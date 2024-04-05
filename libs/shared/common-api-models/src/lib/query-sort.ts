import { SortDirection } from '@angular/material/sort';
import { Column } from '@vioc-angular/shared/util-column';

/**
 * Represents a sort field and direction to be used when searching.
 */
export class QuerySort {
    /**
     * The field being sorted on.
     */
    column: Column;

    /**
     * The direction to sort the field.
     */
    direction: SortDirection;

    constructor(column: Column, direction: SortDirection = 'asc') {
        this.column = column;
        this.direction = direction;
    }

    /**
     * Convenience getter for applying the sort to the search url.
     */
    get sortParameter(): string {
        const sortPath = this.column.apiSortPath;
        return `${sortPath},${this.direction}`;
    }
}
