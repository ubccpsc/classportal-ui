import {UI} from "../util/UI";
import {AdminController} from "../controllers/AdminController";
import {SortableTable, TableCell, TableHeader} from "../util/SortableTable";
import {OnsCheckboxElement, OnsSelectElement} from "onsenui";
import {GradeRow, ResultPayload, ResultRecord, Student} from "../Models";


/**
 * Just used for rendering student results
 */
interface StudentResults {
    userName: string;
    student: Student;
    executions: ResultRecord[];
}

export class ResultView {
    private data: any; // TODO: add types
    private processedData: GradeRow[]; // TODO: change to new type

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

        // console.log('ResultView::render(..) - data: ' + JSON.stringify(data));
        this.data = data;

        data = data.response;

        // let processedData = this.processResponse(data);
        let processedData = this.convertResultsToGrades(data);

        if (this.delivId === 'null' || this.delivId === null) {
            this.delivId = null;
            UI.showErrorToast("Please select a deliverable.");
            return;
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
            headers.push({id: 'project', text: 'Project', sortable: true, defaultSort: false, sortDown: true});
            headers.push({id: 'grade', text: this.delivId + ' Grade', sortable: true, defaultSort: true, sortDown: true});

            let table = new SortableTable(headers, '#admin-result-table');

            for (let key of Object.keys(processedData)) {

                let row = processedData[key] as StudentResults;

                // HACK: this does not print people who did nothing!
                if (typeof row !== 'undefined' && typeof row.student.sNum !== 'undefined' && row.executions.length > 0) {
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
                        value: row.executions[0].projectName,
                        html:  '<a href="' + row.executions[0].projectUrl + '">' + row.executions[0].projectName + '</a>'
                    });
                    r.push({
                        value: row.executions[0].grade,
                        html:  '<a href="' + row.executions[0].commitUrl + '">' + row.executions[0].grade + '</a>'
                    });

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

            this.render(this.data);

            if (this.delivId !== 'all') {
                document.getElementById('resultDataDownloadButton').style.display = 'block';
            } else {
                document.getElementById('resultDataDownloadButton').style.display = 'none';
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
    private convertResultsToGrades(data: ResultPayload) { // : StudentResults[]  (interface inline for clarity)
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
                    // projectUrl: null,
                    executions: []
                };
                studentMap[student.userName] = studentResult;
            }

            // map execution.projectUrl -> [StudentResults]
            let projectMap: { [projectUrl: string]: StudentResults[] } = {};
            for (let record of data.records) {
                if (typeof studentMap[record.userName] !== 'undefined') {
                    const key = record.projectName; //record.projectUrl;
                    if (key.length > 0) {
                        // ignore missing keys
                        if (typeof  projectMap[key] === 'undefined') {
                            // not in map
                            projectMap[key] = [];
                        }
                        const existingStudent = projectMap[key].find(function (student: StudentResults) {
                            return student.userName === record.userName;
                        });
                        if (typeof existingStudent === 'undefined') {
                            // add the student to the projectUrl
                            projectMap[key].push(studentMap[record.userName]);
                        }
                        // studentMap[record.userName].projectUrl = key; // HACK: is name now because projectUrl is not working
                    } else {
                        console.warn('WARN: missing key: ' + record.commitUrl);
                    }
                } else {
                    // this only happens if the student cause a result but was not in the student list
                    // could happen for TAs / instructors, but should not happen for students
                    console.log('WARN: unknown student (probably a TA): ' + record.userName);
                }
            }

            // add all project executions to student
            for (let record of data.records) {
                const studentResult = studentMap[record.userName];
                const project = projectMap[record.projectName]; // HACK: should be projectUrl
                if (typeof project !== 'undefined' && typeof studentResult !== 'undefined') {
                    for (let s of project) {
                        // all students associated with that projectUrl
                        s.executions.push(record);
                    }
                } else {
                    // drop the record (either the student does not exist or the project does not exist).
                    // project case would happen if in the last loop we dropped an execution from a TA.
                }
            }

            // now choose the record we want to emit per-student
            let studentFinal: StudentResults[] = [];
            for (let userName of Object.keys(studentMap)) {
                const studentResult = studentMap[userName];
                const executionsToConsider = studentResult.executions;

                let finalStudentRecord: StudentResults;

                if (executionsToConsider.length > 0) {

                    // in this case we're going to take the last execution
                    // but you can use any of the ResultRecord rows here (branchName, gradeRequested, grade, etc.)
                    const orderedExecutions = executionsToConsider.sort(function (a: ResultRecord, b: ResultRecord) {
                        return b.timeStamp - a.timeStamp;
                    });
                    const gradedResult = orderedExecutions[0];

                    finalStudentRecord = {
                        userName:   userName,
                        student:    studentResult.student,
                        executions: [gradedResult]
                    };
                } else {
                    // no records for student
                    console.log('WARN: no execution records for student: ' + userName);
                    finalStudentRecord = {
                        userName:   userName,
                        student:    studentResult.student,
                        executions: [] // empty array (means 0 probably)
                    };
                }
                studentFinal.push(finalStudentRecord);
            }
            console.log('Result->Grade conversion complete for: ' + data.students.length +
                ' students and ' + data.records.length + ' records. Took: ' + (new Date().getTime() - start) + ' ms');
            return studentFinal;
        } catch (err) {
            console.error('ResultView::convertResultsToGrades(..) - ERROR: ' + err.members, err);
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

    public downloadData() {
        console.log('ResultView::downloadData() - start');
        this.downloadJSON(this.data, 'TestResults_' + this.delivId + '.json');
    }

    // not used yet
    // code from: https://www.codexworld.com/export-html-table-data-to-csv-using-javascript/
    private downloadJSON(json: any, fileName: string) {

        let downloadLink: HTMLAnchorElement;

        // CSV file
        let jsonFile = new Blob([JSON.stringify(json, null, '\t')], {type: 'application/json'});

        if (document.getElementById('resultDataDownload') === null) {
            // Download link
            downloadLink = document.createElement('a');
            downloadLink.innerHTML = 'Download Table as CSV';
            downloadLink.id = 'resultDataDownload';
            document.body.appendChild(downloadLink);
        } else {
            downloadLink = document.getElementById('resultDataDownload') as HTMLAnchorElement;
        }
        /*
        let table = document.querySelector(this.divName);
        table.appendChild(downloadLink);
        */

        // File name
        downloadLink.download = fileName;

        // Create a link to the file
        downloadLink.href = window.URL.createObjectURL(jsonFile);

        // Hide download link
        downloadLink.style.display = 'none';
        downloadLink.style.textAlign = 'center';

        // Add the link to DOM
        // document.body.appendChild(downloadLink);

        // Click download link
        downloadLink.click();
    }

}