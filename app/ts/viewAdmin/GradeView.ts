import {UI} from "../util/UI";
import {AdminController} from "../controllers/AdminController";
import {SortableTable, TableCell, TableHeader} from "../util/SortableTable";

export class GradeView {

    private controller: AdminController;

    constructor(controller: AdminController) {
        this.controller = controller;
    }

    public updateTitle() {
        // document.querySelector('#adminTabsHeader').innerHTML = data.course;
        document.querySelector('#adminTabsHeader').innerHTML = "Grades";
    }

    public render(data: any) {

        console.log('GradeView::render(..) - start');
        this.updateTitle();

        data = data.response;
        // ["csid","snum","lname","fname","username","deliverable","finalGrade"]

        var gradeList = document.querySelector('#admin-grade-table');
        if (gradeList !== null) {
            gradeList.innerHTML = '';

            let headers: TableHeader[] = [];
            const headerRow = data[0];
            let defaultSort = true;
            for (let h of headerRow) {
                headers.push({id: h, text: h, sortable: true, defaultSort: defaultSort, sortDown: true});
                defaultSort = false;
            }

            let table = new SortableTable(headers, '#admin-grade-table');

            let count = 0;
            for (let row of data) {
                if (count > 0) {
                    let r: TableCell[] = [];
                    for (let cell of row) {
                        r.push({
                            value: cell,
                            html:  cell
                        });
                        table.addRow(r);
                    }
                } else {
                    // do nothing; this is the header row
                }
                count++;
            }
            table.generate();
        }

        UI.hideModal();
    }


}