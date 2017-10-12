import {UI} from "../util/UI";
import {AdminController} from "../controllers/AdminController";

export class TeamView {

    private controller: AdminController;

    constructor(controller: AdminController) {
        this.controller = controller;
    }

    public updateTitle() {
        // document.querySelector('#adminTabsHeader').innerHTML = data.course;
        document.querySelector('#adminTabsHeader').innerHTML = "Teams";
    }

    public render(data: any) {
        console.log('TeamView::render(..)  - start');
        this.updateTitle();

        if (typeof data === 'undefined') {
            // no data
            return;
        }
        console.log('TeamView::render(..) - data: ' + JSON.stringify(data));

        try {
            // teams
            var teamsList = document.querySelector('#admin-team-list');
            if (teamsList !== null) {
                teamsList.innerHTML = '';

                for (let deliverable of data.deliverables) {
                    let header = UI.createListHeader(deliverable.id);
                    header.style.backgroundColor = 'lightsteelblue';
                    teamsList.appendChild(header);
                    if (deliverable.unassigned.length > 0) {
                        teamsList.appendChild(UI.createListHeader('Unassigned Students'));
                        for (let unassigned of deliverable.unassigned) {
                            teamsList.appendChild(UI.createListItem(unassigned));
                        }
                    }
                    if (deliverable.teams.length > 0) {
                        teamsList.appendChild(UI.createListHeader('Assigned Students'));
                        for (let team of deliverable.teams) {
                            teamsList.appendChild(UI.createListItem(team.id, 'Members: ' + JSON.stringify(team.members)));
                        }
                    }
                }
            } else {
                console.log('TeamView::render  - element is null');
            }
        } catch (err) {
            console.log('TeamView::render - ERROR: ' + err);
        }
        UI.hideModal();
    }

}