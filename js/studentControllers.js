/***********************************************************************
 * App Controllers. These controllers will be called on page initialization. *
 ***********************************************************************/

myApp.studentControllers = {

    studentTabsPage: function (page) {
        var opts = page.pushedOptions;
        console.log('myApp.controllers::studentsTabPage - start: ' + JSON.stringify(opts));

        if (opts.course === 'cpsc210') {
            var url = 'https://FILLMEIN/student/210/rtholmes';
            myApp.network.handleRemote(url, myApp.studentControllers.populateStudentTabs, myApp.ui.handleError);
        } else if (opts.course === 'cpsc310') {
            var url = 'https://FILLMEIN/student/210/rtholmes';
            myApp.network.handleRemote(url, myApp.studentControllers.populateStudentTabs, myApp.ui.handleError);
        } else {
            console.log('studentTabsPage - unknown course: ' + opts.course);
        }

    },

    populateStudentTabs: function (data) {
        myApp.studentControllers.studentData = data; // HACK: global
        document.querySelector('#studentTabsHeader').innerHTML = data.course;

        myApp.studentControllers.updateStudentData(data);
    },

    updateStudentData: function (data) {

        try {
            document.querySelector('#studentTabsHeader').innerHTML = data.course;

            // crude check to see if tabs are ready
            var studentList = document.querySelector('#student-overview-list');
            if (studentList !== null) {

                // overview
                studentList.appendChild(myApp.ui.createListHeader('Name'));
                studentList.appendChild(myApp.ui.createListItem(data.name));

                studentList.appendChild(myApp.ui.createListHeader('CWL'));
                studentList.appendChild(myApp.ui.createListItem(data.cwl));

                studentList.appendChild(myApp.ui.createListHeader('Lab'));
                studentList.appendChild(myApp.ui.createListItem(data.lab));

                // deliverables
                var deliverableList = document.querySelector('#student-deliverable-list');
                for (var i = 0; i < data.deliverables.length; i++) {
                    var deliverable = data.deliverables[i];
                    deliverableList.appendChild(myApp.ui.createListItem(deliverable.id, deliverable.due));
                }

                // teams
                var teamList = document.querySelector('#student-team-list');
                for (var i = 0; i < data.teams.length; i++) {
                    var team = data.teams[i];
                    if (typeof team.msg !== 'undefined') {
                        teamList.appendChild(myApp.ui.createListItem(team.id, team.msg));
                    } else {
                        teamList.appendChild(myApp.ui.createListItem(team.id, JSON.stringify(team.members)));
                    }
                }

                // grades
                var gradeList = document.querySelector('#student-grade-list');
                for (var i = 0; i < data.grades.length; i++) {
                    var grade = data.grades[i];
                    gradeList.appendChild(myApp.ui.createListHeader(grade.id));
                    if (typeof grade.msg !== 'undefined') {
                        gradeList.appendChild(myApp.ui.createListItem(grade.msg));
                    } else {
                        gradeList.appendChild(myApp.ui.createListItem('Final Grade: ' + grade.final));
                        if (grade.test) {
                            gradeList.appendChild(myApp.ui.createListItem('Test Grade: ' + grade.test));
                        }
                        if (grade.cover) {
                            gradeList.appendChild(myApp.ui.createListItem('Coverage Grade: ' + grade.cover));
                        }
                    }
                }

                return true;
            }
        } catch (err) {
            console.log('updateStudentData failed: ' + err);
        }
        return false;
    }


}; // myApp.studentControllers

