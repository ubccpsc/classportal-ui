import {UI} from "../util/UI";
import {AdminController} from "../controllers/AdminController";
import {SortableTable, TableCell, TableHeader} from "../util/SortableTable";
import {OnsCheckboxElement, OnsSelectElement} from "onsenui";
import {GradeRow, ResultPayload, ResultRecord, Student} from "../Models";

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
        document.querySelector('#adminTabsHeader').innerHTML = "AutoTest Results";
    }

    public render(data: any) {

        console.log('ResultView::render(..) - start');
        this.updateTitle();

        // console.log('ResultView::render(..) - data: ' + JSON.stringify(data));
        this.data = data;

        data = data.response;

        let processedData = this.processResponse(data);

        var gradeList = document.querySelector('#admin-result-table');
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

            let table = new SortableTable(headers, '#admin-result-table');

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
                        console.log('ResultView::render(..) - missing value for key: ' + key);
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

    private processNewResponse(data: ResultPayload) {

        interface StudentResults {
            userName: string;
            student: Student;
            projectUrl: string | null;
            executions: ResultRecord[];
        }

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
                projectUrl: null,
                executions: []
            };
            studentMap[student.userName] = studentResult;
        }

        // map execution.projectUrl -> [StudentResults]
        let projectMap: { [projectUrl: string]: StudentResults[] } = {};
        for (let record of data.records) {
            if (typeof studentMap[record.userName] !== 'undefined') {
                const key = record.projectUrl;
                if (typeof  projectMap[key] === 'undefined') {
                    // not in map
                    projectMap[record.projectUrl] = [];
                }
                const existingStudent = projectMap[key].find(function (student: StudentResults) {
                    return student.userName === record.userName;
                });
                if (existingStudent === null) {
                    // add the student to the projectUrl
                    projectMap[key].push(studentMap[record.userName]);
                }
            } else {
                // this only happens if the student cause a result but was not in the student list
                // could happen for TAs / instructors, but should not happen for students
                console.warn('WARN: unknown student: ' + record.userName);
            }
        }

        // add all project executions to student
        for (let record of data.records) {
            const studentResult = studentMap[record.userName];
            const project = projectMap[record.projectUrl];
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

            // in this case we're going to take the last execution
            // but you can use any of the ResultRecord rows here (branchName, gradeRequested, grade, etc.)
            const orderedExecutions = executionsToConsider.sort(function (a: ResultRecord, b: ResultRecord) {
                return a.timeStamp - b.timeStamp;
            });
            const gradedResult = orderedExecutions[0];

            let finalStudentRecord: StudentResults = {
                userName:   userName,
                student:    studentResult.student,
                projectUrl: gradedResult.projectUrl,
                executions: [gradedResult]
            };
            studentFinal.push(finalStudentRecord);
        }
        return studentFinal;
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