import { Component, Input, Optional, Self } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { MatFormFieldControl } from '@angular/material/form-field';
import { EMPTY } from 'rxjs';

/**
 * Mocked date-range-input component with the minimal fields required for it to be a ControlValueAccessor & MatFormFieldControl.
 */
@Component({
    selector: 'vioc-angular-date-range-input',
    template: '',
})
export class MockDateRangeInputComponent implements ControlValueAccessor, MatFormFieldControl<any> {
    @Input() disabled = false;
    @Input() placeholder = 'Date Range';
    @Input() required = false;
    @Input() styleClass: string;
    @Input() floatLabel = 'never';

    value: any;
    stateChanges = EMPTY;
    id: string;
    focused: boolean;
    empty: boolean;
    shouldLabelFloat: boolean;
    errorState: boolean;
    controlType?: string;
    autofilled?: boolean;

    constructor(@Optional() @Self() public ngControl: NgControl) {
        if (this.ngControl != null) {
            // Setting the value accessor directly (instead of using
            // the providers) to avoid running into a circular import.
            this.ngControl.valueAccessor = this;
        }
    }

    onChange = (_: any) => {};
    onTouched = () => {};
    setDescribedByIds(ids: string[]): void {}
    onContainerClick(event: MouseEvent): void {}
    writeValue(obj: any): void {}
    registerOnChange(fn: any): void {
        this.onChange = fn;
    }
    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }
    setDisabledState?(isDisabled: boolean): void {}
}
