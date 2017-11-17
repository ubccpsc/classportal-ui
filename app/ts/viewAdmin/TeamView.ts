import {UI} from "../util/UI";
import {AdminController} from "../controllers/AdminController";
import {SortableTable, TableCell, TableHeader} from "../util/SortableTable";

interface TeamPayloadContainer {
    response: TeamPayload;
}

interface TeamPayload {
    noTeam: Student[]; // these are the students who do not have teams
    teams: TeamRow[]; // these are the teams
}

interface TeamRow {
    labSection: string;
    name: string;
    teamUrl: string;
    members: Student[];
}

interface Student {
    lname: string;
    fname: string;
    username: string;
    profileUrl: string;
}

export class TeamView {

    private data: TeamPayload = null;
    private controller: AdminController;

    constructor(controller: AdminController) {
        this.controller = controller;
    }

    public updateTitle() {
        // document.querySelector('#adminTabsHeader').innerHTML = data.course;
        document.querySelector('#adminTabsHeader').innerHTML = "Teams";
    }

    public render(data: TeamPayloadContainer) {
        console.log('TeamView::render(..)  - start');
        this.updateTitle();

        if (typeof data === 'undefined') {
            // no data
            return;
        }

        this.data = data.response;

        console.log('TeamView::render(..) - data: ' + JSON.stringify(this.data));

        try {

            let maxTeamMembers = 0;
            for (let row of this.data.teams) {
                if (row.members.length > maxTeamMembers) {
                    maxTeamMembers = row.members.length;
                }
            }

            var teamList = document.querySelector('#admin-team-table');
            if (teamList !== null) {
                teamList.innerHTML = '';

                let headers: TableHeader[] = [];
                headers.push({id: 'name', text: 'Name', sortable: true, defaultSort: true, sortDown: true});
                headers.push({id: 'lab', text: 'Lab', sortable: true, defaultSort: false, sortDown: true});
                for (let i = 0; i < maxTeamMembers; i++) {
                    headers.push({id: 'members' + (i + 1), text: 'Member ' + (i + 1), sortable: true, defaultSort: false, sortDown: true});
                }

                let table = new SortableTable(headers, '#admin-team-table');

                for (let row of this.data.teams) {
                    let r: TableCell[] = [];

                    let teamURL = null;
                    try {
                        teamURL = row.teamUrl;
                    } catch (err) {
                        // do nothing
                    }
                    if (teamURL !== null) {
                        r.push({
                            value: row.name,
                            html:  '<a href="' + teamURL + '">' + row.name + '</a>'
                        });
                    } else {
                        r.push({
                            value: row.name,
                            html:  row.name
                        });
                    }

                    r.push({
                        value: row.labSection,
                        html:  row.labSection
                    });

                    if (row.members.length === maxTeamMembers) {
                        for (let member of row.members) {
                            r.push({value: member.username, html: this.generateMember(member)});
                        }
                    } else {
                        console.log('missing member; length: ' + row.members.length);
                        for (let i = 0; i < maxTeamMembers; i++) {
                            if (typeof row.members[i] !== 'undefined') {
                                r.push({value: row.members[i].username, html: this.generateMember(row.members[i])});
                            } else {
                                r.push({value: '', html: ''});
                            }
                        }
                    }
                    table.addRow(r);
                }
                table.generate();
            }
            /*
            // teams
            var teamsList = document.querySelector('#admin-team-list');
            if (teamsList !== null) {
                teamsList.innerHTML = '';

                for (let deliverable of data.deliverables) {
                    let header = UI.createListHeader(deliverable.id);
                    header.style.backgroundColor = 'lightsteelblue';
                    teamsList.appendChild(header);
                    if (deliverable.unassigned.length > 0) {
                        teamsList.appendChild(UI.createListHeader('Unassigned Students'));
                        for (let unassigned of deliverable.unassigned) {
                            teamsList.appendChild(UI.createListItem(unassigned));
                        }
                    }
                    if (deliverable.teams.length > 0) {
                        teamsList.appendChild(UI.createListHeader('Assigned Students'));
                        for (let team of deliverable.teams) {
                            teamsList.appendChild(UI.createListItem(team.id, 'Members: ' + JSON.stringify(team.members)));
                        }
                    }
                }
            } else {
                console.log('TeamView::render  - element is null');
            }
            */
        } catch (err) {
            console.log('TeamView::render - ERROR: ' + err);
        }
        UI.hideModal();
    }

    private generateTeam(members: Student[]) {
        let ret = '';
        // this is terrible. TeamMember should also have a URL
        for (let member of members) {
            ret += this.generateMember(member) + ', ';
        }
        ret = ret.substr(0, ret.length - 2); // pull off last comma
        return ret;
    }

    private generateMember(member: Student) {
        let ret = '';
        // this is terrible. TeamMember should also have a URL
        ret += member.fname + ' ' + member.lname + ' ( <a href="'+member.profileUrl+'">' + member.username + '</a> )';

        return ret;
    }
}