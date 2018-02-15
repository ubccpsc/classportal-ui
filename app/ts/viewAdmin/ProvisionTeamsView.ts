import {UI} from "../util/UI";
import {AdminController} from "../controllers/AdminController";
import {Deliverable, DeliverablePayload, TeamGenerationPayload, 
    TeamGenerationResponseContainer, TeamGenerationResponse} from "../Models";
import {ProvisionHealthCheck, ProvisionHealthCheckContainer} from "../Models";
import {Network} from "../util/Network";
import {OnsModalElement} from "onsenui";
import {App} from "../App";

const PAGE_HEADER = '#adminTeamsPage__assigned-teams-header';

declare var myApp: App;

export class ProvisionTeamsView {
    private controller: AdminController;
    private deliverable: Deliverable;
    private teamsProvisioned: boolean;
    // private currentlyProvisioning: boolean; - not implemented on back-end properly.

    constructor(controller: AdminController, deliverable: Deliverable) {
        this.controller = controller;
        this.deliverable = deliverable;
    }

    public updateTitle() {
        let title = document.querySelector(PAGE_HEADER) as HTMLElement;
        title.innerText = 'text';
        console.log(title);
    }

    private fetchDelivTeamOverview() {
        console.log('ProvisionTeamsDetailsView::fetchHealthInfo(..) - start - data: ');
        let url = myApp.backendURL + myApp.currentCourseId + '/admin/teams/' + this.deliverable.name + '/overview';
        return Network.httpGet(url)
            .then((data: ProvisionHealthCheckContainer) => {
                return data;
            });
    }

    public render() {
        console.log('ProvisionTeamsDeliverableView::render(..) - start');
        let that = this;

        UI.pushPage('html/admin/provisionTeams.html', {data: null})
            .then(() => {
                return this.fetchDelivTeamOverview()
                    .then((data: ProvisionHealthCheckContainer) => {
                        return that.loadDetails(data.response);
                    });
        });

    }

    private loadDetails(provisionHealthCheck: ProvisionHealthCheck) {
        this.updateTitle();
        console.log('anything!');
        UI.notification('test');
    }
}