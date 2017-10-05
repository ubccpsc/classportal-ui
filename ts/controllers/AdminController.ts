/**
 * Created by rtholmes on 2017-10-04.
 */

import {UI} from '../util/UI';
import {Network} from '../util/Network';
import {DashboardView} from "../viewAdmin/DashboardView";
import {DeliverableView} from "../viewAdmin/DeliverableView";
import {TeamView} from "../viewAdmin/TeamView";
import {GradeView} from "../viewAdmin/GradeView";
import {GitHubView} from "../viewAdmin/GitHubView";

export class AdminController {

    private courseId: string;

    private deliverableView = new DeliverableView();
    private teamView = new TeamView();
    private gradeView = new GradeView();
    private githubView = new GitHubView();
    private dashboardView = new DashboardView();

    constructor(courseId: string) {
        console.log("AdminController::<init>");
        this.courseId = courseId;
    }

    public adminTabsPage(page: any) {
        console.log('AdminController::adminTabsPage - start (no-op)');
        // called when the tabs container inits
    }

    public adminDeliverablesPage() {
        console.log('AdminController::adminDeliverablesPage - start');

        if (this.courseId === 'admin310') {
            const url = 'https://FILLMEIN/admin/310/deliverables';
            Network.handleRemote(url, this.deliverableView.render, UI.handleError);
        } else {
            console.log('adminDeliverablesPage - unknown course: ' + this.courseId);
        }
    }

    public adminTeamsPage() {
        console.log('AdminController::adminTeamsPage - start');

        if (this.courseId === 'admin310') {
            const url = 'https://FILLMEIN/admin/310/teams';
            Network.handleRemote(url, this.teamView.render, UI.handleError);
        } else {
            console.log('adminTeamsPage - unknown course: ' + this.courseId);
        }
    }

    public adminGradesPage() {
        console.log('AdminController::adminGradesPage - start');

        if (this.courseId === 'admin310') {
            const url = 'https://FILLMEIN/admin/310/grades';
            Network.handleRemote(url, this.gradeView.render, UI.handleError);
        } else {
            console.log('adminGradesPage - unknown course: ' + this.courseId);
        }
    }

    public adminDashboardPage() {
        console.log('AdminController::adminDashboardPage - start');

        if (this.courseId === 'admin310') {
            const url = 'https://FILLMEIN/admin/310/dashboard';
            Network.handleRemote(url, this.dashboardView.render, UI.handleError);
        } else {
            console.log('adminDashboardPage - unknown course: ' + this.courseId);
        }
    }

    public adminGitHubPage() {
        console.log('AdminController::adminGitHubPage - start');
        this.githubView.render({});
    }


}

