import {UI} from "../util/UI";
import {Deliverable, DeliverableContainer, Team, Student} from '../Models';
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
const CREATE_TEAM_BUTTON = '#addANewTeamPage-deliverableList-container-create-button';
const LOCAL_STORAGE_USERNAME = 'username';

interface AddTeamData {
    courseDelivList: Deliverable[];
    studentTeamList: Team[];
}    

interface InSameLabData {
    username: string;
    inSameLab: boolean;
}

interface CreateTeamPayload {
    members: string[];
    deliverableName: string;
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

    private async getCurrentUser(user: Student) {
        let url: string = this.app.backendURL + this.courseId + '/currentUser';
        Network.httpGet(url)
            .then((data: any) => {
                return data.response.user as Student;
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
                let createTeamButton = document.querySelector(CREATE_TEAM_BUTTON);

                // can only select a deliv when addANewTeam.html loads, so we do it here.
                let selectedDeliv = that.getCurrentlySelectedDeliv();
                let deliv: Deliverable = that.getDelivByName(selectedDeliv);

                usernameInputButton.addEventListener('click', (e) => {


                    that.validateUsername()
                        .then((inSameLabData: InSameLabData) => {

                            if (that.isTeamTooBig(deliv)) {
                                that.rejectTeamSizeNumber(deliv);
                            } else if (inSameLabData.inSameLab) {
                                that.addUserToTeamList(inSameLabData.username);
                            } else {
                                that.rejectInvalidUser(inSameLabData.username);
                            }
                        })
                        .catch((err) => {
                            console.log('TeamView:: loadNewTeamView() ERROR ' + err);
                        });
                });

                createTeamButton.addEventListener('click', (e) => {

                    let usernames: string[] = that.getTeamMembers();
                    console.log(usernames);
                    let createTeamPayload: CreateTeamPayload = {deliverableName: selectedDeliv, members: usernames};
                    let url: string = this.app.backendURL + this.courseId + '/students/customTeam';
                    console.log('TeamView:: Preparing to send payload to ' + url, createTeamPayload);

                    let isTooBig: boolean = this.isTeamTooBig(deliv);

                    if (!isTooBig) {
                    Network.httpPut(url, createTeamPayload)
                        .then((data: any) => {
                            console.log('TeamView:: Network.createTeam() Response: ', data);
                            if (typeof data !== 'undefined' && data.response.insertedCount === 1) {
                                that.successTeamCreationMsg();
                                UI.popPage();
                            } else {
                                that.failedTeamCreationMsg();
                            }
                        });                    
                    } else {
                        UI.notification('Your team is too big. The max size is ' + deliv.maxTeamSize + '.');
                    }

                    // Network.httpPost(usernames, selectedDeliv, that.courseId);
                });

            })
            .catch((err: any) => {
                console.log('TeamView:: loadNewTeamView(addTeamData) ERROR ' + err);
            });
    }

    private getCurrentTeamSize(): number {
        return document.getElementsByClassName(TEAMMATES_LIST_ITEM_CLASS).length;
    }

    private isTeamTooBig(deliverableObj: Deliverable): boolean {
        let currentTeamSize: number = this.getCurrentTeamSize();
        if (currentTeamSize > deliverableObj.maxTeamSize)  {
            return true;
        }
        return false;
    }

    private isTeamTooSmall(deliverableObj: Deliverable): boolean {
        let currentTeamSize: number = this.getCurrentTeamSize();
        if (currentTeamSize < deliverableObj.minTeamSize) {
            return true;
        }
        return false;
    }

    private getMaxTeamSize(deliverableObj: Deliverable): number {
        return deliverableObj.maxTeamSize;
    }

