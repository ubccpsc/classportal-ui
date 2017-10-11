import {UI} from "../util/UI";
import {OnsSelectElement} from "onsenui";

declare var myApp: any;

interface DashboardResult {
    response: DashboardRow[];
}

interface DashboardRow {
    timestamp: number;
    project: string;
    user: string;
    url: string;
    scoreOverall: number;
    scoreTest: number;
    scoreCover: number;
    passNames: string[];
    failNames: string[];
    skipNames: string[];
}

export class DashboardView {

    private data: DashboardResult;
    private sortCol: string = 'timestamp';

    public updateTitle() {
        // document.querySelector('#adminTabsHeader').innerHTML = data.course;
        document.querySelector('#adminTabsHeader').innerHTML = "Dashboard";
    }


    public render(data: DashboardResult) {
        console.log('DashboardView::render(..) - start');

        this.data = data;

        this.updateTitle();

        try {
            var dashList = document.querySelector('#admin-dashboard-list');
            if (dashList !== null) {
                dashList.innerHTML = '';

                const header = this.buildHeader();

                let body = '';
                let odd = false;
                for (let row of data.response) {
                    body = body + this.buildRow(row, odd);
                    odd = !odd;
                }

                const footer = this.buildFooter();

                dashList.innerHTML = header + body + '</table>' + footer;
            } else {
                console.log('DashboardView::render(..) - element is null');
            }
        } catch (err) {
            console.log('DashboardView::render(..) - ERROR: ' + err.message);
        }
        UI.hideModal();
    }

    private buildHeader() {
        let str = '<table class="dashHeaderRow" style="width: 100%; background-color: white; border-collapse: collapse">';
        str += '<tr style="background-color: rgb(0,33,69); padding-top: 5px; padding-bottom: 5px; color: white">';
        str += '<th class="dashHeaderElem" onclick="window.myApp.adminController.dashboardView.sort(\'info\')">Info</th>';
        str += '<th class="dashHeaderElem" onclick="window.myApp.adminController.dashboardView.sort(\'timestamp\')">Date</th>';
        str += '<th class="dashHeaderElem" onclick="window.myApp.adminController.dashboardView.sort(\'project\')">Repo</th>';
        str += '<th class="dashHeaderElem" onclick="window.myApp.adminController.dashboardView.sort(\'user\')">User</th>';
        str += '<th class="dashHeaderElem" onclick="window.myApp.adminController.dashboardView.sort(\'scoreOverall\')">% Overall</th>';
        str += '<th class="dashHeaderElem" onclick="window.myApp.adminController.dashboardView.sort(\'scoreTest\')">% Pass</th>';
        str += '<th class="dashHeaderElem" onclick="window.myApp.adminController.dashboardView.sort(\'scoreCover\')">% Cover</th>';
        str += '<th class="dashHeaderElem" onclick="window.myApp.adminController.dashboardView.sort(\'passNames\')"># Pass</th>';
        str += '<th class="dashHeaderElem" onclick="window.myApp.adminController.dashboardView.sort(\'failNames\')"># Fail</th>';
        str += '<th class="dashHeaderElem" onclick="window.myApp.adminController.dashboardView.sort(\'skipNames\')"># Skip</th>';
        str += '<th class="dashHeaderElem" style="width: 500px;" onclick="window.myApp.adminController.dashboardView.sort(\'results\')">Results</th>';
        str += '</tr>';
        return str;
    }

    private buildFooter() {
        let str = '<div></div>'; // TODO: add footer (grade histogram, xy scatter (x=coverage, y=grade))
        return str;
    }

