import {UI} from "../util/UI";
import {AdminController} from "../controllers/AdminController";
import {DeliverablePayload, DeliverablePayloadContainer} from "../Models";
import {RawTeamPayload} from "../Models";
import {App} from "../App";
const OPEN_DELIV_KEY = 'open';
const CLOSE_DELIV_KEY = 'close';
const TAPPABLE_INTERFACE = true;
const UI_HTML_INTERFACE_ID = '#admin-provision-teams-deliverable-list';

declare var myApp: App;

export class ProvisionTeamsView {
    private controller: AdminController;

    constructor(controller: AdminController) {
        this.controller = controller;
    }

    public updateTitle() {
        // document.querySelector('#adminTabsHeader').innerHTML = data.course;
        document.querySelector('#adminProvisionTeamsHeader').innerHTML = "Team Provisions by Deliverable";
    }

    public render(data: DeliverablePayloadContainer) {
        console.log('DeliverableView::render(..) - start');
        this.updateTitle();
        let that = this;

        let uiHTMLList = document.querySelector(UI_HTML_INTERFACE_ID);
        console.log(uiHTMLList);
        
        for (let deliverable of data.response) {
          let delivRow = UI.createListItem(deliverable.name, String(myApp.currentCourseId) + ' Deliverable', TAPPABLE_INTERFACE);
          delivRow.onclick = function() {
            that.viewDeliverableProvision(deliverable.name);
          }
          uiHTMLList.appendChild(delivRow);
        }

        UI.hideModal();
    }

    private viewDeliverableProvision(delivName: string) {
        console.log('DeliverableView::editDeliverable( ' + delivName + ' ) - start');
        UI.showModal();
        UI.pushPage('html/admin/provisionTeamDetails.html', {data: delivName})
            .then(() => {
                UI.hideModal();
            });
    }

}