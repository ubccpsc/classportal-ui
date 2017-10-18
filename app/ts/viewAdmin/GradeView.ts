import {UI} from "../util/UI";
import {AdminController} from "../controllers/AdminController";
import {SortableTable, TableCell, TableHeader} from "../util/SortableTable";
import {OnsCheckboxElement, OnsSelectElement} from "onsenui";

export class GradeView {
    private data: any; // TODO: add types

    private delivId = 'all';
    private lastOnly = false;

    private controller: AdminController;

    constructor(controller: AdminController) {
        this.controller = controller;
    }

    public configure() {
        console.log('GradeView::configure() - start');
        if (this.controller.deliverables !== null) {
            const delivSelect = document.getElementById('admin-grade-deliverable-select') as OnsSelectElement;
            while (delivSelect.options.length > 0) {
                delivSelect.remove();
            }

            let option = document.createElement("option");
            option.text = 'All';
            option.value = 'all';
            (<any>delivSelect).add(option);

            for (let deliv of this.controller.deliverables) {
                let option = document.createElement("option");
                option.text = deliv.id;
                option.value = deliv.id;
                (<any>delivSelect).add(option);
            }
        }
    }

    public updateTitle() {
        // document.querySelector('#adminTabsHeader').innerHTML = data.course;
        document.querySelector('#adminTabsHeader').innerHTML = "Grades";
    }

    public render(data: any) {

        console.log('GradeView::render(..) - start');
        this.updateTitle();

        // console.log('GradeView::render(..) - data: ' + JSON.stringify(data));
        this.data = data;

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

    public update() {
        console.log('GradeView::update() - start');
        const delivSelect = document.getElementById('admin-grade-deliverable-select') as OnsSelectElement;
        const lastCheckbox = document.getElementById('admin-grade-last') as OnsCheckboxElement;

        if (delivSelect !== null && lastCheckbox !== null) {
            let delivId = delivSelect.value;
            let lastOnly: boolean = lastCheckbox.checked;

            this.delivId = delivId;
            this.lastOnly = lastOnly;

            this.render(this.data);
        } else {
            console.log('GradeView::update() - ERROR: element missing');
            return;
        }
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
            if (this.includeRecord(row)) {
                // not captured yet
                if (typeof delivNamesMap[delivKey] === 'undefined') {
                    delivNamesMap[delivKey] = delivKey;
                }
            }
        }

        const customSort = function (a: any, b: any) {
            return (Number(a.match(/(\d+)/g)[0]) - Number((b.match(/(\d+)/g)[0])));
        };
        let delivKeys = Object.keys(delivNamesMap).sort(customSort);

        let headers = ['CWL'];
        headers = headers.concat(delivKeys);
        students['_index'] = headers;

        for (var row of data) {
            if (this.includeRecord(row)) {
                const userName = row.username;
                const delivKey = row.gradeKey;

                const student = students[userName];
                const index = delivKeys.indexOf(delivKey);
                student[index] = {url: row.projectUrl, value: row.gradeValue};
            }
        }

        // console.log('grade data processed: ' + JSON.stringify(students));
        return students;
    }

    private includeRecord(row: any): boolean {
        if (this.delivId === 'all' || this.delivId === row.delivId) {
            if (this.lastOnly === false || row.gradeKey.indexOf('Last') >= 0) { // HACK: checking this string is a bad idea
                return true;
            }
        }
        return false;
    }

}