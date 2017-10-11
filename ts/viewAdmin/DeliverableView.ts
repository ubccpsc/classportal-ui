import {UI} from "../util/UI";

export class DeliverableView {

    public render(data: any) {
        console.log('DeliverableView::render() - start');

        if (typeof data === 'undefined') {
            console.log('DeliverableView::render() - data is undefined');
            return;
        }
        document.querySelector('#adminTabsHeader').innerHTML = "Deliverables";

        // deliverables
        const deliverableList = document.querySelector('#admin-deliverable-list');
        if (deliverableList !== null) {
            deliverableList.innerHTML = '';
            if (typeof data.deliverables !== 'undefined') {
                for (let deliverable of data.deliverables) {
                    deliverableList.appendChild(UI.createListHeader(deliverable.id));
                    deliverableList.appendChild(UI.createListItem("Open: " + deliverable.open));
                    deliverableList.appendChild(UI.createListItem("Close: " + deliverable.open));
                    deliverableList.appendChild(UI.createListItem("Scheme: " + deliverable.scheme));
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