import { isNullOrUndefined, isString } from '@vioc-angular/shared/common-functionality';
import {
    AbstractDropdownColumn,
    Column,
    Comparator,
    Comparators,
    instanceOfDefaultSearch,
    Searchable,
} from '@vioc-angular/shared/util-column';
import { QueryRestriction } from './query-restriction';

/**
 * Builds a query restriction from the provided `column`, `comparator` and `value`.
 */
export class SearchLine {
    /**
     * Allows the search line to be removed if `true`.
     *
     * Default `true`
     */
    removable = true;

    /** Path and type representing the data which will be compared to the user provided value(s). */
    column: Column;

    /** Used to equate the `column` against the user provided value(s). */
    comparator: Comparator;

    /** User provided value(s) which the query restriction will be crated against. */
    value: any[];

    /** Build an array of SearchLines based off of the default search configuration of the given column array. */
    static defaults(columns: Column[]): SearchLine[] {
        const isDefaultColumn = (column: Column) =>
            column.searchable !== false && (column.isRequired || column.isSearchedByDefault);
        return columns.filter(isDefaultColumn).map((column) => this.columnToSearchLine(column)) || [];
    }

    static requiredLines(columns: Column[]): SearchLine[] {
        return columns.filter((column) => column.isRequired).map((column) => this.columnToSearchLine(column));
    }

    static columnToSearchLine(column: Column): SearchLine {
        if (column.isSearchedByDefault) {
            const defaultSearch = (column.searchable as Searchable).defaultSearch;
            if (instanceOfDefaultSearch(defaultSearch)) {
                return new SearchLine(column, defaultSearch.comparator, defaultSearch.value);
            } else {
                // default to first comparator if none specified
                return new SearchLine(column, Comparators.for(column)[0], null);
            }
        }
        return new SearchLine(column);
    }

    constructor(column?: Column, comparator?: Comparator, values?: any[] | any) {
        this.column = column;
        this.comparator = comparator;
        if (!isNullOrUndefined(this.column)) {
            if (this.column.isRequired) {
                this.removable = false;
            }
        }
        if (!isNullOrUndefined(values)) {
            this.value = Array.isArray(values) ? values : [values];
        } else {
            this.value = [];
        }
    }

    /**
     * Creates a `QueryRestriction` from the `column`, `comparator` and `value`.
     *
     * @example
     *
     * column = { type: 'string', apiFieldPath: 'code' }
     * comparator = { value: '=' }
     * value = ['TEST']
     * =>
     * queryRestriction = { fieldPath: 'code', dataType: 'string', operator: '=', values: ['TEST'] }
     *
     *
     * column = { type: { entityType: 'company' }, apiFieldPath: 'company', mapToKey: (c: any) => c.id }
     * comparator = { value: 'in' }
     * value = [{ id: 123, code: 'TEST1' },{ id: 456, code: 'TEST2' }]
     * =>
     * queryRestriction = { fieldPath: 'company', dataType: { entityType: 'company' }, operator: 'in', values: [123,456] }
     *
     *
     * column = { type: 'currency', apiFieldPath: 'price' }
     * comparator = { value: '!=' }
     * value = [12.99]
     * =>
     * queryRestriction = { fieldPath: 'price', dataType: 'decimal', operator: '!=', values: [12.99] }
     *
     *
     * column = { type: 'boolean', apiFieldPath: 'active' }
     * comparator = { value: 'true' }
     * value = []
     * =>
     * queryRestriction = { fieldPath: 'active', dataType: 'boolean', operator: 'true', values: [] }
     */
    toQueryRestriction(): QueryRestriction {
        let type: string;
        if (typeof this.column.type === 'string') {
            type = this.column.getTopLevelType() as string;
        } else if ('entityType' in this.column.type) {
            type = this.column.type.entityType;
        } else if ('enum' in this.column.type) {
            type = this.column.type.enum;
        } else if ('customType' in this.column.type) {
            type = this.column.type.customType;
        }
        if (!type) {
            throw new Error(`Cannot interrogate type from ${this.column.type}`);
        }
        let queryRestrictionValues: any[];
        if (this.column.isDropdown) {
            const dropdown = this.column as AbstractDropdownColumn<any>;
            queryRestrictionValues = this.value.map(dropdown.mapToKey);
        } else {
            queryRestrictionValues = this.value;
        }
        return {
            fieldPath: this.column.apiFieldPath,
            dataType: type,
            operator: this.comparator.value,
            values: queryRestrictionValues,
        };
    }

    /**
     * Returns whether the search line has been fully populate and therefore should be used in a search.
     */
    get populated(): boolean {
        if (!this.column || !this.comparator) {
            // Column & comparator are always required
            return false;
        } else if (Comparators.isDateRangeComparator(this.comparator)) {
            // Date ranges must have a start date and end date value
            return this.value && this.value[0] && this.value[1];
        } else {
            // check if the values in value are strings, if so verify they do not have a blank '' value
            return (
                this.comparator.requiresData === false ||
                (this.value && this.value.filter((v) => !isString(v) || (isString(v) && v.trim())).length > 0)
            );
        }
    }
}
