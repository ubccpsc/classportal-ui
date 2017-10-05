import {UI} from "../util/UI";

export class DeliverableView {

    public render(data: any) {
        console.log('DeliverableView::render() - start');
        document.querySelector('#adminTabsHeader').innerHTML = data.course;

        // deliverables
        const deliverableList = document.querySelector('#admin-deliverable-list');
        if (deliverableList !== null) {
            deliverableList.innerHTML = '';
            for (let deliverable of data.deliverables) {
                deliverableList.appendChild(UI.createListHeader(deliverable.id));
                deliverableList.appendChild(UI.createListItem("Open: " + deliverable.open));
                deliverableList.appendChild(UI.createListItem("Close: " + deliverable.open));
                deliverableList.appendChild(UI.createListItem("Scheme: " + deliverable.scheme));
            }
        } else {
            console.log('DeliverableView::render() - element is null');
        }
    }

}