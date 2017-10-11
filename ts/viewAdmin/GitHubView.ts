import {UI} from "../util/UI";

export class GitHubView {

    public updateTitle() {
        // document.querySelector('#adminTabsHeader').innerHTML = data.course;
        document.querySelector('#adminTabsHeader').innerHTML = "GitHub Management";
    }

    public render(data: any) {
        this.updateTitle();

        UI.hideModal();
    }

}