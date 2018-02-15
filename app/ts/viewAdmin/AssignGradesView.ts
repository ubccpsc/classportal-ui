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

export class AssignGradesView {
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
        console.log('AssignGradesView::render(..) - start - data: ' + JSON.stringify(data));
        UI.showModal();
        let that = this;   
        console.log(data);

        UI.pushPage('html/admin/assignGrades.html', {data: null})
            .then(() => {
                that.updateTitle();
                UI.hideModal();
        });
    }
}