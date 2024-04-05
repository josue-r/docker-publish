import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DialogComponent } from '@vioc-angular/shared/ui-dialog';
import { DropListItem } from '@vioc-angular/shared/ui-drop-list';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { Columns } from '@vioc-angular/shared/util-column';
import { kebabCase, startCase } from 'lodash';
import { ManagedColumns } from '../models/managed-columns';

/**
 * Maintains a drag/droppable lists of available columns to display and selected columns to display.
 */
@Component({
    selector: 'vioc-angular-manage-columns',
    templateUrl: './manage-column.component.html',
    styleUrls: ['./manage-column.component.scss'],
})
export class ManageColumnComponent implements OnInit {
    /**
     * Component for opening a dialog for managing columns.
     */
    @ViewChild(DialogComponent, { static: true }) private readonly dialog: DialogComponent;

    /**
     * The container for the supplied lists to maintain.
     */
    @Input() columns: Columns;

    /** Contains the names of the currently displayed columns. These values are modified from the parent component and
     * changes need to be reflected in the dialog displayed to the user.
     */
    private _displayedColumns: string[];

    @Input() set displayedColumns(displayedColumns: string[]) {
        if (this.managedColumns) {
            this.managedColumns.displayedColumns = displayedColumns;
        }
        this._displayedColumns = displayedColumns;
    }

    /**
     * Emit the current column display list.
     */
    @Output() apply = new EventEmitter<string[]>();

    /**
     * Object containing all of the displayed and available columns for the user configure.
     */
    managedColumns: ManagedColumns;

    /**
     * Keeps track the item value passed back from the `DropListComponent` using the #reorderedItems template.
     */
    reorderItem: DropListItem;

    ngOnInit(): void {
        // initialize the column lists
        this.managedColumns = new ManagedColumns(this.columns, this._displayedColumns);
    }

    /**
     * Makes a call to the dialog component to open a dialog for managing columns.
     */
    openDialog(): void {
        this.dialog.open();
    }

    /**
     * Closes the dialog opened by the dialog component.
     */
    closeDialog(): void {
        this.dialog.close();
    }

    /**
     * Emit managed lists and close dialog.
     */
    applyChanges(): void {
        this.apply.emit(this.managedColumns.displayedColumnNames);
        this.closeDialog();
    }

    /**
     * Revert all column changes back to the default values.
     */
    reset(): void {
        this.managedColumns.reset();
    }

    /**
     * A column has been selected/deselected by a user.
     */
    select(item: DropListItem): void {
        const managedColumn = this.managedColumns.all.find((column) => column.name === item.name);
        if (managedColumn) {
            managedColumn.selected = !item.selected;
        }
    }

    /**
     * Add a column to the displayed list and remove it from the available list.
     */
    add(item: DropListItem): void {
        const managedColumn = this.managedColumns.all.find((column) => column.name === item.name);
        this.managedColumns.display(managedColumn);
    }

    /**
     * Remove a column from the displayed list and move to available.
     */
    remove(item: DropListItem): void {
        const managedColumn = this.managedColumns.all.find((column) => column.name === item.name);
        this.managedColumns.hide(managedColumn);
    }

    /**
     * Adds the selected `ManagedColumn` to the displayed list.
     *
     * Represented by: `>`
     */
    addSelected(): void {
        this.managedColumns.displaySelected();
    }

    /**
     * Removes the selected `ManagedColumn` from the displayed list.
     *
     * Represented by: `<`
     */
    removeSelected(): void {
        this.managedColumns.hideSelected();
    }

    /**
     * Adds all of the `ManagedColumn`s to the displayed list.
     *
     * Represented by: `>|`
     */
    addAll(): void {
        this.managedColumns.displayAll();
    }

    /**
     * Removes all of the `ManagedColumn`s from the displayed list.
     *
     * Represented by: `|<`
     */
    removeAll(): void {
        this.managedColumns.hideAll();
    }

    /**
     * Used to column parameter names into a start case (uppercase first letter of every word)
     * names that will be displayed on the screen.
     */
    getGroupName(columnName: string): string {
        return startCase(columnName);
    }

    /**
     * Creates a unique identifier for the display and available drop lists in order to connect
     * the lists and move columns between the two.
     */
    toDropListId(columnName: string, isDisplayed: boolean): string {
        return `${isDisplayed ? 'displayed' : 'available'}-${kebabCase(columnName)}-columns`;
    }
}
