/**
 * Created by rtholmes on 2017-10-04.
 */

import {AdminController} from "./controllers/AdminController";
import {StudentController} from "./controllers/StudentController";
import {AuthHelper} from "./util/AuthHelper";
import {UI} from "./util/UI";
import 'whatwg-fetch';
import {OnsButtonElement, OnsPageElement} from "onsenui";
import {Network} from "./util/Network";

declare var classportal: any;

export class App {

    private studentController: StudentController = null;
    private adminController: AdminController = null;

    private AUTH_STATUS = 'authorized';
    private UNAUTH_STATUS = 'unauthenticated';
    private backendDEV = 'https://localhost:5000/';
    private backendPROD = 'https://portal.cs.ubc.ca:5000/';
    private frontendDEV = 'https://localhost:3000/';
    private frontendPROD = 'https://portal.cs.ubc.ca/';
    private authHelper: AuthHelper;
    public currentCourseId: number;
    public readonly backendURL = this.backendDEV;
    public readonly frontendURL = this.frontendDEV;

    constructor() {
        console.log('App::<init>');
        if (window.location.href.indexOf('://localhost') > 0) {
            this.backendURL = this.backendDEV;
            this.frontendURL = this.frontendDEV;
        } else {
            this.backendURL = this.backendPROD;
            this.frontendURL = this.frontendPROD;
        }

        this.authHelper = new AuthHelper(this.backendURL);
        this.authHelper.updateAuthStatus();

        console.log('App::<init> - backend: ' + this.backendURL);
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
                    window.location.replace(that.backendURL + 'auth/login');
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
        const AUTH_STATUS = 'authorized';
        const UNAUTH_STATUS = 'unauthorized';

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
    * @Return Booelan - True if user is authenticated
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