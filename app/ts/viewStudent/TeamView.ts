import {UI} from "../util/UI";
import {Team} from '../interfaces/Teams.Interfaces';
const HEADER_TEXT = '#student-team-list-header-text';
const ADD_A_TEAM_CONTAINER = '#studentTeamPage-add-team-cta';
const TEAMS_CONTAINER = '#studentTeamPage-teams-container';

export class TeamView {

    constructor() {
        console.log('am i working');
    }

    public render(data: any): void {
        console.log('TeamView::render() - start - data: ', data.response);
        let teamsContainer = document.querySelector(TEAMS_CONTAINER) as HTMLElement;
        let headerText = document.querySelector(HEADER_TEXT) as HTMLElement;
        let addTeamButton = document.querySelector(ADD_A_TEAM_CONTAINER) as HTMLElement;

        let teams = data.response as Team[];

        if (typeof teams.length !== 'undefined' && teams.length > 0) {
            addTeamButton.style.display = 'none';
            addTeamButton.style.padding = '0';
            headerText.innerHTML = '';
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