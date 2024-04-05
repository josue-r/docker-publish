import { FocusMonitor } from '@angular/cdk/a11y';
import { Component, ElementRef, HostBinding, Input, OnDestroy, OnInit, Optional, Self, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl } from '@angular/forms';
import { MatFormFieldControl } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { isNullOrUndefined } from '@vioc-angular/shared/common-functionality';
import { DropdownColumnFacade } from '@vioc-angular/shared/data-access-dropdown-column';
import { DynamicDropdownColumn } from '@vioc-angular/shared/util-column';
import { BehaviorSubject, ReplaySubject, Subject, throwError } from 'rxjs';
import { catchError, debounceTime, switchMap, takeUntil, tap } from 'rxjs/operators';

/**
 * A MatFormFieldControl & ControlValueAccessor component for column dropdowns. This can be configured
 * for either single or multi select and will leverage the column's fetchData configuration and provide
 * some built in results caching.
 *
 * Ex:
 *  <form [formGroup]="form">
 *      <mat-form-field>
 *          <vioc-angular-dropdown-column
 *              [column]="column"
 *              [formControlName]="column.apiFieldPath"
 *              [required]="true"
 *              [noSelectionOption]="true"
 *          ></vioc-angular-dropdown-column>
 *      </mat-form-field>
 *  </form>
 *
 * Implemented using guide: https://material.angular.io/guide/creating-a-custom-form-field-control
 * and then implementing ControlValueAccessor on top.
 */
@Component({
    selector: 'vioc-angular-dropdown-column',
    templateUrl: './dropdown-column.component.html',
    providers: [{ provide: MatFormFieldControl, useExisting: DropdownColumnComponent }],
})
export class DropdownColumnComponent implements ControlValueAccessor, OnInit, OnDestroy, MatFormFieldControl<any> {
    /** Static id var to ensure unique ids */
    static nextId = 0;
    @HostBinding() id = `column-dropdown-${DropdownColumnComponent.nextId++}`;
    @HostBinding('attr.aria-describedby') describedBy = '';
    readonly controlType = 'column-dropdown';
    private readonly _destroyed = new ReplaySubject(1);

    /** Indicate if the component has been initialized. Will be flipped in ngOnInit */
    private _initialized = false;
    @ViewChild('select') select: MatSelect;

    /** The column the dropdown is based on. This is expected to have already been initialized with default values */
    @Input() set column(column: DynamicDropdownColumn<any>) {
        this._column = column;
        this.searchFilterControl.setValue('');
    }

    get column(): DynamicDropdownColumn<any> {
        return this._column;
    }
    private _column: DynamicDropdownColumn<any>;

    /** Multi or single select mode. */
    @Input() set multiple(multiple: boolean) {
        if (this._initialized) {
            // If multiple state gets changed after component is initialized, clear out
            // the current value. Alternatively, we would need logic to convert a single
            // select value to an array and a multi-select value to a single value.
            this.writeValue(null);
            this.updateDefaultOptions();
        }
        this._multiple = multiple;
    }
    get multiple(): boolean {
        return this._multiple;
    }
    private _multiple: boolean;

    /** Controls wether a 'no selection' option appears in single select mode */
    @Input() noSelectionOption = false;

    /** Control for the filter text */
    searchFilterControl = new FormControl('');
    /** Shows searching indicator when true */
    searching = false;

    /** The available values for the dropdown. Using set to prevent duplicates when adding current values */
    option$ = new BehaviorSubject<Set<any>>(new Set());

    value: any;

    stateChanges = new Subject<void>();

    focused = false;

    @Input() disabled = false;

    @Input() set placeholder(placeholder: string) {
        this._placeholder = placeholder;
        this.stateChanges.next();
    }
    get placeholder(): string {
        return this._placeholder;
    }
    private _placeholder: string;

    @Input() set required(required: boolean) {
        this._required = required;
        this.stateChanges.next();
    }
    get required(): boolean {
        return this._required;
    }
    private _required = false;

