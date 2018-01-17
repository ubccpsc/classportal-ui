import {UI} from "../util/UI";
import {Team} from '../interfaces/Teams.Interfaces';
import {Deliverable, DeliverableContainer} from '../interfaces/Deliverables.Interfaces';
import {Network} from '../util/Network';
import {App} from "../App";
const HEADER_TEXT = '#student-team-list-header-text';
const ADD_A_TEAM_CONTAINER = '#studentTeamPage-add-team-cta';
const TEAMS_CONTAINER = '#studentTeamPage-teams-container';

export class TeamView {

    private deliverables: Deliverable[];
    private app: App;
    private courseId: string;

    constructor(app: App, courseId: string) {
        this.app = app;
        console.log('being created', app.backendURL);
        this.courseId = courseId;
    }

    private async getDeliverables(courseId: string) {
        const url: string = this.app.backendURL + courseId + '/deliverables';
        return Network.httpGet(url)
            .then((data: DeliverableContainer) => {
                console.log('TeamView, getDeliverables()', data);
                return data;
            });
    }

    public async render(data: any) {
        console.log('TeamView::render() - start - data: ', data.response);
        UI.showModal();
        let teamsContainer = document.querySelector(TEAMS_CONTAINER) as HTMLElement
        let that = this;
        let headerText = document.querySelector(HEADER_TEXT) as HTMLElement;
        let addTeamButton = document.querySelector(ADD_A_TEAM_CONTAINER) as HTMLElement;
            addTeamButton.addEventListener('click', () => {
                that.getDeliverables(that.courseId);    
            });
        let deliverablesList: DeliverableContainer = await this.getDeliverables(this.courseId);
        let delivStudentTeamCount: number;
        console.log(deliverablesList);

        if (deliverablesList) {
            deliverablesList.response.map((deliv: Deliverable) => {
                if (deliv.studentsMakeTeam) {
                    delivStudentTeamCount++;
                }
            });
            console.log('teamView:: delivStudentTeamCount', delivStudentTeamCount);
        }

        let teams = data.response as Team[];

        // if list of deliverables with studentsMakeTeams equal to team list length, then hide Add Team button.
        if (typeof teams.length !== 'undefined' && teams.length > 0) {
            headerText.innerHTML = '';

            if (teams.length === delivStudentTeamCount) {
                addTeamButton.style.display = 'none';
                addTeamButton.style.padding = '0';
            }
        }

        let teamsElements: string = '<section id="studentTeamPage-teams-container">';

        for (let team of teams) {
            teamsElements += this.createTeam(team);
        }

        teamsElements += '</section>';

        console.log(teamsElements);

        let teamsHTML: HTMLElement = UI.ons.createElement(teamsElements);
        teamsContainer.parentNode.replaceChild(teamsHTML, teamsContainer);

        const teamList = document.querySelector('#student-team-list');
        UI.hideModal();
        // if (teamList !== null) {
        //     teamList.innerHTML = '';
        //     for (let team of data.teams) {
        //         if (typeof team.msg !== 'undefined') {
        //             teamList.appendChild(UI.createListItem(team.id, team.msg));
        //         } else {
        //             teamList.appendChild(UI.createListItem(team.id, JSON.stringify(team.members)));
        //         }
        //     }
        // } else {
        //     console.log('GradeView::render() - element is null');
        // }
    }






    public createTeam(team: Team): string {
        return UI.createTeam(team);
    }

}