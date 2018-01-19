import {UI} from "../util/UI";
import {Team} from '../interfaces/Teams.Interfaces';
import {Deliverable, DeliverableContainer} from '../interfaces/Deliverables.Interfaces';
import {Network} from '../util/Network';
import {App} from "../App";
const HEADER_TEXT = '#student-team-list-header-text';
const ADD_A_TEAM_CONTAINER = '#studentTeamPage-add-team-cta';
const ADD_A_TEAM_BUTTON = '#studentTeamPage-add-team-cta__button';
const TEAMS_CONTAINER = '#studentTeamPage-teams-container';
const DELIV_DROPDOWN_CONTAINER = '#addANewTeamPage-deliverableList-selector';
const USERNAME_INPUT_CONTAINER = '#addANewTeamPage-deliverableList-username-input';
const USERNAME_INPUT_BUTTON = '#addANewTeamPage-deliverableList-username-input-button';
const USERNAME_SEARCH_FIELD = '#addANewTeamPage-deliverableList-username-input';

interface AddTeamData {
    courseDelivList: Deliverable[];
    studentTeamList: Team[]
}

interface InSameLabData {
    username: string;
    inSameLab: boolean;
}

export class TeamView {

    private deliverables: Deliverable[];
    private app: App;
    private courseId: string;

    constructor(app: App, courseId: string) {
        this.app = app;
        this.courseId = courseId;
    }

    private async getDeliverables(courseId: string) {
        const url: string = this.app.backendURL + courseId + '/deliverables';
        return Network.httpGet(url)
            .then((data: DeliverableContainer) => {
                return data;
            });
    }

    public loadNewTeamView(addTeamData: AddTeamData) {
        let data: AddTeamData = addTeamData;
        console.log('TeamView:: loadNewTeamView() - start - data: ', data);
        let that = this;
        UI.showModal();
        UI.pushPage('html/student/addANewTeam.html', {data})
            .then(() => {
                that.addDelivsToDropdown(data);
                let usernameInputButton = document.querySelector(USERNAME_INPUT_BUTTON);
                usernameInputButton.addEventListener('click', (e) => {
                    that.validateUsername();
                    console.log(e);

                });
            })
            .catch((err: any) => {
                console.log('TeamView:: loadNewTeamView(addTeamData) ERROR ' + err);
            });

    }

    private addDelivsToDropdown(addTeamData: AddTeamData) {
        let dropDownSection: string = '<ons-select id="choose-sel" onchange="editSelects(event)">test</ons-select>';
        let dropDownHtml = UI.ons.createElement(dropDownSection);
        let studentTeamList: Team[] = addTeamData.studentTeamList;

        addTeamData.courseDelivList.map((deliv: Deliverable) => {

            // Display the deliverable as a selection choice when not already on the team list && student is allowed
            // to make a team for that particular deliverable.
            if (deliv.studentsMakeTeams) {
                let alreadyOnTeam: boolean = false;

                studentTeamList.map((team: Team) => {
                    if (team.deliverableIds[0].name === deliv.name) {
                        alreadyOnTeam = true;
                    }
                });

                if (alreadyOnTeam === false) {
                    let htmlString = '<option value="' + deliv.name + '">' + deliv.name + '</option>';
                    let htmlElement = UI.ons.createElement(htmlString);
                    dropDownHtml.firstChild.appendChild(htmlElement);
                }
            }
        });

        let delivDropdownContainer = document.querySelector(DELIV_DROPDOWN_CONTAINER) as HTMLElement;
        delivDropdownContainer.appendChild(dropDownHtml);
    }

    public async render(data: any) {
        console.log('TeamView::render() - start - data: ', data.response);
        UI.showModal();
        let teamsContainer = document.querySelector(TEAMS_CONTAINER);
        let that = this;
        let headerText = document.querySelector(HEADER_TEXT) as HTMLElement;
        let deliverablesList: DeliverableContainer = await this.getDeliverables(this.courseId);
        let addTeamButton = document.querySelector(ADD_A_TEAM_CONTAINER) as HTMLElement;
            addTeamButton.addEventListener('click', () => {
                that.loadNewTeamView({courseDelivList: deliverablesList.response, studentTeamList: data.response});
            });
        let delivStudentTeamCount: number;

        if (deliverablesList) {
            deliverablesList.response.map((deliv: Deliverable) => {
                if (deliv.studentsMakeTeams) {
                    delivStudentTeamCount++;
                }
            });
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

        let teamsHTML: HTMLElement = UI.ons.createElement(teamsElements);
        teamsContainer.parentNode.replaceChild(teamsHTML, teamsContainer);

        const teamList = document.querySelector('#student-team-list');
        UI.hideModal();
    }

    public async validateUsername(): Promise<boolean> {
        console.log('validateUsername() clicked');
        let url = this.app.backendURL + this.courseId + '/students/isInSameLab';
        const usernameSearchField = document.querySelector(USERNAME_SEARCH_FIELD) as HTMLInputElement;
        let username: string = usernameSearchField.value;
        console.log(username);
        Network.httpPost(url, {username: username})
            .then((result: any) => {
                let inSameLabData: InSameLabData = result.response;
                if (inSameLabData.inSameLab) {
                    console.log('TeamView:: validateUsername() In same lab with ' + inSameLabData.username);
                }
                console.log('validateusername result', result);
            })
            return true;    
    }

    public createTeam(team: Team): string {
        return UI.createTeam(team);
    }

}