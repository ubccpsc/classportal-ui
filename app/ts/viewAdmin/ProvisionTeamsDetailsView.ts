import {UI} from "../util/UI";
import {AdminController} from "../controllers/AdminController";
import {DeliverablePayload, DeliverablePayloadContainer} from "../Models";
import {RawTeamPayload, RawTeamPayloadContainer} from "../Models";
import {Network} from "../util/Network";
import {App} from "../App";

const PROVISION_DETAILS_HEADER_ID = '#adminProvisionTeamsDetailsHeader';
const PROVISION_DETAILS_BODY_ID = '#admin-provision-details';

declare var myApp: App;

export class ProvisionTeamsDetailsView {
    private controller: AdminController;
    private deliverable: DeliverablePayload;
    private teamsProvisioned: boolean;
    // private currentlyProvisioning: boolean; - not implemented on back-end properly.

    constructor(controller: AdminController, deliverable: DeliverablePayload) {
        this.controller = controller;
        this.deliverable = deliverable;
    }

    public updateTitle() {
        // document.querySelector('#adminTabsHeader').innerHTML = data.course;
        document.querySelector(PROVISION_DETAILS_HEADER_ID).innerHTML = "Team Provisions by Deliverable";
    }

    public render(data: RawTeamPayloadContainer) {
        console.log('ProvisionTeamsDetailsView::render(..) - start');
        UI.showModal();
        let that = this;
        let teamCount = 0;

        for (let provisionedTeam of data.response) {

            // If statements checks for both possibiltiies of mark by batch or single deliv logic
            if (provisionedTeam.disbanded !== true && provisionedTeam.deliverableIds.length > 0) {
                let match = false;

                provisionedTeam.deliverableIds.map((deliv: any) => {
                    if (deliv.name === this.deliverable.name) {
                        match = true;
                    }
                });

                if (match) {
                    teamCount++;
                }
            }

            if (provisionedTeam.disbanded !== true && typeof provisionedTeam.deliverableId === 'undefined') {
                teamCount++;
            }
          // let delivRow = UI.createListItem(deliverable.name, String(myApp.currentCourseId) + ' Deliverable', TAPPABLE_INTERFACE);
          // delivRow.onclick = function() {
          //   that.viewDeliverableProvision(deliverable.name);
          console.log(provisionedTeam);
          // }
          // uiHTMLList.appendChild(delivRow);
        }

        UI.pushPage('html/admin/provisionTeamsDetails.html', {data: null})
            .then(() => {
                that.updateTitle();
                UI.hideModal();
        });

        // let uiHTMLList = document.querySelector(PROVISION_DETAILS_BODY_ID);
        // uiHTMLList.innerHTML = '';
    }


}