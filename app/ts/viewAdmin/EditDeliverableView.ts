import {App} from "../App";
import {UI} from "../util/UI";

export class EditDeliverableView {
    private opts: any;

    constructor(opts: any) {
        this.opts = opts;
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

        // save it

        UI.popPage();
    }
}