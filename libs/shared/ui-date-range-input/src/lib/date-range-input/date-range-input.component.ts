import { FocusMonitor } from '@angular/cdk/a11y';
import { Component, ElementRef, HostBinding, Input, OnDestroy, OnInit, Optional, Self } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { FloatLabelType, MatFormFieldControl } from '@angular/material/form-field';
import { Moment } from 'moment';
import { BehaviorSubject, ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/** The custom value type of the form for this component. Should be a tuple consisting of start and end dates. */
type DateRange = [startDate: Moment, endDate: Moment];

/**
 * Form component designed to wrap Angular Material's date range components and tie the start and end dates to a single array value.
 */
@Component({
    selector: 'vioc-angular-date-range-input',
    templateUrl: './date-range-input.component.html',
    providers: [{ provide: MatFormFieldControl, useExisting: DateRangeInputComponent }],
})
export class DateRangeInputComponent implements ControlValueAccessor, MatFormFieldControl<any>, OnInit, OnDestroy {
    /** Static id var to ensure unique ids */
    static nextId = 0;
    @HostBinding() id = `date-range-input-${DateRangeInputComponent.nextId++}`;
    @HostBinding('attr.aria-describedby') describedBy = '';
    readonly controlType = 'date-range-input';

    private readonly _destroyed = new ReplaySubject(1);

    stateChanges = new Subject<void>();

    /** This handles the startDate and endDate inputs and ties them to the form value. */
    private _dateRangeValue = new BehaviorSubject<DateRange>([null, null]);

    focused = false;

    @Input() styleClass: string;

    @Input() floatLabel: FloatLabelType = 'auto';

    @Input() disabled = false;

    @Input() set placeholder(placeholder: string) {
        this._placeholder = placeholder;
        this.stateChanges.next();
    }
    get placeholder(): string {
        return this._placeholder;
    }
    private _placeholder = 'Date Range';

    @Input() set required(required: boolean) {
        this._required = required;
        this.stateChanges.next();
    }
    get required(): boolean {
        return this._required;
    }
    private _required = false;

    /** Value is managed via _dateRangeValue, if range is incomplete, value will be null */
    get empty(): boolean {
        return !this.value;
    }

    get shouldLabelFloat(): boolean {
        return this.focused || !this.empty;
    }

    get errorState(): boolean {
        // Show input as in error if not disabled, control has been touched, and it is invalid
        return !this.disabled && this.ngControl.touched && this.ngControl.invalid;
    }

    // Start Date ties to first index of value array
    set startDate(startDate: Moment) {
        this._startDate = startDate;
        this._dateRangeValue.next([this.startDate, this.endDate]);
    }
    get startDate() {
        return this._startDate;
    }
    private _startDate: Moment;

    // End Date ties to second index of value array
    set endDate(endDate: Moment) {
        this._endDate = endDate;
        this._dateRangeValue.next([this.startDate, this.endDate]);
    }
    get endDate() {
        return this._endDate;
    }
    private _endDate: Moment;

    value: DateRange;

    constructor(
        @Optional() @Self() public ngControl: NgControl,
        private readonly _fm: FocusMonitor,
        private readonly _elRef: ElementRef
    ) {
        if (this.ngControl != null) {
            // Setting the value accessor directly (instead of using the providers) to avoid running into a circular import.
            this.ngControl.valueAccessor = this;
        }
        // Listen to value changes in the date range and update the form accordingly
        this._dateRangeValue.pipe(takeUntil(this._destroyed)).subscribe(([startDate, endDate]) => {
            if (!startDate || !endDate) {
                // If either startDate or endDate is not provided, the value should just be null
                this.writeValue(null);
            } else {
                this.writeValue([startDate, endDate]);
            }
        });
        // Using FocusMonitor to manage focus state of the component
        _fm.monitor(_elRef.nativeElement, true).subscribe((origin) => {
            if (!this.disabled) {
                this.focused = !!origin;
                this.stateChanges.next();
            }
        });
    }

    ngOnInit(): void {
        if (Array.isArray(this.value) && this.value[0] && this.value[1]) {
            // Set initial values if provided
            this._startDate = this.value[0];
            this._endDate = this.value[1];
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
    onContainerClick(): void {
        if (!this.disabled) {
            this.ngControl.control.markAsTouched();
        }
    }
    setDisabledState?(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    setDescribedByIds(ids: string[]): void {
        this.describedBy = ids.join(' ');
    }
    ngOnDestroy(): void {
        this._fm.stopMonitoring(this._elRef.nativeElement);
        this._destroyed.next();
    }
}
