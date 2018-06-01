/**
 * Created by rtholmes on 2017-10-04.
 */

import {AdminController} from "./controllers/AdminController";
import {StudentController} from "./controllers/StudentController";
import {SuperAdminController} from "./controllers/SuperAdminController";
import {AuthHelper} from "./util/AuthHelper";
import {CourseIdsResponse} from "./Models";
import {UI} from "./util/UI";
import 'whatwg-fetch';
import {OnsButtonElement, OnsPageElement} from "onsenui";
import {Network} from "./util/Network";

// const CONFIG = require('../../config.js');
const COURSE_SELECTION_LIST = '#main-course-selection';
const AUTH_STATUS = 'authorized';
const UNAUTH_STATUS = 'unauthorized';

declare var classportal: any;

export class App {

    private studentController: StudentController = null;
    private adminController: AdminController = null;
    private superAdminController: SuperAdminController = null;
    private AUTH_STATUS = 'authorized';
    private UNAUTH_STATUS = 'unauthenticated';
    private backendDEV = 'https://localhost:5000/';
    private backendPROD = 'https://portal.cs.ubc.ca:5000/';
    private backendSTAG = 'https://portal-dev.cs.ubc.ca:5000/';
    private frontendDEV = 'https://localhost:3000/';
    private frontendSTAG = 'https://portal-dev.cs.ubc.ca/'
    private frontendPROD = 'https://portal.cs.ubc.ca/';
    private authHelper: AuthHelper;
    private courseIds: string[] = null;
    public currentCourseId: number;
    public readonly backendURL = this.backendDEV;
    public readonly frontendURL = this.frontendDEV;

    constructor() {
        console.log('App::<init>');
        if (window.location.href.indexOf('://localhost') > 0) {
            this.backendURL = this.backendDEV;
            this.frontendURL = this.frontendDEV;
        } else if (window.location.href.indexOf('://portal-dev') > 0) {
            this.backendURL = this.backendSTAG;
            this.frontendURL = this.frontendSTAG;
        } else {
            this.backendURL = "https://" + window.location.hostname + ":5000/"
            this.frontendURL = "https://" + window.location.hostname + "/"
        }

        this.authHelper = new AuthHelper(this.backendURL);
        this.authHelper.updateAuthStatus();

        console.log('App::<init> - backend: ' + this.backendURL);
    }

    /**
    * In case of no Courses, set Course 000 for superadmin login potential;
    * requires valid oauth for superadmin role.
    */
    private initCourseSelections() {
        console.log('App::initCourses() - start');
        let that = this;
        let courseSelections = document.querySelector(COURSE_SELECTION_LIST) as HTMLElement;

        if (this.courseIds === null) {
        this.getRunningCourseIds()
            .then((courseIds: string[]) => {
                console.log('App::initCourseSelections() CourseIds: ', courseIds);
                courseIds.map((courseId) => {
                    let courseOption = that.createCourseButton(courseId);
                    courseSelections.appendChild(courseOption);
                });

                // As a workaround, we will force authentication if there are no buttons to click to login.
                if (courseIds.length === 0) {
                    // If no courses, then init Course 000 for SuperAdmin on condition of valid authentication
                    let courseOption = that.createCourseButton('000');
                    courseSelections.appendChild(courseOption);
                }
            });
        }
    }

    private getRunningCourseIds(): Promise<string[]> {
        console.log('App::getRunningCourseIds() - start');
        let that = this;
        let url = this.backendURL + '/courses';

        return Network.httpGet(url)
            .then((data: CourseIdsResponse) => {
                return data.response;
            });
    }

    public createCourseButton(courseId: string): HTMLElement {
        let that = this;
        let buttonContainer = `<ons-list-item>
                                  <div style="display:flex; align-items:center; justify-content: center; width: 100%">
                                      <ons-button>CPSC ${courseId}</ons-button>
                                  </div>
                              </ons-list-item>`
        let buttonContainerHtml = UI.ons.createElement(buttonContainer);
        // A HACK to get deep into the weird UI of onsen to the button that we just created:
        buttonContainerHtml.lastChild.childNodes[1].childNodes[1].addEventListener('click', () => {
            this.handleMainPageClick({courseId: courseId})
        });
        return buttonContainerHtml;
    }

    private login() {
        console.log('App::login() - start');
        window.location.replace(this.backendURL + 'auth/login');
    }

