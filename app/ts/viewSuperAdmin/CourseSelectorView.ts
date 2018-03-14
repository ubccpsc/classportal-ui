import {UI} from "../util/UI";
import {SuperAdminController} from "../controllers/SuperAdminController";
import {Course, CoursesResponse} from "../Models";
import CourseView from "../viewSuperAdmin/CourseView"
import {Network} from "../util/Network";
import {App} from "../App";

const COURSE_LIST = '#superAdminCourseSelector__course-list'
const ADD_COURSE_BUTTON = '#superAdminCourseSelector__course-add-button';

export enum ForwardOptions {
    COURSES = 'COURSES',
    CONTAINERS = 'CONTAINERS',
    USERS = 'USERS'
}

declare var myApp: App;

export default class CourseSelectorView {
    private controller: SuperAdminController;
    private courseView: CourseView;
    private forwardTo: string;
    private header: string;

    constructor(controller: SuperAdminController, forwardTo: string, header: string) {
        this.controller = controller;
        this.forwardTo = forwardTo;
        this.header = header;
    }

    private addNewCourseAction() {
        console.log('ProvisionTeamsDeliverableView::addNewCourseAction(..) - start');
        let that = this;
        let addCourseButton = document.querySelector(ADD_COURSE_BUTTON) as HTMLElement;
        addCourseButton.addEventListener('click', () => {
          let courseView = new CourseView(that.controller, myApp, null);
          courseView.initAddView();
        });
    }

    public render(data: CoursesResponse) {
        console.log('ProvisionTeamsDeliverableView::render(..) - start - data: ' + JSON.stringify(data));
        let that = this;
        let courses = data.response;
        const customSort = function (a: Course, b: Course) {
            return (Number(a.courseId) - Number(b.courseId));
        };
        courses = courses.sort(customSort);

        console.log('CourseSelector::render(..) - setting courses: ' + JSON.stringify(courses));
        this.controller.courses = courses; // HACK: global

        // if (ForwardOptions.EDIT_COURSE === that.forwardTo) {
        //     that.toggleAddDelivButton('show');
        // } else {
        //     that.toggleAddDelivButton('hide');
        // }

        // courses
        const courseList = document.querySelector(COURSE_LIST);
        if (courseList !== null) {
            courseList.innerHTML = '';
            if (courses.length > 0) {
                for (let course of courses) {
                    courseList.appendChild(UI.createListHeader(course.courseId));
                    let text = "Github Org: " + course.githubOrg + '; Course Webhook: ' + course.urlWebhook;
                    let subtext: string;
                    let elem = UI.createListItem(text, subtext, true);
                    elem.onclick = function (event) {

                        switch (that.forwardTo) {
                            case (ForwardOptions.COURSES): {
                                that.courseView = new CourseView(that.controller, myApp, course);
                                that.courseView.initEditView();
                                break;
                            }
                            case (ForwardOptions.CONTAINERS): {
                              // 
                              console.log('should forward to build course container view');
                              break;
                            }
                            case (ForwardOptions.USERS): {
                              //
                              console.log('should forward to manage users view');
                            }
                            default: {
                                UI.notification('DeliverableSelectorView.ts ERROR; No Model has been assigned to this view.');
                            }
                        }

                    };
                    courseList.appendChild(elem);
                }
            } else {
                courseList.appendChild(UI.createListItem("No Courses exist. Please create a Course."));
                that.toggleAddCourseButton('show');
            }
        } else {
            console.log('DeliverableView::render() - element is null');
        }
        UI.hideModal();
    }

    private toggleAddCourseButton(action: string) {
        let hiddenMenu = document.querySelector(ADD_COURSE_BUTTON) as HTMLElement;
        if (hiddenMenu !== null && hiddenMenu.style.display  === 'none' && action === 'show') {
            hiddenMenu.style.display = 'block';
        } else if (hiddenMenu !== null && action === 'hide'){
            hiddenMenu.style.display = 'none';
        }
    }
}