    private buildRow(row: any, odd: boolean) {
        const stdioURL = "http://STDIOURL"; // TODO

        let str = '';
        if (odd) {
            str += '<tr class="dashRow" style="color: black; background: lightgrey">';
        } else {
            str += '<tr class="dashRow" style="color: black; background: white">';
        }

        str += '<td class="dashRowElem"><a target="_blank" href="' + stdioURL + '"><ons-icon icon="ion-ios-help-outline"</ons-icon></a></td>';
        str += '<td class="dashRowElem"><span title="' + new Date(row.timestamp).toISOString() + '">' + new Date(row.timestamp).toLocaleTimeString() + '</span></td>';
        str += '<td class="dashRowElem"><a href="' + row.url + '">' + row.project + '</a></td>';
        str += '<td class="dashRowElem"><a href="https://github.ubc.ca/' + row.user + '">' + row.user + '</a></td>';
        str += '<td class="dashRowElem">' + row.scoreOverall + '</td>';
        str += '<td class="dashRowElem">' + row.scoreTest + '</td>';
        str += '<td class="dashRowElem">' + row.scoreCover + '</td>';
        str += '<td class="dashRowElem">' + row.passNames.length + '</td>';
        str += '<td class="dashRowElem">' + row.failNames.length + '</td>';
        str += '<td class="dashRowElem">' + row.skipNames.length + '</td>';
        str += '<td class="dashRowElem">' + this.getDetails(row) + '</td>';
        str += '</tr>';

        return str;
    }

    private getDetails(row: any) {
        let passNames = row.passNames as string[];
        let failNames = row.failNames as string[];
        let skipNames = row.skipNames as string[];

        let all: string[] = [];
        all = all.concat(passNames, failNames, skipNames);
        all = all.sort();

        interface DetailRow {
            name: string;
            state: string;
            colour: string;
        }

        let annotated: DetailRow[] = [];
        for (var name of all) {
            let state = 'unknown';
            let colour = 'black';
            if (failNames.indexOf(name) > 0) {
                state = 'fail';
                colour = 'red';
            } else if (passNames.indexOf(name) >= 0) {
                state = 'pass';
                colour = 'green';
            } else if (skipNames.indexOf(name) >= 0) {
                state = 'skip';
                colour = 'grey';
            } else {
                // uhoh
            }
            annotated.push({name: name, state: state, colour: colour});
        }

        let str = '<span><table style="height: 20px;">';
        str += '<tr>';

        for (let a of annotated) {
            str += '<td class="dashResultCell" style="width: 5px; height: 20px; background: ' + a.colour + '" title="' + a.name + '"></td>';
        }

        str += '</tr>';
        str += '</table></span>';
        return str;
    }

    public retrieveDashboard() {
        console.log('DashboardView::retrieveDashboard() - start');
        const select = document.getElementById('admin-dashboard-select') as OnsSelectElement;
        if (select != null) {
            const delivId = select.value;
            console.log('DashboardView::retrieveDashboard() - delivId: ' + delivId);
            myApp.adminController.adminDashboardPage(delivId);
        } else {
            console.log('DashboardView::retrieveDashboard() - select is null');
        }
    }

    public sort(columnName: string) {
        if (columnName === 'info' || columnName === 'results') {
            console.log('DashboardView::sort( ' + columnName + ' ) - unsortable column; not doing anything');
            // do nothing
            return;
        }

        let mult = 1;
        if (this.sortCol === columnName) {
            mult = -1;
            this.sortCol = '';
        } else {
            this.sortCol = columnName;
        }

        console.log('DashboardView::sort( ' + columnName + ' ) - mult: ' + mult + '; - start');


        this.data.response = this.data.response.sort(function (a, b) {

            let aVal = a[columnName];
            let bVal = b[columnName];

            if (Array.isArray(aVal)) {
                // an array
                return (aVal.length - bVal.length) * mult;
            } else if (isNaN(aVal) === false) {
                // as a number
                // something that isn't an array or string
                return (Number(aVal) - Number(bVal)) * mult;
            } else if (typeof aVal === 'string') {
                // as a string
                return aVal.localeCompare(bVal) * mult;
            } else {
                // something that isn't an array or string or number
                return (aVal - bVal) * mult;
            }
        });

        this.render(this.data);
    }

}