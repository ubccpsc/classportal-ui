import {UI} from "../util/UI";

interface DashboardResult {
    response: DashboardRow[];
}

interface DashboardRow {
    timestamp: number;
    project: string;
    url: string;
    scoreOverall: number;
    scoreTest: number;
    scoreCover: number;
    passNames: string[];
    failNames: string[];
    skipNames: string[];
}

export class DashboardView {

    public render(data: DashboardResult) {
        console.log('DashboardView::render(..) - start');

        document.querySelector('#adminTabsHeader').innerHTML = "Dashboard";

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
        let str = '<table class="dashHeaderRow" style="width: 100%; background-color: white;">';
        str += '<tr style="background-color: rgb(0,33,69); padding-top: 5px; padding-bottom: 5px; color: white">';
        str += '<th class="dashHeaderElem">Info</th>';
        str += '<th class="dashHeaderElem">Date</th>';
        str += '<th class="dashHeaderElem">Repo</th>';
        str += '<th class="dashHeaderElem">% Overall</th>';
        str += '<th class="dashHeaderElem">% Pass</th>';
        str += '<th class="dashHeaderElem">% Cover</th>';
        str += '<th class="dashHeaderElem"># Pass</th>';
        str += '<th class="dashHeaderElem"># Fail</th>';
        str += '<th class="dashHeaderElem"># Skip</th>';
        str += '<th class="dashHeaderElem" style="width: 500px;">Results</th>';
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

}