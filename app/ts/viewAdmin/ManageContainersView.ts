import {UI} from "../util/UI";
import {AdminController} from "../controllers/AdminController";
import {Deliverable, DeliverablePayload, BuildContainerPayload, BuildContainerContainer, 
        DestroyContainerPayload, DestroyContainerContainer, IsContainerBuiltContainer, 
        IsContainerBuiltPayload, DeliverableContainer} from "../Models";
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
const CONTAINER_PAGE_ONS_BACK_BUTTON = '#adminManageContainers__back-button';

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

    private updateContainerStatus(): Promise<IsContainerBuiltContainer> {
        console.log('ManageContainersView::updateDelivInputs(..) - start');
        let that = this;
        let url = myApp.backendURL + myApp.currentCourseId + '/admin/isContainerBuilt';
        let payload: IsContainerBuiltPayload = {deliverableName: that.deliverable.name};
        return Network.httpPut(url, payload)
            .then((data: any) => {
                return data.json()
                    .then((isContainerBuiltContainer: IsContainerBuiltContainer) => {
                        console.log('ManageContainersView::updateContainerStatus() isContainerBuiltContainer response', isContainerBuiltContainer);
                        let buildButton = document.querySelector(BUILD_CONTAINER_BUTTON) as HTMLElement;
                        let destroyButton = document.querySelector(DESTROY_CONTAINER_BUTTON) as HTMLElement;
                        let containerStatus = document.querySelector(CONTAINER_STATUS) as HTMLElement;
                        // Cannot click destroy if the container does not exist and updates build status
                        if (isContainerBuiltContainer.response === false) {
                            destroyButton.setAttribute('disabled', 'true');
                            containerStatus.innerHTML = 'Container Not Ready';
                        } else {
                            containerStatus.innerHTML = 'Container Ready';
                            buildButton.setAttribute('disabled', 'true');
                            destroyButton.removeAttribute('disabled');
                            destroyButton.addEventListener('click', () => {
                                that.confirmDestroyContainer();
                            });
                        }
                        return isContainerBuiltContainer;
                    });
            });

    }

    private initBuildButton(isContainerBuilt: boolean) {
        console.log('ManageContainersView::toggleBuildButton(..) - start');
        let that = this;
        let buildButton = document.querySelector(BUILD_CONTAINER_BUTTON) as HTMLElement;
        if (this.deliverable.buildingContainer || isContainerBuilt) {
            buildButton.setAttribute('disabled', 'true');
        } else {
            buildButton.removeAttribute('disabled');
            buildButton.addEventListener('click', () => {
                that.confirmBuildContainer();
            });
        }
    }

    private initDestroyLogs(isContainerBuilt: boolean) {
        console.log('ManageContainersView::initDestroyLogs(..) - start');
        let stdLogDestroy: string = this.deliverable.dockerLogs.destroyHistory;
        let destroyLogsContainer = document.querySelector(DOCKER_DESTROY_LOGS_CONTAINER) as HTMLElement;
        let noDestroyHistoryContainer = document.querySelector(NO_DESTROY_HISTORY_CONTAINER) as HTMLElement;

        // Clear Build History by Default for Re-init and then Render
        destroyLogsContainer.innerHTML = '';
        noDestroyHistoryContainer.innerHTML = '';

        let destroyLogCard: string;

        // If container is not built and destroy logs exist, then it has been successfully destroyed.
        if (!isContainerBuilt && stdLogDestroy !== '') {
            destroyLogCard = '<ons-card id="adminManageContainers__docker-logs-destroy" style="background-color: #3A70B8; color: #fff">' + 
                                '<div class="title">SUCCESSFULLY DESTROYED DOCKER CONTAINER:</div><p><p><pre>' + stdLogDestroy || '' +  '</pre>' +
                             '</ons-card>';
        } else {
            destroyLogCard = '<ons-card id="adminManageContainers__docker-logs-destroy" style="background-color: #B8513A; color: #fff">' + 
                                '<div class="title">FAILED TO DESTROY DOCKER CONTAINER:</div><p><p><pre>' + stdLogDestroy || '' +  '</pre>' +
                             '</ons-card>';
        }

        let destroyLogCardHtml = UI.ons.createElement(destroyLogCard);

        if (stdLogDestroy !== '') {
            destroyLogsContainer.appendChild(destroyLogCardHtml);
        }

        if (stdLogDestroy === '') {
            let noHistoryHtml = UI.ons.createElement('<span>No destroy history to display.</span>')
            noDestroyHistoryContainer.appendChild(noHistoryHtml);
        } else {
            noDestroyHistoryContainer.innerHTML = '';
        }

    }

    private initBuildLogs(isContainerBuilt: boolean) {
        console.log('ManageContainersView::initDockerLogs(..) - start');
        let stdLogBuild: string = this.deliverable.dockerLogs.buildHistory;
        let stdLogDestroy: string = this.deliverable.dockerLogs.destroyHistory;

        let buildLogsContainer = document.querySelector(DOCKER_BUILD_LOGS_CONTAINER) as HTMLElement;
        let noBuildHistoryContainer = document.querySelector(NO_BUILD_HISTORY_CONTAINER) as HTMLElement;

        // Clear Build History by Default for Re-init and then Render
        buildLogsContainer.innerHTML = '';
        noBuildHistoryContainer.innerHTML = '';
        let buildLogCard: string;

        // NOTE ON COMPLEX LOGIC: 
        // Possiblity 1) The container is built, and therefore we know the container build was successful.
        // Possibility 2) The container has been destroyed, but we know it was successfully built because (a.) success logs exist 
        // & (b.) destroy logs exist & (c.) no container exists.
        // (c.) is included for high-level view and redundancy

        if (isContainerBuilt || (!isContainerBuilt && stdLogBuild !== '' && stdLogDestroy !== '')) {
            buildLogCard = '<ons-card id="adminManageContainers__docker-logs-build" style="background-color: #3A70B8; color: #fff">' + 
                                '<div class="title">BUILD SUCCESS LOGS:</div><p><p><pre>' + stdLogBuild || '' + '</pre>' + 
                            '</ons-card>';
        } else {
            buildLogCard = '<ons-card id="adminManageContainers__docker-logs-build" style="background-color: #B8513A; color: #fff">' + 
                                '<div class="title">BUILD FAILED LOGS:</div><p><p><pre>' + stdLogBuild || '' +  '</pre>' +
                           '</ons-card>';
        }

        let buildLogCardHtml = UI.ons.createElement(buildLogCard);


        if (stdLogBuild !== '') {
            buildLogsContainer.appendChild(buildLogCardHtml);
        }

        if (stdLogBuild === '') {
            let noHistoryHtml = UI.ons.createElement('<span>No build history to display.</span>')
            noBuildHistoryContainer.appendChild(noHistoryHtml);
        }
    }

    private clearLogContainers() {
        let buildLogsContainer = document.querySelector(DOCKER_BUILD_LOGS_CONTAINER) as HTMLElement;
        let destroyLogsContainer = document.querySelector(DOCKER_DESTROY_LOGS_CONTAINER) as HTMLElement;
        buildLogsContainer.innerHTML = '';
        destroyLogsContainer.innerHTML = '';
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
                        that.clearLogContainers();
                        that.deliverable.buildingContainer = true;
                        that.refreshDelivInitTimer();
                    });
            });
    }


    // Set a timer because the container build process is so long that it is easier to refresh the view
    // if building to determine if progress has been made. Up to 30 minutes build time...
    // refresh deliv manually, as we are not using socket io yet.
    // Can be run for long container build task.
    private refreshDelivInitTimer() {
        let that = this;
        let backButton = document.querySelector(CONTAINER_PAGE_ONS_BACK_BUTTON) as HTMLElement;
        let timers = [];
        for (let i = 0; i < 30; i++) {
            let timer = setTimeout(function() {
               if (that.deliverable.buildingContainer && this === 'undefined') {
                   console.log('ManageContainersView::initView() Time triggered page re-init for building container refresh');
                   that.refreshDeliv()
                       .then(() => {
                            that.initView();
                       });
               }
            }, i * 30000);
            timers.push(timer);
        }
        backButton.addEventListener('click', () => {
            timers.map((timer) => {
                clearTimeout(timer);
            });
        });
    }

    private refreshDeliv(): Promise<Deliverable> {
        let url = myApp.backendURL + myApp.currentCourseId + '/deliverables';
        let that = this;
        return Network.httpGet(url)
           .then((delivContainer: DeliverableContainer) => {
               delivContainer.response.map((deliv) => {
                   if (deliv.name === that.deliverable.name) {
                       that.deliverable = deliv;
                   }
               });
               return that.deliverable;
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
                        UI.notification('Container successfully destroyed.');
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
        let that = this;
        UI.showModal();
        this.updateContainerStatus()
            .then((isContainerBuiltContainer: IsContainerBuiltContainer) => {
                let isContainerBuilt = isContainerBuiltContainer.response;
                this.updateDelivInputs();
                this.initBuildButton(isContainerBuilt);
                this.initBuildLogs(isContainerBuilt);
                this.initDestroyLogs(isContainerBuilt);
                UI.hideModal();
            });
    }
}