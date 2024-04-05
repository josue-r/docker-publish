import { formatCurrency, formatNumber } from '@angular/common';
import { Inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';
import { formatMoment, getValue, isNullOrUndefined } from '@vioc-angular/shared/common-functionality';
// tslint:disable-next-line: nx-enforce-module-boundaries
import { SUPPORTED_CURRENCIES } from '@vioc-angular/shared/ui-currency-prefix';
import { Column } from '../../models/column';
import { ColumnType } from '../../models/column-type';
import { AbstractDropdownColumn } from '../../models/dropdown-column';

/**
 * Converts row and column values to the appropriate display output for tables. This was removed
 * from the table component into a pipe to significantly decrease the number of times called by
 * change detection.
 */
@Pipe({
    name: 'tableDisplay',
})
export class TableDisplayPipe implements PipeTransform {
    constructor(@Inject(LOCALE_ID) private readonly _locale: string) {}

    transform(row: any, column?: Column): string {
        const value = getValue(row, column.apiFieldPath);
        if (!isNullOrUndefined(value)) {
            if (column.isDropdown) {
                const dropdown = column as AbstractDropdownColumn<any>;
                return (dropdown.mapToTableDisplay || dropdown.mapToDropdownDisplay)(value);
            } else {
                return this.displayColumnValue(column, value, column.type);
            }
        } else {
            return value;
        }
    }

    private displayColumnValue(column: Column, value: any, columnType: ColumnType): string {
        // TODO: This should really be a concern of the column defaulting.  That is difficult due to locale needing to be injected.
        // TODO: This also means that mapToTableDisplay will not apply for any non ObjectTypes
        switch (columnType) {
            case 'string':
            case 'integer':
                return value;
            case 'boolean':
                return value ? 'Y' : 'N';
            case 'decimal':
                return formatNumber(value, this._locale, `1.${column.decimalPlaces}-${column.decimalPlaces}`);
            case 'currency':
                return formatCurrency(
                    value,
                    this._locale,
                    SUPPORTED_CURRENCIES.USD.symbol, // TODO: Does not respect the passed locale
                    SUPPORTED_CURRENCIES.USD.code
                );
            case 'date':
                return formatMoment(value, true);
            case 'dateTime':
                return formatMoment(value);
            default:
                return column.mapToTableDisplay(value);
        }
    }
}
