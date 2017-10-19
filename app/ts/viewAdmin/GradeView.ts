import {UI} from "../util/UI";
import {AdminController} from "../controllers/AdminController";
import {SortableTable, TableCell, TableHeader} from "../util/SortableTable";
import {OnsCheckboxElement, OnsSelectElement} from "onsenui";


export interface GradePayloadContainer {
    response: GradeRow[];
}

export interface GradeRow {
    userName: string; // cwl
    commitUrl: string; // full URL to commit corresponding to the row
    gradeKey: string; // deliv key shows Last or Max with delivNum ie . d1Last, d3Max
    gradeValue: string; // score for deliverable key (use string rep for flexibility)
    delivId: string; // deliverable Name e.g. d0
    projectUrl: string; // full URL to project
    projectName: string; // string name for project (e.g., cpsc310_team22)
    sNum: string; // may be removed in future
    fName: string; // may be removed in future
    lName: string; // may be removed in future
    timeStamp: number;
    delivDetails: GradeDetail[];
}

/**
 * This is for extra detail about grades. E.g., if we wanted to return the test and cover score components as well.
 * Will probably be useful for future grade extensions.
 */
export interface GradeDetail {
    key: string;
    value: string;
}

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
            // let headers = ['CWL', 'Student #', 'First', 'Last', 'Team'];
            let numCells = headerRow.length - 5;
            if (this.delivId === 'all') {
                numCells = headerRow.length - 4; // no team column
            }

            let table = new SortableTable(headers, '#admin-grade-table');

            for (let key of Object.keys(processedData)) {
                if (key !== '_index') {
                    if (typeof processedData[key] !== 'undefined' && typeof processedData[key].cwl !== 'undefined') {
                        let row = processedData[key];

                        let r: TableCell[] = [];

                        r.push({
                            value: row.cwl,
                            html:  '<a href="https://github.ubc.ca/' + row.cwl + '">' + row.cwl + '</a>'
                        });
                        r.push({
                            value: row.snum,
                            html:  row.snum
                        });
                        r.push({
                            value: row.fName,
                            html:  row.fName
                        });
                        r.push({
                            value: row.lName,
                            html:  row.lName
                        });
                        if (this.delivId !== 'all') {
                            r.push({
                                value: row.team.value,
                                html:  row.team.html
                            });
                        }


                        for (let i = 0; i < numCells; i++) {
                            // let cell: any = [];
                            let html = '';
                            let val = '';
                            if (typeof row.grades[i] !== 'undefined') {
                                // cell = row[i];
                                html = row.grades[i].html;
                                val = row.grades[i].value;
                            } else {
                                html = '0'; // no record: 0
                                val = '0'; // no record: 0
                            }
                            r.push({
                                value: val,
                                html:  html
                            });
                        }
                        table.addRow(r);
                    } else {
                        console.log('GradeView::render(..) - missing value for key: ' + key);
                    }
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

        let headers = ['CWL', 'Student #', 'First', 'Last'];// , 'Team'];
        if (this.delivId !== 'all') {
            headers.push('Team');
        }
        headers = headers.concat(delivKeys);
        students['_index'] = headers;

        for (var row of data) {
            if (this.includeRecord(row)) {
                const userName = row.username;
                const delivKey = row.gradeKey;

                const student = students[userName];
                const index = delivKeys.indexOf(delivKey);
                // const index = headers.indexOf(delivKey);

                const commitUrl = row.projectUrl;
                const projectUrl = commitUrl.substring(0, commitUrl.lastIndexOf('/commit/'));
                const projectName = projectUrl.substring(projectUrl.lastIndexOf('/') + 1);

                student.cwl = row.username;
                student.snum = row.snum;
                student.fName = row.fname;
                student.lName = row.lname;
                student.team = {value: projectName, html: '<a href="' + projectUrl + '">' + projectName + '</a>'};

                if (typeof student.grades === 'undefined') {
                    student.grades = [];
                }

                student.grades[index] = {
                    value: row.gradeValue,
                    html:  '<a href="' + commitUrl + '">' + row.gradeValue + '</a>'
                };
            }
        }

        // console.log('grade data processed: ' + JSON.stringify(students));
        return students;
    }

    private includeRecord(row: any): boolean {
        if ((this.delivId === 'all' || this.delivId === row.delivId) && typeof row.snum !== 'undefined') { // test rows don't have snums
            if (this.lastOnly === false || row.gradeKey.indexOf('Last') >= 0) { // HACK: checking this string is a bad idea
                return true;
            }
        }
        return false;
    }

}