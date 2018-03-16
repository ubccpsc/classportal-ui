import {UI} from "../util/UI";
import {App} from "../App";
import {GradeUploadResponse, GradeUploadResponseContainer, GRADES_HEADERS_ENUM} from '../Models';
import {AdminController} from "../controllers/AdminController";
import {SortableTable, TableCell, TableHeader} from "../util/SortableTable";
import {OnsCheckboxElement, OnsSelectElement} from "onsenui";
import {Network} from "../util/Network";

const API_GRADES_FILE_PROPERTY = 'gradesFile';
const DELIVERABLE_SELECTOR = '#adminUploadGradesPage__deliverable-selector';
const UPLOAD_BUTTON = '#adminUploadGradesPage__fileInput-button';
const FILE_INPUT = '#adminUploadGradesPage__fileInput-input';
const DEFAULT_SELECTION = 'select';
const CANNOT_UPDATE_CONTAINER = '#adminUploadGradesPage__cannot-update-container';
const CANNOT_UPDATE_CARD = '#adminUploadGradesPage__cannot-update-card';
const UPDATED_CONTAINER ='#adminUploadGradesPage__updated-container';
const UPDATED_CARD = '#adminUploadGradesPage__updated-card';

/**
* IMPORTANT : RETURNED User models are different. If they are successfully updated, the User object comes back. If not,
* then the original CSV row comes back.
*/

export class GradesUploadView {

    private controller: AdminController;
    private app: App;
    private courseId: string;

    constructor(controller: AdminController, courseId: string, app: App) {
        console.log('GradeUploadView::<init>() - start');
        this.controller = controller;
        this.app = app;
        this.courseId = courseId;
    }

    private async getCSVHeaders(fileInput: HTMLInputElement): Promise<any> {
      return new Promise((fulfill, reject) => {
          let csvFile = fileInput.files[0];
          let reader = new FileReader();
          try {
            reader.onload = function (event) {
            let text = reader.result;
            let headers = text.split('\n').shift().split(',');
            headers.map((header: string) => {
              header = JSON.stringify(header);
            })
            fulfill(headers);  
            };
          } catch (err) {
            reject('Error getting CSV Headers ' + err);
          }
          reader.readAsText(csvFile, 'UTF-8');
      })
      .catch((err) => {
        console.log('GradesUploadView:: ' + err);
      });
    }

    private async validateGrades(fileInput: HTMLInputElement, selectedDeliv: string): Promise<boolean> {
      const CSV_HEADERS: string[] = await this.getCSVHeaders(fileInput);
      console.log(CSV_HEADERS);
      if (fileInput.value.length > 0) {
      } else {
        UI.notification('You must select a CSV list of grades to upload.');
        return false;
      }

      if (selectedDeliv === DEFAULT_SELECTION) {
          UI.notification('You must select a Deliverable before you upload grades.');
          return false;
      }

      if (CSV_HEADERS.indexOf(GRADES_HEADERS_ENUM.CSID) < 0 && CSV_HEADERS.indexOf(GRADES_HEADERS_ENUM.SNUM) < 0 && CSV_HEADERS.indexOf(GRADES_HEADERS_ENUM.CWL) < 0) {
        UI.notification('Your CSV is missing at least one of the student identifiers: CSID, SNUM, or CWL.');
        return false;
      } 

      console.log('GradeUploadView::validateGrades() - validation passed');

      return true;
    }

