import {UI} from "../util/UI";
import {AdminController} from "../controllers/AdminController";
import {Deliverable, DeliverablePayload, BuildContainerPayload, BuildContainerContainer, 
        DestroyContainerPayload, DestroyContainerContainer, IsContainerBuiltContainer, 
        IsContainerBuiltPayload} from "../Models";
import {Network} from "../util/Network";
import {OnsModalElement} from "onsenui";
import {App} from "../App";

const BUILD_STATUS = '#adminManageContainers-building-container-status-input';
const CONTAINER_STATUS = '#adminManageContainers-build-container-status-input';
const BUILD_CONTAINER_BUTTON = '#adminManageContainer__build-container-button';
const DESTROY_CONTAINER_BUTTON = '#adminManageContainer__destroy-container-button';
const DOCKER_BUILD_LOGS_CONTAINER = '#adminManageContainers__docker-build-logs-container';
const DOCKER_DESTROY_LOGS_CONTAINER = '#adminManageContainers__docker-destroy-logs-container';
const NO_DESTROY_HISTORY_CONTAINER = '#adminManageContainers__docker-no-destroy-history-section';
const NO_BUILD_HISTORY_CONTAINER = '#adminManageContainers__docker-no-build-history-section';

declare var myApp: App;

export class ManageContainersView {
    private controller: AdminController;
    private deliverable: Deliverable;

    constructor(controller: AdminController, deliverable: Deliverable) {
        this.controller = controller;
        this.deliverable = deliverable;
        console.log('ManageContainersView:: Deliverable: ', this.deliverable);
    }

    private updateDelivInputs() {
        console.log('ManageContainersView::updateDelivInputs(..) - start');
        let buildStatus = document.querySelector(BUILD_STATUS) as HTMLElement;

        buildStatus.innerHTML = this.deliverable.buildingContainer === true ? 'In Progress' : 'Idle';
    }

    private updateContainerStatus() {
        console.log('ManageContainersView::updateDelivInputs(..) - start');
        let that = this;
        let url = myApp.backendURL + myApp.currentCourseId + '/admin/isContainerBuilt';
        let payload: IsContainerBuiltPayload = {deliverableName: that.deliverable.name};
        Network.httpPut(url, payload)
            .then((data: any) => {
                data.json()
                    .then((isContainerBuiltContainer: IsContainerBuiltContainer) => {
                        console.log('ManageContainersView::updateContainerStatus() isContainerBuiltContainer response', isContainerBuiltContainer);
                        let destroyButton = document.querySelector(DESTROY_CONTAINER_BUTTON) as HTMLElement;
                        let containerStatus = document.querySelector(CONTAINER_STATUS) as HTMLElement;
                        // Cannot click destroy if the container does not exist and updates build status
                        if (isContainerBuiltContainer.response === false) {
                            destroyButton.setAttribute('disabled', 'true');
                            containerStatus.innerHTML = 'Container Not Built';
                        } else {
                            containerStatus.innerHTML = 'Container Built';
                            destroyButton.addEventListener('click', () => {
                                that.confirmDestroyContainer();
                            });
                        }

                    });
            });

    }

    private initBuildButton() {
        console.log('ManageContainersView::toggleBuildButton(..) - start');
        let that = this;
        let buildButton = document.querySelector(BUILD_CONTAINER_BUTTON) as HTMLElement;
        if (this.deliverable.buildingContainer) {
            buildButton.setAttribute('disabled', 'true');
        } else {
            buildButton.addEventListener('click', () => {
                that.confirmBuildContainer();
            });
        }
    }

    private initDestroyLogs() {
        console.log('ManageContainersView::initDestroyLogs(..) - start');
        let stdoutDestroy: string = this.deliverable.dockerLogs.destroyHistory.stdout;
        let stderrDestroy: string = this.deliverable.dockerLogs.destroyHistory.stderr;
        let destroyLogsContainer = document.querySelector(DOCKER_DESTROY_LOGS_CONTAINER) as HTMLElement;
        let noDestroyHistoryContainer = document.querySelector(NO_DESTROY_HISTORY_CONTAINER) as HTMLElement;

        // Clear Build History by Default for Re-init and then Render
        noDestroyHistoryContainer.innerHTML = '';

        let failedDestroyLogCard = '<ons-card id="adminManageContainers__docker-logs-build-failed" style="background-color: #B8513A; color: #fff">' + 
                                     '<h5>FAILURE DESTROY RECORD:</h5><p><p><pre>' + stderrDestroy || '' +  '</pre>' +
                                 '</ons-card>';
        let successDestroyLogCard = '<ons-card id="adminManageContainers__docker-logs-build-success" style="background-color: #3A70B8; color: #fff">' + 
                                     '<h5>SUCCESS DESTROY RECORD:</h5><p><p><pre>' + stdoutDestroy || '' + '</pre>' + 
                                  '</ons-card>';
        let successDestroyHTML = UI.ons.createElement(successDestroyLogCard);
        let failedDestroyHTML = UI.ons.createElement(failedDestroyLogCard);

        if (stdoutDestroy !== '') {
            destroyLogsContainer.appendChild(successDestroyHTML);
        }
        if (stderrDestroy !== '') {
            destroyLogsContainer.appendChild(failedDestroyHTML);
        }

        if (stdoutDestroy === '' && stderrDestroy === '') {
            let noHistoryHtml = UI.ons.createElement('<span>No destroy history to display.</span>')
            noDestroyHistoryContainer.appendChild(noHistoryHtml);
        }

    }

