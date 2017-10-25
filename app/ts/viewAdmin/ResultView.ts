import {UI} from "../util/UI";
import {AdminController} from "../controllers/AdminController";
import {SortableTable, TableCell, TableHeader} from "../util/SortableTable";
import {OnsCheckboxElement, OnsSelectElement} from "onsenui";
import {GradeRow, ResultPayload, ResultRecord, Student} from "../Models";
// import flatpickr from "flatpickr";
// import * as flatpickr from "flatpickr";
const flatpickr: any = require('flatpickr');

declare var myApp: any;

/**
 * Internal object for tracking students and executions.
 */
interface StudentResults {
    // userName: string;
    student: Student;
    executions: ResultRecord[];
}

export class ResultView {
    dateFilter: any;
    private data: any; // TODO: add types
    private dataToDownload: any; // TODO: change to new type

    private delivId = 'all';
    private lastOnly = false;

    private controller: AdminController;

    constructor(controller: AdminController) {
        this.controller = controller;
    }

    public configure() {
        console.log('ResultView::configure() - start');
        if (this.controller.deliverables !== null) {
            const delivSelect = document.getElementById('admin-result-deliverable-select') as OnsSelectElement;
            while (delivSelect.options.length > 0) {
                delivSelect.remove();
            }

            let option = document.createElement("option");
            option.text = 'Deliv';
            option.value = 'null';
            (<any>delivSelect).add(option);

            for (let deliv of this.controller.deliverables) {
                let option = document.createElement("option");
                option.text = deliv.id;
                option.value = deliv.id;
                (<any>delivSelect).add(option);
            }

            try {
                // for some reason this isn't working
                this.dateFilter = flatpickr("#admin-result-date", {
                    enableTime:  true,
                    time_24hr:   true,
                    dateFormat:  "Y/m/d @ H:i",
                    defaultDate: new Date()
                });

                console.log('ResultView::configure() - done');
            } catch (err) {
                console.log('flatpickr error: ' + err.message);
            }

        }
    }

    public updateTitle() {
        // document.querySelector('#adminTabsHeader').innerHTML = data.course;
        document.querySelector('#adminTabsHeader').innerHTML = "AutoTest Results";
    }

    public render(data: any) {
        console.log('ResultView::render(..) - start');
        this.updateTitle();

        this.data = data;
        data = data.response;

        // let processedData = this.processResponse(data);
        let processedData = this.convertResultsToGrades(data);

        if (this.delivId !== 'null' && this.delivId !== null) {
            document.getElementById('resultDataDownloadButton').style.display = 'block';
        } else {
            document.getElementById('resultDataDownloadButton').style.display = 'none';
        }

        var gradeList = document.querySelector('#admin-result-table');
        if (gradeList !== null) {
            gradeList.innerHTML = '';

            let headers: TableHeader[] = [];
            //const headerRow = processedData['_index'];

            headers.push({id: 'userName', text: 'CWL', sortable: true, defaultSort: false, sortDown: true});
            headers.push({id: 'studentNumber', text: 'Student #', sortable: true, defaultSort: false, sortDown: true});
            headers.push({id: 'fName', text: 'First', sortable: true, defaultSort: false, sortDown: true});
            headers.push({id: 'lName', text: 'Last', sortable: true, defaultSort: false, sortDown: true});
            headers.push({id: 'lab', text: 'Lab', sortable: true, defaultSort: false, sortDown: true});
            headers.push({id: 'project', text: 'Project', sortable: true, defaultSort: false, sortDown: true});
            headers.push({id: 'grade', text: this.delivId + ' Last Execution', sortable: true, defaultSort: true, sortDown: true});

            let table = new SortableTable(headers, '#admin-result-table');

            let allGrades: number[] = [];
            for (let key of Object.keys(processedData)) {
                let row = processedData[key] as StudentResults;
                // HACK: this does not print people who did nothing!
                if (typeof row !== 'undefined' && typeof row.student.sNum !== 'undefined') {


                    let r: TableCell[] = [];
                    r.push({
                        value: row.student.userName,
                        html:  '<a href="' + row.student.userUrl + '">' + row.student.userName + '</a>'
                    });
                    r.push({
                        value: row.student.sNum,
                        html:  row.student.sNum
                    });
                    r.push({
                        value: row.student.fName,
                        html:  row.student.fName
                    });
                    r.push({
                        value: row.student.lName,
                        html:  row.student.lName
                    });
                    r.push({
                        value: row.student.labId,
                        html:  row.student.labId
                    });
                    if (row.executions[0].projectUrl !== '') {
                        r.push({
                            value: row.executions[0].projectName,
                            html:  '<a href="' + row.executions[0].projectUrl + '">' + row.executions[0].projectName + '</a>'
                        });
                    } else {
                        r.push({
                            value: row.executions[0].projectName,
                            html:  row.executions[0].projectUrl
                        });
                    }
                    if (row.executions[0].commitUrl !== '') {
                        r.push({
                            value: row.executions[0].grade,
                            html:  '<a href="' + row.executions[0].commitUrl + '">' + row.executions[0].grade + '</a>'
                        });
                    } else {
                        r.push({
                            value: row.executions[0].grade,
                            html:  row.executions[0].grade
                        });
                    }
                    allGrades.push(Number(row.executions[0].grade));
                    /**
                     * Should do this for the extraDetails
                     */
                    /*
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
                    */
                    table.addRow(r);
                } else {
                    console.log('ResultView::render(..) - missing value for key: ' + key);
                }

            }
            table.generate();


            const num = allGrades.length;
            let total = 0;
            for (let g of allGrades) {
                total += g;
            }
            allGrades = allGrades.sort(); // NOTE: might not be right (check 100s)

            let footer = '<div style="width: 100%; text-align: center;">';
            footer += '<div><b>Average: </b>' + (total / num).toFixed(1) + '</div>';
            footer += '<div><b>Median: </b>' + allGrades[Math.ceil(num / 2)].toFixed(1) + '</div>';
            document.getElementById('admin-result-footer').innerHTML = footer;
        }
        UI.hideModal();
    }

