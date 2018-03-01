import {UI} from "../util/UI";
import {App} from "../App";
import {AdminController} from "../controllers/AdminController";
import {SortableTable, TableCell, TableHeader} from "../util/SortableTable";
import {OnsCheckboxElement, OnsSelectElement} from "onsenui";
import {Network} from '../util/Network';

const DELIV_SELECT = 'adminGradesView__deliverable-select';
const GRADE_TABLE = '#adminGradesView__grade-table';
const UPDATE_BUTTON = '#adminGradesView__deliverable-submit-button';
const ALL_OPTION = 'all';

export interface GradePayloadContainer {
    response: GradeRow[];
}

export interface GradeContainer {
    headers: string[];
    grades: GradeRow[];
}

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
    gradeDetails: GradeDetail[];
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
    userName: string; // cwl
    userUrl: string;
    sNum: string; // may be removed in future
    fName: string; // may be removed in future
    lName: string; // may be removed in future
    projectUrl: string; // full URL to project
    projectName: string; // string name for project (e.g., cpsc310_team22)
}

export interface TestEntry {
    timeStamp: number; // Date.getTime()
    commitUrl: string; // full URL to commit corresponding to the row
    delivId: string; // deliverable name
    gradeKey: string; // deliverable name (e.g., d0last)
    gradeValue: string; // score for deliverable key (use string rep for flexibility)
    gradeRequested: boolean; // was the result explicitly requested by the student
    gradeDetails: GradeDetail[];
}

/**
 * Proposed grade record.
 */
export interface GradeRecord {
    userName: string;       // cwl
    userUrl: string;
    sNum: string;
    fName: string;
    lName: string;
    delivId: string;
    projectName: string;    // shouldn't be here, but this handles teams & individuals
    projectUrl: string;
    gradeDetails: GradeDetail[]
}

/**
 * This is for extra detail about grades. E.g., if we wanted to return the test and cover score components as well.
 *
 * Will probably be useful for future grade extensions.
 */
export interface GradeDetail {
    key: string;
    value: string;
}

export class GradesView {
    private data: any; // TODO: add types

    private delivId = 'all';
    private lastOnly = false;
    private courseId: string;
    private app: App;
    private controller: AdminController;

    constructor(controller: AdminController, courseId: string, app: App) {
        this.controller = controller;
        this.courseId = courseId;
        this.app = app;
    }

    /**
    * Will  setup the Deliv Selector and add an Event Listener to the Submit button.
    * Must run before most render functions.
    **/
    public configure() {
        console.log('GradeView::configure() - start');
        let that = this;
        if (this.controller.deliverables !== null) {
            const delivSelect = document.getElementById(DELIV_SELECT) as OnsSelectElement;
            while (delivSelect.options.length > 0) {
                delivSelect.remove();
            }

            let option = document.createElement("option");
            option.text = 'All';
            option.value = ALL_OPTION;
            (<any>delivSelect).add(option);

            for (let deliv of this.controller.deliverables) {
                let option = document.createElement("option");
                option.text = deliv.id;
                option.value = deliv.id;
                (<any>delivSelect).add(option);
            }
        }

        let delivSelect = document.getElementById(DELIV_SELECT) as OnsSelectElement;
        let getGradesAction = document.querySelector(UPDATE_BUTTON) as HTMLButtonElement;
            let selectedDeliv: string = delivSelect.options[delivSelect.options.selectedIndex].value;
            console.log(selectedDeliv);
        getGradesAction.addEventListener('click', () => {
            let selectedDeliv: string = delivSelect.options[delivSelect.options.selectedIndex].value;

            // Loads the specified Grade data based on the drop-down menu.
            if (selectedDeliv === ALL_OPTION) {
                that.getAllGradeData(this.courseId);
            } else {
                that.getGradeDataByDeliv(this.courseId, selectedDeliv);
            }
        });
    }

    private async getGradeDataByDeliv(courseId: string, delivName: string) {
        console.log('GradeView::getGradeDataByDeliv() - start, delivName: ' + delivName);
        let url = this.app.backendURL + this.courseId + '/admin/grades/' + delivName;
        Network.httpGet(url)
            .then((data: any) => {
                console.log(data);
            })
            .catch((err) => {
                UI.notification('There was an error retrieving the Deliverable Data for Course ' + this.courseId + ' and Deliverable ' + delivName);
            });

    }

    private async getAllGradeData(courseNum: string) {
        console.log('GradeView::getAllGradeData() - start, course: ' + courseNum);
        let url = this.app.backendURL + this.courseId + '/admin/grades';
        Network.httpGet(url)
            .then((data: any) => {
                console.log('success data in getAllGradeData() ', data);
            })
            .catch((err) => {
                UI.notification('There was an error retrieving the Deliverable Data for Course ' + this.courseId + '.');
            });

    }

    public async renderGradeData(data: any, delivName: string) {
        console.log('GradeView::renderGradesData() - start, delivName: ' + delivName);

        // console.log('GradeView::render(..) - data: ' + JSON.stringify(data));
        this.data = data;

        data = data.response;

        let processedData = this.processResponse(data);

        var gradeList = document.querySelector(GRADE_TABLE);
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

            let table = new SortableTable(headers, GRADE_TABLE);

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

    private render(data: any) {
        console.log('GradeView::render(..) - start');
        // ### IMPORTANT ###
        // As this is the first view that loads, data should be entered into controller as a global.
        this.controller.deliverables = data.response;

        // Configure Select Deliv menu
        this.configure();
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