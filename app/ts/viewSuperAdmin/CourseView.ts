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
* OVERVIEW: CourseView supports ADDING a Course and EDITING a Course. Run initEditView() or initAddView()
* to init UI for each mode handled by this class.
*/

declare var myApp: App;

const ADD_COURSE = 'ADD_COURSE';
const EDIT_COURSE = 'EDIT_COURSE';
const SAVE_ACTION = '#superAdminCoursesPage__save-button';
const COURSE_ID = '#superAdminCoursesPage__course-fields-courseId';
const GITHUB_ORG = '#superAdminCoursesPage__course-fields-githubOrg';
const DOCKER_REPO = '#superAdminCoursesPage__course-fields-dockerRepo';
const DOCKER_KEY = '#superAdminCoursesPage__course-fields-dockerKey';
const URL_WEBHOOK = '#superAdminCoursesPage__course-fields-urlWebhook';

export default class CourseView {
    private controller: SuperAdminController;
    private app: App;
    private course: Course;
    private currentModType: string;

    constructor(controller: SuperAdminController, app: App, course: Course) {
        console.log("CourseView::<init> - start");
        this.controller = controller;
        this.app = app;
        this.course = course;

        // Lets everyone explicitly know that we are in editing mode.
        if (course !== null) {
            this.currentModType = EDIT_COURSE;
        } else {
            this.currentModType = ADD_COURSE;
        }
    }

    public render() {
        console.log("CourseView::render(..) - start");
        let that = this;

        let courseId = document.querySelector(COURSE_ID) as HTMLInputElement;
        let githubOrg = document.querySelector(GITHUB_ORG) as HTMLInputElement;
        let dockerRepo = document.querySelector(DOCKER_REPO) as HTMLInputElement;
        let dockerKey = document.querySelector(DOCKER_KEY) as HTMLInputElement;
        let urlWebhook = document.querySelector(URL_WEBHOOK) as HTMLInputElement;
        let saveAction = document.querySelector(SAVE_ACTION) as HTMLElement;

        if (that.currentModType === EDIT_COURSE) {
            courseId.setAttribute("disabled", "");
            courseId.value = that.course.courseId;
            githubOrg.value = that.course.githubOrg;
            dockerRepo.value = that.course.dockerRepo;
            dockerKey.value = that.course.dockerKey;
            urlWebhook.value = that.course.urlWebhook;
        } else if (that.currentModType === ADD_COURSE) {
            // Blank fields for now.
        }

        saveAction.addEventListener('click', () => {
            console.log('CourseView::save() Event Listener Hit - start');

            let coursePayload: Course = {
                // We will modify these properties:
                courseId: courseId.value,
                githubOrg: githubOrg.value,
                dockerRepo: dockerRepo.value,
                dockerKey: dockerKey.value,
                urlWebhook: urlWebhook.value
            }

            let isValid: boolean = that.isCourseValid(coursePayload);

            if (isValid) {
                console.log('CourseView::Course Payload is Valid: ', coursePayload);
                that.save(coursePayload);
            }
        });

        UI.hideModal();
    }

    public initAddView() {
        console.log('CourseView::initAddView() - start');
        let that = this;
        UI.showModal();
        UI.pushPage('html/superadmin/course.html')
            .then(() => {
                that.render();
                console.log('SUCCESS: html/superadmin/course pushPage loaded in ADD COURSE MODE');
                UI.hideModal();
            });
    }

    public initEditView() {
        if (this.course === null) {
            throw 'CourseView::Course cannot be null in EditView mode.';
        }

        console.log('CourseView::initEditView( ' + this.course.courseId + ' ) - start');
        let that = this;
        UI.pushPage('html/superadmin/course.html')
            .then(() => {
                that.render();
                console.log('SUCCESS: html/superadmin/course pushPage loaded in EDIT COURSE MODE');
                UI.hideModal();
            });

    }

