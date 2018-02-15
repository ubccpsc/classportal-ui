import {App} from "../App";
import {UI} from "../util/UI";
import {DeliverablePayload} from '../Models';
import {OnsSelectElement} from "onsenui";
import {Network} from "../util/Network";

const DELIVERABLE_SELECTOR = '#admin-grades-view__deliverable-select';

export class GradesView {
    private courseId: string;
    private app: App;

    constructor(courseId: string, app: App) {
        this.courseId = courseId;
        this.app = app;
    }

    public render(data: DeliverablePayload) {
        console.log('ViewGrades::render() - start');
        this.configure(data);
    }

    private configure(data: DeliverablePayload) {
        console.log('DashboardView::configure() - start');
        let deliverables = data.response;
        if (deliverables !== null) {
            const delivSelect = document.querySelector(DELIVERABLE_SELECTOR) as OnsSelectElement;
            while (delivSelect.options.length > 0) {
                delivSelect.remove();
            }

            let option = document.createElement("option");
            option.text = 'Select';
            option.value = 'null';
            (<any>delivSelect).add(option);

            for (let deliv of deliverables) {
                let option = document.createElement("option");
                option.text = deliv.id;
                option.value = deliv.id;
                (<any>delivSelect).add(option);
            }
        }
    }

}