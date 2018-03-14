/**
 * Created by rtholmes on 2017-10-04.
 */

import {UI} from '../util/UI';
import {Network} from '../util/Network';
// import {AddCourseView} from "../viewSuperAdmin/AddCourseView";
// import {EditCourseView} from "../viewSuperAdmin/EditCourseView";
// import {UserView} from "../viewSuperAdmin/UserView";
import CourseSelector from "../viewSuperAdmin/CourseSelector";
import {TeamView} from "../viewStudent/TeamView";
import {App} from "../App";

export class SuperAdminController {

    private courseId: string;
    private data: any;

    // Bit of a hack: FIRST SuperAdminView should load the Courses list.
    public courses: any = null;

    // private userView = new UserView();
    // private gradeView = new GradeView();
    private app: App;

    constructor(app: App, courseId: string) {
        console.log('SuperAdminController::<init> - courseId: ' + courseId);
        this.app = app;
        this.courseId = courseId;
    }

    private superAdminCoursesPage() {
        console.log('SuperAdminController::superAdminCoursesPage() - start');
    }

}

