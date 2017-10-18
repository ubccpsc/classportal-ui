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

        // console.log('GradeView::render(..) - data: ' + JSON.stringify(data));

        data = data.response;

        let processedData = this.process(data);
        
        var gradeList = document.querySelector('#admin-grade-table');
        if (gradeList !== null) {
            gradeList.innerHTML = '';

            let headers: TableHeader[] = [];
            const headerRow = processedData['_index'];
            let defaultSort = true;
            for (let h of headerRow) {
                headers.push({id: h, text: h, sortable: true, defaultSort: defaultSort, sortDown: true});
                defaultSort = false;
            }
            let numCells = headerRow.length - 1;

            let table = new SortableTable(headers, '#admin-grade-table');

            for (let key of Object.keys(processedData)) {
                if (key !== '_index') {
                    let row = processedData[key];

                    let r: TableCell[] = [];
                    r.push({
                        value: key,
                        html:  key
                    });
                    for (let i = 0; i < numCells; i++) {
                        let cell: any = [];
                        if (typeof row[i] !== 'undefined') {
                            // cell = row[i];
                            cell = '<a href="' + row[i].url + '">' + row[i].value + '</a>';
                        } else {
                            cell = '';
                        }
                        r.push({
                            value: cell,
                            html:  cell
                        });
                    }
                    table.addRow(r);
                } else {
                    // do nothing; this is the header row
                }
            }
            table.generate();
        }
        UI.hideModal();
    }

    private process(data: any) {

        let students = {};
        let delivNamesMap = {};

        for (var row of data) {
            const userName = row.username;
            const delivKey = row.gradeKey;
            if (typeof students[userName] === 'undefined') {
                students[userName] = []; // get ready for grades
            }
            if (typeof delivNamesMap[delivKey] === 'undefined') {
                delivNamesMap[delivKey] = delivKey;
            }
        }

        let delivKeys = Object.keys(delivNamesMap).sort();

        let headers = ['cwl'];
        headers = headers.concat(delivKeys);
        students['_index'] = headers;

        for (var row of data) {
            const userName = row.username;
            const delivKey = row.gradeKey;

            const student = students[userName];
            const index = delivKeys.indexOf(delivKey);
            student[index] = {url: row.projectUrl, value: row.gradeValue};
        }

        // console.log('grade data processed: ' + JSON.stringify(students));
        return students;
    }


}