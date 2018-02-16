import {UI} from "../util/UI";
import {AdminController} from "../controllers/AdminController";
import {Deliverable, DeliverablePayload, TeamGenerationPayload, RepoRepairPayload, RepoProvisionPayload,
    TeamGenerationResponseContainer, TeamGenerationResponse} from "../Models";
import {ProvisionHealthCheck, ProvisionHealthCheckContainer} from "../Models";
import {Network} from "../util/Network";
import {OnsModalElement} from "onsenui";
import {App} from "../App";

const PAGE_TITLE = '#adminProvisionReposPage__toolbar-title';
const INPUT_MAX_TEAM_SIZE = '#adminProvisionReposPage__option-maxTeamSize';
const INPUT_IN_SAME_LAB = '#adminProvisionReposPage__option-inSameLab';
const ACTION_PROVISION_REPOS = '#adminProvisionReposPage__provision-repos-action';
const CURRENT_DELIV_NAME = '#adminProvisionReposPage__team-generation-deliverable';

declare var myApp: App;

export class ProvisionReposView {
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
        document.querySelector(PAGE_TITLE).innerHTML = String(this.deliverable.name).toUpperCase() + ' Github Repo Provisions';
    }

    private updateInfoText() {
        document.querySelector(CURRENT_DELIV_NAME).innerHTML = String(this.deliverable.name);
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
        console.log('ProvisionReposDeliverableView::render(..) - start');
        let that = this;

        UI.pushPage('html/admin/provisionRepos.html', {data: null})
            .then(() => {
                return this.fetchDelivTeamOverview()
                    .then((data: ProvisionHealthCheckContainer) => {
                        // we need this data for validation later
                        that.provisionHealthCheck = data.response;
                        return that.initView(data.response);
                    });
        });
    }

    private confirmRepoGeneration(payload: TeamGenerationPayload) {
        let that = this;
        let numOfCurrentTeams: number = this.provisionHealthCheck.numOfTeamsWithoutRepo.length;
        let classSize: number = this.provisionHealthCheck.classSize;
        let numWithTeam: number = this.provisionHealthCheck.studentTeamStatus.studentsWithTeam.length;
        let numWithoutTeam: number = this.provisionHealthCheck.studentTeamStatus.studentsWithoutTeam.length;

        let warningMessage: string = 'You cannot currently stop repo creation without restarting ClassPortal-Backend. You cannot delete repos without Github Organization Admin permissions. Would you like to proceed?';

        UI.notificationConfirm(warningMessage, function(answer: boolean) {
            if (answer) {
                that.provisionRepos(payload);
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

    private validateRepoGeneration() {
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
            this.confirmRepoGeneration(teamGenerationPayload);
        }
    }

    private repairRepos(payload: RepoRepairPayload) { 
        console.log('ProvisionReposView::repairRepos() Network payload', payload);
    }

    private provisionRepos(payload: RepoProvisionPayload) {
        console.log('ProvisionReposView::generateRepos() Network payload', payload);
        console.log('generate teams payload', payload);
        let url = myApp.backendURL + myApp.currentCourseId + '/admin/github/repo/team';
        Network.httpPost(url, payload)
            .then((data: any) => {
                data.json()
                    .then((container: TeamGenerationResponseContainer) => {
                        if (typeof container.response !== 'undefined' && container.response.result.ok) {
                            UI.notification('Successfully inserted ' + container.response.result.n);
                        } else {
                            UI.notification('Unable to find students who are not on a team. You must disband student teams before you can create additional student teams.');
                        }
                    });
            });
    }

    private addRepoButtonListener() {
        let that = this;
        let provisionReposAction = document.querySelector(ACTION_PROVISION_REPOS) as HTMLElement;
        provisionReposAction.addEventListener('click', () => {
            that.validateRepoGeneration(); // if Valid, teams will be created 
        });
    }

    private initView(provisionHealthCheck: ProvisionHealthCheck) {
        this.updateTitle();
        this.updateInfoText();
        this.addRepoButtonListener();
    }
}