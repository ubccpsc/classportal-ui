/**
 * Created by rtholmes on 2017-10-04.
 */


// import * as ons from 'onsenui'; // for dev
declare var ons: any; // for release (or webpack bundling gets huge)

export class UI {

    /**
     * Onsen convenience functions
     */
    public static pushPage(pageId: string, options?: any) {

        if (typeof options === 'undefined') {
            options = {};
        }
        console.log('pushPage - id: ' + pageId + '; options: ' + JSON.stringify(options));

        const nav = document.querySelector('#myNavigator') as any;// as ons.OnsNavigatorElement;
        if (nav !== null) {
            nav.pushPage(pageId, options);
        } else {
            console.log('UI::pushPage(..) - WARN: nav is null');
        }
    }

    public static handleError(err: Error) {
        if (err instanceof Error) {
            ons.notification.alert(err.message);
        } else {
            ons.notification.alert(err);
        }
    }

    public static createListItem(text: string, subtext?: string): HTMLElement {
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
                '<ons-list-item style="display:table;">' +
                '<span class="list-item__title">' + text + '</span><span class="list-item__subtitle">' + subtext + '</span>' +
                '</ons-list-item>') as HTMLElement;
            return taskItem;
        }
    }

    public static createListHeader(text: string): HTMLElement {
        var taskHeader = ons.createElement(
            '<ons-list-header>' +
            text +
            '</ons-list-header>') as HTMLElement;

        return taskHeader;
    }


}