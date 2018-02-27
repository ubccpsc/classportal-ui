import {UI} from "../util/UI";
import {App} from "../App";
import {Grade, GradeContainer} from '../models';
import {AdminController} from "../controllers/AdminController";
import {SortableTable, TableCell, TableHeader} from "../util/SortableTable";
import {OnsCheckboxElement, OnsSelectElement} from "onsenui";
import {Network} from "../util/Network";

const API_GRADES_FILE_PROPERTY = 'gradesFile';
const DELIVERABLE_SELECTOR = '#adminUploadGradesPage__deliverable-selector';
const UPLOAD_BUTTON = '#adminUploadGradesPage__fileInput';
const FILE_INPUT = '#adminClassListPage__fileInput';
const DEFAULT_SELECTION = 'select';

export class GradeUploadView {

    private controller: AdminController;
    private app: App;
    private courseId: string;

    constructor(controller: AdminController, courseId: string, app: App) {
        console.log('GradeUploadView::<init>() - start');
        this.controller = controller;
        this.app = app;
        this.courseId = courseId;
    }

    private validateGrades(fileInput: HTMLInputElement, selectedDeliv: string): boolean {
      if (fileInput.value.length > 0) {
        console.log('GradeUploadView::validateGrades() - validation passed');
      } else {
        UI.notification('You must select a CSV list of grades to upload.');
        return false;
      }

      if (selectedDeliv === DEFAULT_SELECTION) {
          UI.notification('You must select a Deliverable before you upload grades.');
          return false;
      }

      return true;
    }

    private uploadGrades(fileList: FileList, delivName: string) {
      console.log('upload grades hit inside GradeUploadView.ts!');
      console.log(fileList);
      console.log(delivName);
      console.log('ClassListView::save() - start');
      let that = this;
      let url = this.app.backendURL + this.courseId + '/admin/grades/' + delivName;
      const formData = new FormData();
      formData.append(API_GRADES_FILE_PROPERTY, fileList[0]); // The CSV is fileList[0]
      Network.httpPostFile(url, formData)
        .then((data: any) => {
          if (data.status >= 200 && data.status < 300) {
            data.json()
              .then((data: GradeContainer) => {
                console.log('GradeUploadView RESPONSE: ' + JSON.stringify(data));
                UI.notification(data.response.length + ' grades successfully updated.');
                UI.hideModal();
              });
          } else {
            UI.notification('There was an issue updating your Grades. Please see the console.log() output.');
            console.error('GradeUploadView:: uploadGrades() ERROR + API ERROR Status: ' + data.status);
          }
        });
    }

    public configure() {
        console.log('GradeUploadView::configure() - start');
        let that = this;
        const delivSelect = document.querySelector(DELIVERABLE_SELECTOR) as OnsSelectElement;

        if (this.controller.deliverables !== null) {
            while (delivSelect.options.length > 0) {
                delivSelect.remove();
            }

            let option = document.createElement("option");
            option.text = 'Select';
            option.value = DEFAULT_SELECTION;
            (<any>delivSelect).add(option);

            for (let deliv of this.controller.deliverables) {
                let option = document.createElement("option");
                option.text = deliv.id;
                option.value = deliv.id;
                (<any>delivSelect).add(option);
            }
        }

        let saveAction = document.querySelector(UPLOAD_BUTTON) as HTMLButtonElement;
        saveAction.addEventListener('click', () => {
            let fileInput = document.querySelector(FILE_INPUT) as HTMLInputElement;
            let selectedDeliv: string = delivSelect.options[delivSelect.options.selectedIndex].value;
            let isValid: boolean = that.validateGrades(fileInput, selectedDeliv);
            if (isValid) {
                that.uploadGrades(fileInput.files, selectedDeliv);
            }
        });

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