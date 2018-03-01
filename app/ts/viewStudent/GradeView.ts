import {UI} from "../util/UI";
import {App} from "../App";
import {Network} from "../util/Network";
import {OnsPopoverElement} from "onsenui";
import {GradeContainer, Grade} from '../Models';
import {StudentController} from "../controllers/StudentController";

const GRADE_ROW_HEADERS_CONTAINER = '#studentGradePage__listContainer';
const GRADE_ROW_HEADERS = '#studentGradePage__rowHeaders';
const POPOVER = '#ons-popover';
const POPOVER_CLOSE_BUTTON = '#ons-popover-close-button';
const POPOVER_MESSAGE = '#ons-popover-message';

// ### STUDENT GRADE VIEW ### 

export class GradeView {

    private controller: StudentController;
    private app: App;
    private courseId: string;

    constructor(controller: StudentController, courseId: string, app: App) {
        console.log('/student/GradeView::<init>() - start');
        this.controller = controller;
        this.app = app;
        this.courseId = courseId;
    }

    public render(data: GradeContainer): void {
        console.log('/student/GradeView::render() - start ' + JSON.stringify(data));
        let that = this;
        const studentGradeContainer = document.querySelector(GRADE_ROW_HEADERS_CONTAINER);
        let rowHeaders = document.querySelector(GRADE_ROW_HEADERS) as HTMLElement;
        studentGradeContainer.innerHTML = '';
        studentGradeContainer.appendChild(rowHeaders);

        // this.addModalEventListener();
        
        studentGradeContainer.appendChild(UI.ons.createElement('<p>'));

        data.response.map((grade: Grade) => {

          let row = '<ons-row>' + 
            '<ons-col>' + grade.deliverable + '</ons-col>' +
            '<ons-col><a href="#" id="test" data-comment="' + grade.comments + '">' + grade.grade + '</a></ons-col>' +
            '</ons-row>';
          let htmlRow = UI.ons.createElement(row);  
                        console.log(htmlRow.childNodes[1].firstChild);

          htmlRow.childNodes[1].firstChild.addEventListener('click', (e: MouseEvent) => {
              let popoverMessage: string = htmlRow.childNodes[1].firstChild.dataset.comment;
              that.showModal(e, popoverMessage);
          });

          console.log(htmlRow.childNodes[1].firstChild.dataset.comment);
          studentGradeContainer.appendChild(htmlRow);
        });
    }

    public showModal(e: MouseEvent, message: string) {
        console.log('/student/GradeView:: showModal() -- start');
        let that = this;
        let modal = document.querySelector(POPOVER) as OnsPopoverElement;
        let modalMessage = document.querySelector(POPOVER_MESSAGE) as HTMLElement;
        let closeButton = document.querySelector(POPOVER_CLOSE_BUTTON) as HTMLElement;
        modalMessage.innerText = message;
        closeButton.addEventListener('click', () => {
            that.hideModal(modal);
        });

        modal.show(e.target);
    }

    public hideModal(modal: OnsPopoverElement) {
        console.log('/student/GradeView::hideModal() -- start');
        modal.hide();
    }

}