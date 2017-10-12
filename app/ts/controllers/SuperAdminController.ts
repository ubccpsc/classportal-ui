/**
 * Created by rtholmes on 2017-10-04.
 */

import {UI} from '../util/UI';
import {Network} from '../util/Network';
// import {CourseView} from "../viewSuperAdmin/CourseView";
// import {UserView} from "../viewSuperAdmin/UserView";
import {DeliverableView} from "../viewStudent/DeliverableView";
import {TeamView} from "../viewStudent/TeamView";
import {App} from "../App";


export class StudentController {

    private courseId: string;
    private data: any;

    // private userView = new UserView();
    // private gradeView = new GradeView();
    private app: App;

    constructor(app: App, courseId: string) {
        console.log('SuperAdminController::<init> - courseId: ' + courseId);
        this.app = app;
        this.courseId = courseId;
    }

    // public populateStudentTabs(data: any) {
    //     // myApp.studentControllers.studentData = data; // HACK: global
    //     // this.data = data; // HACK!
    //     document.querySelector('#studentTabsHeader').innerHTML = data.course;

    //     // this.updateStudentData(data);
    // }


}

