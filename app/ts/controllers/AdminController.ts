/**
 * Created by rtholmes on 2017-10-04.
 */

import {UI} from '../util/UI';
import {Network} from '../util/Network';
import {DashboardView} from "../viewAdmin/DashboardView";
import {DeliverableView} from "../viewAdmin/DeliverableView";
import {ClassListView} from "../viewAdmin/ClassListView";
import {DeliverableSelectorView} from "../viewAdmin/DeliverableSelectorView";
import {TeamView} from "../viewAdmin/TeamView";
import {ResultView} from "../viewAdmin/ResultView";
import {AuthHelper} from "../util/AuthHelper";
import {GitHubView} from "../viewAdmin/GitHubView";
import {GradesView} from "../viewAdmin/GradesView";
import {AddDeliverableView} from "../viewAdmin/AddDeliverableView";
import {App} from "../App";
import {GradeUploadView} from "../viewAdmin/GradeUploadView";

const ADD_DELIVERABLE_BUTTON = '#adminDeliverablesPage-add-deliverable';

export class AdminController {

    private deliverableView: DeliverableView;
    private courseId: string;
    private deliverableSelectorView: DeliverableSelectorView;
    private viewGrades: GradesView;
    private teamView = new TeamView(this);
    private resultView = new ResultView(this);
    private githubView = new GitHubView(this);
    private dashboardView = new DashboardView(this);
    private gradeUploadView = new GradeUploadView(this);

    private authHelper: AuthHelper;
    private readonly REQ_USERROLE = 'admin';

    public deliverables: any = null;

    //private DEV_URL = 'https://localhost:5000/';
    //private PROD_URL = 'https://portal.cs.ubc.ca:5000/';
    //private URL = this.DEV_URL;
    private app: App;

    constructor(app: App, courseId: string) {
        console.log("AdminController::<init>");
        this.app = app;
        this.authHelper = new AuthHelper(app.backendURL);
        this.authHelper.checkUserrole(this.REQ_USERROLE);
        this.deliverableView = new DeliverableView(this, this.app);
        this.courseId = courseId;
    }

    private renderAddDeliverableView() {
        let addDeliverableView: AddDeliverableView = new AddDeliverableView(this.courseId, this.app);
        addDeliverableView.render();
    }

    public adminTabsPage(page: any) {
        this.authHelper.checkUserrole(this.REQ_USERROLE);
        console.log('AdminController::adminTabsPage - start (no-op)');
        // called when the tabs container inits
    }

    public adminDeliverablesPage() {
        console.log('AdminController::adminDeliverablesPage - start');
        let that = this;
        this.authHelper.checkUserrole(this.REQ_USERROLE);
        this.deliverableView.updateTitle();
        // let addDelivButton = document.querySelector(ADD_DELIVERABLE_BUTTON) as HTMLElement;

        // addDelivButton.addEventListener('click', () => {
        //     let data: any = {} // no need at this point
        //     UI.pushPage('html/admin/addDeliverable.html', data)
        //         .then(() => {
        //             that.renderAddDeliverableView();
        //         });
        // });

        // params.teamId = ... // not currently used
        // /:courseId/deliverables
        const url = this.app.backendURL + this.courseId + '/deliverables';
        Network.handleRemote(url, this.deliverableView, UI.handleError);
    }

    public adminTeamsPage() {
        this.authHelper.checkUserrole(this.REQ_USERROLE);
        console.log('AdminController::adminTeamsPage - start');
        this.teamView.updateTitle();

        // /:courseId/admin/teams
        const url = this.app.backendURL + this.courseId + '/admin/teams/info/' + 'd1'; // d1 should be DELIVERABLE NAME variable
        Network.handleRemote(url, this.teamView, UI.handleError);
    }

    public adminResultsPage(delivId?: string) {
        console.log('AdminController::adminResultsPage( ' + delivId + ' ) - start');
        this.authHelper.checkUserrole(this.REQ_USERROLE);
        this.resultView.updateTitle();

        if (typeof delivId === 'undefined' || delivId === null || delivId === 'null' || Object.keys(delivId).length === 0) {
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
        Network.getRemotePost(url, payload, this.resultView, UI.handleError);
    }

    public adminDashboardPage(delivId?: string, teamId?: string | null) {
        console.log('AdminController::adminDashboardPage(..) - start');
        this.dashboardView.updateTitle();

        if (typeof delivId === 'undefined' || delivId === null || delivId === 'null' || Object.keys(delivId).length === 0) {
            console.log('AdminController::adminDashboardPage - delivId missing!');

            // configure selects
            this.dashboardView.configure();
            // just don't do anything!
            return;
        } else {
        }

        if (typeof teamId === 'undefined') {
            teamId = null;
        }

        let orgName = '';
        if (this.courseId === '310') {
            orgName = 'CPSC310-2017W-T2'; // HACK should come from server
        } else if (this.courseId === '210') {
            orgName = 'CPSC210-2017W-T2'; // HACK should come from server
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

    public adminConfigDeliverablesPage(opts: any) {
        console.log('AdminController::adminManageDeliverablesPage - start');
        // this.githubView.updateTitle();
        // this.githubView.render({});

        const url = this.app.backendURL + this.courseId + '/deliverables';
        Network.handleRemote(url, this.deliverableView, UI.handleError);
    }

    public adminGitHubManageGradesPage(delivId?: string) {
        console.log('AdminController::adminGitHubManageGradesPage( ' + delivId + ' ) - start');
        this.authHelper.checkUserrole(this.REQ_USERROLE);
        this.resultView.updateTitle();

        if (typeof delivId === 'undefined' || delivId === null || delivId === 'null' || Object.keys(delivId).length === 0 || typeof (<any>delivId).delivId === 'undefined') {
            console.log('AdminController::adminGitHubManageGradesPage - skipped; select deliverable.');
            // configure selects
            this.gradeUploadView.configure();
            return;
        }
    }

    public adminDeliverableSelector(opts: any) {
        console.log('AdminController::adminDeliverableSelector - start; options: ' + JSON.stringify(opts));
        const url = this.app.backendURL + this.courseId + '/deliverables';
        try {
            if (typeof opts.forward === 'undefined' || opts.forward === '') {
                throw `Opts.Forward must contain forwardTo option. Options found enumerated on DeliverableSelector.ts`;
            }
        } catch (err) {
            console.log(`AdminController::adminDeliverableSelector(opts.forward) ERROR ` + err);
        }
        this.deliverableSelectorView = new DeliverableSelectorView(this, opts.forward, opts.header);

        Network.handleRemote(url, this.deliverableSelectorView, UI.handleError);

    }

    public adminGradesView(opts: any) {
        console.log('AdminController::adminViewGrades - start; options: ' + JSON.stringify(opts));
        this.viewGrades = new GradesView(this.courseId, this.app);
        const url = this.app.backendURL + this.courseId + '/deliverables';
        Network.handleRemote(url, this.viewGrades, UI.handleError);
    }

    public adminClassListPage(opts: any) {
        console.log('AdminController::adminClassListPage - start; options: ' + JSON.stringify(opts));
        let classListView = new ClassListView(this.courseId, this.app);
        classListView.render();
    }
}

