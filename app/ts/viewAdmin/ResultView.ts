import {UI} from "../util/UI";
import {AdminController} from "../controllers/AdminController";
import {SortableTable, TableCell, TableHeader} from "../util/SortableTable";
import {OnsCheckboxElement, OnsSelectElement} from "onsenui";
import {ResultPayload, ResultRecord, Student, StudentResult} from "../Models";
// import flatpickr from "flatpickr";
// import * as flatpickr from "flatpickr";
const flatpickr: any = require('flatpickr');

declare var myApp: any;

/**
 * Internal object for tracking students and executions.
 */
interface StudentGrades {
    student: Student;
    executions: ResultRecord[]; // in future could be extended to multiple deliverables (delivId is encoded in ResultRecord)
}

export class ResultView {
    private dateFilter: any;
    private data: ResultPayload;
    private dataToDownload: ResultPayload; // TODO: refactor this away (same as data now)

    private delivId = 'all';

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
                console.error('ResultView::configure() - flatpickr ERROR: ' + err.message);
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
        this.dataToDownload = data; // just for the UI
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
            headers.push({id: 'grade310', text: this.delivId + ' Max On Master', sortable: true, defaultSort: false, sortDown: true});
            headers.push({id: 'grade210', text: this.delivId + ' Max Requested', sortable: true, defaultSort: false, sortDown: true});

            let table = new SortableTable(headers, '#admin-result-table');

