import {UI} from "../util/UI";

export class TeamView {

    public render(data: any): void {
        console.log('GradeView::render() - start');
        const teamList = document.querySelector('#student-team-list');
        if (teamList !== null) {
            teamList.innerHTML = '';
            for (let team of data.teams) {
                if (typeof team.msg !== 'undefined') {
                    teamList.appendChild(UI.createListItem(team.id, team.msg));
                } else {
                    teamList.appendChild(UI.createListItem(team.id, JSON.stringify(team.members)));
                }
            }
        } else {
            console.log('GradeView::render() - element is null');
        }
    }

}