///<reference path="../helpers/DurationPicker.d.ts" />
import {UI} from "../util/UI";
import {AdminController} from "../controllers/AdminController";
import {DeliverablePayload} from "../Models";
import {App} from "../App";
import {Network} from "../util/Network";
import FlatPicker from "../helpers/FlatPicker";
import DeliverableRecord from "../models/DeliverableRecord";
import {Deliverable} from '../Models';
import HTMLTags from '../helpers/HTMLTags';
import * as $ from "jquery";
import "jquery-duration-picker/duration-picker";

const flatpickr: any = require('flatpickr');
const MONGO_ID = '#adminEditDeliverablePage-id';
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
const CUSTOM_HTML = '#adminEditDeliverablePage-customHtml';
const CUSTOM_JSON = '#adminEditDeliverablePage-custom';
const WHITELISTED_SERVERS = '#adminEditDeliverablePage-whitelistedServers';
const REQUEST_RATE = '#adminEditDeliverablePage-rate';
const DOCKER_OVERRIDE = '#adminEditDeliverablePage-dockerOverride';
const DOCKER_REPO = '#adminEditDeliverablePage-dockerRepo';
const DOCKER_KEY = '#adminEditDeliverablePage-dockerKey';
const REQUEST_MINUTES = '#duration-minutes';
const REQUEST_SECONDS = '#duration-seconds';
const REQUEST_HOURS = '#duration-hours';
const REGRESSION_TESTS = '#adminEditDeliverablePage-regressionTests';
const REGRESSION_TEST = '#adminEditDeliverablePage-regressionTest';
const EDIT_DELIVERABLE_PAGE_HEADER = '#adminEditDeliverablePage-header';
const SAVE_ACTION = '#adminEditDeliverablePage-save-action';
const DISABLED_ONSEN_ATTRIBUTE = 'disabled';
const ADD_DELIVERABLE_TAG = 'Create Deliverable';
const EDIT_DELIVERABLE_TAG = 'Edit Deliverable';

declare var myApp: App;

export class DeliverableView {
    private controller: AdminController;
    private app: App;
    private editTypes = { EDIT_DELIVERABLE: 'edit', ADD_DELIVERABLE: 'add'};

    constructor(controller: AdminController, app: App) {
        console.log("DeliverableView::<init> - start");
        this.controller = controller;
        this.app = app;
    }

    public updateTitle() {
        document.querySelector('#adminTabsHeader').innerHTML = "Deliverables";
    }

