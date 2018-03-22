import {App} from "../App";
import {UI} from "../util/UI";
import {CLASS_LIST_HEADERS_ENUM} from '../Models';
import {StudentWithLabContainer, StudentWithLab, Student, LabSection} from '../Models';
import {Network} from "../util/Network";

const UPLOAD_LIST_CONTAINER = '#uploadClassList-container';
const CLASS_LIST_COLUMNS = {CSID: "CSID", SNUM: "SNUM", LAST: "LAST", FIRST: "FIRST", CWL: "CWL", LAB: "LAB"};
const UPLOAD_BUTTON = '#adminClassListPage-uploadButton';
const ROW_HEADERS = '#adminClassListPage-rowHeaders';
const FILE_INPUT = '#adminClassListPage-fileInput';
const CLASS_LIST_CONTAINER = '#adminClassListPage-listContainer';
const API_CLASS_LIST_PROPERTY = 'classList';

export class ClassListView {
    private courseId: string;
    private app: App;
    private studentsWithLabs: StudentWithLab[];

    constructor(courseId: string, app: App) {
      this.courseId = courseId;
      this.app = app;
    }

    private async validate(fileInput: HTMLInputElement) {
      const CSV_HEADERS = await this.getCSVHeaders(fileInput);
      if (fileInput.value.length === 0) {
        UI.notification('You must select a Class List before you click "Upload".');
        return false;
      } 
            console.log('ClassListView:: Header Validation: ', CSV_HEADERS);

      // Due to an unknown issue, if we perform this test with the CWL, it always fails.
      // Bug needs a fix, but not high priority.
      if (CSV_HEADERS.indexOf(CLASS_LIST_HEADERS_ENUM.CSID) < 0 || CSV_HEADERS.indexOf(CLASS_LIST_HEADERS_ENUM.SNUM) < 0 
          || CSV_HEADERS.indexOf(CLASS_LIST_HEADERS_ENUM.FIRST) < 0 || CSV_HEADERS.indexOf(CLASS_LIST_HEADERS_ENUM.LAST) < 0) {
          UI.notification('You must include the required CSV headers.');
          return false;
      }
      
      console.log('ClassListView::save() - validation passed');
      return true;

    }

    private async getCSVHeaders(fileInput: HTMLInputElement): Promise<any> {
      return new Promise((fulfill, reject) => {
        let csvFile = fileInput.files[0];
        let reader = new FileReader();
        reader.onload = function (event) {
            let text = reader.result;
            let headers = text.split('\n').shift().split(',');
            fulfill(headers);
          };

          reader.readAsText(csvFile, 'UTF-8');
      });
    }

    private async getClassList(): Promise<any> {
      let url = this.app.backendURL + this.courseId + '/admin/students';

      return Network.httpGet(url)
        .then((response: StudentWithLab[]) => {
          return response;
        });
    }

    public async render() {
        console.log('ClassListView::render() - start');
        let that = this;
        let item = await this.getClassList()
          .then((classListWithLab: StudentWithLabContainer) => {
            console.log('studentWithLab list', classListWithLab);
            let rowHeaders = document.querySelector(ROW_HEADERS) as HTMLElement;
            let classListContainer = document.querySelector(CLASS_LIST_CONTAINER) as HTMLElement;
            classListContainer.innerHTML = '';
            classListContainer.appendChild(rowHeaders);
            
            classListContainer.appendChild(UI.ons.createElement('<p>'));

            classListWithLab.response.map((student: StudentWithLab) => {

              let row = '<ons-row>' + 
                '<ons-col>' + student.lname + '</ons-col>' +
                '<ons-col>' + student.fname + '</ons-col>' +
                '<ons-col>' + student.snum + '</ons-col>' +
                '<ons-col>' + student.csid + '</ons-col>' +
                '<ons-col>' + student.labSection + '</ons-col>' +
                '</ons-row>';

              classListContainer.appendChild(UI.ons.createElement(row));
            });


          });

        let uploadContainer: HTMLElement = document.querySelector(UPLOAD_LIST_CONTAINER) as HTMLElement;
        let fileInput = document.querySelector(FILE_INPUT) as HTMLInputElement;
        let uploadButton: HTMLElement = document.querySelector(UPLOAD_BUTTON) as HTMLElement;

        uploadButton.addEventListener('click', () => {
          this.validate(fileInput)
            .then((isValid: boolean) => {
              if (isValid) {
                that.save(fileInput.files);
              }
            });
        });
    }

    public save(fileList: FileList) {
      console.log('ClassListView::save() - start');
      let that = this;
      let url = this.app.backendURL + this.courseId + '/admin/classList';
      const formData = new FormData();
      formData.append(API_CLASS_LIST_PROPERTY, fileList[0]); // The CSV is fileList[0]
      Network.httpPostFile(url, formData)
        .then((data: any) => {
          if (data.status >= 200 && data.status < 300) {
            data.json()
              .then((response: StudentWithLabContainer) => {
                console.log('ClassListView RESPONSE: ' + JSON.stringify(response));
                UI.notification('ClassList Successfully Updated!');
                that.render();
                UI.hideModal();
              });
          } else {
            data.json()
              .then((errorContainer: any) => {
                console.log('ClassListView ERROR UPDATING CLASS LIST: ', errorContainer);
                UI.notification('There was an issue updating your Class List!');
              });
          }
        });
      console.log('ClassListView::save() - end');
    }
}