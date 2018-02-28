import {UI} from "../util/UI";
import {App} from "../App";
import {Network} from "../util/Network";
import {GradeContainer, Grade} from '../models';
import {StudentController} from "../controllers/StudentController";

const GRADE_ROW_HEADERS_CONTAINER = '#studentGradePage-listContainer';
const GRADE_ROW_HEADERS = '#studentGradePage-rowHeaders';

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
        const studentGradeContainer = document.querySelector(GRADE_ROW_HEADERS_CONTAINER);
        let rowHeaders = document.querySelector(GRADE_ROW_HEADERS) as HTMLElement;
        studentGradeContainer.innerHTML = '';
        studentGradeContainer.appendChild(rowHeaders);
        
        studentGradeContainer.appendChild(UI.ons.createElement('<p>'));

        data.response.map((grade: Grade) => {

          let row = '<ons-row>' + 
            '<ons-col>' + grade.deliverable + '</ons-col>' +
            '<ons-col>' + grade.grade + '</ons-col>' +
            '<ons-col>' + grade.comments + '</ons-col>' +
            '</ons-row>';

          studentGradeContainer.appendChild(UI.ons.createElement(row));
        })



    }

}