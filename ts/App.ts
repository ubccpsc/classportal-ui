/**
 * Created by rtholmes on 2017-10-04.
 */

import {AdminController} from "./controllers/AdminController";
import {StudentController} from "./controllers/StudentController";
import {UI} from "./util/UI";

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

            if (pageName === 'loginPage') {
                console.log('App::init()::init - starting login.html');
                (document.querySelector('#loginButton') as OnsButtonElement).onclick = function () {
                    console.log('login pressed for: ' + courseId);

                    if (courseId.indexOf('admin') >= 0) {
                        UI.pushPage('admin.html', {courseId: courseId});
                    } else {
                        UI.pushPage('student.html', {courseId: courseId});
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