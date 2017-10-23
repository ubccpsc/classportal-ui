import {UI} from "../util/UI";
import {AdminController} from "../controllers/AdminController";
import {SortableTable, TableCell, TableHeader} from "../util/SortableTable";
import {OnsCheckboxElement, OnsSelectElement} from "onsenui";
import {GradeRow, ResultPayload, ResultRecord, Student} from "../Models";

declare var myApp: any;

/**
 * Internal object for tracking students and executions.
 */
interface StudentResults {
    userName: string;
    student: Student;
    executions: ResultRecord[];
}

export class ResultView {
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

            for (let key of Object.keys(processedData)) {
                let row = processedData[key] as StudentResults;
                // HACK: this does not print people who did nothing!
                if (typeof row !== 'undefined' && typeof row.student.sNum !== 'undefined') {


                    let r: TableCell[] = [];
                    r.push({
                        value: row.userName,
                        html:  '<a href="' + row.student.userUrl + '">' + row.userName + '</a>'
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

            this.delivId = delivId;
            this.lastOnly = lastOnly;

            if (this.delivId === 'null' || this.delivId === null) {
                this.delivId = null;
                UI.showErrorToast("Please select a deliverable.");
                return;
            }

            myApp.adminController.adminResultsPage(delivId);

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

            // Just a caveat; this could all be done in one pass
            // but is split up for clarity into 4 steps:
            // 1) Create a student map
            // 2) Update students to know what their projectUrl is for the deliverable
            //    This is needed for teams, but not for single projects (but will work for both)
            // 3) Add executions to the Student record
            // 4) Choose the execution we care about from the Student record

            // map: student.userName -> StudentResults
            let studentMap: { [userName: string]: StudentResults } = {};
            for (let student of data.students) {
                const studentResult: StudentResults = {
                    userName:   student.userName,
                    student:    student,
                    executions: []
                };
                studentMap[student.userName] = studentResult;
            }

            // map execution.projectUrl -> [StudentResults]
            let projectMap: { [projectUrl: string]: StudentResults[] } = {};
            for (let record of data.records) {
                if (record.delivId === this.delivId) { // HACK: the query should only get the right deliverables
                    const student = studentMap[record.userName];
                    if (typeof student !== 'undefined' && student.student.sNum !== '') {
                        const key = record.projectUrl;
                        if (key !== '') { // HACK: ignore missing key; this should not come back from the backend; fix and remove
                            if (typeof  projectMap[key] === 'undefined') {
                                projectMap[key] = []; // we don't know about this project yet
                            }
                            const existingStudent = projectMap[key].find(function (student: StudentResults) {
                                return student.userName === record.userName; // see if student is already associated with project
                            });
                            if (typeof existingStudent === 'undefined') {
                                projectMap[key].push(studentMap[record.userName]); // add student to the project
                            }
                        } else {
                            console.warn('WARN: missing key: ' + record.commitUrl);
                        }
                    } else {
                        // this only happens if the student cause a result but was not in the student list
                        // could happen for TAs / instructors, but should not happen for students
                        console.log('WARN: unknown student (probably a TA): ' + record.userName);
                    }
                } else {
                    // wrong deliverable
                }
            }

            // add all project executions to student
            for (let record of data.records) {
                if (record.delivId === this.delivId) { // HACK: backend should return only the right deliverable
                    if (record.projectUrl !== '') { // HACK: backend should only return complete records
                        const studentResult = studentMap[record.userName];
                        const project = projectMap[record.projectUrl];
                        if (typeof project !== 'undefined' && typeof studentResult !== 'undefined') {
                            for (let studentResult of project) {
                                // associate the execution with all students on that project
                                studentResult.executions.push(record);
                            }
                        } else {
                            // drop the record (either the student does not exist or the project does not exist).
                            // project case would happen if in the last loop we dropped an execution from a TA.
                        }
                    }
                } else {
                    // wrong deliverable
                }
            }

            // now choose the record we want to emit per-student
            let studentFinal: StudentResults[] = [];
            for (let userName of Object.keys(studentMap)) {
                const studentResult = studentMap[userName];
                const executionsToConsider = studentResult.executions;

                let result: ResultRecord;
                if (executionsToConsider.length > 0) {
                    // in this case we're going to take the last execution
                    // but you can use any of the ResultRecord rows here (branchName, gradeRequested, grade, etc.)
                    const orderedExecutions = executionsToConsider.sort(function (a: ResultRecord, b: ResultRecord) {
                        return b.timeStamp - a.timeStamp;
                    });
                    result = orderedExecutions[0];
                } else {
                    // no execution records for student; put in a fake one that counts as 0
                    console.log('WARN: no execution records for student: ' + userName);
                    result = {
                        userName:       userName,
                        timeStamp:      -1, // never happened
                        projectName:    'No Request', // unknown
                        projectUrl:     '', //
                        commitUrl:      '',
                        branchName:     '',
                        gradeRequested: false,
                        grade:          '0',
                        delivId:        this.delivId,
                        gradeDetails:   []
                    }
                }
                const finalStudentRecord = {
                    userName:   userName,
                    student:    studentResult.student,
                    executions: [result]
                };
                studentFinal.push(finalStudentRecord);
            }

            const delta = new Date().getTime() - start;
            console.log('Result->Grade conversion complete; # students: ' + data.students.length +
                '; # records: ' + data.records.length + '. Took: ' + delta + ' ms');

            this.dataToDownload = studentMap;
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