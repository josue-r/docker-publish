import { ColumnType } from './column-type';
import { Comparator } from './comparator';
import { Searchable } from './searchable';

export interface ColumnOptions {
    /**
     * The name of the column to be displayed to the user.
     */
    name?: string;

    /**
     * The type that is registered on the api side.
     */
    type?: ColumnType;

    /**
     * The field path on the API side that this maps to. This is usually the value in the json response. For simple
     * fields, this is just the field name. This also supports dereferencing for something like 'service.category.code.'
     */
    apiFieldPath?: string;

    /**
     * The field name on the API side that this maps to. This is usually the value in the json response.
     * The path to trigger sorting on. For instance, the `apiFieldPath` may be an entity that is displayed as entity.code.
     * If we request it to be sorted, we'd expect it to be sorted by code as well. So, `apiSortPath='entity.code'`.
     *
     * This defaults to the value of `apiFieldPath`
     */
    apiSortPath?: string;

    /**
     * Specifies whether the column is displayed in the search results. This defaults to true
     */
    displayable?: boolean;

    /**
     * Specifies whether or not the column is displayed in the search results by default. This defaults to true.
     */
    displayedByDefault?: boolean;

    /**
     * Specifies whether the column can be used for searching. If this is false, the column is just available
     * to be displayed in the search results. This defaults to true.  Passing a `SearchedByDefault` instead of a boolean will add this
     * column to the search screen when the page loads
     */
    searchable?: boolean | Searchable;

    /**
     * Overrides default comparators. If not set, the default comparators will be used.
     */
    comparators?: Comparator[];

    /**
     * Maps the object to the value that should be displayed in the search filter chip. This allows potential short text in the chip,
     * (for example, show company "code - description" in the dropdown but just show code in the chip.)
     * If not specified, it defaults to mapToDropdownDisplay.
     */
    mapToFilterDisplay?: (T) => string;

    /**
     * Maps the object to the value that should be displayed in the search filter chip. This allows potential short text in the table,
     * (for example, show company "code - description" in the dropdown but just show code in the table.)
     * If not specified, it defaults to mapToDropdownDisplay.
     */
    mapToTableDisplay?: (T) => string;

    /**
     * Determines if the column field is able to be updated using the mass update component or the grid component. This should always be
     * false if the column is an id field or refers to a nested entity.
     */
    gridUpdatable?: boolean;

    /*
     * Specifies whether or not this column can be null.
     * This defaults to false, so two comparators will be excluded for this column.
     */
    nullable?: boolean;

    /**
     * Specifies the decimalPlaces for decimal type field, this is configurable but default value is 2.
     */
    decimalPlaces?: number;

    /**
     * String to be used as a html identifier when using this column. Should not contain any white spaces.
     * If this value is not set and is being used in the UI, it will most likely cause test failures that require this id to properly select
     * a column for testing. While it is usually permissable to have multiple elements with the same id, it can lead to undefined behavior
     * when selecting and is not considered to be valid HTML.
     */
    htmlId?: string;

    /**
     * Determines if the column should be able to be sorted by clicking the header
     */
    sortable?: boolean;

    /**
     * Specifies a style class to be applied on the column
     */
    columnStyleClass?: string;
}
