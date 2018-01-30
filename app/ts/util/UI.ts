/**
 * Created by rtholmes on 2017-10-04.
 */
import {OnsModalElement} from "onsenui";
import {Team} from '../interfaces/Teams.Interfaces';

const OPEN_DELIV_KEY = 'open';
const CLOSE_DELIV_KEY = 'close';
const MAX_TEAM_DELIV_KEY = 'maxTeamSize';
const MIN_TEAM_DELIV_KEY = 'minTeamSize';
const MONGO_DB_ID_KEY = '_id';

// import * as ons from 'onsenui'; // for dev
declare var ons: any; // for release (or webpack bundling gets huge)

export class UI {
    public static inputTypes = { TIMEDATE: 'timeDate', NUMBER: 'number', TEXT: 'text', };
    public static ons = ons;

    /**
     * Onsen convenience functions
     */
    public static pushPage(pageId: string, options?: any): any {

        if (typeof options === 'undefined') {
            options = {};
        }
        console.log('pushPage - id: ' + pageId + '; options: ' + JSON.stringify(options));

        const nav = document.querySelector('#myNavigator') as any;// as ons.OnsNavigatorElement;
        if (nav !== null) {
            return nav.pushPage(pageId, options);
        } else {
            console.log('UI::pushPage(..) - WARN: nav is null');
            return nav.pushPage(pageId, options);
        }
    }

    public static getCurrentPage(): any {
        const nav = document.querySelector('#myNavigator') as any;
        if (nav !== null) {
            return nav.getCurrentPage();
        }
    }

    public static popPage() {
        const nav = document.querySelector('#myNavigator') as any;// as ons.OnsNavigatorElement;
        if (nav !== null) {
            nav.popPage();
        } else {
            console.log('UI::popPage(..) - WARN: nav is null');
        }
    }

    public static notification(note: string) {
        ons.notification.alert(note);
    }

    public static handleError(err: Error) {
        if (err instanceof Error) {
            ons.notification.alert(err.message);
        } else {
            ons.notification.alert(err);
        }
    }

    public static showErrorToast(text: string) {
        ons.notification.toast({message: text, timeout: 2000});
    }

    public static createListItem(text: string, subtext?: string, tappable?: boolean): HTMLElement {

        let prefix = '<ons-list-item style="display: table;">';
        if (typeof tappable !== 'undefined' && tappable === true) { // right now only if subtext
            prefix = '<ons-list-item style="display: table;" modifier="chevron" tappable>';
        }

        if (typeof subtext === 'undefined') {
            // simple list item
            var taskItem = ons.createElement(
                '<ons-list-item>' +
                text +
                '</ons-list-item>') as HTMLElement;
            return taskItem;
        } else {
            // compound list item
            var taskItem = ons.createElement(
                prefix +
                '<span class="list-item__title">' + text + '</span><span class="list-item__subtitle">' + subtext + '</span>' +
                '</ons-list-item>') as HTMLElement;
            return taskItem;
        }
    }

    public static createEditableDeliverable(_obj: object): HTMLElement {
        let children = '<div>';

        Object.keys(_obj).forEach((key) => {
            let value = _obj[key];
            let onsListHeader = '';
            let element = '';

            // add item-header only if non-hidden field
            if (key !== MONGO_DB_ID_KEY) {
                onsListHeader = '<on-list-header>' + key + '</on-list-header>';
            }

            // hide the _id field
            if (key === MONGO_DB_ID_KEY) {
                element = '<input name="' + key + '" id="' + key + '" type="hidden" value="' + value + '"/>';
            } else if (key === OPEN_DELIV_KEY || key === CLOSE_DELIV_KEY) {
                let currentDateTime = '<ons-list-item>Current Date/Time: ' + new Date(_obj[key]) + '</ons-list-item>';
                let inputDateTime = '<ons-list-item><input name="' + key + 'DateTime" id="' + key + '" type="text" value="' + value + '"/></ons-list-item>';
                element = currentDateTime + inputDateTime
            } else if (key === MAX_TEAM_DELIV_KEY || key === MIN_TEAM_DELIV_KEY) {
                element = '<ons-list-item><input name="' + key + '" id="' + key + '" type="number" value="' + value + '"/></ons-list-item>';
            } else {
                element = '<ons-list-item><input name="' + key + '" id="' + key + '" type="text" value="' + value + '"/></ons-list-item>';
            }

            children = children + onsListHeader + element;
        });

        children = children + '</div>';

        return ons.createElement(children) as HTMLElement;
    }

    public static createListHeader(text: string): HTMLElement {
        var taskHeader = ons.createElement(
            '<ons-list-header>' +
            text +
            '</ons-list-header>') as HTMLElement;

        return taskHeader;
    }

    public static showModal(text?: string) {
        // https://onsen.io/v2/api/js/ons-modal.html

        if (typeof text === 'undefined') {
            text = null;
        }

        const modal = document.querySelector('ons-modal') as OnsModalElement;
        if (modal !== null) {
            if (text != null) {
                document.getElementById('modalText').innerHTML = text;
            }
            modal.show({animation: 'fade'});
        } else {
            console.log('UI::showModal(..) - Modal is null');
        }
    }

    // Returns the HTML object that maps from a StudentView Team
    public static createTeam(team: Team): string {
        let teamHTMLText = '<h2 style="text-align: center;">' + String(team.deliverableIds[0].name).toUpperCase() + ' Teams</h2>';
        teamHTMLText += '<ons-list-header>' + team.name + '</ons-list-header>';

        for (let member of team.members) {
            teamHTMLText+= '<ons-list-item>' + member.username + ': ' + member.lname + ', ' + member.fname + '</ons-list-item>';
        }

        return teamHTMLText;
    }

    public static createTextInputField(key: string, value: string, type: string) {
        let inputField = ons.createElement(
            '<ons-list-header>' +
            value +
            '</ons-list-header>') as HTMLElement;

        return inputField;
    }

// <ons-page id="studentTeamsPage">
//     <ons-list id="student-team-list">
//         <section style="margin-top: 50px;" class="studentTeamPage-header">
//             <h2 style="text-align: center;">You are currently not on any teams</h2>
//         </section>

//         <section class="studentTeamPage-add-team-cta" style="padding: 30px;">
//             <div class="studentTeamPage-add-team-cta__container" style="width: 100%; margin: auto; text-align: center;">
//                 <ons-button class="studentTeamPage-add-team-cta__button" modifier="medium">Add a Team</ons-button>
//             </div>
//           </section>

//         <ons-list-header>Tappable / Ripple</ons-list-header>
//         <ons-list-item tappable>Tap me</ons-list-item>

//         <ons-list-header>Chevron</ons-list-header>
//         <ons-list-item modifier="chevron" tappable>Chevron</ons-list-item>

//         <ons-list-header>Thumbnails and titles</ons-list-header>
//         <ons-list-item>
//           <div class="left">
//             <img class="list-item__thumbnail" src="http://placekitten.com/g/40/40">
//           </div>
//           <div class="center">
//             <span class="list-item__title">Cutest kitty</span><span class="list-item__subtitle">On the Internet</span>
//           </div>
//     </ons-list>
// </ons-page>

    public static hideModal() {
        const modal = document.querySelector('ons-modal') as OnsModalElement;
        if (modal !== null) {
            modal.hide({animation: 'fade'});
        } else {
            console.log('UI::hideModal(..) - Modal is null');
        }
    }

}