            let allGrades: number[] = [];
            for (let key of Object.keys(processedData)) {
                let row = processedData[key] as StudentGrades;
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
                    for (let record of row.executions) {
                        if (record.commitUrl !== '') {
                            r.push({
                                value: record.grade,
                                html:  '<a href="' + record.commitUrl + '">' + record.grade + '</a>'
                            });
                        } else {
                            r.push({
                                value: record.grade,
                                html:  record.grade
                            });
                        }
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
            allGrades = allGrades.sort(function (a, b) {
                return Number(a) - Number(b);
            }); // NOTE: might not be right (check 100s)

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

        if (delivSelect !== null) {
            let delivId = delivSelect.value;
            let timeFilter = this.dateFilter.latestSelectedDateObj;
            console.log('ResultView::update() - deliv: ' + delivId + '; dateFilter: ' + timeFilter);

            if (delivId === 'null' || delivId === null) {
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

            this.delivId = delivId;

        } else {
            console.log('ResultView::update() - ERROR: element missing');
            return;
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

    private getTimeLimit(): number {
        // note: you probably want to instead return the right timestamp
        // for the due date of the deliverable you are generating grades for.
        return this.dateFilter.latestSelectedDateObj.getTime();
    }

    /**
     * Analyzes the complete results list for a deliverable (aka all test executions for a user
     * or team) to create a single result for each student that can be used for a grade.
     *
     * This is essentially example code as a sample for course instructors to be used for
     * analyzing result records. It is not expected that course instructors will emit
     * StudentGrades[] but will instead print a CSV for their own use (aka UBC Connect).
     *
     * By January it will also be possible to upload this CSV to ClassPortal to serve as
     * a Grade record that will be served to the students.
     *
     * @param {ResultPayload} data
     * @returns {StudentGrades[]}
     */
    private convertResultsToGrades(data: ResultPayload): StudentGrades[] {
        console.log('ResultsView::convertResultsToGrades(..) - start');
        try {
            const start = new Date().getTime();

            // for stats (get number of records)
            let recordCount = 0;
            for (let project of Object.keys(data.projectMap)) {
                recordCount += data.projectMap[project].length;
            }

            // now choose the record we want to emit per-student
            let studentFinal: StudentGrades[] = [];
            for (let student of data.students) {

                // Make sure the student is someone you want to consider (aka exclude TAs & test accounts)
                if (student.sNum !== '') {

                    const executionsToConsider = data.projectMap[student.projectUrl];
                    // Here we are choosing (from all executions for a student), which one will be their grade.
                    const resultLast = this.pickExecution(student, executionsToConsider);
                    const result210 = this.pickExecution210(student, executionsToConsider);
                    const result310 = this.pickExecution310(student, executionsToConsider);

                    studentFinal.push({
                        student:    student,
                        executions: [resultLast, result310, result210]
                    });

                } else {
                    console.log('Excluded student: ' + student.userName);
                }
            }

            const delta = new Date().getTime() - start;
            console.log('Result->Grade conversion complete; # students: ' + data.students.length +
                '; # records: ' + recordCount + '. Took: ' + delta + ' ms');

            return studentFinal; // this array can be trivially iterated on to turn into a CSV or any other format
        } catch (err) {
            console.error('ResultView::convertResultsToGrades(..) - ERROR: ' + err.members, err);
        }
        return []; // don't return partial results; if there is a real problem we're going to want to know about it
    }

    private pickExecution(student: StudentResult, executionsToConsider: ResultRecord[]): ResultRecord {
        let result: ResultRecord = null;
        if (typeof executionsToConsider !== 'undefined' && executionsToConsider.length > 0) {
            // In this case we're going to take the last execution before the time cutoff
            // but you can use any of the ResultRecord rows here (branchName, gradeRequested, grade, etc.)
            const orderedExecutions = executionsToConsider.sort(function (a: ResultRecord, b: ResultRecord) {
                return a.timeStamp - b.timeStamp;
            });

            // Here we use our own date from the UI; but you probably want to set your own timestamp
            const ts = this.getTimeLimit();
            for (let record of orderedExecutions) {
                if (record.timeStamp <= ts) {
                    // keep overwriting result until we are past the deadline
                    result = record;
                }
            }
        }

        if (result === null) {
            // no execution records for student; put in a fake one that counts as 0
            console.log('WARN: no execution records for student: ' + student.userName + ' ' + student.projectUrl);
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

        return result;
    }

    /**
     * This is the 210 rubric selection.
     *
     * It will choose the MAX requested result before the deadline.
     * The requestor _must_ be a student.
     * This _will not_ work for teams because it will return the max per-requestor, not per-team.
     *
     * @param {StudentResult} student
     * @param {ResultRecord[]} executionsToConsider
     * @returns {ResultRecord}
     */
    private pickExecution210(student: StudentResult, executionsToConsider: ResultRecord[]): ResultRecord {
        let result: ResultRecord = null;
        if (typeof executionsToConsider !== 'undefined' && executionsToConsider.length > 0) {

            const ts = this.getTimeLimit();
            // find the list of acceptable requests
            const requestedExecutions = executionsToConsider.filter(function (record: ResultRecord) {
                // grade must be requested &&
                // request must be before timestamp &&
                // requestor must be the student (aka not a TA)
                // NOTE: this only works for individuals (since it is per-requestor, not per-team)
                let include = false;
                if (record.gradeRequested === true) {
                    if (typeof record.gradeRequestedTimeStamp !== 'undefined' && record.gradeRequestedTimeStamp > 0) {
                        if (record.gradeRequestedTimeStamp < ts && record.userName === student.userName) {
                            include = true;
                        }
                    } else {
                        console.warn('pickExecution210 - gradeRequested: true, but gradeRequestedTimestamp: undefined / < 0; for: ' + record.commitUrl);
                    }
                }
                return include;
            });

            let maxRecord = null;
            if (requestedExecutions.length > 0) {
                maxRecord = requestedExecutions.reduce(function (prev: ResultRecord, current: ResultRecord) {
                    return (Number(prev.grade) > Number(current.grade)) ? prev : current
                });
            }

            if (typeof maxRecord !== 'undefined' && maxRecord !== null) {
                result = maxRecord;
            }
        }

        if (result === null) {
            // no execution records for student; put in a fake one that counts as 0
            console.log('WARN: no execution records for student: ' + student.userName + ' ' + student.projectUrl);
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

        return result;
    }

    /**
     * This is the 310 rubric selection.
     *
     * It will choose the MAX record on the master branch.
     *
     * @param {StudentResult} student
     * @param {ResultRecord[]} executionsToConsider
     * @returns {ResultRecord}
     */
    private pickExecution310(student: StudentResult, executionsToConsider: ResultRecord[]): ResultRecord {
        let result: ResultRecord = null;
        if (typeof executionsToConsider !== 'undefined' && executionsToConsider.length > 0) {

            if (executionsToConsider[0].projectName === 'team105') {
                console.log('Debug this; there are many commits on master but all records look like they are on branches');
            }
            const ts = this.getTimeLimit();
            // find the list of acceptable requests
            const requestedExecutions = executionsToConsider.filter(function (record: ResultRecord) {
                // grade must be on master
                // push must be before timestamp
                let include = false;
                if (record.timeStamp < ts && record.branchName === 'refs/heads/master') {
                    include = true;
                }
                return include;
            });

            let maxRecord = null;
            if (requestedExecutions.length > 0) {
                maxRecord = requestedExecutions.reduce(function (prev: ResultRecord, current: ResultRecord) {
                    return (Number(prev.grade) > Number(current.grade)) ? prev : current
                });
            }

            if (typeof maxRecord !== 'undefined' && maxRecord !== null) {
                result = maxRecord;
            }
        }

        if (result === null) {
            // no execution records for student; put in a fake one that counts as 0
            console.log('WARN: no execution records for student: ' + student.userName + ' ' + student.projectUrl);
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

        return result;
    }
}