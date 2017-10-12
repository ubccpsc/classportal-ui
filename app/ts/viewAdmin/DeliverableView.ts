import {UI} from "../util/UI";
import {AdminController} from "../controllers/AdminController";

export interface Deliverable {
    id: string;
    open: Date;
    close: Date;
}

export class DeliverableView {
    private controller: AdminController;

    constructor(controller: AdminController) {
        this.controller = controller;
    }

    public updateTitle() {
        // document.querySelector('#adminTabsHeader').innerHTML = data.course;
        document.querySelector('#adminTabsHeader').innerHTML = "Deliverables";
    }


    public render(data: any) {
        console.log('DeliverableView::render(..) - start');
        this.updateTitle();

        if (typeof data === 'undefined') {
            console.log('DeliverableView::render(..) - data is undefined');
            return;
        }
        console.log('DeliverableView::render(..) - data: ' + JSON.stringify(data));

        let deliverables: Deliverable[] = [];
        if (typeof data.response !== 'undefined') {
            for (let deliverable of data.response) {
                deliverables.push({id: deliverable.name, open: new Date(deliverable.open), close: new Date(deliverable.close)});
            }
        }
        this.controller.deliverables = deliverables; // HACK: global

        // deliverables
        const deliverableList = document.querySelector('#admin-deliverable-list');
        if (deliverableList !== null) {
            deliverableList.innerHTML = '';
            if (deliverables.length > 0) {
                for (let deliverable of deliverables) {
                    deliverableList.appendChild(UI.createListHeader(deliverable.id));
                    deliverableList.appendChild(UI.createListItem("Open: " + deliverable.open));
                    deliverableList.appendChild(UI.createListItem("Close: " + deliverable.close));
                }
            } else {
                deliverableList.appendChild(UI.createListItem("No deliverable data returned from server."));
            }
        } else {
            console.log('DeliverableView::render() - element is null');
        }

        UI.hideModal();
    }

}