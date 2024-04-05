import { DropdownOptions } from './dropdown-options';

/**
 * Options for configuring the dropdown field and how it should be displayed.
 */
export interface SimpleDropdownOptions<T> extends DropdownOptions<T> {
    /**
     * The values for the dropdown
     */
    values: any[];
}
