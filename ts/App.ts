/**
 * Created by rtholmes on 2017-10-04.
 */

import {AdminController} from "./controllers/AdminController";
import {StudentController} from "./controllers/StudentController";
import {UI} from "./util/UI";
import 'whatwg-fetch';
import {OnsButtonElement, OnsPageElement} from "onsenui";

declare var classportal: any;

export class App {

    private studentController: StudentController = null;
    private adminController: AdminController = null;

    constructor() {
        console.log('App::<init>');
    }

    init() {
        console.log('App::init() - start');
        var that = this;
        document.addEventListener('init', function (event) {
            const page = event.target as OnsPageElement;


            const pageName = page.id;

            let courseId: string = null;

            if (typeof (<any>page).pushedOptions !== 'undefined' && typeof (<any>page).pushedOptions.courseId !== 'undefined') {
                courseId = (<any>page).pushedOptions.courseId;
            }

            console.log('App::init()::init - page: ' + pageName);


            if (pageName === 'adminTabsPage') {
                // initializing tabs page for the first time
                that.adminController = new AdminController(courseId);
            }

            if (pageName === 'studentTabsPage') {
                // initializing tabs page for the first time
                that.studentController = new StudentController(courseId);
            }

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

            if (pageName === 'main') {
                const OPTIONS_HTTP_GET: object = {credentials: 'include'};
                const AUTHORIZED_STATUS: string = 'authorized';

                console.log('App::main()::authCheck - starting main.html with auth check');
                const DEV_URL = 'https://localhost:5000/currentUser';
                const PROD_URL = 'https://portal.cs.ubc.ca:5000/currentUser';
                const URL = DEV_URL;
                fetch(URL, OPTIONS_HTTP_GET).then((data: any) => {
                    if (data.status !== 200) {
                        console.log('App::main()::authCheck WARNING: Repsonse status: ' + data.status);
                        throw 'App::main()::authCheck - API ERROR' + data.status;
                    }
                    return data.json();
                }).then((response: any) => {
                    let user = response.user;
                    localStorage.setItem('userrole', user.userrole);
                    localStorage.setItem('username', user.username);
                    localStorage.setItem('authStatus', AUTHORIZED_STATUS);
                    localStorage.setItem('fname', user.fname);
                }).catch((err: any) => {
                    console.log('App:main()::authCheck ERROR ' + err);
                });
            }

            if (pageName === 'loginPage') {

                let userrole = String(localStorage.userrole);
                let username = String(localStorage.username);

                if (userrole === 'student') {
                    UI.pushPage('student.html', {courseId: courseId});
                } else if (userrole === 'admin' || userrole === 'superadmin') {
                    UI.pushPage('admin.html', {courseId: courseId});
                }

                (document.querySelector('#loginButton') as OnsButtonElement).onclick = function () {
                    console.log('login pressed for: ' + courseId);

                    if (courseId.indexOf('admin') >= 0) {
                        window.location.replace('https://localhost:5000/auth/login');
                        // UI.pushPage('admin.html', {courseId: courseId});
                    } else {
                        window.location.replace('https://localhost:5000/auth/login');
                        // UI.pushPage('student.html', {courseId: courseId});
                    }
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
            console.log('App::init()::show - page: ' + pageName);

            if (that.studentController !== null) {
                if (typeof that.studentController[pageName] === 'function') {
                    that.studentController[pageName]();//(page);
                }
            }
            if (that.adminController !== null) {
                if (typeof that.adminController[pageName] === 'function') {
                    that.adminController[pageName]()//(page);
                }
            }

        });
    }

    getAdminController(courseId: string) {
        console.log('App::getAdminController( ' + courseId + ' )');
        return new AdminController(courseId);
    }

    pushPage(page: string, opts?: any) {
        UI.pushPage(page, opts);
    }

    handleMainPageClick(courseId: object) {
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
}

console.log('App.ts - preparing App for access');
if (typeof classportal === 'undefined') {
    console.log('App.ts - preparing App; defining globals');
    (<any>window).classportal = {};
    (<any>window).classportal.App = App;
    (<any>window).classportal.UI = UI;
}

(<any>window).myApp = new classportal.App();
(<any>window).myApp.init();

console.log('App.ts - App prepared');