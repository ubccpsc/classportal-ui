import {App} from "../App";
import {UI} from "../util/UI";
import {Network} from "../util/Network";

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

}