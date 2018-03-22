import {App} from "../App";
import {AdminController} from "../controllers/AdminController";
import {UI} from "../util/UI";
import {AdminListResponse, Admin, Staff, StaffListResponse, Course} from '../Models';
import {Network} from "../util/Network";

const UPLOAD_ADMIN_LIST_CONTAINER = '#adminManageStaffPage-container';
const STAFF_LIST_HEADERS = {CSID: "CSID", SNUM: "SNUM", CWL: "CWL", LAST: "LAST", FIRST: "FIRST"};
const UPLOAD_BUTTON = '#adminManageStaffPage-uploadButton';
const STAFF_ROW_HEADERS = '#adminManageStaffPage-staffRowHeaders';
const FILE_INPUT = '#adminManageStaffPage-fileInput';
const STAFF_LIST_CONTAINER = '#adminManageStaffPage-staffListContainer';
const API_CLASS_LIST_PROPERTY = 'staffList';

/**
* OVERVIEW: Upload an Staff List to a Course.
* 
* It is important that SNUM and CSID numbers remain consistent, as TAs may be enrolled in another course and usernames 
* could collide if they are not consistent. Expect errors if you deviate.
*
*/

export class ManageStaffView {
    private courseId: string;
    private app: App;
    private controller: AdminController;

    constructor(controller: AdminController, app: App, courseId: string) {
      this.courseId = courseId;
      this.app = app;
      this.controller = controller;
    }

    private async validate(fileInput: HTMLInputElement) {
      let CSV_HEADERS = await this.getCSVHeaders(fileInput);
      if (fileInput.value.length === 0) {
        UI.notification(`You must select an Admin List before clicking 'Upload'.`);
        return false;
      } 
      console.log('ManageStaffView:: Header Validation: ', CSV_HEADERS);

      if (!this.isHeaderValid(STAFF_LIST_HEADERS.CSID, CSV_HEADERS) || !this.isHeaderValid(STAFF_LIST_HEADERS.SNUM, CSV_HEADERS)
         || !this.isHeaderValid(STAFF_LIST_HEADERS.CWL, CSV_HEADERS) || !this.isHeaderValid(STAFF_LIST_HEADERS.LAST, CSV_HEADERS)
         || !this.isHeaderValid(STAFF_LIST_HEADERS.FIRST, CSV_HEADERS)) {
        UI.notification('You must include the required CSV headers.');
        return false;
      }

      console.log('ManageStaffView::save() - validation passed');
      return true;

    }

    private isHeaderValid(enumHeader: string, csvHeaders: string[]) {
      console.log('ManageStaffView:: isHeaderValid() - start test for ' + enumHeader);
      let isValid: boolean = false;
      for (let i = 0; i < csvHeaders.length; i++) {
        if (csvHeaders[i].indexOf(enumHeader) > -1) {
          isValid = true;
        }
      }
      return isValid;
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
        reader.readAsText(csvFile);
        if (csvFile === null || typeof csvFile === 'undefined') {
          reject('CSV file is null or undefined');
        }
      });
    }

    private getStaffList(): Promise<any> {
      console.log('ManageStaffView::getStaffList() - start')
      let staffListUrl = this.app.backendURL + this.courseId + '/admin/staff';

      let staffListGet = Network.httpGet(staffListUrl)
        .then((response: StaffListResponse) => {
          return response;
        });

      return Promise.all([staffListGet])
        .then((staffAdminLists) => {
          console.log('ManageStaffView::getStaffAdminList data: ', staffAdminLists);
          if (typeof staffAdminLists === 'undefined') {
            throw `Could not retrieve admin or staff lists`;
          }
          return staffAdminLists;
        });
    }

    public render() {
        console.log('ManageStaffView::render() - start');
        UI.showModal('Loading Admin/Staff List...');
        let that = this;
        this.getStaffList()
          .then((staffAdminList: AdminListResponse) => {

          let staffList = staffAdminList[0].response as Staff[];
          console.log('adminlist', staffAdminList);

          // #Step 1: Load Lists as rows
          that.loadStaffRows(staffList);

          // #Step 2: Upload Event Listener
          that.addEventListener();
          UI.hideModal();
        });
    }

    private loadStaffRows(staffList: Staff[]) {
      console.log('ManageStaffView::loadStaffList() - start - data: ', staffList);
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
        console.log('ManageStaffView::loadStaffRows() - ' + err);
      }
    }

    private addEventListener() {
      let that = this;
      let uploadContainer: HTMLElement = document.querySelector(UPLOAD_ADMIN_LIST_CONTAINER) as HTMLElement;
      let fileInput = document.querySelector(FILE_INPUT) as HTMLInputElement;
      let uploadButton: HTMLElement = document.querySelector(UPLOAD_BUTTON) as HTMLElement;

      // replace event listener if already added from previous render
      let new_el = uploadButton.cloneNode(true); // true means a deep copy
      uploadButton.parentNode.replaceChild(new_el, uploadButton);

      new_el.addEventListener('click', () => {
        this.validate(fileInput)
          .then((isValid: boolean) => {
            if (isValid) {
              that.save(fileInput.files);
            }
          });
      });
    }

    public save(fileList: FileList) {
      console.log('ManageStaffView::save() - start');
      let that = this;
      let url = this.app.backendURL + this.courseId + '/admin/staff';
      const formData = new FormData();
      formData.append(API_CLASS_LIST_PROPERTY, fileList[0]); // The CSV is fileList[0]
      Network.httpPostFile(url, formData)
        .then((data: any) => {
          if (data.status >= 200 && data.status < 300) {
            data.json()
              .then((response: Admin) => {
                console.log('ManageStaffView::save() RESPONSE: ' + JSON.stringify(response));
                UI.notification('ManageStaffView::save() Successfully Updated!');
                that.render();
                UI.hideModal();
              });
          } else {
              data.json()
                .then((err: any) => {
                  UI.notification('There was an issue updating your Staff List.');
                  console.log('ManageStaffView::save() ERROR', err);
                });
          }
        });
      console.log('ManageStaffView::save() - end');
    }
}