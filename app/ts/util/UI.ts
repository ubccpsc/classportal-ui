/**
 * Created by rtholmes on 2017-10-04.
 */
import {OnsModalElement} from "onsenui";


// import * as ons from 'onsenui'; // for dev
declare var ons: any; // for release (or webpack bundling gets huge)

export class UI {

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
            if (key !== "_id") {
                onsListHeader = '<on-list-header>' + key + '</on-list-header>';
            }

            // hide the _id field
            if (key === "_id") {
                element = '<input name="' + key + '" id="' + key + '" type="hidden" value="' + value + '"/>';
            } else if (key === "open" || key === "close") {
                let spanDateTime = '<ons-list-item><span> Current Date/Time: ' + new Date(_obj[key]) + '</span></ons-list-item>';
                let inputDate = '<ons-list-item><input name="' + key + 'Date" id="' + key + '" type="date" value="' + value + '"/></ons-list-item>';
                let inputTime = '<ons-list-item><input name="' + key + 'Time" id="' + key + '" type="time" value="' + value + '"/></ons-list-item>';
                element = spanDateTime + inputDate + inputTime;
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

    public static hideModal() {
        const modal = document.querySelector('ons-modal') as OnsModalElement;
        if (modal !== null) {
            modal.hide({animation: 'fade'});
        } else {
            console.log('UI::hideModal(..) - Modal is null');
        }
    }

}