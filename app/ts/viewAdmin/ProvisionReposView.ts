import {UI} from "../util/UI";
import {AdminController} from "../controllers/AdminController";
import {Deliverable, DeliverablePayload, TeamGenerationPayload, 
    TeamGenerationResponseContainer, TeamGenerationResponse} from "../Models";
import {ProvisionHealthCheckContainer} from "../Models";
import {Network} from "../util/Network";
import {OnsModalElement} from "onsenui";
import {App} from "../App";

const REPO_PROVISION_HEADER = '#adminRepoProvisionHeader';

declare var myApp: App;

export class ProvisionReposView {
    private controller: AdminController;
    private deliverable: Deliverable;
    private teamsProvisioned: boolean;
    // private currentlyProvisioning: boolean; - not implemented on back-end properly.

    constructor(controller: AdminController, deliverable: Deliverable) {
        this.controller = controller;
        this.deliverable = deliverable;
    }

    public updateTitle() {
        // document.querySelector('#adminTabsHeader').innerHTML = data.course;
        document.querySelector(REPO_PROVISION_HEADER).innerHTML = "Repo Provision: '" + String(this.deliverable.name) + "'";
    }

    public render(data: ProvisionHealthCheckContainer) {
        console.log('ProvisionTeamsDetailsView::render(..) - start - data: ' + JSON.stringify(data));
        UI.showModal();
        let that = this;   
        console.log(data);

        UI.pushPage('html/admin/provisionRepos.html', {data: null})
            .then(() => {
                that.updateTitle();

                // let classSize = data.response.classSize;
                // let studentsWithTeam = data.response.studentTeamStatus.studentsWithTeam;
                // let teamsAllowed = data.response.teamsAllowed;
                // let studentsWithoutTeam = data.response.studentTeamStatus.studentsWithoutTeam;
                // let teams = data.response.teams;
                // let numOfTeams = data.response.numOfTeams;
                // let teamsWithRepo = data.response.numOfTeamsWithRepo;
                // let teamsWithoutRepo = data.response.numOfTeamsWithoutRepo;
                // let minTeamSize = (document.querySelector(MIN_TEAM_SIZE) as HTMLInputElement).value = String(this.deliverable.minTeamSize);
                // let maxTeamSize = (document.querySelector(MAX_TEAM_SIZE) as HTMLInputElement).value = String(this.deliverable.maxTeamSize);

                // (document.querySelector(STUDENTS_WITH_TEAM)).addEventListener('click', () => {
                //     that.loadDetails(studentsWithTeam);
                // });

                // (document.querySelector(STUDENTS_WITHOUT_TEAM)).addEventListener('click', () => {
                //     that.loadDetails(studentsWithoutTeam);
                // });

                // (document.querySelector(TEAMS)).addEventListener('click', () => {
                //     that.loadDetails(teams);
                // });

                // (document.querySelector(TEAMS_WITH_REPO)).addEventListener('click', () => {
                //     that.loadDetails(teamsWithRepo);
                // });

                // (document.querySelector(TEAMS_WITHOUT_REPO)).addEventListener('click', () => {
                //     that.loadDetails(teamsWithoutRepo);
                // });

                // (document.querySelector(GENERATE_TEAMS_ACTION)).addEventListener('click', () => {
                //     // that.generateTeams(); // ENABLE after respective Team provision / team repo views loading.
                // });

                // (document.querySelector(TEAMS_ALLOWED).firstChild as HTMLElement).innerHTML = teamsAllowed === true ? 'Yes' : 'No';
                // (document.querySelector(CLASS_SIZE).firstChild as HTMLElement).innerHTML = classSize.toString();
                // (document.querySelector(STUDENTS_WITH_TEAM).firstChild as HTMLElement).innerHTML = studentsWithTeam.length.toString();
                // (document.querySelector(STUDENTS_WITHOUT_TEAM).firstChild as HTMLElement).innerHTML = studentsWithoutTeam.length.toString();
                // (document.querySelector(TEAMS).firstChild as HTMLElement).innerHTML = numOfTeams.toString();
                // (document.querySelector(TEAMS_WITH_REPO).firstChild as HTMLElement).innerHTML = teamsWithRepo.length.toString();
                // (document.querySelector(TEAMS_WITHOUT_REPO).firstChild as HTMLElement).innerHTML = teamsWithoutRepo.length.toString();

                UI.hideModal();
        });
    }

    public loadDetails(data: object[]) {
        console.log('ProvisionTeamsDetailsView::loadDetails(..) - start - data: ' + JSON.stringify(data));

        let that = this;
        UI.showModal();

        UI.pushPage('html/admin/provisionRepos.html', {data})
            .then(() => {

            });

        UI.hideModal();

        console.log('ProvisionTeamsDetailsView::loadDetails(..) - end');
    }
}