import {App} from "../App";
import {UI} from "../util/UI";
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

    private validate(fileInput: HTMLInputElement) {
      if (fileInput.value.length > 0) {
        console.log('ClassListView::save() - validation passed');
        return true;
      } else {
        UI.notification('You must select a Class List before you click "Upload".');
        return false;
      }
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
            })


          });

        let uploadContainer: HTMLElement = document.querySelector(UPLOAD_LIST_CONTAINER) as HTMLElement;
        let fileInput = document.querySelector(FILE_INPUT) as HTMLInputElement;
        let uploadButton: HTMLElement = document.querySelector(UPLOAD_BUTTON) as HTMLElement;

        uploadButton.addEventListener('click', () => {
          let isValid: boolean = this.validate(fileInput);
          if (isValid) {
            that.save(fileInput.files);
          }
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
            UI.notification('There was an issue updating your Class List! Please check the CSV format.');
          }
        });
      console.log('ClassListView::save() - end');
    }
}