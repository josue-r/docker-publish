import { isNullOrUndefined } from '@vioc-angular/shared/common-functionality';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { Columns, instanceOfColumnGroup } from '@vioc-angular/shared/util-column';
import { ManagedColumn } from './managed-column';

/**
 * Container for column lists to be added and removed from.
 */
export class ManagedColumns {
    /**
     * The columns being displayed.
     */
    displayed: ManagedColumn[] = [];
    /**
     * The columns that could be displayed, but are not.
     */
    hidden: ManagedColumn[] = [];
    private readonly _defaultManagedColumns: ManagedColumn[];
    /**
     * The columns displayed by default.
     */
    private readonly _defaultDisplayed: ManagedColumn[];
    /**
     * The columns hidden by default.
     */
    private readonly _defaultHidden: ManagedColumn[];
    /**
     * All the columns available for display.
     */
    public readonly columns: Columns;
    /**
     * Building an array of managed columns and determining default state based on the column definition.
     */
    constructor(columns: Columns, displayedColumns: string[]) {
        this.columns = columns;
        this._mapManagedColumns(columns);
        this.sortHidden();
        // Slicing to create new array copies
        this._defaultDisplayed = this.displayed.slice();
        this._defaultHidden = this.hidden.slice();
        this._defaultManagedColumns = [...this._defaultDisplayed.slice(), ...this._defaultHidden.slice()];
        if (displayedColumns) {
            this.displayedColumns = displayedColumns;
        }
    }
    /**
     * Sets the columns to show as displayed, all non-included columns are hidden.
     */
    set displayedColumns(displayedColumns: string[]) {
        const columnCopy = [...this._defaultManagedColumns];
        this.displayed = [];
        this.hidden = [];
        displayedColumns.forEach((displayColumnName) => {
            const displayedColumn = {
                ...columnCopy.find((c) => {
                    if (c.groupedColumns) {
                        return c.groupedColumns.some((gc) => gc.name === displayColumnName);
                    } else {
                        return c.name === displayColumnName;
                    }
                }),
                displayedByDefault: true,
                selected: false,
            };
            if (!this.displayed.map((dc) => dc.name).includes(displayedColumn.name)) {
                this.displayed.push(displayedColumn);
            }
        });
        this.hidden = columnCopy
            .filter((c) => !this.displayed.map((dc) => dc.name).includes(c.name))
            .map((c) => {
                return {
                    name: c.name,
                    displayedByDefault: false,
                    selected: false,
                    groupedColumns: c.groupedColumns,
                };
            });
        this.sortHidden();
    }
    /**
     * All available managed columns.
     */
    get all(): ManagedColumn[] {
        return this.displayed.concat(this.hidden);
    }
    /**
     * Return the column names of the currently displayed columns.
     */
    get displayedColumnNames(): string[] {
        const names: string[] = [];
        this.displayed.forEach((mc) => {
            if (mc.groupedColumns) {
                names.push(...mc.groupedColumns.map((gc) => gc.name));
            } else {
                names.push(mc.name);
            }
        });
        return names;
    }
    /**
     * The columns currently displayed but have been selected for removal by the user.
     */
    private get _selectedDisplayed(): ManagedColumn[] {
        return this.displayed.filter((mc) => mc.selected);
    }
    /**
     * The columns currently not displayed but have been selected for display by the user.
     */
    private get _selectedHidden(): ManagedColumn[] {
        return this.hidden.filter((mc) => mc.selected);
    }
    /**
     * The available columns will be sorted alphabetically.
     */
    sortHidden(): void {
        this.hidden.sort((colA, colB) => colA.name.localeCompare(colB.name));
    }
    /**
     * Move a column to the displayed list.
     */
    display(managedColumn: ManagedColumn, index?: number): void {
        managedColumn.selected = false;
        this._removeFrom(this.hidden, managedColumn);
        this._addTo(this.displayed, managedColumn, index);
    }
    /**
     * Move a column to the available list.
     */
    hide(managedColumn: ManagedColumn): void {
        managedColumn.selected = false;
        this._removeFrom(this.displayed, managedColumn);
        this._addTo(this.hidden, managedColumn);
        this.sortHidden();
    }
    /**
     * Moves the selected column to the displayed list.
     */
    displaySelected(): void {
        this._selectedHidden.forEach((mc) => this.display(mc));
    }
    /**
     * Moves the selected column to the available list.
     */
    hideSelected(): void {
        this._selectedDisplayed.forEach((mc) => this.hide(mc));
    }
    /**
     * Moves all the columns to the displayed list.
     */
    displayAll(): void {
        // Slicing before forEach to prevent concurrent modification
        this.hidden.slice().forEach((mc) => this.display(mc));
    }
    /**
     * Moves all the columns to the available list.
     */
    hideAll(): void {
        // Slicing before forEach to prevent concurrent modification
        this.displayed.slice().forEach((mc) => this.hide(mc));
    }
    /**
     * Resets the displayed and hidden columns to their defaults.
     */
    reset(): void {
        this.displayed = this._defaultDisplayed.slice();
        this.hidden = this._defaultHidden.slice();
    }
    /**
     * Remove the element from the array.
     */
    private _removeFrom(array: ManagedColumn[], element: ManagedColumn): void {
        const index = array.indexOf(element);
        if (index >= 0) {
            array.splice(index, 1);
        }
    }
    /**
     * Add the element to the array at a specific index.
     */
    private _addTo(array: ManagedColumn[], element: ManagedColumn, index?: number): void {
        this._removeFrom(array, element);
        if (isNullOrUndefined(index)) {
            index = array.length;
        }
        array.splice(index, 0, element);
    }
    /**
     * Maps the `Columns` to `ManagedColumns` and adds them to the displayed or hidden list based on
     * whether they are `displayedByDefault`.
     */
    private _mapManagedColumns(columns: Columns): void {
        const columnDefs = Object.keys(columns);
        columnDefs.forEach((columnName) => {
            const column = columns[columnName];
            if (instanceOfColumnGroup(column)) {
                const columnGroup = Columns.toColumnArray(column.columns)
                    .filter((c) => c.displayable !== false)
                    .map((c) => {
                        return { name: c.name, displayedByDefault: c.displayedByDefault, selected: false };
                    });
                if (columnGroup.length > 0) {
                    this.addManagedColumn(
                        columnName,
                        columnGroup.some((c) => c.displayedByDefault === true),
                        columnGroup
                    );
                }
            } else {
                const col = Columns.toColumn(column);
                if (col.displayable !== false) {
                    this.addManagedColumn(col.name, col.displayedByDefault);
                }
            }
        });
    }
    /**
     * Adds column parameters to a `ManagedColumn` object, then adds it to the displayed or hidden list based on
     * whether they are `displayedByDefault`.
     */
    private addManagedColumn(columnName: string, displayedByDefault: boolean, columnGroup?: ManagedColumn[]): void {
        if (displayedByDefault) {
            this.displayed.push({
                name: columnName,
                displayedByDefault: true,
                selected: false,
                groupedColumns: columnGroup,
            });
        } else {
            this.hidden.push({
                name: columnName,
                displayedByDefault: false,
                selected: false,
                groupedColumns: columnGroup,
            });
        }
    }
}
