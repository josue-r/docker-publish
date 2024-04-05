import { SelectionModel } from '@angular/cdk/collections';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { QuerySort } from '@vioc-angular/shared/common-api-models';
import { Loggers } from '@vioc-angular/shared/common-logging';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { Column } from '@vioc-angular/shared/util-column';

/**
 * Component to provide a generic table implementation for search screens. Takes all
 * columns the table could display and provides a default way of displaying and sorting data.
 */
@Component({
    selector: 'vioc-angular-table',
    templateUrl: './table.component.html',
    styleUrls: ['./table.component.scss'],
})
export class TableComponent {
    private readonly logger = Loggers.get('ui-table', 'TableComponent');

    /** The data for the table to display. */
    @Input() data: any[];

    /** Used for allowing to select multiple rows when true else only single row when false */
    @Input() multiple = true;

    /** All of the available columns to the table as SearchColumns. */
    @Input() columns: Column[];

    /** SelectionModel for the currently selected data in the table. */
    @Input() selection: SelectionModel<any>;

    /** QuerySort representing the current sort of the table. */
    @Input() sort: QuerySort;

    /** All of the currently displayed columns. */
    @Input() displayedColumns: string[];

    /**
     * Used for i18n extraction, by i18n pipes (DatePipe, I18nPluralPipe, CurrencyPipe, DecimalPipe and PercentPipe)
     * and by ICU expressions.
     */
    @Input() locale: string;

    /** Emits a QuerySort whenever the sorting of the table changes. */
    @Output() sortChange: EventEmitter<QuerySort> = new EventEmitter();

    /** rowSelect event generated upon click of row inside search results. */
    @Output() rowSelect = new EventEmitter<any>();

    /** Used for allow only single selection of row when true else multiple rows when false */
    @Input() singleSelection = false;

    /** Used to hold single selected row details */
    selected: any;

    /** Returns the currently displayed columns in an array to be used for the sticky header. */
    get displayedColumnsWithSelect(): string[] {
        return this.selection ? ['Select'].concat(this.displayedColumns) : this.displayedColumns;
    }

    /** Determines if all of the available rows of the table are selected. */
    isAllSelected(): boolean {
        const numSelected = this.selection && this.selection.selected.length;
        const numRows = this.data.length;
        return numSelected === numRows;
    }

    /** If no rows are selected selects all available rows, if all rows are selected then clears the selection. */
    masterToggle(): void {
        this.isAllSelected() ? this.selection.clear() : this.data.forEach((row) => this.selection.select(row));
    }

    singleSelectedRow(row: any): void {
        this.selection.clear();
        this.selected = row;
        this.rowSelect.emit(row);
    }

    /** Called whenever the sort direction or column changes, emits as a QuerySort. */
    sortData(sort: Sort): void {
        const column = this.columns.find((c) => c.name === sort.active);
        if (column) {
            this.sortChange.emit(new QuerySort(column, sort.direction));
        } else {
            this.logger.error('Could not find sort column for', `"${sort.active}"`);
        }
    }
}
