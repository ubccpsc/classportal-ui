import {UI} from "../util/UI";
import {SuperAdminController} from "../controllers/SuperAdminController";
import {CoursesResponse, Course} from "../Models";
import {App} from "../App";
import {Network} from "../util/Network";
import FlatPicker from "../helpers/FlatPicker";
import DeliverableRecord from "../models/DeliverableRecord";
import {Deliverable} from '../Models';
import HTMLTags from '../helpers/HTMLTags';

/**
* OVERVIEW: CourseView supports AddView and EditView. Run initEditView() or initAddView()
* to init UI for each mode.
*/

declare var myApp: App;

const SAVE_ACTION = '#superAdminEditCourse-save-button';

export default class CourseView {
    private controller: SuperAdminController;
    private app: App;
    private course: Course;
    private modTypes = {EDIT_COURSE: 'edit', ADD_COURSE: 'add'};

    constructor(controller: SuperAdminController, app: App, course: Course) {
        console.log("CourseView::<init> - start");
        this.controller = controller;
        this.app = app;
        this.course = course;
    }

    public render(data: CoursesResponse) {
        console.log("CourseView::render(..) - start");

        if (typeof data === 'undefined') {
            console.log('EditCoursesView::render(..) - data is undefined');
            return;
        }
        console.log('CourseView::render(..) - data: ' + JSON.stringify(data));

        let courses = data.response;
        const customSort = function (a: Course, b: Course) {
            return (Number(a.courseId) - Number(b.courseId));
        };
        courses = courses.sort(customSort);

        console.log('CourseView::render(..) - setting deliverables: ' + JSON.stringify(courses));
        this.controller.courses = courses; // HACK: global

        const that = this;
        // course

        UI.hideModal();
    }

    public initAddView() {
        console.log('CourseView::initAddView() - start');
        UI.showModal();
        UI.pushPage('html/superadmin/course.html')
            .then(() => {
                console.log('SUCCESS: html/admin/editDeliverable.html pushPage loaded');
                UI.hideModal();
            });
    }


    public initEditView() {
        if (this.course === null) {
            throw 'CourseView::Course cannot be null in EditView mode.';
        }
        console.log('CourseView::initEditView( ' + this.course.courseId + ' ) - start');
        let that = this;




        // let mongoId: HTMLInputElement = document.querySelector(MONGO_ID) as HTMLInputElement;
        // mongoId.value = deliverable._id;

        let saveAction = document.querySelector(SAVE_ACTION) as HTMLElement;

        saveAction.addEventListener('click', () => {
            let isValid: boolean = that.isCourseValid();

            // # NEEDS IMPLEMENTING

            // let coursePayload: Course = {
            //     // Needs filling in.
            // }

            // console.log('CourseView:: DEBUG All `coursePayload` properties: ' + JSON.stringify(coursePayload));
            // if (isValid) {
            //     that.save(coursePayload);
            // }
        });

        UI.hideModal();
    }

    /**
    * Determines if the Deliverable values loaded on the EditDeliverable view are valid and are ready to be saved.
    *
    * @return boolean true if deliverable properties are valid.
    */
    private isCourseValid(): boolean {

        const SPACE_DELIN_REGEX: RegExp = /[^ ]+/g;
        const HTTPS_REGEX = new RegExp(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
        const NAME_REGEX: RegExp = /^[^_]+([0-9])/;
        const TEAM_SIZE_ERR: string = 'The minimum team size cannot be greater than the maximum team size';
        const CUSTOM_JSON_ERR: string = 'Your custom JSON input should be valid stringified JSON: ';
        const DELIV_NAME_ERR: string = 'A deliverable name must be all lowercase letters, up to 10 characters, and a combination of [a-z] and [0-9].';
        const GIT_REPO_ERR: string = 'Please make sure your Git repo addresses are valid Https URIs.';
        const OPEN_CLOSE_ERR: string = 'The close date must be greater than the open date.';
        const REGRESION_TEST_ERR: string = 'One of your regression tests does not exist. Please ensure that a Deliverable exists before it is used as a regression test.';

        return true;
    }

    /**
    * ## INFO ##
    *
    * EditCourseView.ts is used for two different CRUD operations:
    *
    * If 'Add Course' view, hit PUT: '/:courseId/admin/course'
    * If 'Edit Course' view, hit POST: '/:courseId/admin/course'
    * @return void
    */
    private save(deliv: Deliverable) {
        console.log('EditCourseView::save() - start');
        let url = this.app.backendURL + this.app.currentCourseId + '/admin/deliverable';
        let header = document.querySelector(HTMLTags.EDIT_DELIVERABLE_HEADER) as HTMLElement;

        let deliverablePayload = {deliverable: deliv};

        Network.httpPost(url, deliverablePayload)
            .then((data: any) => {
                if (data.status >= 200 && data.status < 300) {
                    UI.notification(('Successfully updated Deliverable'));
                    UI.popPage();
                } else {
                    data.json()
                        .then((response: any) => {
                            UI.notification('There was an error updating the Deliverable: ' + response.err);
                        })
                }
                })
    }
}