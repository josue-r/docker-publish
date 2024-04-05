/**
 * Values representing a comparator to be used for searching a table.
 */
export interface Comparator {
    /**
     * Value to be displayed to the user for the comparator.
     */
    readonly displayValue: string;

    /**
     * Value to be sent to the API for the comparator.
     */
    readonly value: string;

    /**
     * Determine whether or not the comparator requires an input for it.
     */
    readonly requiresData: boolean;

    /**
     * Boolean to determine if the comparator should have multiple values associated with it.
     */
    readonly multiValue: boolean;
}
