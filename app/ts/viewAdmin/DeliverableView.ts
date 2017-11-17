import {UI} from "../util/UI";
import {AdminController} from "../controllers/AdminController";
import {DeliverablePayload, DeliverablePayloadContainer} from "../Models";
import {App} from "../App";
const flatpickr: any = require('flatpickr');

declare var myApp: App;

export class DeliverableView {
    private controller: AdminController;

    constructor(controller: AdminController) {
        this.controller = controller;
    }

    public updateTitle() {
        // document.querySelector('#adminTabsHeader').innerHTML = data.course;
        document.querySelector('#adminTabsHeader').innerHTML = "Deliverables";
    }

    public render(data: DeliverablePayloadContainer) {
        console.log('DeliverableView::render(..) - start');
        this.updateTitle();

        if (typeof data === 'undefined') {
            console.log('DeliverableView::render(..) - data is undefined');
            return;
        }
        console.log('DeliverableView::render(..) - data: ' + JSON.stringify(data));

        let deliverables = data.response;
        const customSort = function (a: DeliverablePayload, b: DeliverablePayload) {
            return (Number(a.id.match(/(\d+)/g)[0]) - Number((b.id.match(/(\d+)/g)[0])));
        };
        deliverables = deliverables.sort(customSort);

        console.log('DeliverableView::render(..) - setting deliverables: ' + JSON.stringify(deliverables));
        this.controller.deliverables = deliverables; // HACK: global

        const that = this;
        // deliverables
        const deliverableList = document.querySelector('#admin-config-deliv-list');
        if (deliverableList !== null) {
            deliverableList.innerHTML = '';
            if (deliverables.length > 0) {
                for (let deliverable of deliverables) {
                    const close = new Date(deliverable.close);
                    const open = new Date(deliverable.open);
                    deliverableList.appendChild(UI.createListHeader(deliverable.id));
                    let text = "Open: " + open.toLocaleDateString() + ' @ ' + open.toLocaleTimeString() + "; Close: " + open.toLocaleDateString() + ' @ ' + open.toLocaleTimeString();
                    let subtext = 'Subtext';
                    let elem = UI.createListItem(text, subtext, true);
                    elem.onclick = function () {
                        that.editDeliverable(deliverable);
                    };
                    deliverableList.appendChild(elem);
                    // deliverableList.appendChild(UI.createListItem("Close: " + open.toLocaleDateString() + ' @ ' + open.toLocaleTimeString()));
                }
            } else {
                deliverableList.appendChild(UI.createListItem("No deliverable data returned from server."));
            }
        } else {
            console.log('DeliverableView::render() - element is null');
        }
        UI.hideModal();
    }

    private editDeliverable(deliverable: DeliverablePayload) {
        console.log('DeliverableView::editDeliverable( ' + deliverable.id + ' ) - start');
        UI.showModal();
        UI.pushPage('html/admin/editDeliverable.html', {data: deliverable})
            .then(() => {
                let editableDeliv = document.querySelector('#admin-editable-deliverable') || document.querySelector('#admin-manage-deliverables');
                editableDeliv.innerHTML = '';

                let header = UI.createListHeader('Deliverable ' + deliverable.id);
                let elements = UI.createEditableDeliverable(deliverable);

                editableDeliv.appendChild(header);
                editableDeliv.appendChild(elements);

                try {
                    // for some reason this isn't working
                    let dateFilter = flatpickr(".dateTime-picker", {
                        enableTime:  true,
                        time_24hr:   true,
                        utc: true,
                        dateFormat:  "Y/m/d @ H:i",
                        defaultDate: new Date()
                    });

                    console.log('ResultView::configure() - done');
                } catch (err) {
                    console.error('ResultView::configure() - flatpickr ERROR: ' + err.message);
                }

                UI.hideModal();
            });
    }

}