import { Moment } from 'moment';
import { Observable } from 'rxjs';
import { DropdownOptions } from './dropdown-options';

/**
 * Options for configuring the dropdown field and how it should be displayed.
 */
export interface DynamicDropdownOptions<T> extends DropdownOptions<T> {
    /**
     * The minimum number of characters (inclusive) required to trigger a search on the backed. For instance,
     * if there are thousands of possibilities for the dropdown, you may want to ensure that the
     * user types at least 2 characters in before executing the search.
     *
     * Defaults to 0.
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
     * Override the default remote call for the data displayed in the dropdown.
     */
    fetchData?: (searchText: string) => Observable<any[]>;

    /**
     * @memberof DropdownOptions
     */
    mapToKey?: (arg: T) => string | number | Moment | boolean;

    /**
     * @memberof DropdownOptions
     */
    mapToDropdownDisplay?: (arg: T) => string;

    /**
     * Provide a specific cache key to use for external data. Only required if you wish to override the default
     * cache key of `${api}:${name}`. See DropdownColumnState for implementation.
     */
    dataCacheKey?: string;
}
