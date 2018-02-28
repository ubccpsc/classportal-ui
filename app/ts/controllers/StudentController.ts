/**
 * Created by rtholmes on 2017-10-04.
 */

import {UI} from '../util/UI';
import {Network} from '../util/Network';
import {SummaryView} from "../viewStudent/SummaryView";
import {GradeView} from "../viewStudent/GradeView";
import {DeliverableView} from "../viewStudent/DeliverableView";
import {TeamView} from "../viewStudent/TeamView";
import {App} from "../App";


export class StudentController {

    private courseId: string;
    private data: any;
    private summaryView = new SummaryView();
    private gradeView: GradeView;
    private teamView: TeamView;
    private deliverableView = new DeliverableView();
    private app: App;

    constructor(app: App, courseId: string) {
        console.log('StudentController::<init> - courseId: ' + courseId);
        this.app = app;
        this.teamView = new TeamView(app, courseId);
        this.courseId = courseId;
        this.gradeView = new GradeView(this, courseId, app);
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

    public studentTeamsPage() {
        console.log('StudentController::studentTeamsPage - start');
        const url = this.app.backendURL + this.courseId + '/myTeams';
        Network.handleRemote(url, this.teamView, UI.handleError);
    }

    public studentGradePage() {
        console.log('StudentController::studentGradePage - start');
        const url = this.app.backendURL + this.courseId + '/grades/released';
        Network.handleRemote(url, this.gradeView, UI.handleError);
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

