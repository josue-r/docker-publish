import { defaultIfNullOrUndefined, Described } from '@vioc-angular/shared/common-functionality';
import { Moment } from 'moment';
import { Observable, of } from 'rxjs';
import { Column } from './column';
import { DropdownOptions } from './dropdown-options';
import { DynamicDropdownConfig } from './dynamic-dropdown-config';
import { SimpleDropdownConfig } from './simple-dropdown-config';

/**
 * Abstract class with additional configuration options for dropdown specific columns.
 */
// TODO: Rename to DropdownColumn
export abstract class AbstractDropdownColumn<T> extends Column implements DropdownOptions<T> {
    constructor(opts: DynamicDropdownConfig<T> | SimpleDropdownConfig<T>) {
        super(opts);
        defaultIfNullOrUndefined(this, 'mapToKey', (o) => o.toString());
        defaultIfNullOrUndefined(this, 'mapToDropdownDisplay', (o) => o.toString());
        defaultIfNullOrUndefined(this, 'hint', this.name);
    }

    /**
     * Should never be set to false.
     */
    isDropdown: true = true;

    /**
     * @memberof DropdownOptions
     */
    hint: string;

    /**
     * @memberof DropdownOptions
     */
    apiSortPath: string;

    /**
     * @memberof DropdownOptions
     */
    mapToKey?: (arg: T) => string | number | Moment | boolean;

    /**
     * @memberof DropdownOptions
     */
    mapToDropdownDisplay?: (arg: T) => string;
}

/**
 * A dropdown with a fixed list of values. These values are either static or the entire list is loaded once.
 */
export class SimpleDropdownColumn<T> extends AbstractDropdownColumn<T> {
    constructor(opts: SimpleDropdownConfig<T>) {
        super(opts);
    }

    /**
     * The values for the dropdown
     */
    values: any[];
    static of<T>(opts: SimpleDropdownConfig<T>): SimpleDropdownColumn<T> {
        return new SimpleDropdownColumn(opts);
    }

    convertToDynamicDropdownColumn(): DynamicDropdownColumn<T> {
        return DynamicDropdownColumn.of({ ...this, fetchData: () => of(this.values) });
    }
}

/**
 * Dynamic search dropdown configuration. This will execute multiple searches.
 */
export class DynamicDropdownColumn<T> extends AbstractDropdownColumn<T> implements DynamicDropdownConfig<T> {
    constructor(opts: DynamicDropdownConfig<T>) {
        super(opts);
        defaultIfNullOrUndefined(this, 'minCharactersForSearch', 0);
        defaultIfNullOrUndefined(this, 'maxCharactersForSearch', 4);
        defaultIfNullOrUndefined(this, 'throttleMilliseconds', 0);
    }

    /**
     * The field name on the API side that this maps to. This is usually the value in the json response.
     * The path to trigger sorting on. For instance, the `apiFieldPath` may be an entity that is displayed as entity.code.
     * If we request it to be sorted, we'd expect it to be sorted by code as well. So, `apiSortPath='entity.code'`.
     */
    apiSortPath: string;

    /**
     * Provide a specific cache key to use for external data. Only required if you wish to override the default
     * cache key of `${api}:${name}`. See DropdownColumnState for implementation.
     */
    dataCacheKey?: string;

    /**
     * The minimum number of characters (inclusive) required to trigger a search on the backed. For instance,
     * if there are thousands of possibilities for the dropdown, you may want to ensure that the
     * user types at least 2 characters in before executing the search.
     *
     * Defaults to 2.
     */
    minCharactersForSearch?: number;

    /**
     * The maximum number of characters (inclusive) to keep executing the search url for.
     *
     * At some point, it's going to faster to search in-memory instead of doing a search that filters from 10 elements to 8.
     *
     * Defaults to 4.
     */
    maxCharactersForSearch?: number;

    /**
     * Wait this number of milliseconds before triggering the remote search. If someone types
     * in 5 characters, we want to wait until we think they are done with input before triggering the search.
     */
    throttleMilliseconds?: number;

    /**
     * Loads the data for the drop-down.
     */
    fetchData: (searchText: string) => Observable<T[]>;

    static of<T>(opts: DynamicDropdownConfig<T>): DynamicDropdownColumn<T> {
        return new DynamicDropdownColumn(opts);
    }

    /**
     * Creates a `DynamicDropdownColumn` with a facade to make a call to retrieve data to be displayed
     * in the dropdown.
     */
    static ofDescribed(options: DynamicDropdownConfig<Described>): DynamicDropdownColumn<Described> {
        return DynamicDropdownColumn.of({
            minCharactersForSearch: 0,
            maxCharactersForSearch: 0,
            mapToKey: Described.idMapper,
            mapToDropdownDisplay: Described.codeAndDescriptionMapper,
            mapToTableDisplay: Described.codeMapper,
            mapToFilterDisplay: Described.codeMapper,
            ...options,
        });
    }
}
