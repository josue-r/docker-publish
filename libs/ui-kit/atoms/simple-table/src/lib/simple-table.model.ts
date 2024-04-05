/**
 * Represents the configuration for a column in a table.
 */
export interface ColumnConfiguration {
    /**
     * The unique identifier for the column. Should be a single word or phrase without spaces.
     * This identifier is used to uniquely identify the column and should be unique within the table.
     *
     * @required Must be unique.
     */
    columnId: string;

    /**
     * Determines if the column is visible in the table.
     * If set to `true`, the column will be visible. If set to `false`, the column will be hidden.
     *
     * @required true or false
     */
    isVisible: boolean;

    /**
     * The label to display for the column header.
     * This label is what will be shown in the table header to identify the column.
     *
     * @required
     */
    label: string;

    /**
     * Custom styles to apply to the column.
     * These styles will be applied to the column header.
     *
     * @optional
     */
    customStyles?: Record<string, string>;

    /**
     * Custom classes to apply to the column.
     * These classes will be applied to the column header.
     *
     * @optional
     */
    customClasses?: string;
}
