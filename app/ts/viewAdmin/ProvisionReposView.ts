import {UI} from "../util/UI";
import {AdminController} from "../controllers/AdminController";
import {Deliverable, DeliverablePayload, RepoRepairPayload, RepoProvisionPayload,
        RepoProvisionResponse, RepoTeamUnlinkPayload, RepoTeamUnlinkResponseContainer,
        RepoRepairResponse, RepoRepairResponseContainer} from "../Models";
import {ProvisionHealthCheck, ProvisionHealthCheckContainer, Team} from "../Models";
import {Network} from "../util/Network";
import {OnsModalElement} from "onsenui";
import {App} from "../App";

const PAGE_TITLE = '#adminProvisionReposPage__toolbar-title';
const INPUT_MAX_TEAM_SIZE = '#adminProvisionReposPage__option-maxTeamSize';
const INPUT_IN_SAME_LAB = '#adminProvisionReposPage__option-inSameLab';
const ACTION_PROVISION_REPOS = '#adminProvisionReposPage__provision-repos-action';
const ACTION_UNLINK_REPOS = '#adminProvisionReposPage__unlink-repos-action';
const CURRENT_DELIV_NAME = '#adminProvisionReposPage__error-manager-deliverable';
const KNOWN_ISSUES_LIST = '#adminProvisionReposPage__known-issues-list';
const REPAIR_REPO_BUTTON = '#adminProvisionReposPage__repair-repo-button';

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
        document.querySelector(CURRENT_DELIV_NAME).innerHTML = String(this.deliverable.name).toUpperCase();
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

    private confirmUnlinkRepos(payload: RepoProvisionPayload) {
        let that = this;
        let warningMessage: string = 'Unlinking repos will erase Github State information from the Teams for the deliverable ' + this.deliverable.name + '. Would you like to proceed?';

        UI.notificationConfirm(warningMessage, function(answer: boolean) {
            if (answer) {
                that.unlinkRepos(payload);
            } else {
                // Do nothing. Let them think about it.
            }
        });
    }

    private confirmRepairRepo(payload: RepoRepairPayload) {
        let that = this;
        let warningMessage: string = 'Are you sure you want to repair repos for ' + (this.deliverable.name).toUpperCase() + '?';

        UI.notificationConfirm(warningMessage, function(answer: boolean) {
            if (answer) {
                that.repairRepos(payload);
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
        let repoProvisionPayload: RepoProvisionPayload = {deliverableName: that.deliverable.name};
        let isValid: boolean = true;

        // No validation required as of yet.

        if (isValid) {
            this.confirmRepoGeneration(repoProvisionPayload);
        }
    }

    private validateRepairRepo() {
        let that = this;
        let repoRepairPayload: RepoRepairPayload = {deliverableName: that.deliverable.name}
        let isValid: boolean = true;

        // No validation required as of yet.

        if (isValid) {
            this.confirmRepairRepo(repoRepairPayload);
        }
    }

    private validateUnlinkRepos() {
        let that = this;
        let repoProvisionPayload: RepoTeamUnlinkPayload = {deliverableName: that.deliverable.name};
        let isValid: boolean = true;

        // No validation required as of yet.

        if (isValid) {
            this.confirmUnlinkRepos(repoProvisionPayload);
        }
    }

    private repairRepos(payload: RepoRepairPayload) { 
        console.log('ProvisionReposView::repairRepos() Network payload', payload);
        let url = myApp.backendURL + myApp.currentCourseId + '/admin/github/repair';
        Network.httpPut(url, payload)
            .then((data: any) => {
                data.json()
                    .then((container: RepoRepairResponseContainer) => {
                        if (typeof container.response !== 'undefined') {
                            UI.notification('Beginning repair process for ' + container.response.teamsForRepair + ' Teams.');
                        } else {
                            console.log('ProvisionReposView::provisionRepos() ERROR', container);
                            UI.notification('Unable to Provision Repos. Please see console and ClassPortal-Backend logs for more information.');
                        }
                    });
            });
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

    private unlinkRepos(payload: RepoTeamUnlinkPayload) {
        console.log('ProvisionReposView::unlinkRepos() Network payload', payload);
        console.log('unlink repos payload', payload);
        let url = myApp.backendURL + myApp.currentCourseId + '/admin/github/repo/team/unlink';
        Network.httpPut(url, payload)
            .then((data: any) => {
                data.json()
                    .then((container: RepoTeamUnlinkResponseContainer) => {
                        console.log('ProvisionReposView:: unlinkRepos() Network response:', container);
                        if (typeof container.response !== 'undefined' && container.response.ok && container.response.nModified > 0) {
                            UI.notification('Successfully removed Github references from ' + container.response.nModified + ' Teams on ' + String(this.deliverable.name).toUpperCase() + '.');
                        } else if (typeof container.response !== 'undefined' && container.response.ok && container.response.nModified === 0) {
                            UI.notification('There were no Github references to remove from Teams on ' + String(this.deliverable.name).toUpperCase() + '.');
                        }
                        else {
                            console.log('ProvisionReposView::provisionRepos() ERROR', container);
                            UI.notification('Unable to Unlink Repo references on Teams for Deliverable ' + String(this.deliverable.name).toUpperCase() + '. Please see console errors.');
                        }
                    });
            });
    }

    private addButtonClickListeners() {
        let that = this;
        let provisionReposAction = document.querySelector(ACTION_PROVISION_REPOS) as HTMLElement;
        let unlinkReposAction = document.querySelector(ACTION_UNLINK_REPOS) as HTMLElement;
        let repairReposAction = document.querySelector(REPAIR_REPO_BUTTON) as HTMLElement;
        provisionReposAction.addEventListener('click', () => {
            that.validateRepoGeneration(); // if Valid, teams will be created 
        });
        unlinkReposAction.addEventListener('click', () => {
            that.validateUnlinkRepos(); // if Valid, teams will be created 
        });
        repairReposAction.addEventListener('click', () => {
            that.validateRepairRepo(); // if Valid, repos will be repaired.
        })
    }

    private getErroredTeams(): Team[] {
        console.log('ProvisionReposView::getErroredTeams() - start');
        let erroredTeams: Team[] = [];
        this.provisionHealthCheck.teams.map((team) => {
            console.log('debug', team);
            if (team.githubState.creationRecord.error !== null) {
                let errorKeys = Object.keys(team.githubState.creationRecord.error);
                if (errorKeys.length > 0) {
                    erroredTeams.push(team);
                }
            }
        });
        return erroredTeams;
    }

    private renderKnownIssues() {
        console.log('ProvisionReposView::renderKnownIssues() - start');
        let erroredTeams: Team[] = this.getErroredTeams();
        let knownIssuesList = document.querySelector(KNOWN_ISSUES_LIST) as HTMLElement;

        erroredTeams.map((team: Team) => {
            let error = team.githubState.creationRecord.error;
            let teamName = this.deliverable.name + '_' + team.name;
            let errorListItemHtml = UI.ons.createElement(
                                        '<li class="list-item list-item--tappable">' +
                                            '<div class="list-item__center">' + teamName + '</div>' +
                                        '</li>'
                                    );
            errorListItemHtml.addEventListener('click', (e: MouseEvent) => {
                let w = window.open('', '', 'width=400,height=400,resizeable,scrollbars');
                w.document.write('Error JSON Details: ' + JSON.stringify(JSON.parse(error), null, 2));
            });
            knownIssuesList.appendChild(errorListItemHtml);
        });
        console.log('ProvisionReposView::renderKnownIssues() - complete');
    }

    private initView(provisionHealthCheck: ProvisionHealthCheck) {
        this.updateTitle();
        this.updateInfoText();
        this.addButtonClickListeners();
        this.renderKnownIssues();
    }
}