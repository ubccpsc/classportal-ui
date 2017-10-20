import {UI} from "../util/UI";
import {AdminController} from "../controllers/AdminController";
import {SortableTable, TableCell, TableHeader} from "../util/SortableTable";
import {OnsCheckboxElement, OnsSelectElement} from "onsenui";


export interface GradePayloadContainer {
    response: GradeRow[];
}

export interface GradeContainer {
    headers: string[];
    grades: GradeRow[];
}

/**
 * This is the old format we're going to get away from shortly.
 */
export interface GradeRow {
    userName: string; // cwl
    userUrl: string;
    sNum: string; // may be removed in future
    fName: string; // may be removed in future
    lName: string; // may be removed in future
    projectUrl: string; // full URL to project
    projectName: string; // string name for project (e.g., cpsc310_team22)

    timeStamp: number; // Date.getTime()
    commitUrl: string; // full URL to commit corresponding to the row
    delivId: string; // deliverable name
    gradeKey: string; // deliverable name (e.g., d0last)
    gradeValue: string; // score for deliverable key (use string rep for flexibility)
    gradeRequested: boolean; // was the result explicitly requested by the student
    gradeDetails: ExtraDetail[];
}

/**
 * Future interface for exposing TestRecords to courses for converting into their own GradeRecord.
 */
export interface TestPayloadContainer {
    response: TestRecord[];
}

export interface TestRecord {
    target: TestTarget;
    entries: TestEntry[]
}

export interface TestTarget {
    userName: string;           // cwl
    userUrl: string;            // full URL to user
    sNum: string;
    fName: string;
    lName: string;
    labId: string;
    projectUrl: string;         // full URL to project
    projectName: string;        // string name for project (e.g., cpsc310_team22)
}

export interface TestEntry {
    timeStamp: number;          // timestamp of the webhoook push event
    commitUrl: string;          // full URL to commit corresponding to the row
    commitBranch: string;       // branch name
    delivId: string;            // deliverable name
    grade: string;              // string, just in case people want to use letters instead of numbers
    gradeRequested: boolean;    // was the result explicitly requested by the student
    gradeDetails: ExtraDetail[];
}

/**
 * Required columns for CSV upload; the first row must contain thes labels with this case.
 * If any of these are missing, the upload will be rejected.
 * If the CSV contains more than one delivId, the upload will be rejected.
 *
 * Uploads will always overwrite all previous records for each student for that deliverable.
 *
 * You can add _any_ other columns you want. Only columns with headers will be considered.
 * The column header _must_ not collide with any existing column (from any deliverable);
 * this will _not_ be validated by the system.
 *
 * The grade and any additional columns you add will be visible to students when they view
 * their grade details.
 *
 * Empty cells will be treated as ''.
 *
 * userName
 * sNum
 * labId
 * projectName
 * delivId
 * grade
 *
 */

/**
 * Proposed grade record for our backend tracking & supporting editing.
 */
export interface GradeRecord {
    userName: string;       // cwl
    userUrl: string;
    sNum: string;
    fName: string;
    lName: string;
}

/**
 * Details about a graded deliverable.
 */
export interface GradeDeliverable {
    delivId: string;
    projectName: string;        // shouldn't be here, but this handles teams & individuals
    projectUrl: string;
    grade: string;
    gradeDetails: ExtraDetail[]
}

/**
 * This is for extra detail about grades.
 *
 * This will not be used this term, but future containers can emit things like:
 *
 * {key: 'testScore', value: 92}
 * {key: 'branchCoverage', value: 65}
 *
 * And those can be forwarded back with the TestRecord.
 *
 *
 */
export interface ExtraDetail {
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

        let processedData = this.processResponse(data);

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

            // this is a hack that should be dealt with better
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
                                value: row.projectName,
                                html:  '<a href="' + row.projectUrl + '">' + row.projectName + '</a>'
                            });
                        }

                        for (let i = 0; i < numCells; i++) {
                            let html = '';
                            let val = '';
                            if (typeof row.grades[i] !== 'undefined') {
                                val = row.grades[i].value;
                                html = row.grades[i].html;
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

    private processResponse(data: GradeRow[]) {

        let students = {};
        let delivNamesMap = {};

        for (var row of data) {
            const userName = row.userName;
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

        let headers = ['CWL', 'Student #', 'First', 'Last'];
        if (this.delivId !== 'all') {
            headers.push('Project');
        }
        headers = headers.concat(delivKeys);
        students['_index'] = headers;

        for (var row of data) {
            if (this.includeRecord(row)) {
                const userName = row.userName;
                const delivKey = row.gradeKey;

                const student = students[userName];
                const index = delivKeys.indexOf(delivKey);

                student.timeStamp = row.timeStamp;
                student.cwl = row.userName;
                student.snum = row.sNum;
                student.fName = row.fName;
                student.lName = row.lName;
                student.projectName = row.projectName;
                student.projectUrl = row.projectUrl;

                if (typeof student.grades === 'undefined') {
                    student.grades = [];
                }

                student.grades[index] = {
                    value: row.gradeValue,
                    html:  '<a href="' + row.commitUrl + '">' + row.gradeValue + '</a>'
                };

                // row.delivDetails // UNUSED right now
            }
        }

        // console.log('grade data processed: ' + JSON.stringify(students));
        return students;
    }

    private includeRecord(row: GradeRow): boolean {
        if ((this.delivId === 'all' || this.delivId === row.delivId) && typeof row.sNum !== 'undefined') { // test rows don't have snums
            if (this.lastOnly === false || row.gradeKey.indexOf('Last') >= 0) { // HACK: checking this string is a bad idea
                return true;
            }
        }
        return false;
    }
}