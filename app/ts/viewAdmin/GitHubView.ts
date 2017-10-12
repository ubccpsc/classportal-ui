import {UI} from "../util/UI";
import {AdminController} from "../controllers/AdminController";

export class GitHubView {

    private controller: AdminController;

    constructor(controller: AdminController) {
        this.controller = controller;
    }

    public updateTitle() {
        // document.querySelector('#adminTabsHeader').innerHTML = data.course;
        document.querySelector('#adminTabsHeader').innerHTML = "GitHub Management";
    }

    public render(data: any) {
        this.updateTitle();

        UI.hideModal();
    }

}