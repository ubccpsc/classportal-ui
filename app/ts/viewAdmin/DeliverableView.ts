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
const DELIV_NAME = '#adminEditDeliverablePage-name';
const MIN_TEAM_SIZE = '#adminEditDeliverablePage-minTeamSize';
const MAX_TEAM_SIZE = '#adminEditDeliverablePage-maxTeamSize';
const MUST_BE_IN_SAME_LAB = '#adminEditDeliverablePage-inSameLab';
const STUDENTS_MAKE_TEAMS = '#adminEditDeliverablePage-studentsMakeTeams';
const GRADES_RELEASED = '#adminEditDeliverablePage-gradesReleased';
const BUILDING_REPOS = '#adminEditDeliverablePage-buildingRepos';
const PROJECT_COUNT = '#adminEditDeliverablePage-projectCount';
const EDIT_DELIVERABLE_PAGE_HEADER = '#adminEditDeliverablePage-header';
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

        let starterCode: HTMLInputElement = document.querySelector(START_CODE_URL) as HTMLInputElement;
        starterCode.value = deliverable.url;

        let delivName: HTMLInputElement = document.querySelector(DELIV_NAME) as HTMLInputElement;
        delivName.value = deliverable.name;

        let minTeamSize: HTMLInputElement = document.querySelector(MIN_TEAM_SIZE) as HTMLInputElement;
        minTeamSize.value = String(deliverable.minTeamSize);

        let maxTeamSize: HTMLInputElement = document.querySelector(MAX_TEAM_SIZE) as HTMLInputElement;
        maxTeamSize.value = String(deliverable.maxTeamSize);

        let mustBeInSameLab: HTMLInputElement = document.querySelector(MUST_BE_IN_SAME_LAB) as HTMLInputElement;
        mustBeInSameLab.value = deliverable.teamsInSameLab === true ? 'true' : 'false';

        let studentsMakeTeams: HTMLInputElement = document.querySelector(STUDENTS_MAKE_TEAMS) as HTMLInputElement;
        studentsMakeTeams.value = deliverable.studentsMakeTeams === true ? 'true' : 'false';

        let gradesReleased: HTMLInputElement = document.querySelector(GRADES_RELEASED) as HTMLInputElement;
        gradesReleased.value = deliverable.gradesReleased === true ? 'true' : 'false';

        let projectCount: HTMLInputElement = document.querySelector(PROJECT_COUNT) as HTMLInputElement;
        projectCount.value = String(deliverable.projectCount);

        let buildingRepos: HTMLInputElement = document.querySelector(BUILDING_REPOS) as HTMLInputElement;
        buildingRepos.value = deliverable.buildingRepos === true ? 'true' : 'false';

        if (viewType === this.editTypes.EDIT_DELIVERABLE) {

            let header = document.querySelector(EDIT_DELIVERABLE_PAGE_HEADER) as HTMLElement;
            header.innerHTML = 'Edit Deliverable';
            
            // ## DISABLE fields in edit       
            buildingRepos.setAttribute(DISABLED_ONSEN_ATTRIBUTE, "");
            delivName.setAttribute(DISABLED_ONSEN_ATTRIBUTE, "");
        }

        FlatPicker.setFlatPickerField(deliverable.open, OPEN_DELIV_KEY);
        FlatPicker.setFlatPickerField(deliverable.close, CLOSE_DELIV_KEY);

        // TODO: update to use the ids in the HTML file and populate values from there (except for the date, that will need to be moved over)
        /*
            let editableDeliv = document.querySelector('#admin-editable-deliverable-list') || document.querySelector('#admin-manage-deliverables');
            editableDeliv.innerHTML = '';
        */

        UI.hideModal();
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