import {UI} from "../util/UI";
import {AdminController} from "../controllers/AdminController";
import {Deliverable, DeliverablePayload, BuildContainerPayload} from "../Models";
import {Network} from "../util/Network";
import {OnsModalElement} from "onsenui";
import {App} from "../App";

const BUILD_STATUS = '#adminManageContainers-build-status';
const DOCKER_LOGS_FAIL = '#adminManageContainers__docker-logs-fail';
const DOCKER_LOGS_SUCCESS = '#adminManageContainers__docker-logs-success';
const BUILD_CONTAINER_BUTTON = '#adminManageContainer__build-container-button';
const BUILD_LOGS_CONTAINER = '#adminManageContainers-docker-logs-container';
const NO_HISTORY_CONTAINER = '#adminManageContainers-docker-logs-container';

declare var myApp: App;

export class ManageContainersView {
    private controller: AdminController;
    private deliverable: Deliverable;

    constructor(controller: AdminController, deliverable: Deliverable) {
        this.controller = controller;
        this.deliverable = deliverable;
        console.log('ManageContainersView:: Deliverable: ', this.deliverable);
    }

    private updateFields() {
        console.log('ManageContainersView::updateFields(..) - start');
        let buildStatus = document.querySelector(BUILD_STATUS) as HTMLElement;

        buildStatus.innerHTML = this.deliverable.buildingContainer === true ? 'In Progress' : 'Idle';
    }

    private initBuildButton() {
        console.log('ManageContainersView::toggleBuildButton(..) - start');
        let that = this;
        let buildButton = document.querySelector(BUILD_CONTAINER_BUTTON) as HTMLElement;
        if (this.deliverable.buildingContainer) {
            buildButton.setAttribute('disabled', 'true');
        } else {
            buildButton.addEventListener('click', () => {
                that.confirmContainerBuild();
            });
        }
    }

    // private initDestroyLogs() {
    //     console.log('ManageContainersView::initDockerLogs(..) - start');
    //     let failedDestroyLogCard = '<ons-card id="adminManageContainers__docker-logs-destroy-failed">' + 
    //                                     this.deliverable.dockerLogs.buildHistory + 
    //                                 '</ons-card>';
    //     let successDestroyLogCard = '<ons-card id="adminManageContainers__docker-logs-destroy-success">' + 
    //                                     this.deliverable.dockerLogs.buildHistory + 
    //                                 '</ons-card>';
    // }

    private initBuildLogs() {
        console.log('ManageContainersView::initDockerLogs(..) - start');
        let stderr: string = this.deliverable.dockerLogs.buildHistory.stderr;
        let stdout: string = this.deliverable.dockerLogs.buildHistory.stdout;
        let buildLogsContainer = document.querySelector(BUILD_LOGS_CONTAINER) as HTMLElement;
        let noHistoryContainer = document.querySelector(NO_HISTORY_CONTAINER) as HTMLElement;

        let failedBuildLogCard = '<ons-card id="adminManageContainers__docker-logs-build-failed" style="background-color: #B8513A; color: #fff">' + 
                                     '<pre>' + stderr || '' +  '</pre>' +
                                 '</ons-card>';
        let successBuildLogCard = '<ons-card id="adminManageContainers__docker-logs-build-success" style="background-color: #3A70B8; color: #fff">' + 
                                     '<pre>' + stdout || '' + '</pre>' + 
                                  '</ons-card>';

        let failedHTML = UI.ons.createElement(failedBuildLogCard);
        let successHTML = UI.ons.createElement(successBuildLogCard);

        if (stderr !== '') {
            buildLogsContainer.appendChild(failedHTML);
        }
        if (stdout !== '') {
            buildLogsContainer.appendChild(successHTML);
        }
        if (stdout === '' && stderr === '') {
            let noHistoryHtml = UI.ons.createElement('<span>No build history to display.</span>')
            noHistoryContainer.appendChild(noHistoryHtml);
        }
    }

    private buildContainer() {
        console.log('ManageContainersView::buidlContainer(..) - start');
        let that = this;
        let url = myApp.backendURL + myApp.currentCourseId + '/admin/buildContainer';
        let payload: BuildContainerPayload = {deliverableName: that.deliverable.name};

        Network.httpPut(url, payload)
            .then((data: any) => {
                data.json()
                    .then((response: any) => {
                        console.log('the response back frm build contianer', response);
                    });
            });

    }

    private confirmContainerBuild() {
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
        this.updateFields();
        this.initBuildButton();
        this.initBuildLogs();
    }
}