    public init() {
        console.log('App::init() - start');
        var that = this;
        document.addEventListener('init', function (event) {

            const page = event.target as OnsPageElement;


            const pageName = page.id;

            let courseId: string = null;

            if (typeof (<any>page).pushedOptions !== 'undefined' && typeof (<any>page).pushedOptions.courseId !== 'undefined') {
                courseId = (<any>page).pushedOptions.courseId;
                that.currentCourseId = (<any>page).pushedOptions.courseId;
            }

            console.log('App::init()::init - page: ' + pageName);

            if (pageName === 'adminTabsPage') {
                // initializing tabs page for the first time
                that.adminController = new AdminController(that, courseId);
            }

            if (pageName === 'studentTabsPage') {
                // initializing tabs page for the first time
                that.studentController = new StudentController(that, courseId);
            }

            if (pageName === 'superAdminTabsPage') {
                // initalizing tabs page for the first time
                that.superAdminController = new SuperAdminController(that, courseId);
            }

            /*
            // DO NOT DO THIS HERE; DO IT ON SHOW BELOW!

            // Each page calls its own initialization controller.
            if (that.studentController !== null) {
                if (typeof that.studentController[pageName] === 'function') {
                    that.studentController[pageName]();//(page);
                }
            }

            // Each page calls its own initialization controller.
            if (that.adminController !== null) {
                if (typeof that.adminController[pageName] === 'function') {
                    that.adminController[pageName]();//(page);
                }
            }
            */

            if (pageName === 'main') {
                const AUTHORIZED_STATUS: string = 'authorized';

                console.log('App::main()::authCheck - starting main.html with auth check');

                that.initCourseSelections();
                that.toggleLoginButton();

                const URL = that.backendURL + 'currentUser';
                let OPTIONS_HTTP_GET: RequestInit = {credentials: 'include'};
                fetch(URL, OPTIONS_HTTP_GET).then((data: any) => {
                    if (data.status !== 200) {
                        console.log('App::main()::authCheck - WARNING: Response status: ' + data.status);
                        throw new Error('App::main()::authCheck - API ERROR: ' + data.status);
                    }
                    return data.json();
                }).then((data: any) => {
                    let user = data.response.user;
                    localStorage.setItem('userrole', user.userrole);
                    localStorage.setItem('username', user.username);
                    localStorage.setItem('authStatus', AUTHORIZED_STATUS);
                    localStorage.setItem('fname', user.fname);
                    that.toggleLoginButton();
                }).catch((err: any) => {
                    console.log('App:main()::authCheck - ERROR: ' + err.message);
                });
            }

            if (pageName === 'loginPage') {

                const userrole = String(localStorage.userrole);
                // const username = String(localStorage.username);
                if (userrole === 'student') {
                    UI.pushPage('student.html', {courseId: courseId});
                } else if (userrole === 'admin' || userrole === 'superadmin') {
                    UI.pushPage('admin.html', {courseId: courseId});
                }

                (document.querySelector('#loginButton') as OnsButtonElement).onclick = function () {
                    console.log('App::init()::init - login pressed for: ' + courseId);
                    that.login();
                };
            }
        });

        /**
         * Runs once a page is ready to be rendered.
         *
         * Useful for student view since we populate all tabs at once.
         */
        document.addEventListener('show', function (event) {
            const page = event.target as OnsPageElement;
            const pageName = page.id;
            let options = (<any>page).pushedOptions;
            if (typeof options === 'undefined') {
                options = {};
            }
            console.log('App::init()::show - page: ' + pageName);

            if (that.studentController !== null) {
                if (typeof that.studentController[pageName] === 'function') {
                    that.studentController[pageName](options);
                }
            }
            if (that.adminController !== null) {
                if (typeof that.adminController[pageName] === 'function') {
                    that.adminController[pageName](options);
                }
            }
            if (that.superAdminController !== null) {
                if (typeof that.superAdminController[pageName] === 'function') {
                    that.superAdminController[pageName](options);
                }
            }
        });
    }

    public getAdminController(courseId: string) {
        console.log('App::getAdminController( ' + courseId + ' )');
        return new AdminController(this, courseId);
    }

    public pushPage(page: string, opts?: any) {
        UI.pushPage(page, opts);
    }

    public handleMainPageClick(courseId: object) {
        let userrole = typeof localStorage.userrole === 'undefined' ? null : localStorage.userrole;
        let authStatus = typeof localStorage.authStatus === 'undefined' ? 'unauthorized' : AUTH_STATUS;

        // either go to Login page or redirect to student/admin management areas
        if (localStorage.authStatus !== AUTH_STATUS) {
            UI.pushPage('login.html', courseId);
        } else if (localStorage.authStatus === AUTH_STATUS && userrole === 'superadmin') {
            UI.pushPage('superadmin.html', courseId);
        } else if (localStorage.authStatus === AUTH_STATUS && userrole === 'admin') {
            UI.pushPage('admin.html', courseId);
        } else {
            UI.pushPage('student.html', courseId);
        }
    }

    /*
    * @Return Boolean - True if user is authenticated
    */
    public isLoggedIn() {
        let that = this;
        if (String(localStorage.authStatus) === that.AUTH_STATUS) {
            // console.log(true);
            return true;
        }
        // console.log(false);
        return false;
    }

    public logout() {
        console.log("App::logout() - start");
        let url = this.backendURL + '/logout';
        let OPTIONS_HTTP_GET: RequestInit = {credentials: 'include'};
        const that = this;
        fetch(url, OPTIONS_HTTP_GET).then((data: any) => {
            if (data.status !== 200) {
                console.log('App::logout() - authCheck WARNING: Response status: ' + data.status);
                throw new Error('App::logout() - authCheck - API ERROR' + data.status);
            }
            return data.json();
        }).then((result: any) => {
            const LOGOUT_SUCCESS = 'Successfully logged out.';
            console.log('App::logout() Logging out... ');
            let logoutResponse = String(result.response);
            if (logoutResponse === LOGOUT_SUCCESS) {
                localStorage.clear();
                console.log('App::logout() Successfully logged out');
                window.location.replace(that.frontendURL);
            }
        }).catch((err: Error) => {
            // just force the logout if we run into a problem
            console.log('App::logout() - ERROR: ' + err.message);
            console.log('App::logout() - Clearing localstorage and refreshing');
            localStorage.clear();
            window.location.replace(that.frontendURL);
        });
    }

    private toggleLoginButton() {
        try {
            if (this.isLoggedIn() === false) {
                document.getElementById('indexLogin').style.display = 'none';
            } else {
                document.getElementById('indexLogin').style.display = 'block';
            }
        } catch (err) {
            // silently fail
        }
    }
}

console.log('App.ts - preparing App for access');
if (typeof classportal === 'undefined') {
    console.log('App.ts - preparing App; defining globals');
    (<any>window).classportal = {};
    (<any>window).classportal.App = App;
    (<any>window).classportal.UI = UI;
    (<any>window).classportal.Network = Network;
}

(<any>window).myApp = new classportal.App();
(<any>window).myApp.init();
console.log('App.ts - App prepared');
