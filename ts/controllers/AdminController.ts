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

    private DEV_URL = 'https://localhost:5000/';
    private PROD_URL = 'https://portal.cs.ubc.ca:5000/';
    private URL = this.DEV_URL;

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

        // params.teamId = ... // not currently used

        // /:courseId/deliverables
        const url = this.URL + this.courseId + '/deliverables';
        Network.handleRemote(url, this.deliverableView, UI.handleError);
    }

    public adminTeamsPage() {
        console.log('AdminController::adminTeamsPage - start');

        // /:courseId/admin/teams
        const url = this.URL + this.courseId + '/admin/teams';
        Network.handleRemote(url, this.teamView, UI.handleError);
    }

    public adminGradesPage() {
        console.log('AdminController::adminGradesPage - start');

        // /:courseId/admin/grades
        const url = this.URL + this.courseId + '/admin/grades';
        Network.handleRemote(url, this.gradeView, UI.handleError);
    }

    public adminDashboardPage(delivId?: string) {
        if (typeof delivId === 'undefined') {
            console.log('AdminController::adminDashboardPage - delivId missing!');
            // just don't do anything!
            return;
        }

        let orgName = '';
        if (this.courseId === 'cs310') {
            orgName = 'CPSC310-2017W-T1'; // HACK should come from server
        } else if (this.courseId === 'cs210') {
            orgName = 'CPSC210-2017W-T1'; // HACK should come from server
        }

        console.log('AdminController::adminDashboardPage - orgName: ' + orgName + '; delivId: ' + delivId + ' - start');

        let params: any = {};
        params.orgName = orgName;
        params.delivId = delivId;
        // params.teamId = ... // not currently used

        // '/:courseId/admin/dashboard/:orgName/:delivId
        const url = this.URL + this.courseId + '/admin/dashboard/' + params.orgName + '/' + params.delivId;

        // going to be slow; show a modal
        UI.showModal('Dashboard being retrieved. This may be slow.');
        Network.handleRemote(url, this.dashboardView, UI.handleError);
    }

    public adminGitHubPage() {
        console.log('AdminController::adminGitHubPage - start');
        this.githubView.render({});
    }


}

