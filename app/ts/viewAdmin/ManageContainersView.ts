import {UI} from "../util/UI";
import {AdminController} from "../controllers/AdminController";
import {Deliverable, DeliverablePayload, TeamGenerationPayload, 
    TeamGenerationResponseContainer, TeamGenerationResponse} from "../Models";
import {ProvisionHealthCheck, ProvisionHealthCheckContainer} from "../Models";
import {Network} from "../util/Network";
import {OnsModalElement} from "onsenui";
import {App} from "../App";

const BUILD_STATUS = '#adminManageContainers-build-status';
const DOCKER_LOGS_FAIL = '#adminManageContainers__docker-logs-fail';
const DOCKER_LOGS_SUCCESS = '#adminManageContainers__docker-logs-success';
const BUILD_CONTAINER_BUTTON = '#adminManageContainer__build-container-button';
const BUILD_LOGS_CONTAINER = '#adminManageContainers-docker-logs-container';

declare var myApp: App;

export class ManageContainersView {
    private controller: AdminController;
    private deliverable: Deliverable;
    private teamsProvisioned: boolean;
    private provisionHealthCheck: ProvisionHealthCheck;
    // private currentlyProvisioning: boolean; - not implemented on back-end properly.

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
        let buildButton = document.querySelector(BUILD_CONTAINER_BUTTON) as HTMLElement;
        if (this.deliverable.buildingContainer) {
            buildButton.setAttribute('disabled', 'true');
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

        let buildLogsContainer = document.querySelector(BUILD_LOGS_CONTAINER) as HTMLElement;
        let failedBuildLogCard = '<ons-card id="adminManageContainers__docker-logs-build-failed" style="background-color: #B8513A; color: #fff">' + 
                                     this.deliverable.dockerLogs.buildHistory.stderr || '' +  
                                 '</ons-card>';
        let successBuildLogCard = '<ons-card id="adminManageContainers__docker-logs-build-success" style="background-color: #3A70B8; color: #fff">' + 
                                     this.deliverable.dockerLogs.buildHistory.stdout || '' + 
                                  '</ons-card>';

        let failedHTML = UI.ons.createElement(failedBuildLogCard);
        let successHTML = UI.ons.createElement(successBuildLogCard);

        buildLogsContainer.appendChild(failedHTML);
        buildLogsContainer.appendChild(successHTML);
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