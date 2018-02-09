import {App} from "../App";
import {UI} from "../util/UI";
import {Network} from "../util/Network";

const UPLOAD_LIST_CONTAINER = '#uploadClassList-container';
const CLASS_LIST_ENUM = {CSID: "CSID", SNUM: "SNUM", LAST: "LAST", FIRST: "FIRST", CWL: "CWL", LAB: "LAB"};
const UPLOAD_BUTTON = '#adminClassListPage-uploadButton';

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
        uploadContainer.addEventListener('click', () => {
            that.uploadClassList();
        });
    }

    public uploadClassList() {
        console.log('ClassListView::save() - start');

        console.log('ClassListView::save() - end');
    }
}