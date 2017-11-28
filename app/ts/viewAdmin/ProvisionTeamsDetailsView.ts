import {UI} from "../util/UI";
import {AdminController} from "../controllers/AdminController";
import {DeliverablePayload, DeliverablePayloadContainer} from "../Models";
import {ProvisionHealthCheckContainer} from "../Models";
import {Network} from "../util/Network";
import {App} from "../App";

const PROVISION_DETAILS_HEADER = '#adminProvisionTeamsDetailsHeader';
const CLASS_SIZE = '#admin-prov-details__class-size-body';
const STUDENTS_ON_TEAM = '#admin-prov-details__students-on-team-body';
const STUDENTS_WITHOUT_TEAM = '#admin-prov-details__students-without-team-body';
const NUM_OF_TEAMS = '#admin-prov-details__students-num-of-teams-body';
const NUM_OF_TEAMS_WITH_REPO = '#admin-prov-details__students-num-of-teams-with-repo-body';
const NUM_OF_TEAMS_WITHOUT_REPO = '#admin-prov-details__students-num-of-teams-without-repo-body';

declare var myApp: App;

export class ProvisionTeamsDetailsView {
    private controller: AdminController;
    private deliverable: DeliverablePayload;
    private teamsProvisioned: boolean;
    // private currentlyProvisioning: boolean; - not implemented on back-end properly.

    constructor(controller: AdminController, deliverable: DeliverablePayload) {
        this.controller = controller;
        this.deliverable = deliverable;
    }

    public updateTitle() {
        // document.querySelector('#adminTabsHeader').innerHTML = data.course;
        document.querySelector(PROVISION_DETAILS_HEADER).innerHTML = "Team Provisions: " + this.deliverable.name;
    }

    public render(data: ProvisionHealthCheckContainer) {
        console.log('ProvisionTeamsDetailsView::render(..) - start - data: ' + JSON.stringify(data));
        UI.showModal();
        let that = this;
        let teamCount = 0;


          // let delivRow = UI.createListItem(deliverable.name, String(myApp.currentCourseId) + ' Deliverable', TAPPABLE_INTERFACE);
          // delivRow.onclick = function() {
          //   that.viewDeliverableProvision(deliverable.name);
          console.log(data);
   

        UI.pushPage('html/admin/provisionTeamsDetails.html', {data: null})
            .then(() => {
                that.updateTitle();

                let classSize = data.response.classSize.toString();
                let numStudentsWithTeam = data.response.studentTeamStatus.studentsWithTeam.length.toString();
                let numStudentsWithoutTeam = data.response.studentTeamStatus.studentsWithoutTeam.length.toString();
                let numOfTeams = data.response.numOfTeams.toString();
                let numOfTeamsWithRepo = data.response.numOfTeamsWithRepo.length.toString();
                let numOfTeamsWithoutRepo = data.response.numOfTeamsWithoutRepo.length.toString();

                (document.querySelector(CLASS_SIZE).firstChild as HTMLElement).innerHTML = classSize;
                (document.querySelector(STUDENTS_ON_TEAM).firstChild as HTMLElement).innerHTML = numStudentsWithTeam;
                (document.querySelector(STUDENTS_WITHOUT_TEAM).firstChild as HTMLElement).innerHTML = numStudentsWithoutTeam;
                (document.querySelector(NUM_OF_TEAMS).firstChild as HTMLElement).innerHTML = numOfTeams;
                (document.querySelector(NUM_OF_TEAMS_WITH_REPO).firstChild as HTMLElement).innerHTML = numOfTeamsWithRepo;
                (document.querySelector(NUM_OF_TEAMS_WITHOUT_REPO).firstChild as HTMLElement).innerHTML = numOfTeamsWithoutRepo;

                UI.hideModal();
        });

        // let uiHTMLList = document.querySelector(PROVISION_DETAILS_BODY_ID);
        // uiHTMLList.innerHTML = '';
    }


}