    get errorState(): boolean {
        // Show input as in error if not disabled, control has been touched, and it is invalid
        return !this.disabled && this.ngControl.touched && this.ngControl.invalid;
    }

    get empty(): boolean {
        // Should be considered empty if value is null/undefined or multiple and an empty array
        return isNullOrUndefined(this.value) || (this.multiple && this.value.length === 0);
    }

    get shouldLabelFloat(): boolean {
        return this.focused || !this.empty;
    }

    constructor(
        @Optional() @Self() public ngControl: NgControl,
        private readonly _fm: FocusMonitor,
        private readonly _elRef: ElementRef,
        private readonly _facade: DropdownColumnFacade
    ) {
        if (this.ngControl != null) {
            // Setting the value accessor directly (instead of using
            // the providers) to avoid running into a circular import.
            this.ngControl.valueAccessor = this;
        }
        // Using FocusMonitor to manage focus state of the component
        _fm.monitor(_elRef.nativeElement, true).subscribe((origin) => {
            if (!this.disabled) {
                this.focused = !!origin;
                this.stateChanges.next();
            }
        });
    }
    ngOnInit(): void {
        this.updateDefaultOptions();
        // Wire up search functionality based on filter input
        this.searchFilterControl.valueChanges
            .pipe(
                tap(() => (this.searching = true)),
                debounceTime(this.column.throttleMilliseconds),
                takeUntil(this._destroyed),
                switchMap((searchText) => this._facade.search(this.column, searchText)),
                catchError((err) => {
                    this.searching = false;
                    return throwError(err);
                })
            )
            .subscribe((results) => {
                this.searching = false;
                if (!this.empty) {
                    // Pre-pending the the currently selected value(s) to the result options
                    if (Array.isArray(this.value)) {
                        results = this.value.concat(results);
                    } else {
                        results = [this.value].concat(results);
                    }
                }
                this.option$.next(new Set(results));
            });
        // pre-loads the dropdown
        this.searchFilterControl.updateValueAndValidity();
        // Mark as initialized
        this._initialized = true;
    }

    /** Dropdown overlay listener */
    openedChanged(dropdownOpen: boolean): void {
        if (!dropdownOpen) {
            // Revert options back to default on close
            this.updateDefaultOptions();
        } else if (this.column.minCharactersForSearch === 0) {
            // Trigger a search for initial data on open if no characters required
            this.searchFilterControl.updateValueAndValidity();
        }
    }
    /** Ensure current value is displayed by defaulting the dropdown's options with it */
    private updateDefaultOptions(): void {
        if (!isNullOrUndefined(this.value)) {
            // Setup initial values as currently selected values
            if (!this.multiple) {
                this.option$.next(new Set([this.value]));
            } else {
                if (!Array.isArray(this.value)) {
                    // The value will initially be the form value and will need to be converted to an array
                    this.value = [this.value];
                }
                this.option$.next(new Set(this.value));
            }
        } else {
            this.option$.next(new Set());
        }
    }
    /** Function to set the focus of the cell. Required for arrow navigation. */
    focus(): void {
        this.select.focus();
    }
    onContainerClick(): void {
        if (!this.disabled) {
            this.ngControl.control.markAsTouched();
        }
    }
    writeValue(value: any): void {
        this.value = value;
        this.onChange(value);
    }
    onChange: (value: any) => void = () => {};
    registerOnChange(fn: any): void {
        this.onChange = (value: any) => {
            this.value = value;
            fn(value);
        };
    }
    onTouched = () => {};
    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }
    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }
    setDescribedByIds(ids: string[]): void {
        this.describedBy = ids.join(' ');
    }
    ngOnDestroy(): void {
        this._fm.stopMonitoring(this._elRef.nativeElement);
        this._destroyed.next();
        this._destroyed.unsubscribe();
    }
}