    private async uploadGrades(fileListElement: HTMLInputElement, delivName: string) {
      console.log('GradeUploadView::uploadGrades() - start');
      let fileList: FileList = fileListElement.files;
      let that = this;
      let csvHeaders = await this.getCSVHeaders(fileListElement);
      let url = this.app.backendURL + this.courseId + '/admin/grades/' + delivName;
      const formData = new FormData();
      formData.append(API_GRADES_FILE_PROPERTY, fileList[0]); // The CSV is fileList[0]
      Network.httpPostFile(url, formData)
        .then((data: any) => {
          if (data.status >= 200 && data.status < 300) {
            data.json()
              .then((data: GradeUploadResponseContainer) => {
                console.log('GradeUploadView GradeUploadResponseContainer data: ' + JSON.stringify(data));
                if (data.response.cannotUpdate.length > 0) {
                  UI.notification(data.response.updatedGrades.length + ' grades successfully updated. Could not update ' + data.response.cannotUpdate.length + ' grades.');
                  that.showCannotUpdateObjects(data.response, csvHeaders);
                  that.showUpdatedObjects(data.response, csvHeaders);
                } else {
                  UI.notification(data.response.updatedGrades.length + ' grades successfully updated.');
                }
                UI.hideModal();
              });
          } else {
            console.log('GradeUploadView:: uploadGrades() ERROR + API ERROR Status: ' + data.status);
            data.json()
              .then((data: any) => {
                UI.notification('There was an issue updating your Grades: ' + data.err);
                console.log('GradeUploadView:: uploadGrades() ERROR + Error message: ' + JSON.stringify(data));
              });
          }
        });
    }

    private showCannotUpdateObjects(gradeUploadResponse: GradeUploadResponse, csvHeaders: string[]) {
      let container = document.querySelector(CANNOT_UPDATE_CONTAINER) as HTMLElement;
      let cannotUpdateList = document.querySelector(CANNOT_UPDATE_CARD) as HTMLElement;
      cannotUpdateList.innerHTML = '';

      // #FIRST: make the headers
      let headers = '';
      csvHeaders.map((header) => {
        if (header.length !== 0) {
          headers += '<ons-col>' + header + '</ons-col>';
        }
      });
      cannotUpdateList.appendChild(UI.ons.createElement('<ons-row>' + headers + '</ons-row>'));
      cannotUpdateList.appendChild(UI.ons.createElement('<p></p>'));

      // #SECOND: make the rows of cannot update users
      gradeUploadResponse.cannotUpdate.map((user: any) => {
        let columns = '';
        Object.keys(user).forEach((key) => {
          if (key.length !== 0) {
            console.log('key will be posted', key.toUpperCase());
            console.log('key content', user[key]);
            columns += '<ons-col>' + user[key] + '</ons-col>';
          }        
        });
          cannotUpdateList.appendChild(UI.ons.createElement('<ons-row>' + columns + '</ons-row>'));
      });

      container.style.display = 'block';
    }

    private showUpdatedObjects(gradeUploadResponse: GradeUploadResponse, csvHeaders: string[]) {
      let container = document.querySelector(UPDATED_CONTAINER) as HTMLElement;
      let updatedList = document.querySelector(UPDATED_CARD) as HTMLElement;
      updatedList.innerHTML = '';

      // make the headers
      let headers = '';
      if (typeof gradeUploadResponse.updatedGrades[0] !== 'undefined' && gradeUploadResponse.updatedGrades[0] !== null) {
        Object.keys((gradeUploadResponse.updatedGrades[0])).forEach((key) => {
          headers += '<ons-col>' + key + '</ons-col>';
        });
      }

      updatedList.appendChild(UI.ons.createElement('<ons-row>' + headers + '</ons-row>'));
      updatedList.appendChild(UI.ons.createElement('<p></p>'));

      // make the rows of updated users
      gradeUploadResponse.updatedGrades.map((user: any) => {
        let columns = '';
        Object.keys(user).forEach((key) => {
          if (key.length !== 0) {
            columns += '<ons-col>' + user[key] + '</ons-col>';
          }
        });
          updatedList.appendChild(UI.ons.createElement('<ons-row>' + columns + '</ons-row>'));
      });

      container.style.display = 'block';
    }
    public async configure(): Promise<any> {
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
            that.validateGrades(fileInput, selectedDeliv)
                .then((isValid: boolean) => {
                    if (isValid) {
                        console.log(fileInput.files);
                        return that.uploadGrades(fileInput, selectedDeliv);
                    }
                });
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