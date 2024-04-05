import { SearchLine } from '@vioc-angular/shared/common-api-models';
import { formatMoment, isNullOrUndefined } from '@vioc-angular/shared/common-functionality';

/**
 * Builds a string `chip` that represents a query restriction.
 *
 * @example
 *
 * searchLine = { column: { name: 'code', type: 'string' }, comparator: { 'equal to' }, value: ['TEST'] }
 * =>
 * chipValue = 'code equal to TEST'
 *
 *
 * searchLine = { column: { name: 'code', type: 'string' }, comparator: { 'in' }, value: ['TEST1', 'TEST2'] }
 * =>
 * chipValue = 'code in [TEST1,TEST2]'
 *
 *
 * searchLine = { column: { name: 'active', type: 'boolean' }, comparator: { 'is Y' } }
 * =>
 * chipValue = 'active is Y'
 *
 * searchLine = { column: { name: 'code', type: 'string' }, comparator: { 'equal to' }, value: ['TEST CODE 1'] }
 * converter = (value) => { return value.replace(' ', '_'); }
 * =>
 * chipValue = 'code equal to TEST_CODE_1'
 */
export class SearchChip {
    /**
     * Represents the value of the passed in SearchLine.
     */
    private readonly chipValue: string;

    constructor(searchLine: SearchLine, converter?: (any) => string) {
        const field = searchLine.column.name;
        const comparator = searchLine.comparator.displayValue;
        const type = searchLine.column.type;
        let value: string;
        if (searchLine.comparator.requiresData) {
            let values: any[];
            if (isNullOrUndefined(searchLine.value)) {
                values = [];
            } else if (Array.isArray(searchLine.value)) {
                values = searchLine.value;
            } else {
                values = [searchLine.value];
            }
            if (type === 'date' || type === 'dateTime') {
                // Using the same function as the moment pipe to ensure dates are displayed consistently
                value = values.map((v) => formatMoment(v, true)).join(', ');
            } else {
                converter = converter || ((o) => o.toString());
                value = values.map(converter).join();
            }
            if (values.length > 1) {
                value = `[${value}]`;
            }
        } else {
            value = '';
        }
        this.chipValue = `${field} ${comparator} ${value}`;
    }

    /**
     * @see chipValue
     */
    get value(): string {
        return this.chipValue;
    }
}
