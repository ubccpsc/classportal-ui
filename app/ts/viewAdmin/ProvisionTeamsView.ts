import {UI} from "../util/UI";
import {AdminController} from "../controllers/AdminController";
import {Deliverable, DeliverablePayload, TeamGenerationPayload, 
    TeamGenerationResponseContainer, TeamGenerationResponse} from "../Models";
import {ProvisionHealthCheck, ProvisionHealthCheckContainer} from "../Models";
import {Network} from "../util/Network";
import {OnsModalElement} from "onsenui";
import {App} from "../App";

const PAGE_TITLE = '#adminProvisionTeamsPage__toolbar-title';
const INPUT_MAX_TEAM_SIZE = '#adminProvisionTeamsPage__option-maxTeamSize';
const INPUT_IN_SAME_LAB = '#adminProvisionTeamsPage__option-inSameLab';
const ACTION_GENERATE_TEAMS = '#adminProvisionTeamsPage__generate-teams-action';
const CURRENT_DELIV_NAME = '#adminProvisionTeamsPage__team-generation-deliverable';

declare var myApp: App;

export class ProvisionTeamsView {
    private controller: AdminController;
    private deliverable: Deliverable;
    private teamsProvisioned: boolean;
    private provisionHealthCheck: ProvisionHealthCheck;
    // private currentlyProvisioning: boolean; - not implemented on back-end properly.

    constructor(controller: AdminController, deliverable: Deliverable) {
        this.controller = controller;
        this.deliverable = deliverable;
    }

    public updateTitle() {
        document.querySelector(PAGE_TITLE).innerHTML = String(this.deliverable.name).toUpperCase() + ' Team Provisions';
    }

    private updateInfoText() {
        document.querySelector(CURRENT_DELIV_NAME).innerHTML = String(this.deliverable.name).toUpperCase();
    }

    private fetchDelivTeamOverview() {
        console.log('ProvisionTeamsDetailsView::fetchHealthInfo(..) - start - data: ');
        let url = myApp.backendURL + myApp.currentCourseId + '/admin/teams/' + this.deliverable.name + '/overview';
        return Network.httpGet(url)
            .then((data: ProvisionHealthCheckContainer) => {
                return data;
            });
    }

    public render() {
        console.log('ProvisionTeamsDeliverableView::render(..) - start');
        let that = this;

        UI.pushPage('html/admin/provisionTeams.html', {data: null})
            .then(() => {
                return this.fetchDelivTeamOverview()
                    .then((data: ProvisionHealthCheckContainer) => {
                        // we need this data for validation later
                        that.provisionHealthCheck = data.response;
                        return that.initView(data.response);
                    });
        });
    }

    private confirmTeamGeneration(payload: TeamGenerationPayload) {
        let that = this;
        let numOfCurrentTeams: number = this.provisionHealthCheck.numOfTeamsWithoutRepo.length;
        let classSize: number = this.provisionHealthCheck.classSize;
        let numWithTeam: number = this.provisionHealthCheck.studentTeamStatus.studentsWithTeam.length;
        let numWithoutTeam: number = this.provisionHealthCheck.studentTeamStatus.studentsWithoutTeam.length;

        let warningMessage: string = 'There are currently ' + numWithoutTeam + ' students without a team in a class of ' + classSize +
            ' students. These students will be randomly added to teams of ' + payload.maxTeamSize +'. Would you like to proceed?';

        UI.notificationConfirm(warningMessage, function(answer: boolean) {
            if (answer) {
                that.generateTeams(payload);
            } else {
                // Do nothing. Let them think about it.
            }
        });
    }

    private isConfirmed(answer: boolean): boolean {
        if (answer) {
            return true;
        }
        return false;
    }

    private validateTeamGeneration() {
        let that = this;
        let maxTeamSize: number;
        let teamsInSameLab: boolean;
        let teamGenerationPayload: TeamGenerationPayload;
        let isValid: boolean = true;
        let teamSizeError: string = 'Your team size must be greater than 0 and less than 30 students.';
        let allStudentsOnTeamError: string = 'You cannot create teams because all of your students are already on a Team';

        try {
            maxTeamSize = parseInt((document.querySelector(INPUT_MAX_TEAM_SIZE) as HTMLInputElement).value);
            teamsInSameLab = (document.querySelector(INPUT_IN_SAME_LAB) as HTMLInputElement).checked;
            teamGenerationPayload = {maxTeamSize, teamsInSameLab, deliverableName: that.deliverable.name}
        } catch (err) {
            console.log('ProvisionTeamsView() ERROR: ' + err);
            UI.notification('Could not read Team Generation options to make a Team. Team generation cancelled.');
        }

        if (maxTeamSize < 0 && maxTeamSize > 30) {
            isValid = false;
            UI.notification('Your team size cannot be 0 or greater than 30 students.');
        }

        if (isValid) {
            this.confirmTeamGeneration(teamGenerationPayload);
        }
    }

    private generateTeams(payload: TeamGenerationPayload) {
        console.log('generate teams', payload);
        let url = myApp.backendURL + myApp.currentCourseId + '/admin/teamGeneration';
        Network.httpPost(url, payload)
            .then((data: any) => {
                data.json()
                    .then((container: TeamGenerationResponseContainer) => {
                        if (typeof container.response !== 'undefined' && container.response.result.ok) {
                            UI.notification('Successfully inserted ' + container.response.result.n + ' teams of ' + payload.maxTeamSize + '.');
                        } else {
                            UI.notification('Unable to find students who are not on a team. You must disband student teams before you can create additional student teams.');
                        }
                    });
            });
    }

    private addGenerateTeamsEventListener() {
        let that = this;
        let generateTeamsAction = document.querySelector(ACTION_GENERATE_TEAMS) as HTMLElement;
        generateTeamsAction.addEventListener('click', () => {
            that.validateTeamGeneration(); // if Valid, teams will be created 
        });
    }

    private initView(provisionHealthCheck: ProvisionHealthCheck) {
        this.updateTitle();
        this.updateInfoText();
        this.addGenerateTeamsEventListener();
    }
}