import {UI} from "../util/UI";
import {AdminController} from "../controllers/AdminController";
import {CourseContainer, Course} from "../Models";
import {App} from "../App";
import {Network} from "../util/Network";
import FlatPicker from "../helpers/FlatPicker";
import DeliverableRecord from "../models/DeliverableRecord";
import {Deliverable} from '../Models';
import HTMLTags from '../helpers/HTMLTags';

/**
* OVERVIEW: Edit a Course as an Admin: Can only edit one field for now.
*/

declare var myApp: App;

const EDIT_COURSE = 'EDIT_COURSE';
const SAVE_ACTION = '#adminCourseConfigPage__save-button';
const COURSE_ID = '#adminCourseConfigPage__course-fields-courseId';
const GITHUB_ORG = '#adminCourseConfigPage__course-fields-githubOrg';
const DOCKER_REPO = '#adminCourseConfigPage__course-fields-dockerRepo';
const DOCKER_KEY = '#adminCourseConfigPage__course-fields-dockerKey';
const URL_WEBHOOK = '#adminCourseConfigPage__course-fields-urlWebhook';

export class CourseView {
    private controller: AdminController;
    private app: App;
    private courseId: string;
    private course: Course;

    constructor(controller: AdminController) {
        console.log("CourseView::<init> - start");
        this.controller = controller;
    }

    public render(courseData: CourseContainer) {
        console.log("CourseView::render(..) - start");
        if (this.course === null) {
            throw 'CourseView::Course cannot be null in EditView mode.';
        }
        let that = this;
        this.course = courseData.response;

        let courseId = document.querySelector(COURSE_ID) as HTMLInputElement;
        let githubOrg = document.querySelector(GITHUB_ORG) as HTMLInputElement;
        let dockerRepo = document.querySelector(DOCKER_REPO) as HTMLInputElement;
        let dockerKey = document.querySelector(DOCKER_KEY) as HTMLInputElement;
        let urlWebhook = document.querySelector(URL_WEBHOOK) as HTMLInputElement;
        let saveAction = document.querySelector(SAVE_ACTION) as HTMLElement;

        courseId.setAttribute("disabled", "");
        courseId.value = this.course.courseId;
        githubOrg.value = this.course.githubOrg;
        dockerRepo.value = this.course.dockerRepo;
        dockerKey.value = this.course.dockerKey;
        urlWebhook.value = this.course.urlWebhook;

        saveAction.addEventListener('click', () => {
            console.log('CourseView::save() Event Listener Hit - start');

            let coursePayload: Course = {
                // We will only modify two properties for the Github Dockerfile Repo and Key
                courseId: that.course.courseId,
                githubOrg: that.course.githubOrg,
                dockerRepo: dockerRepo.value,
                dockerKey: dockerKey.value,
                urlWebhook: that.course.urlWebhook
            }

            let isValid: boolean = that.isCourseValid(coursePayload);

            if (isValid) {
                console.log('CourseView::Course Payload is Valid: ', coursePayload);
                that.save(coursePayload);
            }
        });

        UI.hideModal();
    }

    public initEditView() {
        console.log('CourseView::initEditView( ' + this.courseId + ' ) - start');
        let that = this;
        let url = this.app.backendURL + this.courseId + '/admin/course';
        Network.httpGet(url)
          .then((courseContainer: CourseContainer) => {
            console.log('the CourseView Course data: ', courseContainer);
            that.course = courseContainer.response;
          });
    }

    /**
    * Determines if the Deliverable values loaded on the EditDeliverable view are valid and are ready to be saved.
    *
    * @return boolean true if deliverable properties are valid.
    */
    private isCourseValid(course: Course): boolean {
      const HTTPS_REGEX = new RegExp(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
      const REPO_FORMAT_ERROR: string = 'The Dockerfile Repo must be Https formatted.';

      // Dockerfile repo should at least be valid Https URI
      if (course.dockerRepo !== '' && !HTTPS_REGEX.test(course.dockerRepo)) {
          UI.notification(REPO_FORMAT_ERROR);
          return false;
      }

      return true;
    }

    /**
    * ## INFO ##
    *
    * PUT: '/:courseId/admin/course'
    * @return void
    */
    private save(course: Course) {
        console.log('EditCourseView::save() - start');
        let url = this.app.backendURL + '/superadmin/course';

        Network.httpPost(url, course)
            .then((data: any) => {
                if (data.status >= 200 && data.status < 300) {
                    UI.notification(('Successfully updated Course'));
                    UI.popPage();
                } else {
                    data.json()
                        .then((response: any) => {
                            UI.notification('There was an error updating the Course: ' + response.err);
                        });
                }
            });
    }
}