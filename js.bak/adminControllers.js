
myApp.adminControllers = {

    adminTabsPage: function (page) {
        var opts = page.pushedOptions;
        console.log('myApp.controllers::adminTabPage - start: ' + JSON.stringify(opts));

        myApp.adminControllers.adminCourseId = opts.course; // HACK: global
    },


    adminDeliverablesPage: function (page) {
        console.log('myApp.controllers::adminDeliverablesPage - start');

        var course = myApp.adminControllers.adminCourseId; // HACK: global

        if (course === 'admin310') {
            var url = 'https://FILLMEIN/admin/310/deliverables';
            myApp.network.handleRemote(url, myApp.adminControllers.populateAdminDeliverablesPage, myApp.ui.handleError);
        } else {
            console.log('adminDeliverablesPage - unknown course: ' + course);
        }
    },

    adminTeamsPage: function (page) {
        console.log('myApp.controllers::adminTeamsPage - start');

        var course = myApp.adminControllers.adminCourseId; // HACK: global

        if (course === 'admin310') {
            var url = 'https://FILLMEIN/admin/310/teams';
            myApp.network.handleRemote(url, myApp.adminControllers.populateAdminTeamsPage, myApp.ui.handleError);
        } else {
            console.log('adminTeamsPage - unknown course: ' + course);
        }
    },

    adminGradesPage: function (page) {
        console.log('myApp.controllers::adminGradesPage - start');

        var course = myApp.adminControllers.adminCourseId; // HACK: global

        if (course === 'admin310') {
            var url = 'https://FILLMEIN/admin/310/grades';
            myApp.network.handleRemote(url, myApp.adminControllers.populateAdminGradesPage, myApp.ui.handleError);
        } else {
            console.log('adminGradesPage - unknown course: ' + course);
        }
    },

    adminDashboardPage: function (page) {
        console.log('myApp.controllers::adminDashboardPage - start');

        var course = myApp.adminControllers.adminCourseId; // HACK: global

        if (course === 'admin310') {
            var url = 'https://FILLMEIN/admin/310/dashboard';
            myApp.network.handleRemote(url, myApp.adminControllers.populateAdminDashboardPage, myApp.ui.handleError);
        } else {
            console.log('adminDashboardPage - unknown course: ' + course);
        }
    },

    populateAdminDeliverablesPage: function (data) {
        console.log('myApp.controllers::populateAdminDeliverablesPage - start');
        document.querySelector('#adminTabsHeader').innerHTML = data.course;

        // deliverables
        var deliverableList = document.querySelector('#admin-deliverable-list');
        if (deliverableList !== null) {
            deliverableList.innerHTML = '';
            for (var i = 0; i < data.deliverables.length; i++) {
                var deliverable = data.deliverables[i];
                deliverableList.appendChild(myApp.ui.createListHeader(deliverable.id));
                deliverableList.appendChild(myApp.ui.createListItem("Open: " + deliverable.open));
                deliverableList.appendChild(myApp.ui.createListItem("Close: " + deliverable.open));
                deliverableList.appendChild(myApp.ui.createListItem("Scheme: " + deliverable.scheme));
            }
        } else {
            console.log('myApp.controllers::populateAdminDeliverablesPage - element is null');
        }
    },

    populateAdminTeamsPage: function (data) {
        console.log('myApp.controllers::populateAdminTeamsPage - start');
        document.querySelector('#adminTabsHeader').innerHTML = data.course;

        try {
            // teams
            var teamsList = document.querySelector('#admin-team-list');
            if (teamsList !== null) {
                teamsList.innerHTML = '';
                for (var i = 0; i < data.deliverables.length; i++) {
                    var deliverable = data.deliverables[i];
                    teamsList.appendChild(myApp.ui.createListHeader(deliverable.id));
                    if (deliverable.unassigned.length > 0) {
                        teamsList.appendChild(myApp.ui.createListHeader('Unassigned Students'));

                        for (var j = 0; j < deliverable.unassigned.length; j++) {
                            teamsList.appendChild(myApp.ui.createListItem(deliverable.unassigned[j]));
                        }
                    }
                    if (deliverable.teams.length > 0) {
                        teamsList.appendChild(myApp.ui.createListHeader('Assigned Students'));
                        for (var k = 0; k < deliverable.teams.length; k++) {
                            var team = deliverable.teams[k];
                            teamsList.appendChild(myApp.ui.createListItem(team.id, 'Members: ' + JSON.stringify(team.members)));
                        }
                    }
                }
            } else {
                console.log('myApp.controllers::populateAdminTeamsPage - element is null');
            }
        } catch (err) {
            console.log('myApp.controllers::populateAdminTeamsPage - ERROR: ' + err);
        }
    },

    populateAdminGradesPage: function (data) {
        console.log('myApp.controllers::populateAdminGradesPage - start');
        document.querySelector('#adminTabsHeader').innerHTML = data.course;

        // grades
        var gradeList = document.querySelector('#admin-grade-list');
        if (gradeList !== null) {
            gradeList.innerHTML = '';

            var headers = null;

            var table = '<table style="width: 100%"><tr>';

            for (var i = 0; i < data.students.length; i++) {
                var student = data.students[i];

                if (headers === null) {
                    table += '<th style="text-align:left;">Student</th>';
                    for (var j = 0; j < student.deliverables.length; j++) {
                        var deliv = student.deliverables[j];
                        if (typeof deliv.final !== 'undefined') {
                            table += '<th>' + deliv.id + '</th>'
                        }
                    }
                    table += '</tr>';
                    headers = true;
                }

                table += '<tr>';
                table += '<td>' + student.id + '</td>';
                for (var k = 0; k < student.deliverables.length; k++) {
                    var deliv = student.deliverables[k];
                    if (typeof deliv.final !== 'undefined') {
                        table += '<td style="text-align: center;">' + deliv.final + '</td>'
                    }
                }
                table += '</tr>';
            }
            table += '</table>';

            gradeList.innerHTML = table;
        } else {
            console.log('myApp.controllers::populateAdminGradePage - element is null');
        }
    },

    populateAdminDashboardPage: function (data) {
        console.log('myApp.controllers::populateAdminDashboardPage - start');
        document.querySelector('#adminTabsHeader').innerHTML = data.course;

        // deliverables
        var dashList = document.querySelector('#admin-dashboard-list');
        if (dashList !== null) {
            dashList.innerHTML = '';
            for (var i = 0; i < data.rows.length; i++) {
                var row = data.rows[i];
                // dashList.appendChild(createListHeader(deliverable.id));
                dashList.appendChild(myApp.ui.createListItem(row.team + ' ( ' + row.final + ' )', JSON.stringify(row.passing)));
            }
        } else {
            console.log('myApp.controllers::populateAdminDashboardPage - element is null');
        }
    },

}; // myApp.controllers

