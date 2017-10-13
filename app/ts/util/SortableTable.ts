export interface TableHeader {
    id: string;
    text: string;
    sortable: boolean;
    defaultSort: true; // should only be true for one row
    sortDown: boolean; // probably true on init
}

export class SortableTable {

    private headers: TableHeader[] = [];
    private rows: any[] = [];

    private sortCol: string = null;

    constructor(headers: TableHeader[]) {
        this.headers = headers;

        for (let col of headers) {
            if (col.defaultSort) {
                this.sortCol = col.id;
            }
        }
    }

    private startTable() {
        let tablePrefix = '<table>';
        tablePrefix += '<tr>';
        for (let header of this.headers) {
            // decorate this.sorCol appropriately

            tablePrefix += '<th>' + header.text + '</th>';
        }
        tablePrefix += '</tr>';

        return tablePrefix;
    }

    private endTable() {
        let tableSuffix = '</table>';
        return tableSuffix;
    }

    public addRow(row: any[]) {
        this.rows.push(row);
    }

    private generateRow(cols: any[]) {
        let row = '<tr>';
        for (let col of row) {
            row += '<td>' + col + '</td>';
        }
        row += '</tr>';
        return row;
    }

    private sort() {

        let sortHead = null;
        let sortIndex = 0;
        for (let head of this.headers) {
            if (head.id === this.sortCol) {
                if (head.sortable === false) {
                    console.log('SortableTable::sort() - no sort required; unsortable column: ' + head.id);
                    return;
                } else {
                    sortHead = head;
                }
            }
            sortIndex++;
        }

        sortHead.sortDown = !sortHead.sortDown;
        let mult = 1;
        if (sortHead.sortDown) {
            mult = -1;
        }
        console.log('SortableTable::sort() - col: ' + sortHead.id + '; down: ' + sortHead.sortDown + '; mult: ' + mult + '; index: ' + sortIndex);
        
        this.rows = this.rows.sort(function (a, b) {

            let aVal = a[sortIndex];
            let bVal = b[sortIndex];

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

    generate(): string {
        let table = '';
        table += this.startTable();

        this.sort();

        for (let row of this.rows) {
            this.generateRow(row);
        }
        table += this.endTable();
        return table;
    }

}