import {App} from "../App";
import {UI} from "../util/UI";
import {Network} from "../util/Network";

const UPLOAD_LIST_CONTAINER = '#uploadClassList-container';
const CLASS_LIST_ENUM = {CSID: "CSID", SNUM: "SNUM", LAST: "LAST", FIRST: "FIRST", CWL: "CWL", LAB: "LAB"};
const UPLOAD_BUTTON = '#adminClassListPage-uploadButton';
const FILE_INPUT = '#adminClassListPage-fileInput';
const API_CLASS_LIST_PROPERTY = 'classList';

export class ClassListView {
    private courseId: string;
    private app: App;

    constructor(courseId: string, app: App) {
        this.courseId = courseId;
        this.app = app;
    }

    public render() {
        console.log('ClassListView::render() - start');
        let that = this;
        let uploadContainer: HTMLElement = document.querySelector(UPLOAD_LIST_CONTAINER) as HTMLElement;
        let fileInput = document.querySelector(FILE_INPUT) as HTMLInputElement;
        let uploadButton: HTMLElement = document.querySelector(UPLOAD_BUTTON) as HTMLElement;
        uploadButton.addEventListener('click', () => {
          if (fileInput.value.length > 0) {
            console.log('ClassListView::save() - validation passed');
            console.log(fileInput.files[0]);
            that.save(fileInput.files[0]);
          } else {
            UI.notification('You must select a Class List before you click "Upload".');
          }
        });
    }

    public save(classListFile: any) {
        console.log('ClassListView::save() - start');
        let url = this.app.backendURL + this.courseId + '/admin/classList';
        const formData = new FormData();
        formData.append(API_CLASS_LIST_PROPERTY, classListFile);
        console.log('filepayload', formData);
        Network.httpPostFile(url, formData)
          .then((response: any) => {
            console.log('ClassListView RESPONSE: ' + response);
          });
        console.log('ClassListView::save() - end');
    }
}