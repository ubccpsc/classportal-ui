import {App} from "../App";
import {UI} from "../util/UI";
import {Network} from "../util/Network";

const OPEN_DELIV_KEY = 'open';
const CLOSE_DELIV_KEY = 'close';

export class EditDeliverableView {
    private opts: any;
    private app: App;

    constructor(opts: any, app: App) {
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

    public save() {
        console.log('EditDeliverableView::save() - start');
        let url = this.app.backendURL + this.app.currentCourseId + '/admin/deliverable';

        let deliverable = document.getElementById('admin-editable-deliverable-form');

        let payload: any = {deliverable: {}}

        for (let key in this.opts.data) {
            let item = document.getElementById(key) as HTMLInputElement;
            payload.deliverable[key] = item.value;

            if (key === CLOSE_DELIV_KEY || key === OPEN_DELIV_KEY) {
                payload.deliverable[key] = new Date(item.value).getTime();
            }
        }

        Network.remotePost(url, payload, UI.handleError);
        // save it

        UI.popPage();
        console.log('EditDeliverableView::save() - end');
    }
}