    public update() {
        console.log('ResultView::update() - start');
        const delivSelect = document.getElementById('admin-result-deliverable-select') as OnsSelectElement;
        const lastCheckbox = document.getElementById('admin-result-last') as OnsCheckboxElement;

        if (delivSelect !== null && lastCheckbox !== null) {
            let delivId = delivSelect.value;
            let lastOnly: boolean = lastCheckbox.checked;
            let timeFilter = this.dateFilter.latestSelectedDateObj;
            console.log('ResultView::update() - deliv: ' + delivId + '; dateFilter: ' + timeFilter);

            this.delivId = delivId;
            this.lastOnly = lastOnly;

            if (this.delivId === 'null' || this.delivId === null) {
                this.delivId = null;
                UI.showErrorToast("Please select a deliverable.");
                return;
            }

            if (this.delivId === delivId && typeof this.data !== 'undefined' && this.data !== null) {
                // refresh w/o query (aka just the timestamp changed)
                console.log('ResultView::update() - same deliv; updating without query');
                this.render(this.data);
            } else {
                console.log('ResultView::update() - new deliv requested');
                myApp.adminController.adminResultsPage(delivId);
            }


        } else {
            console.log('ResultView::update() - ERROR: element missing');
            return;
        }
    }

    /**
     * Analyzes the complete results list for a deliverable (aka all test executions for a user
     * or team) to create a single result for each student that can be used for a grade.
     *
     * This is essentially example code as a sample for course instructors to be used for
     * analyzing result records. It is not expected that course instructors will emit
     * StudentResults[] but will instead print a CSV for their own use (aka UBC Connect).
     *
     * By January it will also be possible to upload this CSV to ClassPortal to serve as
     * a Grade record that will be served to the students.
     *
     * @param {ResultPayload} data
     * @returns {StudentResults[]}
     */
    private convertResultsToGrades(data: ResultPayload) {
        console.log('ResultsView::convertResultsToGrades(..) - start');
        try {
            const start = new Date().getTime();

            // just for stats
            let recordCount = 0;
            for (let project of Object.keys(data.projectMap)) {
                recordCount += data.projectMap[project].length;
            }

            // now choose the record we want to emit per-student
            let studentFinal: StudentResults[] = [];
            for (let student of data.students) {

                // make sure the student is someone you want to consider (aka exclude TAs & test accounts)
                if (student.sNum !== '') {
                    const executionsToConsider = data.projectMap[student.projectUrl];

                    let result: ResultRecord = null;
                    if (typeof executionsToConsider !== 'undefined' && executionsToConsider.length > 0) {
                        // in this case we're going to take the last execution before the time cutoff
                        // but you can use any of the ResultRecord rows here (branchName, gradeRequested, grade, etc.)
                        const orderedExecutions = executionsToConsider.sort(function (a: ResultRecord, b: ResultRecord) {
                            return a.timeStamp - b.timeStamp;
                        });

                        const ts = this.dateFilter.latestSelectedDateObj.getTime();
                        for (let record of orderedExecutions) {
                            if (record < ts) {
                                // keep overwriting result until we are past the deadline
                                result = record;
                            }
                        }
                    }

                    if (result === null) {
                        // no execution records for student; put in a fake one that counts as 0
                        console.log('WARN: no execution records for student: ' + student.userName);
                        result = {
                            userName:       student.userName,
                            timeStamp:      -1, // never happened (NOTE: if this is outside some kind of time filter this could be a problem)
                            projectName:    'No Request', // unknown, so give a better message
                            projectUrl:     student.projectUrl,
                            commitUrl:      '',
                            branchName:     '',
                            gradeRequested: false,
                            grade:          '0',
                            delivId:        this.delivId,
                            gradeDetails:   []
                        }
                    }
                    const finalStudentRecord = {
                        student:    student,
                        executions: [result]
                    };
                    studentFinal.push(finalStudentRecord);
                } else {
                    console.log('Excluded student: ' + student.userName);
                }
            }

            const delta = new Date().getTime() - start;
            console.log('Result->Grade conversion complete; # students: ' + data.students.length +
                '; # records: ' + recordCount + '. Took: ' + delta + ' ms');

            this.dataToDownload = data; //studentFinal;
            // this array can be trivially iterated on to turn into a CSV or any other format
            return studentFinal;
        } catch (err) {
            console.error('ResultView::convertResultsToGrades(..) - ERROR: ' + err.members, err);
        }
    }

    public downloadData() {
        console.log('ResultView::downloadData() - start');
        this.downloadJSON(this.dataToDownload, 'TestResults_' + this.delivId + '.json');
    }

    private downloadJSON(json: any, fileName: string) {
        let downloadLink: HTMLAnchorElement;

        let jsonFile = new Blob([JSON.stringify(json, null, '\t')], {type: 'application/json'});

        if (document.getElementById('resultDataDownload') === null) {
            downloadLink = document.createElement('a');
            downloadLink.innerHTML = 'Download Table as CSV';
            downloadLink.id = 'resultDataDownload';
            document.body.appendChild(downloadLink);
        } else {
            downloadLink = document.getElementById('resultDataDownload') as HTMLAnchorElement;
        }

        downloadLink.download = fileName;
        // create a link to the file
        downloadLink.href = window.URL.createObjectURL(jsonFile);
        downloadLink.style.display = 'none';
        // downloadLink.style.textAlign = 'center';
        downloadLink.click();
    }

}