    private initBuildLogs() {
        console.log('ManageContainersView::initDockerLogs(..) - start');
        let stderrBuild: string = this.deliverable.dockerLogs.buildHistory.stderr;
        let stdoutBuild: string = this.deliverable.dockerLogs.buildHistory.stdout;

        let buildLogsContainer = document.querySelector(DOCKER_BUILD_LOGS_CONTAINER) as HTMLElement;
        let noBuildHistoryContainer = document.querySelector(NO_BUILD_HISTORY_CONTAINER) as HTMLElement;

        // Clear Build History by Default for Re-init and then Render
        noBuildHistoryContainer.innerHTML = '';

        let failedBuildLogCard = '<ons-card id="adminManageContainers__docker-logs-build-failed" style="background-color: #B8513A; color: #fff">' + 
                                     '<h5>FAILURE BUILD RECORD:</h5><p><p><pre>' + stderrBuild || '' +  '</pre>' +
                                 '</ons-card>';
        let successBuildLogCard = '<ons-card id="adminManageContainers__docker-logs-build-success" style="background-color: #3A70B8; color: #fff">' + 
                                     '<h5>SUCCESS BUILD RECORD:</h5><p><p><pre>' + stdoutBuild || '' + '</pre>' + 
                                  '</ons-card>';
        let failedBuildHTML = UI.ons.createElement(failedBuildLogCard);
        let successBuildHTML = UI.ons.createElement(successBuildLogCard);


        if (stderrBuild !== '') {
            buildLogsContainer.appendChild(failedBuildHTML);
        }
        if (stdoutBuild !== '') {
            buildLogsContainer.appendChild(successBuildHTML);
        }

        if (stdoutBuild === '' && stderrBuild === '') {
            let noHistoryHtml = UI.ons.createElement('<span>No build history to display.</span>')
            noBuildHistoryContainer.appendChild(noHistoryHtml);
        }
    }

    private buildContainer() {
        console.log('ManageContainersView::buildContainer(..) - start');
        let that = this;
        let url = myApp.backendURL + myApp.currentCourseId + '/admin/buildContainer';
        let payload: BuildContainerPayload = {deliverableName: that.deliverable.name};

        Network.httpPut(url, payload)
            .then((data: any) => {
                return data.json()
                    .then((buildContainerContainer: BuildContainerContainer) => {
                        console.log('ManageContainersView::buildContainer(..) Network response: ', buildContainerContainer);
                        // Surprisingly nice UI message:
                        UI.notification(buildContainerContainer.response);
                    });
            });
    }

    private destroyContainer() {
        console.log('ManageContainersView::destroyContainer(..) - start');
        let that = this;
        let url = myApp.backendURL + myApp.currentCourseId + '/admin/destroyContainer';
        let payload: DestroyContainerPayload = {deliverableName: that.deliverable.name};

        Network.httpPut(url, payload)
            .then((data: any) => {
                return data.json()
                    .then((destroyContainerContainer: DestroyContainerContainer) => {
                        console.log('ManageContainersView::destroyContainer(..) Netowrk response: ', destroyContainerContainer);
                        that.deliverable = destroyContainerContainer.response;
                        that.initView();
                        UI.notification('Container successfully desotroyed');
                    });
            });

    }

    private confirmBuildContainer() {
        let that = this;
        let warningMessage: string = 'Are you sure you want to build a container for ' + (this.deliverable.name).toUpperCase() + '?';

        UI.notificationConfirm(warningMessage, function(answer: boolean) {
            if (answer) {
                that.buildContainer();
            } else {
                // Do nothing. Let them think about it.
            }
        });
    }

    private confirmDestroyContainer() {
        let that = this;
        let warningMessage: string = 'WARNING: Destroying a container can have detrimental course effects. Are you sure you want to destroy a container for ' + (this.deliverable.name).toUpperCase() + '?';

        UI.notificationConfirm(warningMessage, function(answer: boolean) {
            if (answer) {
                that.destroyContainer();
            } else {
                // Do nothing. Let them think about it.
            }
        });
    }

    public render() {
        console.log('ManageContainersView::render(..) - start');
        let that = this;

        UI.pushPage('html/admin/manageContainers.html', {data: null})
            .then(() => {
                that.initView();
        });
    }

    private isConfirmed(answer: boolean): boolean {
        if (answer) {
            return true;
        }
        return false;
    }

    private initView() {
        UI.showModal();
        this.updateContainerStatus();
        this.updateDelivInputs();
        this.initBuildButton();
        this.initBuildLogs();
        this.initDestroyLogs();
        UI.hideModal();
    }
}