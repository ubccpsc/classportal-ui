// App logic.
window.myApp = {};

document.addEventListener('init', function (event) {
    var page = event.target;

    console.log('app::init - page: ' + page.id);

    // Each page calls its own initialization controller.
    if (myApp.studentControllers.hasOwnProperty(page.id)) {
        myApp.studentControllers[page.id](page);
    }

    if (myApp.adminControllers.hasOwnProperty(page.id)) {
        myApp.adminControllers[page.id](page);
    }

    if (page.id === 'loginPage') {
        console.log('starting login.html');
        var courseId = page.pushedOptions.course;
        document.querySelector('#loginButton').onclick = function () {
            console.log('login pressed for: ' + courseId);

            if (courseId.indexOf('admin') >= 0) {
                pushPage('admin.html', {course: courseId});
            } else {
                pushPage('student.html', {course: courseId});
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
    var page = event.target;

    console.log('app::show - page: ' + page.id);
    if (page.id === 'studentTabsPage') {
        if (typeof myApp.studentControllers.studentData !== 'undefined') { // HACK: global access
            console.log('student data ready, rendering');
            myApp.studentControllers.updateStudentData(myApp.studentControllers.studentData); // HACK: global access
        } else {
            console.log('student data not ready, skipping render');
        }
    } else {
        console.log('app::show - page: ' + page.id + ' calling controller');
        if (myApp.studentControllers.hasOwnProperty(page.id)) {
            myApp.studentControllers[page.id](page);
        }
        if (myApp.adminControllers.hasOwnProperty(page.id)) {
            myApp.adminControllers[page.id](page);
        }
    }
});


/**
 * Onsen convenience functions
 */
function pushPage(pageId, options) {

    if (typeof options === 'undefined') {
        options = {};
    }
    console.log('pushPage - id: ' + pageId + '; options: ' + JSON.stringify(options));

    myNavigator.pushPage(pageId, options);
}
