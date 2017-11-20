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
        document.querySelector('#adminProvisionTeamsHeader').innerHTML = "Deliverable Provisions";
    }

    public render(data: DeliverablePayloadContainer) {
        console.log('DeliverableView::render(..) - start');
        this.updateTitle();

        let uiHTMLList = document.querySelector(UI_HTML_INTERFACE_ID);
        console.log(uiHTMLList);

        console.log(data);
        
        for (let deliverable of data.response) {
          let delivRow = UI.createListItem(deliverable.name, String(myApp.currentCourseId), TAPPABLE_INTERFACE);
          uiHTMLList.appendChild(delivRow);
        }

        UI.hideModal();
    }

    private editDeliverable(deliverable: DeliverablePayload) {
        console.log('DeliverableView::editDeliverable( ' + deliverable.id + ' ) - start');
        UI.showModal();
        UI.pushPage('html/admin/editDeliverable.html', {data: deliverable})
            .then(() => {
                let editableDeliv = document.querySelector('#admin-editable-deliverable') || document.querySelector('#admin-manage-deliverables');
                editableDeliv.innerHTML = '';

                let header = UI.createListHeader('Deliverable ' + deliverable.id);
                let elements = UI.createEditableDeliverable(deliverable);

                editableDeliv.appendChild(header);
                editableDeliv.appendChild(elements);

                let closeDefault = document.getElementById('close') as HTMLInputElement;
                let openDefault = document.getElementById('open') as HTMLInputElement;

                UI.hideModal();
            });
    }

}