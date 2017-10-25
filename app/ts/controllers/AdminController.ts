/**
 * Created by rtholmes on 2017-10-04.
 */

import {UI} from '../util/UI';
import {Network} from '../util/Network';
import {DashboardView} from "../viewAdmin/DashboardView";
import {DeliverableView} from "../viewAdmin/DeliverableView";
import {TeamView} from "../viewAdmin/TeamView";
import {ResultView} from "../viewAdmin/ResultView";
import {GitHubView} from "../viewAdmin/GitHubView";
import {App} from "../App";

export class AdminController {

    private courseId: string;

    private deliverableView = new DeliverableView(this);
    private teamView = new TeamView(this);
    private resultView = new ResultView(this);
    private githubView = new GitHubView(this);
    private dashboardView = new DashboardView(this);

    public deliverables: any = null;

    //private DEV_URL = 'https://localhost:5000/';
    //private PROD_URL = 'https://portal.cs.ubc.ca:5000/';
    //private URL = this.DEV_URL;
    private app: App;

    constructor(app: App, courseId: string) {
        console.log("AdminController::<init>");
        this.app = app;
        this.courseId = courseId;
    }

    public adminTabsPage(page: any) {
        console.log('AdminController::adminTabsPage - start (no-op)');
        // called when the tabs container inits
    }

    public adminDeliverablesPage() {
        console.log('AdminController::adminDeliverablesPage - start');
        this.deliverableView.updateTitle();

        // params.teamId = ... // not currently used
        // /:courseId/deliverables
        const url = this.app.backendURL + this.courseId + '/deliverables';
        Network.handleRemote(url, this.deliverableView, UI.handleError);
    }

    public adminTeamsPage() {
        console.log('AdminController::adminTeamsPage - start');
        this.teamView.updateTitle();

        // /:courseId/admin/teams
        const url = this.app.backendURL + this.courseId + '/admin/teams/byBatch';
        Network.handleRemote(url, this.teamView, UI.handleError);
    }

    public adminResultsPage(delivId?: string) {
        console.log('AdminController::adminResultsPage( ' + delivId + ' ) - start');
        this.resultView.updateTitle();

        if (typeof delivId === 'undefined' || delivId === null || delivId === 'null') {
            console.log('AdminController::adminResultsPage - skipped; select deliverable.');
            // configure selects
            this.resultView.configure();
            return;
        }

        UI.showModal('Test results being retrieved. This is a slow query.');

        // /:courseId/admin/grades
        const url = this.app.backendURL + this.courseId + '/admin/grades/results';
        let that = this;
        console.log('AdminController::adminResultsPage(..) - url: ' + url);
        const payload: object = {deliverableName: delivId};
        Network.handleRemotePost(url, payload, this.resultView, UI.handleError);
    }

    public adminDashboardPage(delivId?: string, teamId?: string | null) {
        this.dashboardView.updateTitle();

        if (typeof delivId === 'undefined') {
            console.log('AdminController::adminDashboardPage - delivId missing!');

            // configure selects
            this.dashboardView.configure();
            // just don't do anything!
            return;
        }

        if (typeof teamId === 'undefined') {
            teamId = null;
        }

        let orgName = '';
        if (this.courseId === '310') {
            orgName = 'CPSC310-2017W-T1'; // HACK should come from server
        } else if (this.courseId === '210') {
            orgName = 'CPSC210-2017W-T1'; // HACK should come from server
        }

        console.log('AdminController::adminDashboardPage - orgName: ' + orgName + '; delivId: ' + delivId + ' - start');

        let params: any = {};
        params.orgName = orgName;
        params.delivId = delivId;
        // params.teamId = ... // not currently used

        let ts = new Date().getTime();
        let post = '';
        // let post = '?tsMax=' + ts + '&teamId=team62';
        if (teamId !== null) {
            post = '?teamId=' + teamId;
        }

        // '/:courseId/admin/dashboard/:orgName/:delivId
        const url = this.app.backendURL + this.courseId + '/admin/dashboard/' + params.orgName + '/' + params.delivId + post;

        // going to be slow; show a modal
        UI.showModal('Dashboard being retrieved. This should take < 10 seconds.');
        Network.handleRemote(url, this.dashboardView, UI.handleError);
    }

    public adminGitHubPage() {
        console.log('AdminController::adminGitHubPage - start');
        this.githubView.updateTitle();

        this.githubView.render({});
    }


}

