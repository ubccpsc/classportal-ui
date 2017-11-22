import {UI} from "../util/UI";
import {AdminController} from "../controllers/AdminController";
import {DeliverablePayload, DeliverablePayloadContainer} from "../Models";
import {ProvisionTeamsDetailsView} from "../viewAdmin/ProvisionTeamsDetailsView";
import {RawTeamPayload} from "../Models";
import {Network} from "../util/Network";
import {App} from "../App";

const OPEN_DELIV_KEY = 'open';
const CLOSE_DELIV_KEY = 'close';
const TAPPABLE_INTERFACE = true;
const DELIV_HTML_LIST_ID = '#admin-provision-teams-deliverable-list';
const PROVISION_DETAILS_ID = '#admin-provision-details';

declare var myApp: App;

export class ProvisionTeamsDeliverableView {
    private controller: AdminController;
    private provisionTeamsDetailsView: ProvisionTeamsDetailsView;

    constructor(controller: AdminController) {
        this.controller = controller;
    }

    public updateTitle() {
        // document.querySelector('#adminTabsHeader').innerHTML = data.course;
        document.querySelector('#adminProvisionTeamsHeader').innerHTML = "Team Provisions by Deliverable";
    }

    public render(data: DeliverablePayloadContainer) {
        console.log('ProvisionTeamsDeliverableView::render(..) - start');
        this.updateTitle();
        let that = this;

        let uiHTMLList = document.querySelector(DELIV_HTML_LIST_ID);
        uiHTMLList.innerHTML = '';
        
        for (let deliverable of data.response) {
          let delivRow = UI.createListItem(deliverable.name, String(myApp.currentCourseId) + ' Deliverable', TAPPABLE_INTERFACE);
          delivRow.onclick = function() {
            that.provisionTeamsDetailsView = new ProvisionTeamsDetailsView(that.controller, deliverable);
            that.viewDeliverableProvision(deliverable.name);
          }
          uiHTMLList.appendChild(delivRow);
        }

        UI.hideModal();
    }

    private getTeamProvisions() {
      let that = this;
      let url = myApp.backendURL + myApp.currentCourseId + '/admin/teams';
      Network.handleRemote(url, that.provisionTeamsDetailsView, UI.handleError);
    }

    private viewDeliverableProvision(delivName: string) {
        console.log('ProvisionTeamsDeliverableView::viewDeliverableProvision( ' + delivName + ' ) - start');
        UI.showModal();
        this.getTeamProvisions();
    }

}