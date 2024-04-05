import { isNullOrUndefined } from '@vioc-angular/shared/common-functionality';
import { Column } from './column';
import { ColumnConfig } from './column-config';
import { AbstractDropdownColumn } from './dropdown-column';

export class ColumnGroup {
    name: string;
    columns: Columns;
}

type columnType = Column | ColumnConfig | (() => AbstractDropdownColumn<any>);

/**
 * Column mapping intended for use in `SearchPage`.
 */
export class Columns {
    [name: string]: columnType | ColumnGroup;

    static toColumnArray(columns: Columns): Column[] {
        let columnArray: Column[] = [];
        Object.values(columns).forEach((c) => {
            if (instanceOfColumnGroup(c)) {
                // break down the grouped columns into an array and add it to the rest
                columnArray = columnArray.concat(this.toColumnArray(c.columns));
            } else {
                columnArray.push(this.toColumn(c));
            }
        });
        return columnArray;
    }

    static toColumn(column: columnType): Column {
        if (typeof column === 'function') {
            return column();
        } else if (column instanceof Column) {
            return column;
        } else {
            return Column.of(column);
        }
    }
}

export function instanceOfColumnGroup(object: any): object is ColumnGroup {
    return !isNullOrUndefined(object?.name) && object.apiFieldPath === undefined && instanceOfColumns(object.columns);
}

export function instanceOfColumns(object: any): object is Columns {
    return (
        object !== null &&
        object !== undefined &&
        object.name === undefined &&
        object.apiFieldPath === undefined &&
        Object.values(object).length > 0 &&
        // ensure that the properties of the Columns instance has other ColumnConfigs
        Object.values(object).every(
            (o) =>
                o instanceof Column ||
                (o.hasOwnProperty('name') && o.hasOwnProperty('apiFieldPath')) ||
                typeof o === 'function'
        )
    );
}
