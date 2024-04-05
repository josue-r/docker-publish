import { defaultIfNullOrUndefined } from '@vioc-angular/shared/common-functionality';
import { ColumnConfig } from './column-config';
import { ColumnType } from './column-type';
import { Comparator } from './comparator';
import { instanceOfSearchable, Searchable } from './searchable';

/**
 * Custom class that defines the way a data column should appear.
 */
export class Column implements ColumnConfig {
    constructor(opts: ColumnConfig) {
        Object.keys(opts).forEach((key) => (this[key] = opts[key]));
        defaultIfNullOrUndefined(this, 'displayable', true);
        defaultIfNullOrUndefined(this, 'displayedByDefault', true);
        defaultIfNullOrUndefined(this, 'apiSortPath', opts.apiFieldPath);
        defaultIfNullOrUndefined(this, 'mapToTableDisplay', (o) => o.toString());
        defaultIfNullOrUndefined(this, 'searchable', true);
        defaultIfNullOrUndefined(this, 'gridUpdatable', !this.apiFieldPath.includes('.'));
        defaultIfNullOrUndefined(this, 'nullable', false);
        defaultIfNullOrUndefined(this, 'decimalPlaces', 2);
        defaultIfNullOrUndefined(this, 'sortable', true);
        defaultIfNullOrUndefined(this, 'columnStyleClass', '');
    }

    /**
     * @memberof ColumnConfig
     */
    name: string;

    /**
     * @memberof ColumnConfig
     */
    apiFieldPath: string;

    /**
     * @memberof ColumnOptions
     */
    apiSortPath: string;

    /**
     * @memberof ColumnConfig
     */
    type: ColumnType;
    /**
     * @memberof ColumnConfig
     */
    displayable: boolean;

    /**
     * @memberof ColumnConfig
     */
    displayedByDefault: boolean;

    /**
     * @memberof ColumnConfig
     */
    searchable: boolean | Searchable;

    /**
     * @memberof ColumnConfig
     */
    comparators: Comparator[];

    /*** Not a dropdown.  Extending classes will update this */
    isDropdown = false;

    /**
     * @memberof ColumnConfig
     */
    mapToFilterDisplay: (T) => string;

    /**
     * @memberof ColumnConfig
     */
    mapToTableDisplay: (T) => string;

    /**
     * @memberof ColumnConfig
     */
    gridUpdatable: boolean;

    /**
     * @memberof ColumnConfig
     */
    nullable: boolean;

    /**
     * @memberof ColumnConfig
     */
    decimalPlaces: number;

    /**
     * @memberof ColumnConfig
     */
    htmlId?: string;

    /**
     * @memberof ColumnConfig
     */
    sortable?: boolean;

    /**
     * @memberof ColumnConfig
     */
    columnStyleClass?: string;

    static of(opts: ColumnConfig): Column {
        return new Column(opts);
    }

    /**
     * Returns the top level type to be used for searching and getting comparators. This needs to match
     * with the data-type on the API side.
     */
    getTopLevelType(): ColumnType {
        if (this.type === 'currency') {
            return 'decimal';
        } else {
            return this.type;
        }
    }

    /** Searched-by-default if searchable is an instance of Searchable and the comparator is set. */
    get isSearchedByDefault(): boolean {
        // !! forces return of boolean
        return instanceOfSearchable(this.searchable) && !!this.searchable.defaultSearch;
    }

    /** Required if searchable is an instance of Searchable and required is true */
    get isRequired(): boolean {
        return instanceOfSearchable(this.searchable) && this.searchable.required === true;
    }
}
