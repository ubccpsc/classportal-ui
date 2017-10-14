export interface TableHeader {
    id: string;
    text: string;
    sortable: boolean;
    defaultSort: boolean; // should only be true for one row
    sortDown: boolean; // probably true on init
}

export interface TableCell {
    value: any;
    html: string;
}

/**
 * Sorted table widget.
 */
export class SortableTable {

    private divName: string;
    private headers: TableHeader[] = [];
    private rows: any[] = [];
    private sortHeader: TableHeader = null;

    constructor(headers: TableHeader[]) {
        this.headers = headers;

        for (let col of headers) {
            if (col.defaultSort) {
                col;
            }
        }
    }

    public addRow(row: any[]) {
        this.rows.push(row);
    }

    public sort(colId: string) {
        for (let c of this.headers) {
            if (c.id === colId) {
                this.sortHeader = c;
            }
        }
        this.generate(this.divName);
    }

    public generate(targetDiv: any) {
        let that = this;

        this.divName = targetDiv;
        let table = '';
        table += this.startTable();

        this.performSort();

        for (let row of this.rows) {
            table += this.generateRow(row);
        }
        table += this.endTable();

        // return table;
        var div = document.querySelector(targetDiv);
        div.innerHTML = '';
        div.innerHTML = table;
        console.log('foo');
        let ths = div.getElementsByTagName('th');
        for (let th of ths) {
            th.onclick = function () {
                const colName = this.getAttribute('col');
                that.sort(colName);
            };
        }
        console.log('foo');
    }

    private startTable() {
        let tablePrefix = '<table style="width: 100%">';
        tablePrefix += '<tr>';

        // set the default header if one is not yet set
        if (this.sortHeader === null) {
            for (let header of this.headers) {
                if (header.defaultSort) {
                    this.sortHeader = header;
                }
            }
        }

        for (let header of this.headers) {
            // decorate this.sorCol appropriately
            if (header.id === this.sortHeader.id) {
                if (this.sortHeader.sortDown) {
                    tablePrefix += '<th col="' + header.id + '"><b>' + header.text + ' ▼</b></th>';
                } else {
                    tablePrefix += '<th col="' + header.id + '"><b>' + header.text + ' ▲</b></th>';
                }
            } else {
                tablePrefix += '<th col="' + header.id + '">' + header.text + '</th>';
            }
        }
        tablePrefix += '</tr>';

        return tablePrefix;
    }

    private endTable() {
        let tableSuffix = '</table>';
        return tableSuffix;
    }

    private generateRow(cols: any[]) {
        let row = '<tr class="dashRow" style="color: black; background: lightgrey">';
        let count = 0;
        for (let col of cols) {
            if (count % 2 === 0) {
                row += '<td class="dashRowElem" style="color: black; background: white">' + (<any>col).html + '</td>';
            } else {
                row += '<td class="dashRowElem" style="color: black; background: lightgrey">' + (<any>col).html + '</td>';
            }
        }
        row += '</tr>';
        return row;
    }

    private performSort() {
        let sortHead = null;
        let sortIndex = 0;
        for (let head of this.headers) {
            if (head.id === this.sortHeader.id) {
                if (head.sortable === false) {
                    console.log('SortableTable::sort() - no sort required; unsortable column: ' + head.id);
                    return;
                } else {
                    sortHead = head;
                }
            }

            if (sortHead === null) {
                sortIndex++;
            }
        }

        sortHead.sortDown = !sortHead.sortDown;
        let mult = -1;
        if (sortHead.sortDown) {
            mult = 1;
        }
        console.log('SortableTable::sort() - col: ' + sortHead.id + '; down: ' + sortHead.sortDown + '; mult: ' + mult + '; index: ' + sortIndex);

        this.rows = this.rows.sort(function (a, b) {

            let aVal = a[sortIndex].value;
            let bVal = b[sortIndex].value;

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
    }

}