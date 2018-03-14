/**
 * Created by rtholmes on 2017-10-04.
 */

import {UI} from '../util/UI';
import {Network} from '../util/Network';
// import {AddCourseView} from "../viewSuperAdmin/AddCourseView";
// import {EditCourseView} from "../viewSuperAdmin/EditCourseView";
// import {UserView} from "../viewSuperAdmin/UserView";
import CourseSelectorView from "../viewSuperAdmin/CourseSelectorView";
import CourseView from "../viewSuperAdmin/CourseView";
import {TeamView} from "../viewStudent/TeamView";
import {CourseIdsResponse} from "../Models"; 
import {App} from "../App";

const COURSES_PAGE_BUTTON = '#superAdminTabbar-courses';
const USERS_PAGE_BUTTON = '#superAdminTabbar-users';

export class SuperAdminController {

    private courseId: string;
    private data: any;
    private courseSelectorView: CourseSelectorView;
    private courseView: CourseView;

    // Bit of a hack: FIRST SuperAdminView should load the Courses list.
    public courses: any = null;

    // private userView = new UserView();
    // private gradeView = new GradeView();
    private app: App;

    constructor(app: App, courseId: string) {
        console.log('SuperAdminController::<init> - courseId: ' + courseId);
        this.app = app;
        this.courseId = courseId;
        this.courseView = new CourseView(this, app, null);
    }

    private superAdminCoursesPage() {
        console.log('SuperAdminController::superAdminCoursesPage() - start');
        UI.showModal('Loading Courses...');
        let that = this;
        let url = this.app.backendURL + '/courses';
        if (this.courses === null) {
            Network.httpGet(url)
                .then((courseIds: CourseIdsResponse) => {
                    that.courses = courseIds.response;
                });
        }
        UI.hideModal();
    }

    public superAdminCourseSelector(opts: any) {
        console.log('AdminController::adminDeliverableSelector - start; options: ' + JSON.stringify(opts));
        const url = this.app.backendURL + '/superadmin/courses';
        try {
            if (typeof opts.forward === 'undefined' || opts.forward === '') {
                throw `Opts.Forward must contain forwardTo option. Options found enumerated on DeliverableSelector.ts`;
            }
        } catch (err) {
            console.log(`AdminController::adminDeliverableSelector(opts.forward) ERROR ` + err);
        }
        this.courseSelectorView = new CourseSelectorView(this, opts.forward, opts.header);
        Network.handleRemote(url, this.courseSelectorView, UI.handleError);
    }

}

