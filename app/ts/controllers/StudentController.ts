/**
 * Created by rtholmes on 2017-10-04.
 */

import {UI} from '../util/UI';
import {Network} from '../util/Network';
import {SummaryView} from "../viewStudent/SummaryView";
import {GradeView} from "../viewStudent/GradeView";
import {DeliverableView} from "../viewStudent/DeliverableView";
import {TeamView} from "../viewStudent/TeamView";


export class StudentController {

    private courseId: string;
    private data: any;

    private summaryView = new SummaryView();
    private gradeView = new GradeView();
    private teamView = new TeamView();
    private deliverableView = new DeliverableView();

    constructor(courseId: string) {
        console.log('StudentController::<init> - courseId: ' + courseId);
        this.courseId = courseId;
    }

    public studentTabsPage() {
        console.log('StudentController::studentTabsPage() - start (no-op)');
    }

    public studentSummaryPage() {
        console.log('StudentController::studentSummaryPage - start');

        if (this.courseId === 'cpsc210') {
            const url = 'https://FILLMEIN/student/210/rtholmes';
            Network.handleRemote(url, this.summaryView, UI.handleError);
        } else if (this.courseId === 'cpsc310') {
            const url = 'https://FILLMEIN/student/210/rtholmes';
            Network.handleRemote(url, this.summaryView, UI.handleError);
        } else {
            console.log('StudentController::studentSummaryPage - unknown course: ' + this.courseId);
        }
    }

    public studentDeliverablePage() {
        console.log('StudentController::studentDeliverablePage - start');

        if (this.courseId === 'cpsc210') {
            const url = 'https://FILLMEIN/student/210/rtholmes';
            Network.handleRemote(url, this.deliverableView, UI.handleError);
        } else if (this.courseId === 'cpsc310') {
            const url = 'https://FILLMEIN/student/210/rtholmes';
            Network.handleRemote(url, this.deliverableView, UI.handleError);
        } else {
            console.log('StudentController::studentDeliverablePage - unknown course: ' + this.courseId);
        }
    }

    public studentTeamPage() {
        console.log('StudentController::studentTeamPage - start');

        if (this.courseId === 'cpsc210') {
            const url = 'https://FILLMEIN/student/210/rtholmes';
            Network.handleRemote(url, this.teamView, UI.handleError);
        } else if (this.courseId === 'cpsc310') {
            const url = 'https://FILLMEIN/student/210/rtholmes';
            Network.handleRemote(url, this.teamView, UI.handleError);
        } else {
            console.log('StudentController::studentTeamPage - unknown course: ' + this.courseId);
        }
    }

    public studentGradePage() {
        console.log('StudentController::studentGradePage - start');

        if (this.courseId === 'cpsc210') {
            const url = 'https://FILLMEIN/student/210/rtholmes';
            Network.handleRemote(url, this.gradeView, UI.handleError);
        } else if (this.courseId === 'cpsc310') {
            const url = 'https://FILLMEIN/student/210/rtholmes';
            Network.handleRemote(url, this.gradeView, UI.handleError);
        } else {
            console.log('StudentController::studentGradePage - unknown course: ' + this.courseId);
        }
    }

    public populateStudentTabs(data: any) {
        // myApp.studentControllers.studentData = data; // HACK: global
        // this.data = data; // HACK!
        document.querySelector('#studentTabsHeader').innerHTML = data.course;

        // this.updateStudentData(data);
    }

    /*
    public updateStudentData(data: any) {

        try {
            document.querySelector('#studentTabsHeader').innerHTML = data.course;


            return true;
        }
    }

    catch(err) {
        console.log('updateStudentData failed: ' + err);
    }

    return
    false;
}*/
}

