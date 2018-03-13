import {UI} from "../util/UI";
import {SuperAdminController} from "../controllers/SuperAdminController";
import {Course, CoursesResponseContainer, CoursesResponse} from "../Models";
import CourseView from "../viewSuperAdmin/CourseView"
import {Network} from "../util/Network";
import {App} from "../App";

const COURSE_LIST = '#superAdminDeliverableSelector__course-list'
const ADD_COURSE_BUTTON = 'superAdminDeliverableSelector-add-course-button';

export enum ForwardOptions {
    EDIT_COURSE = 'EDIT_COURSE',
    BUILD_COURSE_CONTAINER = 'EDIT_COURSE_CONTAINER',
    MANAGE_USERS = 'MANAGE_USERS'
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

    public render(data: CoursesResponseContainer) {
        console.log('ProvisionTeamsDeliverableView::render(..) - start - data: ' + JSON.stringify(data));
        let that = this;
        let courses = data.response.courses;
        const customSort = function (a: Course, b: Course) {
            return (Number(a.courseId.match(/(\d+)/g)[0]) - Number((b.courseId.match(/(\d+)/g)[0])));
        };
        courses = courses.sort(customSort);

        console.log('CourseSelector::render(..) - setting courses: ' + JSON.stringify(courses));
        this.controller.courses = courses; // HACK: global

        // if (ForwardOptions.EDIT_COURSE === that.forwardTo) {
        //     that.toggleAddDelivButton('show');
        // } else {
        //     that.toggleAddDelivButton('hide');
        // }

        // deliverables
        const deliverableList = document.querySelector(COURSE_LIST);
        if (deliverableList !== null) {
            deliverableList.innerHTML = '';
            if (courses.length > 0) {
                for (let course of courses) {
                    deliverableList.appendChild(UI.createListHeader(course.courseId));
                    let text = "Github Organization: " + course.githubOrg;
                    let subtext: string;
                    let elem = UI.createListItem(text, subtext, true);
                    elem.onclick = function (event) {

                        switch (that.forwardTo) {
                            case (ForwardOptions.EDIT_COURSE): {
                                that.courseView = new CourseView(that.controller, myApp, course);
                                that.courseView.initEditView();
                                break;
                            }
                            case (ForwardOptions.BUILD_COURSE_CONTAINER): {
                              // 
                              console.log('should forward to build course container view');
                              break;
                            }
                            case (ForwardOptions.MANAGE_USERS): {
                              //
                              console.log('should forward to manage users view');
                            }
                            default: {
                                UI.notification('DeliverableSelectorView.ts ERROR; No Model has been assigned to this view.');
                            }
                        }

                    };
                    deliverableList.appendChild(elem);
                }
            } else {
                deliverableList.appendChild(UI.createListItem("No deliverable data returned from server."));
            }
        } else {
            console.log('DeliverableView::render() - element is null');
        }
        UI.hideModal();
    }

    private toggleAddDelivButton(action: string) {
        let hiddenMenu = document.querySelector(ADD_COURSE_BUTTON) as HTMLElement;
        if (hiddenMenu !== null && hiddenMenu.style.display  === 'none' && action === 'show') {
            hiddenMenu.style.display = 'block';
        } else if (hiddenMenu !== null && action === 'hide'){
            hiddenMenu.style.display = 'none';
        }
    }
}