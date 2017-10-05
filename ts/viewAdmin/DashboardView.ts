import {UI} from "../util/UI";

export class DashboardView {

    public render(data: any) {
        console.log('DashboardView::render - start');
        document.querySelector('#adminTabsHeader').innerHTML = data.course;

        // deliverables
        var dashList = document.querySelector('#admin-dashboard-list');
        if (dashList !== null) {
            dashList.innerHTML = '';
            for (let row of data.rows) {
                dashList.appendChild(UI.createListItem(row.team + ' ( ' + row.final + ' )', JSON.stringify(row.passing)));
            }
        } else {
            console.log('DashboardView::render - element is null');
        }
    }

}