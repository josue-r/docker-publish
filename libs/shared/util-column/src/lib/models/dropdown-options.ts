import { Moment } from 'moment';
import { ColumnOptions } from './column-options';

/**
 * Options for configuring the dropdown field and how it should be displayed.
 */
export interface DropdownOptions<T> extends ColumnOptions {
    /**
     * The field name on the API side that this maps to. This is usually the value in the json response.
     * The path to trigger sorting on. For instance, the `apiFieldPath` may be an entity that is displayed as entity.code.
     * If we request it to be sorted, we'd expect it to be sorted by code as well. So, `apiSortPath='entity.code'`.
     */
    apiSortPath?: string;

    /**
     * A hint to serve as a placeholder for the search dropdown. For example, you may want "Company Code" or "Product Description".
     */
    hint?: string;

    /**
     * Maps the object to the key that should be passed to the search API. For example, if you  have an entity, this function could
     * map to the id of the entity.
     * Defaults to object.toString().
     */
    mapToKey?: (arg: T) => string | number | Moment | boolean;

    /**
     * Maps the object to the value that should be displayed in the dropdown.
     */
    mapToDropdownDisplay?: (arg: T) => string;
}
