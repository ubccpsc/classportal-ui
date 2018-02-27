import {App} from "../App";
import {AdminController} from "../controllers/AdminController";
import {UI} from "../util/UI";
import {DeliverablePayload} from '../Models';
import {OnsSelectElement} from "onsenui";
import {Network} from "../util/Network";

const DELIVERABLE_SELECTOR = '#adminUploadGradesPage__deliverable-select';
const UPLOAD_GRADES = '#adminUploadGradesPage__fileInput';

export class GradesView {
    private courseId: string;
    private app: App;
    private controller: AdminController;

    constructor(courseId: string, app: App, adminController: AdminController) {
        this.courseId = courseId;
        this.app = app;
        this.controller = adminController;
    }

    public render(data: DeliverablePayload) {
        console.log('ViewGrades::render() - start');
        this.configure(data);
    }

    private uploadGrades() {
        console.log('upload grades hit');
    }

    private configure(data: DeliverablePayload) {
        console.log('DashboardView::configure() - start');
        let deliverables = data.response;
        this.controller.deliverables = data.response;
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