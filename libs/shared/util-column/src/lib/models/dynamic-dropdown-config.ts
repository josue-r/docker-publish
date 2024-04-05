import { Observable } from 'rxjs';
import { ColumnType } from './column-type';
import { DynamicDropdownOptions } from './dynamic-dropdown-options';

export interface DynamicDropdownConfig<T> extends DynamicDropdownOptions<T> {
    /**
     * The name of the column to be displayed to the user.
     */
    name: string;

    /**
     * The field path on the API side that this maps to. This is usually the value in the json response. For simple
     * fields, this is just the field name. This also supports dereferencing for something like 'service.category.code.'
     */
    apiFieldPath: string;

    /**
     * The type of the column used for display purposes in the table. If searching or fetching comparators use the topLevelType. Based off
     * of above union type.
     */
    type: ColumnType;

    /**
     * Loads the data for the drop-down.
     */
    fetchData: (searchText: string) => Observable<T[]>;
}
