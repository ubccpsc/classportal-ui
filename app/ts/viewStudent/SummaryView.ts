import {UI} from "../util/UI";

export class SummaryView {

    public render(data: any): void {
        console.log('SummaryView::render() - start');
        const studentList = document.querySelector('#student-summary-list');
        if (studentList !== null) {
            studentList.innerHTML = '';

            studentList.appendChild(UI.createListHeader('Name'));
            studentList.appendChild(UI.createListItem(data.name));

            studentList.appendChild(UI.createListHeader('CWL'));
            studentList.appendChild(UI.createListItem(data.cwl));

            studentList.appendChild(UI.createListHeader('Lab'));
            studentList.appendChild(UI.createListItem(data.lab));
        } else {
            console.log('SummaryView::render() - null element');
        }
    }

}