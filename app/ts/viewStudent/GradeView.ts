import {UI} from "../util/UI";

export class GradeView {

    public render(data: any): void {
        console.log('GradeView::render() - start');
        const gradeList = document.querySelector('#student-grade-list');
        if (gradeList !== null) {
            gradeList.innerHTML = '';
            for (let grade of data.grades) {
                gradeList.appendChild(UI.createListHeader(grade.id));
                if (typeof grade.msg !== 'undefined') {
                    gradeList.appendChild(UI.createListItem(grade.msg));
                } else {
                    gradeList.appendChild(UI.createListItem('Final Grade: ' + grade.final));
                    if (grade.test) {
                        gradeList.appendChild(UI.createListItem('Test Grade: ' + grade.test));
                    }
                    if (grade.cover) {
                        gradeList.appendChild(UI.createListItem('Coverage Grade: ' + grade.cover));
                    }
                }
            }
        } else {
            console.log('GradeView::render() - element is null');
        }
    }

}