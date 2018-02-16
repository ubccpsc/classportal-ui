import {UI} from "../util/UI";
import {AdminController} from "../controllers/AdminController";
import {Deliverable, DeliverablePayload, RepoRepairPayload, RepoProvisionPayload,
        RepoProvisionResponse} from "../Models";
import {ProvisionHealthCheck, ProvisionHealthCheckContainer} from "../Models";
import {Network} from "../util/Network";
import {OnsModalElement} from "onsenui";
import {App} from "../App";

const PAGE_TITLE = '#adminProvisionReposPage__toolbar-title';
const INPUT_MAX_TEAM_SIZE = '#adminProvisionReposPage__option-maxTeamSize';
const INPUT_IN_SAME_LAB = '#adminProvisionReposPage__option-inSameLab';
const ACTION_PROVISION_REPOS = '#adminProvisionReposPage__provision-repos-action';
const CURRENT_DELIV_NAME = '#adminProvisionReposPage__error-manager-deliverable';

declare var myApp: App;

export class ProvisionReposView {
    private controller: AdminController;
    private deliverable: Deliverable;
    private teamsProvisioned: boolean;
    private provisionHealthCheck: ProvisionHealthCheck;
    // private currentlyProvisioning: boolean; - not implemented on back-end properly.

    constructor(controller: AdminController, deliverable: Deliverable) {
        this.controller = controller;
        this.deliverable = deliverable;
    }

    public updateTitle() {
        document.querySelector(PAGE_TITLE).innerHTML = String(this.deliverable.name).toUpperCase() + ' Github Repo Provisions';
    }

    private updateInfoText() {
        document.querySelector(CURRENT_DELIV_NAME).innerHTML = String(this.deliverable.name);
    }

    private fetchDelivTeamOverview() {
        console.log('ProvisionTeamsDetailsView::fetchHealthInfo(..) - start - data: ');
        let url = myApp.backendURL + myApp.currentCourseId + '/admin/teams/' + this.deliverable.name + '/overview';
        return Network.httpGet(url)
            .then((data: ProvisionHealthCheckContainer) => {
                return data;
            });
    }

    public render() {
        console.log('ProvisionReposDeliverableView::render(..) - start');
        let that = this;

        UI.pushPage('html/admin/provisionRepos.html', {data: null})
            .then(() => {
                return this.fetchDelivTeamOverview()
                    .then((data: ProvisionHealthCheckContainer) => {
                        // we need this data for validation later
                        that.provisionHealthCheck = data.response;
                        return that.initView(data.response);
                    });
        });
    }

    private confirmRepoGeneration(payload: RepoProvisionPayload) {
        let that = this;

        let warningMessage: string = 'The Repo Provisioning process, once underway, cannot be stopped. Would you like to proceed?';

        UI.notificationConfirm(warningMessage, function(answer: boolean) {
            if (answer) {
                that.provisionRepos(payload);
            } else {
                // Do nothing. Let them think about it.
            }
        });
    }

    private isConfirmed(answer: boolean): boolean {
        if (answer) {
            return true;
        }
        return false;
    }

    private validateRepoGeneration() {
        let that = this;
        let maxTeamSize: number;
        let teamsInSameLab: boolean;
        let repoProvisionPayload: RepoProvisionPayload = {deliverableName: that.deliverable.name};
        let isValid: boolean = true;

        // No validation required as of yet.

        if (isValid) {
            this.confirmRepoGeneration(repoProvisionPayload);
        }
    }

    private repairRepos(payload: RepoRepairPayload) { 
        console.log('ProvisionReposView::repairRepos() Network payload', payload);
    }

    private provisionRepos(payload: RepoProvisionPayload) {
        console.log('ProvisionReposView::generateRepos() Network payload', payload);
        console.log('generate teams payload', payload);
        let url = myApp.backendURL + myApp.currentCourseId + '/admin/github/repo/team';
        Network.httpPut(url, payload)
            .then((data: any) => {
                data.json()
                    .then((container: RepoProvisionResponse) => {
                        if (typeof container.response !== 'undefined') {
                            UI.notification(container.response);
                        } else {
                            console.log('ProvisionReposView::provisionRepos() ERROR', container);
                            UI.notification('Unable to Provision Repos. Please see console and ClassPortal-Backend logs for more information.');
                        }
                    });
            });
    }

    private addRepoButtonListener() {
        let that = this;
        let provisionReposAction = document.querySelector(ACTION_PROVISION_REPOS) as HTMLElement;
        provisionReposAction.addEventListener('click', () => {
            that.validateRepoGeneration(); // if Valid, teams will be created 
        });
    }

    private initView(provisionHealthCheck: ProvisionHealthCheck) {
        this.updateTitle();
        this.updateInfoText();
        this.addRepoButtonListener();
    }
}