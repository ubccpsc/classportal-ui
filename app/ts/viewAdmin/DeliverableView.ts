import {UI} from "../util/UI";
import {AdminController} from "../controllers/AdminController";
import {DeliverablePayload} from "../Models";
import {App} from "../App";
import FlatPicker from "../helpers/FlatPicker";
import DeliverableRecord from "../models/DeliverableRecord";
import {Deliverable} from '../Models';

const flatpickr: any = require('flatpickr');
const OPEN_DELIV_KEY = '#adminEditDeliverablePage-open';
const CLOSE_DELIV_KEY = '#adminEditDeliverablePage-close';
const START_CODE_URL = '#adminEditDeliverablePage-url';
const START_CODE_KEY = '#adminEditDeliverablePage-deliverableKey';
const SOLUTIONS_CODE_URL = '#adminEditDeliverablePage-solutionsUrl';
const SOLUTIONS_CODE_KEY = '#adminEditDeliverablePage-solutionsKey';
const DELIV_NAME = '#adminEditDeliverablePage-name';
const MIN_TEAM_SIZE = '#adminEditDeliverablePage-minTeamSize';
const MAX_TEAM_SIZE = '#adminEditDeliverablePage-maxTeamSize';
const MUST_BE_IN_SAME_LAB = '#adminEditDeliverablePage-inSameLab';
const STUDENTS_MAKE_TEAMS = '#adminEditDeliverablePage-studentsMakeTeams';
const GRADES_RELEASED = '#adminEditDeliverablePage-gradesReleased';
const BUILDING_REPOS = '#adminEditDeliverablePage-buildingRepos';
const PROJECT_COUNT = '#adminEditDeliverablePage-projectCount';
const DOCKER_IMAGE = '#adminEditDeliverablePage-dockerImage';
const DOCKER_BUILD = '#adminEditDeliverablePage-dockerBuild';
const CUSTOM_HTML = '#adminEditDeliverablePage-customHtml';
const CUSTOM_JSON = '#adminEditDeliverablePage-custom';
const WHITELISTED_SERVERS = '#adminEditDeliverablePage-whitelistedServers';
const REQUEST_RATE = '#adminEditDeliverablePage-dockerOverride';
const DOCKER_OVERRIDE = '#adminEditDeliverablePage-rate';
const EDIT_DELIVERABLE_PAGE_HEADER = '#adminEditDeliverablePage-header';
const SAVE_ACTION = '#adminEditDeliverablePage-save-action';
const DISABLED_ONSEN_ATTRIBUTE = 'disabled';

declare var myApp: App;

export class DeliverableView {
    private controller: AdminController;
    private editTypes = { EDIT_DELIVERABLE: 'edit', ADD_DELIVERABLE: 'add'};

    constructor(controller: AdminController) {
        this.controller = controller;
    }

    public updateTitle() {
        // document.querySelector('#adminTabsHeader').innerHTML = data.course;
        document.querySelector('#adminTabsHeader').innerHTML = "Deliverables";
    }

    public render(data: DeliverablePayload) {
        console.log('DeliverableView::render(..) - start');
        this.updateTitle();

        if (typeof data === 'undefined') {
            console.log('DeliverableView::render(..) - data is undefined');
            return;
        }
        console.log('DeliverableView::render(..) - data: ' + JSON.stringify(data));

        let deliverables = data.response;
        const customSort = function (a: Deliverable, b: Deliverable) {
            return (Number(a.id.match(/(\d+)/g)[0]) - Number((b.id.match(/(\d+)/g)[0])));
        };
        deliverables = deliverables.sort(customSort);

        console.log('DeliverableView::render(..) - setting deliverables: ' + JSON.stringify(deliverables));
        this.controller.deliverables = deliverables; // HACK: global

        const that = this;
        // deliverables
        const deliverableList = document.querySelector('#adminConfigDeliverablesPage-deliv-list');
        if (deliverableList !== null) {
            deliverableList.innerHTML = '';
            if (deliverables.length > 0) {
                for (let deliverable of deliverables) {
                    const close = new Date(deliverable.close);
                    const open = new Date(deliverable.open);
                    deliverableList.appendChild(UI.createListHeader(deliverable.id));
                    let text = "Open: " + open.toLocaleDateString() + ' @ ' + open.toLocaleTimeString() + "; Close: " + open.toLocaleDateString() + ' @ ' + open.toLocaleTimeString();
                    let subtext = 'Subtext';
                    let elem = UI.createListItem(text, subtext, true);
                    elem.onclick = function () {
                        that.editDeliverable(deliverable);
                    };
                    deliverableList.appendChild(elem);
                    // deliverableList.appendChild(UI.createListItem("Close: " + open.toLocaleDateString() + ' @ ' + open.toLocaleTimeString()));
                }
            } else {
                deliverableList.appendChild(UI.createListItem("No deliverable data returned from server."));
            }
        } else {
            console.log('DeliverableView::render() - element is null');
        }
        UI.hideModal();
    }

