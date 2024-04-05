import { ColumnOptions } from './column-options';
import { ColumnType } from './column-type';

export interface ColumnConfig extends ColumnOptions {
    /**
     * The name of the column to be displayed to the user.
     */
    name: string;

    /**
     * @memberof ColumnOptions
     */
    apiFieldPath: string;

    /**
     * @memberof ColumnOptions
     */
    type: ColumnType;

    /**
     * @memberof ColumnOptions
     */
    apiSortPath?: string;

    /**
     * @memberof ColumnOptions
     */
    mapToFilterDisplay?: (T) => string;

    /**
     * @memberof ColumnOptions
     */
    mapToTableDisplay?: (T) => string;

    /**
     * @memberof ColumnOptions
     */
    gridUpdatable?: boolean;

    /**
     * @memberof ColumnOptions
     */
    decimalPlaces?: number;

    /**
     * @memberof ColumnOptions
     */
    htmlId?: string;

    /**
     * @memberof ColumnOptions
     */
    sortable?: boolean;

    /**
     * @memberof ColumnOptions
     */
    columnStyleClass?: string;
}
