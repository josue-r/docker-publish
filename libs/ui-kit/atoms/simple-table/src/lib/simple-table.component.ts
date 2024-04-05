import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { ColumnConfiguration } from './simple-table.model';

/**
 * A simple table component that displays data in a tabular format.
 * This component uses Angular Material's MatTableModule for rendering the table.
 */
@Component({
    selector: 'vioc-simple-table',
    standalone: true,
    imports: [CommonModule, MatTableModule],
    templateUrl: './simple-table.component.html',
    styleUrls: ['./simple-table.component.scss'],
})
export class SimpleTableComponent<T> {
    /**
     * The configuration for columns.
     * An array of ColumnConfiguration objects that define the columns of the table.
     *
     * @required Must contain at least one element.
     */
    @Input() columnConfigurations: ColumnConfiguration[] = [];

    /**
     * The data to be displayed in the table.
     * An array of objects representing the rows of the table.
     *
     * @required Must contain at least one element.
     */
    @Input() data: T[] = [];

    /**
     * Returns the list of column IDs for columns that are visible.
     * Used internally to determine which columns to display in the table.
     *
     * @returns string[] an array with id's of the columns to be displayed.
     */
    get displayedColumns() {
        return this.columnConfigurations.filter((config) => config.isVisible === true).map((config) => config.columnId);
    }
}
