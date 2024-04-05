import { SimpleDropdownOptions } from '../..';
import { ColumnType } from './column-type';

export interface SimpleDropdownConfig<T> extends SimpleDropdownOptions<T> {
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
}
