import {UI} from "../util/UI";
import {AdminController} from "../controllers/AdminController";
import {Deliverable, DeliverablePayload} from "../Models";
import {TeamHealthView} from "../viewAdmin/TeamHealthView";
import {ProvisionReposView} from "../viewAdmin/ProvisionReposView";
import {ProvisionTeamsView} from "../viewAdmin/ProvisionTeamsView";
import {DeliverableView} from "../viewAdmin/DeliverableView";
import {RawTeamPayload} from "../Models";
import {Network} from "../util/Network";
import {App} from "../App";

const OPEN_DELIV_KEY = 'open';
const CLOSE_DELIV_KEY = 'close';
const TAPPABLE_INTERFACE = true;
const DELIV_HTML_LIST_ID = '#admin-provision-teams-deliverable-list';
const PROVISION_DETAILS_ID = '#admin-provision-details';

export enum ForwardOptions {
    PROVISION_REPOS = 'PROVISION_REPOS',
    CREATE_TEAMS = 'CREATE_TEAMS',
    TEAM_HEALTH = 'TEAM_HEALTH',
    ASSIGN_GRADES = 'ASSIGN_GRADES',
    MANAGE_DELIVERABLES = 'MANAGE_DELIVERABLES'
}

declare var myApp: App;

export class DeliverableSelectorView {
    private controller: AdminController;
    private teamHealthView: TeamHealthView;
    private provisionReposView: ProvisionReposView;
    private deliverableView: DeliverableView;
    private provisionTeamsView: ProvisionTeamsView;
    private forwardTo: string;
    private header: string;

    constructor(controller: AdminController, forwardTo: string, header: string) {
        this.controller = controller;
        this.forwardTo = forwardTo;
        this.header = header;
    }

    public updateTitle() {
        // document.querySelector('#adminTabsHeader').innerHTML = data.course;
        document.querySelector('#adminProvisionTeamsHeader').innerHTML = this.header;
    }

    public render(data: DeliverablePayload) {
        console.log('ProvisionTeamsDeliverableView::render(..) - start - data: ' + JSON.stringify(data));
        this.updateTitle();
        let that = this;
        let deliverables = data.response;
        const customSort = function (a: Deliverable, b: Deliverable) {
            return (Number(a.id.match(/(\d+)/g)[0]) - Number((b.id.match(/(\d+)/g)[0])));
        };
        deliverables = deliverables.sort(customSort);

        console.log('DeliverableView::render(..) - setting deliverables: ' + JSON.stringify(deliverables));
        this.controller.deliverables = deliverables; // HACK: global

        // deliverables
        const deliverableList = document.querySelector(DELIV_HTML_LIST_ID);
        if (deliverableList !== null) {
            deliverableList.innerHTML = '';
            if (deliverables.length > 0) {
                for (let deliverable of deliverables) {
                    const close = new Date(deliverable.close);
                    const open = new Date(deliverable.open);
                    deliverableList.appendChild(UI.createListHeader(deliverable.id));
                    let text = "Open: " + open.toLocaleDateString() + ' @ ' + open.toLocaleTimeString() + "; Close: " + close.toLocaleDateString() + ' @ ' + close.toLocaleTimeString();
                    let subtext: string;
                    deliverable.dockerOverride === true ? subtext = deliverable.dockerImage + ':' + deliverable.dockerBuild : '';
                    let elem = UI.createListItem(text, subtext, true);
                    elem.onclick = function (event) {

                        switch (that.forwardTo) {
                            case (ForwardOptions.PROVISION_REPOS): {
                                that.provisionReposView = new ProvisionReposView(that.controller, deliverable);
                                that.manageRepoProvisions(deliverable.name);
                                break;
                            }
                            case (ForwardOptions.CREATE_TEAMS): {
                                that.provisionTeamsView = new ProvisionTeamsView(that.controller, deliverable);
                                that.manageRepoProvisions(deliverable.name);
                                break;
                            }
                            case (ForwardOptions.TEAM_HEALTH): {
                                that.teamHealthView = new TeamHealthView(that.controller, deliverable);
                                that.viewDeliverableProvision(deliverable.name);
                                break;
                            }
                            case (ForwardOptions.ASSIGN_GRADES): {
                                that.teamHealthView = new TeamHealthView(that.controller, deliverable);
                                that.viewDeliverableProvision(deliverable.name);
                                break;
                            }
                            case (ForwardOptions.MANAGE_DELIVERABLES): {
                                that.deliverableView = new DeliverableView(that.controller, myApp);
                                that.deliverableView.editDeliverable(deliverable);
                                break;
                            }
                            default: {
                                UI.notification('DeliverableSelectorView.ts ERROR; No Model has been assigned to this view.');
                            }
                        }

                    };
                    deliverableList.appendChild(elem);
                }
            } else {
                deliverableList.appendChild(UI.createListItem("No deliverable data returned from server."));
            }
        } else {
            console.log('DeliverableView::render() - element is null');
        }
        UI.hideModal();
    }

    private editDeliverable(delivName: string) {
      let that = this;
    }

    private getTeamProvisions(delivName: string) {
      let that = this;
      let url = myApp.backendURL + myApp.currentCourseId + '/admin/teams/' + delivName + '/overview';
      Network.handleRemote(url, that.teamHealthView, UI.handleError);
    }

    private manageRepoProvisions(delivName: string) {
        console.log('ProvisionTeamsDeliverableView::viewDeliverableProvision( ' + delivName + ' ) - start');
        UI.showModal();
        this.getTeamProvisions(delivName);
    }

    private viewDeliverableProvision(delivName: string) {
        console.log('ProvisionTeamsDeliverableView::viewDeliverableProvision( ' + delivName + ' ) - start');
        UI.showModal();
        this.getTeamProvisions(delivName);
    }

}