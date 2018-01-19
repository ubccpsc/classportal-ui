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
const TEAMMATES_LIST = '#addANewTeamPage-teammates-list';
const TEAMMATES_LIST_HEADER = '#addANewTeamPage-teammates-list-header';
const TEAMMATES_LIST_ITEM_CLASS = 'addANewTeamPage-teammates-list-item';
const TEAMMATES_LIST_PLACEHOLDER = '#addANewTeamPage-teammates-list-placeholder';

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
                    that.validateUsername()
                        .then((inSameLabData: InSameLabData) => {
                            if (inSameLabData.inSameLab) {
                                that.addUserToTeamList(inSameLabData.username);
                            } else {
                                that.rejectInvalidUser(inSameLabData.username);
                            }
                        });
                });
            })
            .catch((err: any) => {
                console.log('TeamView:: loadNewTeamView(addTeamData) ERROR ' + err);
            });

    }

    private isTeammateInTableList(username: string): boolean {
        let teammatesHtmlList = document.getElementsByClassName(TEAMMATES_LIST_ITEM_CLASS);
        let isInTableList: boolean = false;
        console.log(teammatesHtmlList);
        for (let i = 0; i < teammatesHtmlList.length; i++) {
            let teammate = teammatesHtmlList[i] as HTMLElement;
            console.log(teammate.dataset.username);
            if (teammate.dataset.username === username) {
                isInTableList = true;
            }
        }
        return isInTableList;
    }

    private removeHtmlItem(parentNode: Node, childElement: HTMLElement) {
        console.log('TeamView:: removeHtmlItem() Removing item');
        parentNode.removeChild(childElement);
    }

    private addUserToTeamList(username: string) {
        console.log('TeamView::addUserToTeamList() - start');
        let teamList = document.querySelector(TEAMMATES_LIST);
        let teammate: string = '<ons-list-item class="addANewTeamPage-teammates-list-item" data-username="' + username + '">' + username + 
          '<div class="right"><ons-icon icon="ion-close-round" class="list-item__icon"></div></ons-list-item>';
        let teammateHtml = UI.ons.createElement(teammate) as HTMLElement;
        teammateHtml.lastChild.addEventListener('click', () => {
            this.removeHtmlItem(teammateHtml.parentNode, teammateHtml);
        })

        let alreadyOnTeam: boolean = this.isTeammateInTableList(username);

        if (!alreadyOnTeam) {

            // clean table from default placeholder
            let teammatesHtmlPlaceholder = document.querySelector(TEAMMATES_LIST_PLACEHOLDER) as HTMLElement;
                console.log(teammatesHtmlPlaceholder);
                if (teammatesHtmlPlaceholder) {
                    this.removeHtmlItem(teammatesHtmlPlaceholder.parentNode, teammatesHtmlPlaceholder);
                }

            teamList.appendChild(teammateHtml);
        }
    }

    private rejectInvalidUser(username: string) {
        console.log('TeamView::rejectInvalidUser() - start');
        UI.notification('The user ' + username + ' is not registered in the same lab');
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

    public async validateUsername(): Promise<InSameLabData> {
        console.log('validateUsername() clicked');
        let url = this.app.backendURL + this.courseId + '/students/isInSameLab';
        const usernameSearchField = document.querySelector(USERNAME_SEARCH_FIELD) as HTMLInputElement;
        let username: string = usernameSearchField.value;
        console.log(username);
        return Network.httpPost(url, {username: username})
            .then((data: any) => {
                return data.response;
            });
    }

    public createTeam(team: Team): string {
        return UI.createTeam(team);
    }

}