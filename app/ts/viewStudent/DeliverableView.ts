import {UI} from "../util/UI";

export class DeliverableView {

    public render(data: any): void {
        console.log('GradeView::render() - start');

        const deliverableList = document.querySelector('#student-deliverable-list');
        if (deliverableList !== null) {
            deliverableList.innerHTML = '';
            for (const deliverable of  data.deliverables) {
                deliverableList.appendChild(UI.createListItem(deliverable.id, deliverable.due));
            }
        } else {
            console.log('GradeView::render() - element is null');
        }
    }

}