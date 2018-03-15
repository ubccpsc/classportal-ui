import {App} from "../App";
import {SuperAdminController} from "../controllers/SuperAdminController";
import {UI} from "../util/UI";
import {AdminList, Admin} from '../Models';
import {Network} from "../util/Network";

const UPLOAD_ADMIN_LIST_CONTAINER = '#uploadClassList-container';
const ADMIN_LIST_HEADERS = {CSID: "CSID", SNUM: "SNUM", LAST: "LAST", FIRST: "FIRST", CWL: "CWL"};
const UPLOAD_BUTTON = '#adminClassListPage-uploadButton';
const ROW_HEADERS = '#adminClassListPage-rowHeaders';
const FILE_INPUT = '#adminClassListPage-fileInput';
const CLASS_LIST_CONTAINER = '#adminClassListPage-listContainer';
const API_CLASS_LIST_PROPERTY = 'adminList';

/**
* OVERVIEW: Upload an Admin List to a Course.
* 
* IMPORTANT: Students  heavily influenced the User objects in the design of ClassPortal. The SNUMs and 
* CSIDs must be unique for students and not an empty string. This has consequences for ADMINS, as they
* share the User model. Admins must create a faux-CSID and faux-SNUM that are unique and do not change, as
* if it were a SNUM or CSID. As long as these strings are unique and do not change, there will be no issues.
*
* Above message applies to 'STAFF' roles as well.
*/

export class AdminListView {
    private courseId: string;
    private app: App;
    private controller: SuperAdminController;

    constructor(controller: SuperAdminController, app: App, courseId: string) {
      this.courseId = courseId;
      this.app = app;
      this.controller = controller;
    }

    private async validate(fileInput: HTMLInputElement) {
      const CSV_HEADERS = await this.getCSVHeaders(fileInput);
      if (fileInput.value.length === 0) {
        UI.notification(`You must select an Admin List before clicking 'Upload'.`);
        return false;
      } 
      console.log('AdminListView:: Header Validation: ', CSV_HEADERS);

      if (CSV_HEADERS.indexOf(ADMIN_LIST_HEADERS.CSID) < 0 || CSV_HEADERS.indexOf(ADMIN_LIST_HEADERS.SNUM) < 0 
          || CSV_HEADERS.indexOf(ADMIN_LIST_HEADERS.FIRST) < 0 || CSV_HEADERS.indexOf(ADMIN_LIST_HEADERS.LAST) < 0) {
          UI.notification('You must include the required CSV headers.');
          return false;
      }
      
      console.log('AdminListView::save() - validation passed');
      return true;

    }

    private getCSVHeaders(fileInput: HTMLInputElement): Promise<any> {
      return new Promise((fulfill, reject) => {
        let csvFile = fileInput.files[0];
        let reader = new FileReader();
        reader.onload = function (event) {
            let text = reader.result;
            let headers = text.split('\n').shift().split(',');
            fulfill(headers);
          };
        reader.readAsText(csvFile, 'UTF-8');
        if (csvFile === null || typeof csvFile === 'undefined') {
          reject('CSV file is null or undefined');
        }
      });
    }

    private getAdminList(): Promise<any> {
      let url = this.app.backendURL + this.courseId + '/superadmin/admins';

      return Network.httpGet(url)
        .then((response: AdminList) => {
          return response;
        });
    }

    public render() {
        console.log('AdminListView::render() - start');
        UI.showModal('Loading Admin List...');
        let that = this;
        this.getAdminList()
          .then((adminList: AdminList) => {
          // #Step 1: Load Admin List info as Rows
          that.loadAdminRows(adminList);

          // #Step 2: Upload Event Listener
          that.addEventListener();
          UI.hideModal();
          });
    }

    private loadAdminRows(adminList: AdminList) {
      console.log('adminList response', adminList);
      let rowHeaders = document.querySelector(ROW_HEADERS) as HTMLElement;
      let adminListContainer = document.querySelector(UPLOAD_ADMIN_LIST_CONTAINER) as HTMLElement;
      adminListContainer.innerHTML = '';
      adminListContainer.appendChild(rowHeaders);
      
      adminListContainer.appendChild(UI.ons.createElement('<p>'));

      adminList.response.map((admin: Admin) => {

        let row = '<ons-row>' + 
          '<ons-col>' + admin.lname + '</ons-col>' +
          '<ons-col>' + admin.fname + '</ons-col>' +
          '<ons-col>' + admin.snum + '</ons-col>' +
          '<ons-col>' + admin.csid + '</ons-col>' +
          '</ons-row>';

        adminListContainer.appendChild(UI.ons.createElement(row));
      });
    }

    private addEventListener() {
      let that = this;
      let uploadContainer: HTMLElement = document.querySelector(UPLOAD_ADMIN_LIST_CONTAINER) as HTMLElement;
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
      console.log('AdminListView::save() - start');
      let that = this;
      let url = this.app.backendURL + this.courseId + '/superadmin/admins';
      const formData = new FormData();
      formData.append(API_CLASS_LIST_PROPERTY, fileList[0]); // The CSV is fileList[0]
      Network.httpPostFile(url, formData)
        .then((data: any) => {
          if (data.status >= 200 && data.status < 300) {
            data.json()
              .then((response: AdminList) => {
                console.log('AdminListView RESPONSE: ' + JSON.stringify(response));
                UI.notification('ClassList Successfully Updated!');
                that.render();
                UI.hideModal();
              });
          } else {
            UI.notification('There was an issue updating your Admin List. Please check the CSV format.');
          }
        });
      console.log('AdminListView::save() - end');
    }
}