    public addDeliverable() { 
        console.log('DeliverableView::addDeliverable() - start');
        let defaultNewDeliv: Deliverable = DeliverableRecord.getDefaultDeliv();


        let that = this;
        UI.showModal();
        UI.pushPage('html/admin/editDeliverable.html')
            .then(() => {
                let header = document.querySelector(EDIT_DELIVERABLE_PAGE_HEADER) as HTMLElement;
                        this.initEditDeliverableView(defaultNewDeliv, this.editTypes.ADD_DELIVERABLE);

                header.innerHTML = 'Create Deliverable';
                FlatPicker.setFlatPickerField(new Date().getTime(), OPEN_DELIV_KEY);
                FlatPicker.setFlatPickerField(new Date().getTime(), CLOSE_DELIV_KEY);
                UI.hideModal();
            });
    }

    private initEditDeliverableView(deliverable: Deliverable, viewType: string) {
        console.log('DeliverableView::initEditDeliverable( ' + deliverable.id + ' ) - start');
        let that = this;

        let delivName: HTMLInputElement = document.querySelector(DELIV_NAME) as HTMLInputElement;
        delivName.value = deliverable.name;

        let starterCode: HTMLInputElement = document.querySelector(START_CODE_URL) as HTMLInputElement;
        starterCode.value = deliverable.url;

        let starterCodeKey: HTMLInputElement = document.querySelector(START_CODE_KEY) as HTMLInputElement;
        starterCodeKey.value = deliverable.deliverableKey;

        let solutionsUrl: HTMLInputElement = document.querySelector(SOLUTIONS_CODE_URL) as HTMLInputElement;
        solutionsUrl.value = deliverable.solutionsUrl;

        let solutionsKey: HTMLInputElement = document.querySelector(SOLUTIONS_CODE_KEY) as HTMLInputElement;
        solutionsKey.value = deliverable.solutionsKey;

        let minTeamSize: HTMLInputElement = document.querySelector(MIN_TEAM_SIZE) as HTMLInputElement;
        let minTeamSizeOptions = minTeamSize.children;
        for (let i = 0; i < minTeamSizeOptions.length; i++) {
            let maxTeamSizeOption = minTeamSizeOptions[i] as HTMLSelectElement;
            if (parseInt(minTeamSizeOptions[i].innerHTML) === deliverable.minTeamSize) {
                maxTeamSizeOption.selected = 'selected';
            }
        }
        minTeamSize.value = String(deliverable.minTeamSize);

        let maxTeamSize: HTMLSelectElement = document.querySelector(MAX_TEAM_SIZE) as HTMLSelectElement;
        let maxTeamSizeOptions = maxTeamSize.children;
        let selectionMaps: boolean = false;

        for (let i = 0; i < maxTeamSizeOptions.length; i++) {
            let maxTeamSizeOption = maxTeamSizeOptions[i] as HTMLSelectElement;
            if (parseInt(maxTeamSizeOptions[i].innerHTML) === deliverable.maxTeamSize) {
                maxTeamSizeOption.selected = 'selected';
                selectionMaps = true;
            }
        }

        // if no max team size match on front-end, use default front-end max
        if (selectionMaps === false) {
             (maxTeamSizeOptions[7] as HTMLSelectElement).selected = 'selected';
        }
        maxTeamSize.value = String(deliverable.maxTeamSize);

        let teamsInSameLab: HTMLInputElement = document.querySelector(MUST_BE_IN_SAME_LAB) as HTMLInputElement;
        teamsInSameLab.checked = deliverable.teamsInSameLab;

        let studentsMakeTeams: HTMLInputElement = document.querySelector(STUDENTS_MAKE_TEAMS) as HTMLInputElement;
        studentsMakeTeams.checked = deliverable.studentsMakeTeams;

        let gradesReleased: HTMLInputElement = document.querySelector(GRADES_RELEASED) as HTMLInputElement;
        gradesReleased.checked = deliverable.gradesReleased;

        let projectCount: HTMLInputElement = document.querySelector(PROJECT_COUNT) as HTMLInputElement;
        projectCount.value = String(deliverable.projectCount);

        let buildingRepos: HTMLInputElement = document.querySelector(BUILDING_REPOS) as HTMLInputElement;
        buildingRepos.checked = deliverable.buildingRepos;

        let dockerImage: HTMLInputElement = document.querySelector(DOCKER_IMAGE) as HTMLInputElement;
        dockerImage.value = deliverable.dockerImage;

        let dockerBuild: HTMLInputElement = document.querySelector(DOCKER_BUILD) as HTMLInputElement;
        dockerBuild.value = deliverable.dockerBuild;

        let whitelistedServers: HTMLInputElement = document.querySelector(WHITELISTED_SERVERS) as HTMLInputElement;
        whitelistedServers.value = deliverable.whitelistedServers;

        let dockerOverride: HTMLInputElement = document.querySelector(DOCKER_OVERRIDE) as HTMLInputElement;
        dockerOverride.checked = deliverable.dockerOverride;

        let rate: HTMLInputElement = document.querySelector(REQUEST_RATE) as HTMLInputElement;
        rate.value = String(deliverable.rate);

        let customHtml: HTMLInputElement = document.querySelector(CUSTOM_HTML) as HTMLInputElement;
        customHtml.checked = deliverable.customHtml;

        let customJson: HTMLInputElement = document.querySelector(CUSTOM_JSON) as HTMLInputElement;
        customJson.value = JSON.stringify(deliverable.custom);


        if (viewType === this.editTypes.EDIT_DELIVERABLE) {

            let header = document.querySelector(EDIT_DELIVERABLE_PAGE_HEADER) as HTMLElement;
            header.innerHTML = 'Edit Deliverable';
            
            // ## DISABLE fields in edit       
            delivName.setAttribute(DISABLED_ONSEN_ATTRIBUTE, "");
        }

        FlatPicker.setFlatPickerField(deliverable.open, OPEN_DELIV_KEY);
        FlatPicker.setFlatPickerField(deliverable.close, CLOSE_DELIV_KEY);

        // TODO: update to use the ids in the HTML file and populate values from there (except for the date, that will need to be moved over)
        /*
            let editableDeliv = document.querySelector('#admin-editable-deliverable-list') || document.querySelector('#admin-manage-deliverables');
            editableDeliv.innerHTML = '';
        */

        let open = document.querySelector(OPEN_DELIV_KEY) as HTMLInputElement;
        let close = document.querySelector(CLOSE_DELIV_KEY) as HTMLInputElement;
        let saveAction = document.querySelector(SAVE_ACTION) as HTMLElement;

        saveAction.addEventListener('click', () => {
            let isValid: boolean = that.isDeliverableValid();

            try {
                let delivPayload: Deliverable = {
                    id: '',
                    name: String(delivName.value).toLowerCase(),
                    url: starterCode.value,
                    deliverableKey: starterCodeKey.value,
                    solutionsUrl: solutionsUrl.value,
                    solutionsKey: solutionsKey.value,
                    teamsAllowed: studentsMakeTeams.checked,
                    minTeamSize: parseInt(minTeamSize.value),
                    maxTeamSize: parseInt(maxTeamSize.value),
                    teamsInSameLab: teamsInSameLab.checked,
                    studentsMakeTeams: studentsMakeTeams.checked,
                    gradesReleased: gradesReleased.checked,
                    projectCount: parseInt(projectCount.value),
                    buildingRepos: buildingRepos.checked,
                    open: new Date(open.value).getTime(),
                    close: new Date(close.value).getTime(),
                    dockerImage: dockerImage.value,
                    dockerBuild: dockerBuild.value,
                    rate: parseInt(rate.value),
                    whitelistedServers: whitelistedServers.value,
                    dockerOverride: dockerOverride.checked,
                    customHtml: customHtml.checked,
                    custom: JSON.parse(customJson.value)
                }
                console.log('DeliverableView:: DEBUG All Deliverable submission properties', delivPayload);
                if (isValid) {
                    that.save(delivPayload);
                }
            } catch (err) {
                console.log('Could not save Deliverable: ERROR ' + err);
                console.error('There was an error with one of the Deliverable inputs: ' + err);
            }
        });

        UI.hideModal();
    }

