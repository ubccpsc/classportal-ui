import {UI} from "../util/UI";

export class GradeView {

    public render(data: any) {

        console.log('GradeView::render - start');
        document.querySelector('#adminTabsHeader').innerHTML = data.course;

        // grades
        var gradeList = document.querySelector('#admin-grade-list');
        if (gradeList !== null) {
            gradeList.innerHTML = '';

            var headers = null;

            var table = '<table style="width: 100%"><tr>';


            for (let student of data.students) {
                if (headers === null) {
                    table += '<th style="text-align:left;">Student</th>';
                    for (let deliv of student.deliverables) {
                        if (typeof deliv.final !== 'undefined') {
                            table += '<th>' + deliv.id + '</th>'
                        }
                    }
                    table += '</tr>';
                    headers = true;
                }

                table += '<tr>';
                table += '<td>' + student.id + '</td>';
                for (let deliv of student.deliverables) {
                    if (typeof deliv.final !== 'undefined') {
                        table += '<td style="text-align: center;">' + deliv.final + '</td>'
                    }
                }
                table += '</tr>';
            }
            table += '</table>';

            gradeList.innerHTML = table;
        } else {
            console.log('GradeView::render - element is null');
        }
        UI.hideModal();
    }


}