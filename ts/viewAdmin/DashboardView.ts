import {UI} from "../util/UI";

export class DashboardView {

    public render(data: any) {
        console.log('DashboardView::render - start');
        data = data.response; // peel off the top layer

        document.querySelector('#adminTabsHeader').innerHTML = "Dashboard";

        // dash rows
        try {
            var dashList = document.querySelector('#admin-dashboard-list');
            if (dashList !== null) {
                dashList.innerHTML = '';

                const header = this.buildHeader();
                // dashList.innerHTML = header;

                let body = '';
                for (let row of data) {
                    body = body + this.buildRow(row);
                }

                dashList.innerHTML = header + body + '</table>';
            } else {
                console.log('DashboardView::render - element is null');
            }
        } catch (err) {
            console.log('DashboardView::render - ERROR: ' + err.message);
        }
    }

    private buildHeader() {
        /*
        let str = '<div class="dashHeaderRow" style="display:flex; flex-wrap: wrap; justify-content: space-around; margin-left: -10px; margin-right: -10px; background-color: rgb(0,33,69); padding-top: 5px; padding-bottom: 5px; color: white">';
        str += '<div class="dashHeaderElem">Date</div>';
        str += '<div class="dashHeaderElem">Repo</div>';
        str += '<div class="dashHeaderElem">% Overall</div>';
        str += '<div class="dashHeaderElem">% Pass</div>';
        str += '<div class="dashHeaderElem">% Cover</div>';
        str += '<div class="dashHeaderElem"># Pass</div>';
        str += '<div class="dashHeaderElem"># Fail</div>';
        str += '<div class="dashHeaderElem"># Skip</div>';
        str += '<div class="dashHeaderElem">Results</div>';
        str += '</div>';
        */
        let str = '<table class="dashHeaderRow" style="width: 100%; background-color: white;">';
        str += '<tr style="background-color: rgb(0,33,69); padding-top: 5px; padding-bottom: 5px; color: white">';
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

    private buildRow(row: any) {
        /*
        let str = '<div class="dashRow" style="display: flex; justify-content: space-around; color: black">'
        str += '<div class="dashRowElem">' + new Date(row.timestamp).toLocaleTimeString() + '</div>';
        str += '<div class="dashRowElem"><a href="' + row.url + '">' + row.project + '</a></div>';
        str += '<div class="dashRowElem">' + row.scoreOverall + '</div>';
        str += '<div class="dashRowElem">' + row.scoreTest + '</div>';
        str += '<div class="dashRowElem">' + row.scoreCover + '</div>';
        str += '<div class="dashRowElem">' + row.passNames.length + '</div>';
        str += '<div class="dashRowElem">' + row.failNames.length + '</div>';
        str += '<div class="dashRowElem">' + row.skipNames.length + '</div>';
        str += '<div class="dashRowElem">DETAILS HERE!</div>';
        */

        let str = '<tr class="dashRow" style="color: black">';
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
        let passNames = row.passNames;
        let failNames = row.failNames;
        let skipNames = row.skipNames;

        let all: any[] = [];
        all = all.concat(passNames, failNames, skipNames);
        all = all.sort();

        let annotated: any[] = [];
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

        for (var a of annotated) {
            str += '<td class="dashResultCell" style="width: 5px; height: 20px; background: ' + a.colour + '" title="' + a.name + '"></td>';
        }

        // str += '<td>RESULTS HERE</td>';
        str += '</tr>';
        str += '</table></span>';
        return str;
    }

}