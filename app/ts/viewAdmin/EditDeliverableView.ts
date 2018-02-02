import {App} from "../App";
import {UI} from "../util/UI";
import {Network} from "../util/Network";
import HTMLTags from '../helpers/HTMLTags';

const ADD_DELIVERABLE_TAG = 'Add Deliverable';
const EDIT_DELIVERABLE_TAG = 'Edit Deliverable';

export class EditDeliverableView {
    private opts: any;
    private app: App;

    constructor(opts: any, app: App) {
        console.log("EditDeliverableView::<init> - start");
        this.opts = opts;
        this.app = app;
    }

    public render() {
        console.log('EditDeliverableView::render() - start');
        if (typeof this.opts.deliverable === 'undefined') {
            console.log('EditDeliverableView::render() - new deliverable');
        } else {
            console.log('EditDeliverableView::render() - editing deliverable');
        }
    }

    /**
    * ## INFO ## 
    *
    * EditDeliverableView.ts is used for two different CRUD operations:
    *
    * If 'Add Deliverable' view, hit PUT: '/:courseId/admin/deliverable'
    * If 'Edit Deliverable' view, hit POST: '/:courseId/admin/deliverable'
    * @return void
    */
    public save() {
        console.log('EditDeliverableView::save() - start');
        let url = this.app.backendURL + this.app.currentCourseId + '/admin/deliverable';
        let header = document.querySelector(HTMLTags.EDIT_DELIVERABLE_HEADER) as HTMLElement;
        let isEdit: boolean = header.innerHTML === ADD_DELIVERABLE_TAG ? true : false;
        let deliverable = {}
        let deliverablePayload = {deliverable};
        if (isEdit) {
            Network.httpPost(url, deliverablePayload)
                .then((response: object) => {
                    console.log('EditDeliverableView POST response', response);
                })
        }
        // TODO: retrieve specific form elements and construct object

        let payload: any = {deliverable: {}};

        for (let key in this.opts.data) {
            let item = document.getElementById(key) as HTMLInputElement;
            payload.deliverable[key] = item.value;

            if (key === HTMLTags.CLOSE_DELIV_KEY || key === HTMLTags.OPEN_DELIV_KEY) {
                payload.deliverable[key] = new Date(item.value).getTime();
            }
        }

        Network.remotePost(url, payload, UI.handleError);
        // save it

        UI.popPage();
        console.log('EditDeliverableView::save() - end');
    }
}