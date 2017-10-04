myApp.ui = {


    handleError: function (err) {
        if (err instanceof Error) {
            ons.notification.alert(err.message);
        } else {
            ons.notification.alert(err);
        }
    },

    createListItem: function (text, subtext) {
        if (typeof subtext === 'undefined') {
            // simple list item
            var taskItem = ons.createElement(
                '<ons-list-item>' +
                text +
                '</ons-list-item>');
            return taskItem;
        } else {
            // compound list item
            var taskItem = ons.createElement(
                '<ons-list-item style="display:table;">' +
                '<span class="list-item__title">' + text + '</span><span class="list-item__subtitle">' + subtext + '</span>' +
                '</ons-list-item>');
            return taskItem;
        }
    },

    createListHeader: function (text) {

        var taskHeader = ons.createElement(
            '<ons-list-header>' +
            text +
            '</ons-list-header>');

        return taskHeader;
    }
};

