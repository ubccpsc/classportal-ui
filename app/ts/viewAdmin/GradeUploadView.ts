import {UI} from "../util/UI";
import {AdminController} from "../controllers/AdminController";
import {SortableTable, TableCell, TableHeader} from "../util/SortableTable";
import {OnsCheckboxElement, OnsSelectElement} from "onsenui";


export class GradeUploadView {

    private controller: AdminController;

    constructor(controller: AdminController) {
        console.log('GradeUploadView::<init>() - start');
        this.controller = controller;
    }

    public configure() {
        console.log('GradeUploadView::configure() - start');
        if (this.controller.deliverables !== null) {
            const delivSelect = document.getElementById('admin-gradeUpload-deliverable-select') as OnsSelectElement;
            while (delivSelect.options.length > 0) {
                delivSelect.remove();
            }

            let option = document.createElement("option");
            option.text = 'All';
            option.value = 'all';
            (<any>delivSelect).add(option);

            for (let deliv of this.controller.deliverables) {
                let option = document.createElement("option");
                option.text = deliv.id;
                option.value = deliv.id;
                (<any>delivSelect).add(option);
            }
        }
    }

    public updateTitle() {
        // document.querySelector('#adminTabsHeader').innerHTML = data.course;
        document.querySelector('#adminTabsHeader').innerHTML = "Grade Upload";
    }

    public render(data: any) {

        console.log('GradeUploadView::render(..) - start');
        this.updateTitle();

    }

    public update() {
        console.log('GradeUploadView::update() - start');


    }
}