    /**
    * Determines if the Deliverable values loaded on the EditDeliverable view are valid and are ready to be saved.
    *
    * @return boolean true if deliverable properties are valid.
    */
    private isCourseValid(course: Course): boolean {
      const HTTPS_REGEX = new RegExp(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
      const ORG_REGEX: RegExp = new RegExp('^([A-Z0-9{4}]+-)([A-Z0-9{4}]+-)([A-Z0-9{4}])*$');
      const DNS_PORT_REGEX: RegExp = new RegExp(/^([^\:]+:[0-9]+\s|[0-9]+.[0-9]+.[0-9]+.[0-9]+:[0-9]\+)+$/g);
      const COURSE_ID_REGEX: RegExp = new RegExp('(^[0-9]{3,4}$)');
      const COURSE_EXISTS_ERROR: string = 'The course already exists.';
      const COURSE_FORMAT_ERROR: string = 'The Course Id must be a number between 3-4 characters in length.';
      const ORG_FORMAT_ERROR: string = `The Github Organization must meet the required format. ie. 'CPSC210-2017W-T2'. It cannot be left blank.`;
      const REPO_FORMAT_ERROR: string = 'The Dockerfile Repo must be Https formatted.';
      const ORG_EXISTS_ERROR: string = 'The Github Organization already exists.';

      // #1. If course exists && in ADD COURSE mode, invalid:
      if (!this.isCourseIdValid(this.controller.courses, course) && this.currentModType === ADD_COURSE) {
          UI.notification(COURSE_EXISTS_ERROR);
          return false;
      }

      if (!COURSE_ID_REGEX.test(course.courseId)) {
          UI.notification(COURSE_FORMAT_ERROR);
          return false;
      }

      // #2. If Github ORG doesn't meet format. ie. 'CPSC210-2017W-T2';
      if (!ORG_REGEX.test(course.githubOrg)) {
          UI.notification(ORG_FORMAT_ERROR);
          return false;
      }

      // #2b. Github Orgs must be unique
      if (!this.isGithubOrgUnique(this.controller.courses, course)) {
          UI.notification(ORG_EXISTS_ERROR);
          return false;
      }

      // #3. Dockerfile repo should at least be valid Https URI
      if (course.dockerRepo !== '' && course.dockerRepo.match(HTTPS_REGEX) === null) {
          UI.notification(REPO_FORMAT_ERROR);
          return false;
      }

      return true;
    }

    private isCourseIdValid(courseList: Course[], course: Course): boolean {
      let courseExists = false;
      courseList.map((_course: Course) => {
          if (_course.courseId === course.courseId) {
              courseExists = true;
          }
      });
      return !courseExists;
    }

    private isGithubOrgUnique(courseList: Course[], course: Course): boolean {
      let orgExists = false;

      let courses = courseList.slice();

      // if Course ID matches, eliminate it because you do not want to check against itself.
      let index: number = null;
      for (let i = 0; i < courses.length; i++) {
          if (course.courseId === courses[i].courseId) {
              index = i;
          }
      }

      console.log('index', index);
      if (index !== null) {
          courses.splice(index, 1);
      }

      courses.map((_course: Course) => {
          if (_course.githubOrg === course.githubOrg) {
              orgExists = true;
          }
      });

      return !orgExists;
    }

    /**
    * ## INFO ##
    *
    * EditCourseView.ts is used for two different CRUD operations:
    *
    * If 'Add Course' view, hit PUT: '/:courseId/superadmin/course'
    * If 'Edit Course' view, hit POST: '/:courseId/superadmin/course'
    * @return void
    */
    private save(course: Course) {
        console.log('EditCourseView::save() - start');
        let url = this.app.backendURL + '/superadmin/course';

        if (this.currentModType === EDIT_COURSE) {
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
        } else if (this.currentModType === ADD_COURSE) {
            Network.httpPut(url, course)
                .then((data: any) => {
                    if (data.status >= 200 && data.status < 300) {
                        UI.notification('Successfully created Course.');
                        UI.popPage();
                    } else {
                        data.json()
                            .then((response: any) => {
                                UI.notification('There was an error creating the Course: ' + response.response + '.');
                            });
                    }
                    console.log('CourseView::save() - end');
                });
        } else {
            console.log('CourseView ERROR Could not determine Deliv update/add type');
        }


    }
}