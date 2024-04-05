import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { Loggers } from '@vioc-angular/shared/common-logging';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { DropdownColumnComponent } from '@vioc-angular/shared/feature-dropdown-column';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { Column, DynamicDropdownColumn } from '@vioc-angular/shared/util-column';
import { ReplaySubject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { ArrowKeyDirection, ArrowKeyEvent } from '../arrow-key-event';

/**
 * The cells of the GridComponent. This determines the type of input element (if any) that the data
 * requires and displays it. So, this could be just a span, a text input, a number input, a date picker,
 * a Y/N dropdown, a value driven dropdown, or an api driven dropdown.
 *
 * Ex:
 *  <vioc-angular-grid-cell
 *      #cell
 *      [row]="row"
 *      [rowIndex]="rowIndex"
 *      [column]="column"
 *      [columnIndex]="columnIndex"
 *      (arrowPressed)="arrowPressed($event)"
 *  >
 *  </vioc-angular-grid-cell>
 */
@Component({
    selector: 'vioc-angular-grid-cell',
    templateUrl: './grid-cell.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridCellComponent implements OnInit, OnDestroy {
    private readonly logger = Loggers.get('ui-grid', 'GridCellComponent');

    /**
     * Selects the specific input used for this gridCell, can be an html input element of a MatSelect
     */
    @ViewChild('input') input: ElementRef | MatSelect | DropdownColumnComponent;

    @Input() row: FormGroup;

    @Input() column: Column;

    @Input() rowIndex: number;

    @Input() columnIndex: number;

    @Output() arrowPressed = new EventEmitter<ArrowKeyEvent>();

    /**
     * This output lets parent components know that a validation state has changed, typically to allow
     * the parent component to trigger change detection
     */
    @Output() updateValidity = new EventEmitter();

    inputType: string;

    formControl: FormControl;

    editable: boolean;

    /**
     * Maintains the validity state of the grid cell.
     */
    invalid = false;

    columnAsDropdown: DynamicDropdownColumn<any>;

    private readonly _destroyed = new ReplaySubject(1);

    textInputWidth = 1; // ensure there is at least a size of 1

    ngOnInit(): void {
        this.inputType = this.getInputType();
        this.formControl = this.getFormControl();
        this.editable = this.isEditable();
        if (this.editable) {
            this.invalid = this.formControl.invalid;
            this.formControl.statusChanges.pipe(debounceTime(200), takeUntil(this._destroyed)).subscribe(() => {
                // maintain validity state
                if (this.invalid !== this.formControl.invalid) {
                    // state only needs to be updated if it has changed
                    this.invalid = this.formControl.invalid;
                    this.updateValidity.emit();
                }
            });
        }
        if (this.formControl && this.formControl.value) {
            // if length is defined use the length value, otherwise default back to 1
            this.textInputWidth = this.formControl.value.length > 0 ? this.formControl.value.length : 1;
        }
    }

    /**
     * Puts focus on this gridCell, used for navigating using arrow key presses
     */
    select(): void {
        if (this.input instanceof ElementRef) {
            this.input.nativeElement.focus();
        } else if (this.input instanceof MatSelect || this.input instanceof DropdownColumnComponent) {
            this.input.focus();
        } else {
            this.logger.warn('Unsupported input element', () => typeof this.input);
        }
    }

    getFormControl(): FormControl {
        // splitting on '.' to support child fields
        // e.g. costAccount.code => row.get('costAccount').get('code')
        return this.row.get(this.column.apiFieldPath.split('.')) as FormControl;
    }

    private getInputType(): string {
        if (this.column.isDropdown) {
            return 'single-select-dropdown';
        } else {
            const columnType = this.column.getTopLevelType();
            switch (columnType) {
                case 'integer':
                    return 'integer';
                case 'decimal':
                    return 'decimal';
                case 'date':
                    return 'date';
                case 'string':
                    return 'text';
                case 'boolean':
                    return 'boolean';
                default:
                    this.logger.warn('Unsupported input type in', this.column);
                    return 'text';
            }
        }
    }

    private isEditable(): boolean {
        return this.column.gridUpdatable && this.formControl && this.formControl.enabled;
    }

    /**
     * Emits an arrow key event indicating an arrow key was pressed inside this gridCell input.
     * Will stop propagation and default actions of the arrowKey to prevent unwanted movements
     * or modifications.
     */
    arrowKeyPressed(event: KeyboardEvent, direction: ArrowKeyDirection): void {
        // don't emit event if matSelect is currently opened
        if (!(this.input instanceof MatSelect) || !this.input.panelOpen) {
            event.stopImmediatePropagation();
            event.preventDefault();
            this.arrowPressed.emit({ columnIndex: this.columnIndex, rowIndex: this.rowIndex, direction });
        }
    }

    ngOnDestroy(): void {
        this._destroyed.next();
        this._destroyed.unsubscribe();
    }
}
