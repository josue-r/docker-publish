/**
 * Contains a column name and its display status including if it's displayed by default
 * or if it is selected to be removed/added.
 */
export interface ManagedColumn {
    name: string;
    displayedByDefault: boolean;
    selected: boolean;
    groupedColumns?: ManagedColumn[];
}
