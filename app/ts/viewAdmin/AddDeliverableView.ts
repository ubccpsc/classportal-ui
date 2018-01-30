import {App} from "../App";
import {UI} from "../util/UI";
import {Deliverable} from "../interfaces/Deliverables.Interfaces";
import {Network} from "../util/Network";

const ADD_DELIV_CONTAINER = '#addDeliverablePage-container';

export class AddDeliverableView {
    private courseId: string;
    private app: App;

    constructor(courseId: string, app: App) {
        this.courseId = courseId;
        this.app = app;
    }

    public render() {
        console.log('EditDeliverableView::render() - start');
        let addDelivContainer: HTMLElement = this.getAddDelivContainer();
        let newDeliv: Deliverable = this.newDefaultDelivObj();
        let delivHeaderMap: any = this.getDelivHeaderMap();

        Object.keys(newDeliv).forEach((key) => {
            let htmlInputHeader = delivHeaderMap[key];
            let objKey = key;
            let htmlHeader = this.createHtmlHeader(htmlInputHeader);
            let htmlInput = this.createHtmlInput(newDeliv[key]);
        });
    }

    private createHtmlInput(fieldKey: string) {
        let defaultType = UI.inputTypes.TEXT;
        let type = defaultType;
        return UI.createTextInputField(fieldKey, fieldKey, type);
    }

    private createHtmlHeader(header: string): HTMLElement {
        return UI.createListHeader(header);
    }

    private getDelivHeaderMap(): any {
        let delivMap = new Map();
        delivMap.set('url', 'URL');
        delivMap.set('open', 'OPEN DATE');
        delivMap.set('close', 'CLOSE DATE');
        delivMap.set('name', 'NAME');
        delivMap.set('studentsMakeTeams', 'STUDENTS MAKE TEAMS');
        delivMap.set('minTeamSize', 'MINIMUM TEAM SIZE');
        delivMap.set('maxTeamSize', 'MAXIMUM TEAM SIZE');
        delivMap.set('projectCount', 'PROJECT COUNT');
        delivMap.set('teamsInSameLab', 'TEAMS IN SAME LAB');
        delivMap.set('customHtml', 'ENABLE STATIC HTML');
        delivMap.set('buildingRepos', 'PROPOGATING REPOS');
        delivMap.set('dockerImage', 'DOCKER TAG NAME');
        delivMap.set('dockerBuild', 'DOCKER BUILD COMMIT');
        delivMap.set('solutionsUrl', 'SOLUTIONS URL');
        delivMap.set('whitelistedServers', 'WHITELIST SERVER LIST');
        delivMap.set('solutionsKey', 'GITHUB SOLUTIONS KEY');
        delivMap.set('deliverableKey', 'GITHUB DELIVERABLE KEY');
        delivMap.set('rate', 'GRADE REQUEST RATE');
        delivMap.set('gradesReleased', 'GRADES RELEASED');
    }

    private newDefaultDelivObj(): Deliverable {
        let that = this;
        let delivObj: Deliverable = {
            url: '',
            open: 0,
            close: 0,
            name: '',
            studentsMakeTeams: false,
            minTeamSize: 1,
            maxTeamSize: 3,
            projectCount: 0,
            teamsInSameLab: true,
            customHtml: false,
            buildingRepos: false,
            dockerImage: '',
            commit: '',
            dockerBuild: '',
            solutionsUrl: '',
            whitelistedServers: 'portal.cs.ubc.ca:1210 portal.cs.ubc.ca:1310',
            solutionsKey: '',
            deliverableKey: '',
            rate: 90000,
            gradesReleased: false
        }
        return delivObj;
    }

    private getAddDelivContainer(): HTMLElement {
        return document.querySelector(ADD_DELIV_CONTAINER) as HTMLElement;
    }

    public saveDeliverable(): object {
        return {};
    }



    public save() {
        console.log('AddDeliverableView::save() - start');
        let url = this.app.backendURL + this.app.currentCourseId + '/admin/deliverable';

        let deliverable = document.getElementById('admin-editable-deliverable-form');

        let payload: any = {deliverable: {}}

        // for (let key in this.opts.data) {
        //     let item = document.getElementById(key) as HTMLInputElement;
        //     payload.deliverable[key] = item.value;

        //     if (key === CLOSE_DELIV_KEY || key === OPEN_DELIV_KEY) {
        //         payload.deliverable[key] = new Date(item.value).getTime();
        //     }
        // }

        Network.remotePost(url, payload, UI.handleError);
        // save it

        UI.popPage();
        console.log('EditDeliverableView::save() - end');
    }
}