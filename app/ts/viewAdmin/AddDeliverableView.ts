import {App} from "../App";
import {UI} from "../util/UI";
import DeliverableRecord from "../models/DeliverableRecord";
import {Deliverable} from '../Models';
import {Network} from "../util/Network";

const ADD_DELIV_CONTAINER = '#addDeliverablePage-container';
const NEW_DELIV_FIELDS = 'addDeliverablePage-new-deliverable';
const SAVE_DELIV = '#addDeliverablePage-save-deliverable';

export class AddDeliverableView {
    private courseId: string;
    private app: App;

    constructor(courseId: string, app: App) {
        this.courseId = courseId;
        this.app = app;
    }

    public render() {
        console.log('AddDeliverableView::render() - start');
        // let addDelivContainer: HTMLElement = this.getAddDelivContainer();
        let that = this;
        let saveDelivButton: HTMLElement = document.querySelector(SAVE_DELIV) as HTMLElement;
        saveDelivButton.addEventListener('click', () => {
            that.save();
        });
        // let newDeliv: Deliverable = this.getBlankDeliv();
        // console.log('new deliv', newDeliv);
        // console.log('add deliv container', addDelivContainer);
        // let delivHeaderMap: any = this.getDelivHeaderMap();

    }

    private createHtmlInput(fieldKey: string) {
        console.log("AddDeliverableView::createHtmlInput() - start");
        let defaultType = UI.inputTypes.TEXT;
        let type = defaultType;
        return UI.createTextInputField(fieldKey, fieldKey, type);
    }

    private createHtmlHeader(header: string): HTMLElement {
        console.log("AddDeliverableView::createHtmlHeader() - start");
        return UI.createListHeader(header);
    }

    private getAddDelivContainer(): HTMLElement {
        console.log("AddDeliverableView::addDelivContainer() - start");
        return document.querySelector(ADD_DELIV_CONTAINER) as HTMLElement;
    }

    public saveDeliverable(): object {
        console.log("AddDeliverableView::saveDeliverable() - start");
        return {};
    }

    private getNewDelivFields(): object {
        let onsenInputParents = document.getElementsByClassName(NEW_DELIV_FIELDS);
        
        console.log('onsenInputParents', onsenInputParents);
        let deliv: Deliverable = DeliverableRecord.getDefaultDeliv();
        for (let i = 0; i < onsenInputParents.length; i++) {
            console.log((onsenInputParents[i]));
            console.log('name', ((onsenInputParents[i]) as HTMLInputElement).name);
            console.log('value', ((onsenInputParents[i]) as HTMLInputElement).value);
            deliv[(onsenInputParents[i].firstChild as HTMLInputElement).name] = (onsenInputParents[i].firstChild as HTMLInputElement).value;
        }
        console.log('new deliv fields before return', deliv);
        return deliv;
    }

    public save() {
        console.log('AddDeliverableView::save() - start');

        this.getNewDelivFields();

        let url = this.app.backendURL + this.app.currentCourseId + '/admin/deliverable';

        let deliverable = document.getElementById('admin-editable-deliverable-form');

        let payload: any = {deliverable: {}};

        // for (let key in this.opts.data) {
        //     let item = document.getElementById(key) as HTMLInputElement;
        //     payload.deliverable[key] = item.value;

        //     if (key === CLOSE_DELIV_KEY || key === OPEN_DELIV_KEY) {
        //         payload.deliverable[key] = new Date(item.value).getTime();
        //     }
        // }

        // Network.remotePost(url, payload, UI.handleError);
        // save it

        console.log('EditDeliverableView::save() - end');
    }
}