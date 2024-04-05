import { SelectionModel } from '@angular/cdk/collections';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    QueryList,
    ViewChild,
    ViewChildren,
} from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { MatSort, Sort } from '@angular/material/sort';
import { QuerySort } from '@vioc-angular/shared/common-api-models';
import { Loggers } from '@vioc-angular/shared/common-logging';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { DropdownColumnFacade } from '@vioc-angular/shared/data-access-dropdown-column';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { Column } from '@vioc-angular/shared/util-column';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ArrowKeyEvent } from '../arrow-key-event';
import { GridCellComponent } from '../grid-cell/grid-cell.component';

/**
 * Provides a grid view of the provided form that enables editing of the form data. Key features include row
 * selection tracking to enable easy saves, dropdown support, sorting support, and arrow key navigation.
 *
 * @example
 *      <vioc-angular-grid
 *          [form]="gridForm"
 *          [columns]="columns"
 *          [displayedColumns]="displayedColumns"
 *          [sort]="sort"
 *          [selection]="selection"
 *          (sortChange)="doSort()"
 *     ></vioc-angular-grid>
 */
@Component({
    selector: 'vioc-angular-grid',
    templateUrl: './grid.component.html',
    styleUrls: ['./grid.component.scss'],
    providers: [DropdownColumnFacade],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridComponent implements OnInit, OnDestroy {
    private readonly logger = Loggers.get('ui-grid', 'GridComponent');
    protected readonly _destroyed = new ReplaySubject(1);

    @ViewChildren('cell') set gridCells(gridCells: QueryList<GridCellComponent>) {
        this.buildGridCellArray(gridCells);
    }

    /** Component maintaining the grid's active sort state. */
    @ViewChild(MatSort, { static: true }) gridSort: MatSort;

    @Input() columns: Column[];

    @Input() sort: QuerySort;

    /** Used to track which rows are selected to save. */
    @Input() selection = new SelectionModel<any>();

    @Input() set displayedColumns(displayedColumns: string[]) {
        this.displayedColumnsWithSelect = ['Select'].concat(displayedColumns);
    }

    /**
     * form -> FormGroup
     * -- data -> FormArray
     * ---- 0 … n -> formGroup
     * ------ [column.apiFieldPath] -> FormControl
     */
    @Input() set form(form: FormGroup) {
        this._form = form;
        this.selection.clear();
        this.dataFormArray = form.get('data') as FormArray;
        this.dataLength = this.dataFormArray.length;
    }
    get form(): FormGroup {
        return this._form;
    }
    private _form: FormGroup;

    @Output() sortChange: EventEmitter<QuerySort> = new EventEmitter();

    dataLength: number;

    gridCellArray: GridCellComponent[][];

    displayedColumnsWithSelect: string[];

    dataFormArray: FormArray;

    constructor(private readonly _cdr: ChangeDetectorRef) {}

    ngOnInit() {
        this.selection.changed.pipe(takeUntil(this._destroyed)).subscribe(() => this._cdr.detectChanges());
    }

    detectChanges() {
        this._cdr.detectChanges();
    }

    masterToggle(): void {
        this.isAllSelected()
            ? this.selection.clear()
            : this.dataFormArray.controls.forEach((row, index) => this.selection.select(index));
    }

    isAllSelected(): boolean {
        const numSelected = this.selection.selected.length;
        const numRows = this.dataFormArray.length;
        return numSelected === numRows;
    }

    sortData(sort: Sort): void {
        const column = this.columns.find((c) => c.name === sort.active);
        if (column) {
            this.sortChange.emit(new QuerySort(column, sort.direction));
        } else {
            this.logger.error('Could not find sort column for', `'${sort.active}'`);
        }
    }

    /** Build a 2d array of the page's grid cells. */
    private buildGridCellArray(gridCells: QueryList<GridCellComponent>): void {
        // sort cells by order of column names in 'displayedColumnsWithSelect'
        const sortFn = (
            a: GridCellComponent,
            b: GridCellComponent //
        ) =>
            this.displayedColumnsWithSelect.indexOf(a.column.name) -
            this.displayedColumnsWithSelect.indexOf(b.column.name);
        // initialize/reset 2d array
        this.gridCellArray = [];
        for (let i = 0; i < this.dataLength; i++) {
            this.gridCellArray.push(
                gridCells
                    .filter((cell) => i === cell.rowIndex)
                    .sort(sortFn)
                    .map((cell, index) => {
                        // update column index
                        cell.columnIndex = index;
                        return cell;
                    })
            );
        }
        // TODO: See if there is a way this can be removed after full search implementation is complete
        // Change detection required for when cells are rearranged in the manage-columns dialog
        this._cdr.detectChanges();
    }

    /**
     * Process an arrowPressed event. Calculates what the new cell should be and attempts to select it.
     * Will skip over disabled cells and continue in the same direction as the key pressed until a viable cell is found.
     */
    arrowPressed(event: ArrowKeyEvent): void {
        switch (event.direction) {
            case 'UP': {
                // If up on top row go to last row
                const newRowIndex = event.rowIndex - 1 >= 0 ? event.rowIndex - 1 : this.dataLength - 1;
                const gridCell = this.gridCellArray[newRowIndex][event.columnIndex];
                this.skipDisabledCells(gridCell, { ...event, rowIndex: newRowIndex });
                break;
            }
            case 'DOWN': {
                // If down on last row go to top row
                const newRowIndex = event.rowIndex + 1 < this.dataLength ? event.rowIndex + 1 : 0;
                const gridCell = this.gridCellArray[newRowIndex][event.columnIndex];
                this.skipDisabledCells(gridCell, { ...event, rowIndex: newRowIndex });
                break;
            }
            case 'LEFT': {
                // If left on first column go to last column
                const newColumnIndex =
                    event.columnIndex - 1 >= 0 ? event.columnIndex - 1 : this.displayedColumnsWithSelect.length - 2;
                const gridCell = this.gridCellArray[event.rowIndex][newColumnIndex];
                this.skipDisabledCells(gridCell, { ...event, columnIndex: newColumnIndex });
                break;
            }
            case 'RIGHT': {
                // If right on last column go to first column
                const newColumnIndex =
                    event.columnIndex + 1 < this.displayedColumnsWithSelect.length - 1 ? event.columnIndex + 1 : 0;
                const gridCell = this.gridCellArray[event.rowIndex][newColumnIndex];
                this.skipDisabledCells(gridCell, { ...event, columnIndex: newColumnIndex });
                break;
            }
        }
    }

    /** Helper method for recursively calling arrowPressed when skipping disabled cells. */
    private skipDisabledCells(gridCell: GridCellComponent, newEvent: ArrowKeyEvent): void {
        if (gridCell.editable) {
            gridCell.select();
        } else {
            this.arrowPressed(newEvent);
        }
    }

    /**
     * Refreshes the sort component with the desired values. The component values can get out of sync if a sort page event's
     * changes get cancelled by the parent component.
     */
    refreshSortValues(): void {
        this.gridSort.active = this.sort.column.name;
        this.gridSort.direction = this.sort.direction;
    }

    ngOnDestroy(): void {
        this._destroyed.next();
    }
}
