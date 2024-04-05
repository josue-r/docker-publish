import { Component, Input, Optional, Self } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { MatFormFieldControl } from '@angular/material/form-field';
import { DynamicDropdownColumn } from '@vioc-angular/shared/util-column';
import { EMPTY } from 'rxjs';

/**
 * Mock component used in place of an actual dropdown. This can be used to verify inputs
 * passed to the dropdown component without having the overhead of actually importing and
 * rendering the dropdown.
 */
@Component({
    selector: 'vioc-angular-dropdown-column',
    template: '',
    providers: [{ provide: MatFormFieldControl, useExisting: MockDropdownColumnComponent }],
})
export class MockDropdownColumnComponent implements ControlValueAccessor, MatFormFieldControl<any> {
    @Input() column: DynamicDropdownColumn<any>;
    @Input() multiple: boolean;
    @Input() noSelectionOption = false;
    @Input() disabled = false;
    @Input() placeholder: string;
    @Input() required = false;

    value: any;
    stateChanges = EMPTY;
    id: string;
    focused: boolean;
    empty: boolean;
    shouldLabelFloat: boolean;
    controlType?: string;
    autofilled?: boolean;

    get errorState(): boolean {
        // Show input as in error if not disabled, control has been touched, and it is invalid
        return !this.disabled && this.ngControl.touched && this.ngControl.invalid;
    }

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

    /**
     * This is a helper method to simulate the dropdown having a value selected
     */
    setValue(value: any) {
        this.onChange(value);
    }
}