    // All other fields are input numbers and booleans that are assumed to be valid.
    private isDeliverableValid(): boolean {

        const HTTPS_REGEX = new RegExp(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
        const NAME_REGEX: RegExp = /^[^_]+([0-9])/;
        const TEAM_SIZE_ERR: string = 'The minimum team size cannot be greater than the maximum team size';
        const CUSTOM_JSON_ERR: string = 'Your custom JSON input should be valid stringified JSON: ';
        const DELIV_NAME_ERR: string = 'A deliverable name must be all lowercase letters, up to 10 characters, and a combination of [a-z] and [0-9].';
        const GIT_REPO_ERR: string = 'Please make sure your Git repo addresses are valid Https URIs.'
        let minTeamSize: HTMLInputElement = document.querySelector(MIN_TEAM_SIZE) as HTMLInputElement;
        let maxTeamSize: HTMLInputElement = document.querySelector(MAX_TEAM_SIZE) as HTMLInputElement;
        let customJson: HTMLInputElement = document.querySelector(CUSTOM_JSON) as HTMLInputElement;
        let delivName: HTMLInputElement = document.querySelector(DELIV_NAME) as HTMLInputElement;
        let solutionsCodeUrl: HTMLInputElement = document.querySelector(SOLUTIONS_CODE_URL) as HTMLInputElement;
        let starterCodeUrl: HTMLInputElement = document.querySelector(START_CODE_URL) as HTMLInputElement;

        if (parseInt(minTeamSize.value) > parseInt(maxTeamSize.value)) {
            UI.notification(TEAM_SIZE_ERR);
            return false;
        }

        try {
            JSON.parse(customJson.value);
        } catch (err) {
            UI.notification(CUSTOM_JSON_ERR + err);
            return false;
        }

        let name: string = delivName.value;
        if (name.length > 10 || name.search(NAME_REGEX) === -1) {
            UI.notification(DELIV_NAME_ERR);
            return false;
        }

        if (starterCodeUrl.value.search(HTTPS_REGEX) === -1 || solutionsCodeUrl.value.search(HTTPS_REGEX) === -1) {
            UI.notification(GIT_REPO_ERR);
            return false;
        }

        return true;
    }

    private save(deliverable: Deliverable) {
        console.log('DeliverableView::save( ' + deliverable.id + ' ) - start');


    }



    private editDeliverable(deliverable: Deliverable) {
        console.log('DeliverableView::editDeliverable( ' + deliverable.id + ' ) - start');
        let that = this;
        UI.showModal();
        UI.pushPage('html/admin/editDeliverable.html', {data: deliverable})
            .then(() => {
                that.initEditDeliverableView(deliverable, that.editTypes.EDIT_DELIVERABLE);
            });
    }
}