    public render(data: DeliverablePayload) {
        console.log("DeliverableView::render(..) - start");
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
                    let text = "Open: " + open.toLocaleDateString() + ' @ ' + open.toLocaleTimeString() + "; Close: " + close.toLocaleDateString() + ' @ ' + close.toLocaleTimeString();
                    let subtext: string;
                    deliverable.dockerOverride === true ? subtext = 'Docker Override Enabled' : '';
                    let elem = UI.createListItem(text, subtext, true);
                    elem.onclick = function () {
                        that.editDeliverable(deliverable);
                    };
                    deliverableList.appendChild(elem);
                    // deliverableList.appendChild(UI.createListItem("Close: " + open.toLocaleDateString() + ' @ ' + open.toLocaleTimeString()));
                }
            } else {
                deliverableList.appendChild(UI.createListItem("No deliverables exist for this course."));
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

        let mongoId: HTMLInputElement = document.querySelector(MONGO_ID) as HTMLInputElement;
        mongoId.value = deliverable._id;

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
        let maxTeamSizeFound: boolean = false;

        for (let i = 0; i < maxTeamSizeOptions.length; i++) {
            let maxTeamSizeOption = maxTeamSizeOptions[i] as HTMLSelectElement;
            if (parseInt(maxTeamSizeOptions[i].innerHTML) === deliverable.maxTeamSize) {
                maxTeamSizeOption.selected = 'selected';
                maxTeamSizeFound = true;
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

        let regressionTest: HTMLInputElement = document.querySelector(REGRESSION_TEST) as HTMLInputElement;
        regressionTest.checked = deliverable.regressionTest;

        let regressionTests: HTMLInputElement = document.querySelector(REGRESSION_TESTS) as HTMLInputElement;
        regressionTests.value = deliverable.regressionTests;

        let projectCount: HTMLInputElement = document.querySelector(PROJECT_COUNT) as HTMLInputElement;
        projectCount.value = String(deliverable.projectCount);

        let buildingRepos: HTMLInputElement = document.querySelector(BUILDING_REPOS) as HTMLInputElement;
        buildingRepos.checked = deliverable.buildingRepos;

        let dockerImage: HTMLInputElement = document.querySelector(DOCKER_IMAGE) as HTMLInputElement;
        dockerImage.value = deliverable.dockerImage;

        let whitelistedServers: HTMLInputElement = document.querySelector(WHITELISTED_SERVERS) as HTMLInputElement;
        whitelistedServers.value = deliverable.whitelistedServers;

        let dockerOverride: HTMLInputElement = document.querySelector(DOCKER_OVERRIDE) as HTMLInputElement;
        dockerOverride.checked = deliverable.dockerOverride;

        let dockerRepo: HTMLInputElement = document.querySelector(DOCKER_REPO) as HTMLInputElement;
        dockerRepo.value = deliverable.dockerRepo;

        let dockerKey: HTMLInputElement = document.querySelector(DOCKER_KEY) as HTMLInputElement;
        dockerKey.value = deliverable.dockerKey;

        let customHtml: HTMLInputElement = document.querySelector(CUSTOM_HTML) as HTMLInputElement;
        customHtml.checked = deliverable.customHtml;

        let customJson: HTMLInputElement = document.querySelector(CUSTOM_JSON) as HTMLInputElement;
        customJson.value = JSON.stringify(deliverable.custom);

        let rate: HTMLInputElement = document.querySelector(REQUEST_RATE) as HTMLInputElement;
        rate.value = String(deliverable.rate);

        let durationpicker = $(REQUEST_RATE).durationPicker();
        let duration = deliverable.rate;
        let hoursInMs = 60 * 60 * 1000;
        let minutesInMs = 60 * 1000;
        let durationHours = Math.floor(duration / hoursInMs);
        let durationMinutes = Math.floor((duration - (durationHours * hoursInMs)) / minutesInMs);
        let durationSeconds = Math.floor((duration - (durationHours * hoursInMs) - (durationMinutes * minutesInMs)) / 1000);

        durationpicker.setvalues({
          hours: durationHours,
          minutes: durationMinutes,
          seconds: durationSeconds
        });

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
            // DOM is loaded so jQuery has built this HTML.
            let rateSeconds: HTMLInputElement = document.querySelector(REQUEST_SECONDS) as HTMLInputElement;
            let rateMinutes: HTMLInputElement = document.querySelector(REQUEST_MINUTES) as HTMLInputElement;
            let rateHours: HTMLInputElement = document.querySelector(REQUEST_HOURS) as HTMLInputElement;

            let isValid: boolean = that.isDeliverableValid();
            let rateHoursInMs: number = parseInt(rateHours.value) * 60 * 60 * 1000; // convert hours to ms
            let rateMinutesInMs: number = parseInt(rateMinutes.value) * 60 * 1000; // convert minutes to ms
            let rateSecsInMs: number = parseInt(rateSeconds.value) * 1000 // convert seconds to ms
            let rateInMs: number = rateHoursInMs + rateMinutesInMs + rateSecsInMs;

            let delivPayload: Deliverable = {
                _id: mongoId.value,
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
                regressionTest: regressionTest.checked,
                regressionTests: regressionTests.value,
                studentsMakeTeams: studentsMakeTeams.checked,
                gradesReleased: gradesReleased.checked,
                projectCount: parseInt(projectCount.value),
                buildingRepos: buildingRepos.checked,
                open: new Date(open.value).getTime(),
                close: new Date(close.value).getTime(),
                dockerImage: dockerImage.value,
                rate: rateInMs,
                whitelistedServers: whitelistedServers.value,
                dockerOverride: dockerOverride.checked,
                dockerRepo: dockerRepo.value,
                dockerKey: dockerKey.value,
                dockerLogs: undefined, // Handled by classportal-backend
                buildingContainer: undefined, // Handled by classportal-backend
                customHtml: customHtml.checked,
                custom: JSON.parse(customJson.value)
            }
            console.log('DeliverableView:: DEBUG All Deliverable submission properties' + JSON.stringify(delivPayload));
            if (isValid) {
                that.save(delivPayload);
            }
        });

        UI.hideModal();
    }

    /**
    * Determines if the Deliverable values loaded on the EditDeliverable view are valid and are ready to be saved.
    *
    * @return boolean true if deliverable properties are valid.
    */
    private isDeliverableValid(): boolean {

        const SPACE_DELIN_REGEX: RegExp = /[^ ]+/g;
        const HTTPS_REGEX = new RegExp(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
        const NAME_REGEX: RegExp = /^[^_]+([0-9])/;
        const TEAM_SIZE_ERR: string = 'The minimum team size cannot be greater than the maximum team size';
        const CUSTOM_JSON_ERR: string = 'Your custom JSON input should be valid stringified JSON: ';
        const DELIV_NAME_ERR: string = 'A deliverable name must be all lowercase letters, up to 10 characters, and a combination of [a-z] and [0-9].';
        const GIT_REPO_ERR: string = 'Please make sure your Git repo addresses are valid Https URIs.';
        const OPEN_CLOSE_ERR: string = 'The close date must be greater than the open date.';
        const REGRESION_TEST_ERR: string = 'One of your regression tests does not exist. Please ensure that a Deliverable exists before it is used as a regression test.';

        let minTeamSize: HTMLInputElement = document.querySelector(MIN_TEAM_SIZE) as HTMLInputElement;
        let maxTeamSize: HTMLInputElement = document.querySelector(MAX_TEAM_SIZE) as HTMLInputElement;
        let openDate: HTMLInputElement = document.querySelector(OPEN_DELIV_KEY) as HTMLInputElement;
        let closeDate: HTMLInputElement = document.querySelector(CLOSE_DELIV_KEY) as HTMLInputElement;
        let customJson: HTMLInputElement = document.querySelector(CUSTOM_JSON) as HTMLInputElement;
        let regressionTests: HTMLInputElement = document.querySelector(REGRESSION_TESTS) as HTMLInputElement;
        let delivName: HTMLInputElement = document.querySelector(DELIV_NAME) as HTMLInputElement;
        let solutionsCodeUrl: HTMLInputElement = document.querySelector(SOLUTIONS_CODE_URL) as HTMLInputElement;
        let starterCodeUrl: HTMLInputElement = document.querySelector(START_CODE_URL) as HTMLInputElement;

        if (regressionTests.value.length > 0) {
            let testValues = regressionTests.value.match(SPACE_DELIN_REGEX);
            let allNamesValid: boolean = true;

            testValues.map((testValue: string) => {
                let testNameValid: boolean = false;
                this.controller.deliverables.map((deliv: Deliverable) => {
                    if (testValue === deliv.name) {
                        console.log('test value', testValue);
                        console.log('deliv name', deliv.name);
                        console.log(testValue === deliv.name);
                        testNameValid = true;
                    }
                });
                if (!testNameValid) {
                    console.log('invalid', testValue);
                    allNamesValid = false;
                }
            });
            console.log('allNamesValid', allNamesValid);
            if (!allNamesValid) {
                UI.notification(REGRESION_TEST_ERR);
                return false;
            }
        }

        if (parseInt(minTeamSize.value) > parseInt(maxTeamSize.value)) {
            UI.notification(TEAM_SIZE_ERR);
            return false;
        }

        if (parseInt(openDate.value) > parseInt(closeDate.value)) {
            UI.notification(OPEN_CLOSE_ERR);
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

        // if (starterCodeUrl.value.search(HTTPS_REGEX) === -1 || solutionsCodeUrl.value.search(HTTPS_REGEX) === -1) {
        //     UI.notification(GIT_REPO_ERR);
        //     return false;
        // }

        return true;
    }

    /**
    * ## INFO ##
    *
    * EditDeliverableView.ts is used for two different CRUD operations:
    *
    * If 'Add Deliverable' view, hit PUT: '/:courseId/admin/deliverable'
    * If 'Edit Deliverable' view, hit POST: '/:courseId/admin/deliverable'
    * @return void
    */
    private save(deliv: Deliverable) {
        console.log('EditDeliverableView::save() - start');
        let url = this.app.backendURL + this.app.currentCourseId + '/admin/deliverable';
        let header = document.querySelector(HTMLTags.EDIT_DELIVERABLE_HEADER) as HTMLElement;
        let isEditDeliv: boolean = header.innerHTML === EDIT_DELIVERABLE_TAG ? true : false;
        let isCreateDeliv: boolean = header.innerHTML === ADD_DELIVERABLE_TAG ? true : false;

        let deliverablePayload = {deliverable: deliv};

        if (isEditDeliv) {
            Network.httpPost(url, deliverablePayload)
                .then((data: any) => {
                    if (data.status >= 200 && data.status < 300) {
                        UI.notification(('Successfully updated Deliverable'));
                        UI.popPage();
                    } else {
                        data.json()
                            .then((response: any) => {
                                UI.notification('There was an error updating the Deliverable: ' + response.err);
                            })
                    }
                })
        } else if (isCreateDeliv) {
            Network.httpPut(url, deliverablePayload)
                .then((data: any) => {
                    if (data.status >= 200 && data.status < 300) {
                        UI.notification('Successfully created Deliverable');
                        UI.popPage();
                    } else {
                        data.json()
                            .then((response: any) => {
                                if (response.err.indexOf('duplicate') > -1) {
                                UI.notification('Deliverable name already exists');
                                } else {
                                    UI.notification('There was an error creating the Deliverable: ' + response.response);
                                }
                            });
                    }
                    console.log('EditDeliverableView::save() - end');
                })
        } else {
            console.log('EditDeliverableView ERROR Could not determine Deliv update/add type');
        }
    }

    public editDeliverable(deliverable: Deliverable) {
        console.log('DeliverableView::editDeliverable( ' + deliverable.id + ' ) - start');
        let that = this;
        UI.showModal();
        UI.pushPage('html/admin/editDeliverable.html', {data: deliverable})
            .then(() => {
                that.initEditDeliverableView(deliverable, that.editTypes.EDIT_DELIVERABLE);
            });
    }
}