    private getMinTeamSize(deliverableObj: Deliverable): number {
        return deliverableObj.minTeamSize;
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

    private getDelivByName(delivName: string): Deliverable {
        // try-catch since Deliverables should be loaded, but possibly not loaded due to async
        try {
            for (let i = 0; i < this.deliverables.length; i++) {
                if (this.deliverables[i].name === delivName) {
                    return this.deliverables[i];
                }
            }
        } catch (err) {
            console.log('TeamView:: getDelivByName() ERROR ' + err);
        }
    }

    private getCurrentlySelectedDeliv(): string {
        let selectedDeliv: string = null;
        try {
            selectedDeliv = (document.getElementsByClassName('select-input')[0] as HTMLSelectElement).value;
        } catch (err) {
            console.log('TeamView:: getCurrentlySelectedDeliv() ERROR ' + err);
        }
        return selectedDeliv;
    }

    private addUserToTeamList(username: string) {
        console.log('TeamView::addUserToTeamList() - start');
        let teamList = document.querySelector(TEAMMATES_LIST);
        let myUsername: string = window.localStorage.getItem(LOCAL_STORAGE_USERNAME);
        let myself: string = '<ons-list-item class="addANewTeamPage-teammates-list-item" data-username="' + myUsername + '">' + myUsername + 
          '<div class="right"><ons-icon icon="ion-person" class="list-item__icon"></div></ons-list-item>';
        let teammate: string = '<ons-list-item class="addANewTeamPage-teammates-list-item" data-username="' + username + '">' + username + 
          '<div class="right"><ons-icon icon="ion-close-round" class="list-item__icon"></div></ons-list-item>';
        let teammateHtml = UI.ons.createElement(teammate) as HTMLElement;
        let myselfHtml = UI.ons.createElement(myself) as HTMLElement;
        teammateHtml.lastChild.addEventListener('click', () => {
            this.removeHtmlItem(teammateHtml.parentNode, teammateHtml);
        })
        let alreadyOnTeam: boolean = this.isTeammateInTableList(username);
        let iNeedToBeAddedToTeam: boolean = !this.isTeammateInTableList(myUsername);

        if (!alreadyOnTeam) {

            // clean table from default placeholder
            let teammatesHtmlPlaceholder = document.querySelector(TEAMMATES_LIST_PLACEHOLDER) as HTMLElement;
            console.log(teammatesHtmlPlaceholder);
            if (teammatesHtmlPlaceholder) {
                this.removeHtmlItem(teammatesHtmlPlaceholder.parentNode, teammatesHtmlPlaceholder);
            }
            if (iNeedToBeAddedToTeam && username !== myUsername) {
                teamList.appendChild(myselfHtml);
            }

            // if it is your own username being added, then it has to stay there permanently because you
            // do not want to be able to form teams that you are not on.
            if (username === myUsername) {
                teamList.appendChild(myselfHtml);
            } else {
                teamList.appendChild(teammateHtml);
            }

            this.clearSearchInput();
        }
    }

    private rejectTeamSizeNumber(deliverableObj: Deliverable) {
        console.log('TeamView::rejectTooManyTeammembers() - start');
        let maxTeamSize: number = this.getMaxTeamSize(deliverableObj);
        let minTeamSize: number = this.getMinTeamSize(deliverableObj);
        UI.notification('Your team size must be between ' + minTeamSize + ' and ' + maxTeamSize + ' members.');
    }

    private rejectInvalidUser(username: string) {
        console.log('TeamView::rejectInvalidUser() - start');
        if (typeof username === 'undefined' || username.length === 0) {
            UI.notification('You have to enter a valid username.');
        } else {
            UI.notification('The user ' + username + ' is not registered in the same lab.');
        }
    }

    private failedTeamCreationMsg() {
        UI.notification('The team could not be created. Please ensure that team members are in the same lab' + 
         ' and are not currently on a team for this deliverable.');
    }

    private successTeamCreationMsg() {
        UI.notification('Your team was successfully created.');
    }

    private getTeamMembers(): string[] {
        let htmlItems = document.getElementsByClassName(TEAMMATES_LIST_ITEM_CLASS);
        let usernames: string[] = [];

        for (let i = 0; i < htmlItems.length; i++) {
            console.log('htmlItem in loop', htmlItems[i]);
            let username: string = (htmlItems[i] as HTMLElement).dataset.username;
            usernames.push(username);
        }
        return usernames;
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
                this.deliverables = deliverablesList.response;
                that.loadNewTeamView({courseDelivList: deliverablesList.response, studentTeamList: data.response});
            });

        let delivStudentTeamCount: number = 0;
        let onStudentMadeTeamCount: number = 0;

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

            teams.map((team: any) => {
                let studentMadeTeam: boolean = team.deliverableIds[0].studentsMakeTeams;
                if (studentMadeTeam) {
                    onStudentMadeTeamCount++;
                }
            });

            console.log('TEAMS LENGTH', teams.length);
            console.log('DELIV STUDENT TEAM COUNT', delivStudentTeamCount);

            if (onStudentMadeTeamCount === delivStudentTeamCount) {
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

    private clearSearchInput() {
        const usernameSearchField = document.querySelector(USERNAME_SEARCH_FIELD) as HTMLInputElement;
        usernameSearchField.value = '';
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