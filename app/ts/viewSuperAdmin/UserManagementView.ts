import {App} from "../App";
import {SuperAdminController} from "../controllers/SuperAdminController";
import {UI} from "../util/UI";
import {AdminListResponse, Admin, Staff, StaffListResponse, Course} from '../Models';
import {Network} from "../util/Network";

const UPLOAD_ADMIN_LIST_CONTAINER = '#superAdminUsersPage-container';
const ADMIN_LIST_HEADERS = {CSID: "CSID", SNUM: "SNUM", LAST: "LAST", FIRST: "FIRST", CWL: "CWL"};
const UPLOAD_BUTTON = '#superAdminUsersPage-uploadButton';
const ADMIN_ROW_HEADERS = '#superAdminUsersPage-adminRowHeaders';
const STAFF_ROW_HEADERS = '#superAdminUsersPage-staffRowHeaders';
const FILE_INPUT = '#superAdminUsersPage-fileInput';
const ADMIN_LIST_CONTAINER = '#superAdminUsersPage-adminListContainer';
const STAFF_LIST_CONTAINER = '#superAdminUsersPage-staffListContainer';
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

export default class UserManagementView {
    private course: Course;
    private app: App;
    private controller: SuperAdminController;

    constructor(controller: SuperAdminController, app: App, course: Course) {
      this.course = course;
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

    private getStaffAdminList(): Promise<any> {
      console.log('AdminListView::getStaffAdminList() - start')
      let adminListUrl = this.app.backendURL + this.course.courseId + '/superadmin/admins';
      let staffListUrl = this.app.backendURL + this.course.courseId + '/admin/staff';

      let staffListGet = Network.httpGet(staffListUrl)
        .then((response: StaffListResponse) => {
          return response;
        });

      let adminListGet = Network.httpGet(adminListUrl)
        .then((response: AdminListResponse) => {
          return response;
        });

      return Promise.all([adminListGet, staffListGet])
        .then((staffAdminLists) => {
          console.log('AdminListView::getStaffAdminList data: ', staffAdminLists);
          if (typeof staffAdminLists === 'undefined') {
            throw `Could not retrieve admin or staff lists`;
          }
          return staffAdminLists;
        });
    }

    public render() {
        console.log('AdminListView::render() - start');
        UI.showModal('Loading Admin/Staff List...');
        let that = this;
        this.getStaffAdminList()
          .then((staffAdminList: AdminListResponse) => {

          let adminList = staffAdminList[0].response as Admin[];
          let staffList = staffAdminList[1].response as Staff[];

            UI.pushPage('html/superadmin/users.html')
              .then(() => {
                console.log('adminlist', staffAdminList);
                // #Step 1: Load Lists as rows
                that.loadAdminRows(adminList);
                that.loadStaffRows(staffList);

                // #Step 2: Upload Event Listener
                that.addEventListener();
                UI.hideModal();
                });

              });
    }

    private loadAdminRows(adminList: Admin[]) {
      console.log('AdminListView::loadAdminList() - start - data: ', adminList);
      let rowHeaders = document.querySelector(ADMIN_ROW_HEADERS) as HTMLElement;
      let adminListContainer = document.querySelector(ADMIN_LIST_CONTAINER) as HTMLElement;
      try {
        adminListContainer.innerHTML = '';
        adminListContainer.appendChild(rowHeaders);
        adminListContainer.appendChild(UI.ons.createElement('<p>'));
        adminList.map((admin: Admin) => {

          let row = '<ons-row>' + 
            '<ons-col>' + admin.lname + '</ons-col>' +
            '<ons-col>' + admin.fname + '</ons-col>' +
            '<ons-col>' + admin.snum + '</ons-col>' +
            '<ons-col>' + admin.csid + '</ons-col>' +
            '<ons-col>' + admin.username + '</ons-col>' +
            '<ons-col>' + admin.userrole + '</ons-col>' +
            '</ons-row>';
          adminListContainer.appendChild(UI.ons.createElement(row));
        });
        if (adminList.length === 0) {
          adminListContainer.appendChild(UI.ons.createElement('<p>No admins exist.</p>'));
        }        
        adminListContainer.appendChild(UI.ons.createElement('<p>'));

      } catch (err) {
        console.log('AdminListView::loadAdminList() - ' + err);
      }
    }

    private loadStaffRows(staffList: Staff[]) {
      console.log('AdminListView::loadStaffList() - start - data: ', staffList);
      let rowHeaders = document.querySelector(STAFF_ROW_HEADERS) as HTMLElement;
      let staffListContainer = document.querySelector(STAFF_LIST_CONTAINER) as HTMLElement;

      try {
        staffListContainer.innerHTML = '';
        staffListContainer.appendChild(rowHeaders);
        staffListContainer.appendChild(UI.ons.createElement('<p>'));
        staffList.map((staff: Staff) => {

          let row = '<ons-row>' + 
            '<ons-col>' + staff.lname + '</ons-col>' +
            '<ons-col>' + staff.fname + '</ons-col>' +
            '<ons-col>' + staff.snum + '</ons-col>' +
            '<ons-col>' + staff.csid + '</ons-col>' +
            '<ons-col>' + staff.username + '</ons-col>' +
            '<ons-col>' + staff.userrole + '</ons-col>' +
            '</ons-row>';
          staffListContainer.appendChild(UI.ons.createElement(row));
        });
        if (staffList.length === 0) {
          staffListContainer.appendChild(UI.ons.createElement('<p>No staff exist.</p>'));
        }
        staffListContainer.appendChild(UI.ons.createElement('<p>'));
      } catch (err) {
        console.log('AdminListView::loadAdminList() - ' + err);
      }

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
      let url = this.app.backendURL + this.course.courseId + '/superadmin/admins';
      const formData = new FormData();
      formData.append(API_CLASS_LIST_PROPERTY, fileList[0]); // The CSV is fileList[0]
      Network.httpPostFile(url, formData)
        .then((data: any) => {
          if (data.status >= 200 && data.status < 300) {
            data.json()
              .then((response: Admin) => {
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