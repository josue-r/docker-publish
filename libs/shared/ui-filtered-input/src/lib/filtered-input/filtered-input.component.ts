import { Component, EventEmitter, HostBinding, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';
import { FloatLabelType } from '@angular/material/form-field';
import { MatSelectChange } from '@angular/material/select';
import { Described, isNullOrUndefined } from '@vioc-angular/shared/common-functionality';
import { Loggers } from '@vioc-angular/shared/common-logging';
import { isEqual } from 'lodash';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { distinctUntilChanged, startWith, takeUntil } from 'rxjs/operators';

/**
 * A component to add a filterable (auto-complete) select menu. If the field is not editable, this will instead
 * display a disabled input.
 *
 * Usage ex:
 * <vioc-angular-filtered-input
        class="flex-item"
        [options]="availableStores | async"
        [valueControl]="storeControl"
        [editable]="accessMode.isAdd"
        placeHolder="Store"
    ></vioc-angular-filtered-input>
 */
@Component({
    selector: 'vioc-angular-filtered-input',
    templateUrl: './filtered-input.component.html',
})
export class FilteredInputComponent implements OnInit, OnDestroy {
    private readonly logger = Loggers.get('ui-filtered-input', 'FilteredInputComponent');
    private readonly _destroyed = new ReplaySubject(1);

    /** The form control for the option filtering text. */
    filterControl = new FormControl('');

    readonly filteredOptions$ = new BehaviorSubject<any[]>([]);

    /** The value of the disabled input when the field is not editable. */
    valueText: string;

    /**
     * Sets the vioc-angular-filtered-input as a 'flex-container'. This can be set to false if not wanting to
     * have the select menu flexed.
     */
    @Input() @HostBinding('class.flex-container') readonly flexed = true;

    /**
     * Pass through custom error mappings for input
     */
    @Input() customErrorMapping = null;

    /** The control for the actual input value. */
    @Input() valueControl: AbstractControl;

    @Input() placeHolder: string;

    @Input() editable = false;

    /**
     * Not being nullable is not the same as being required. Nullable is just controlling the display of a blank option in the dropdown.
     */
    @Input() nullable = false;

    @Input() required = false;

    /** Enables Multi select property in dropdown */
    @Input() multiple = false;

    /** Enables the `hint` property to be displayed under the field. */
    @Input() hintEnabled = false;

    /** Hint that will be displayed under the field if `hintEnabled` is true. */
    @Input() hint = '';

    /**
     * Determines how (if at all) the placeholder floats above the input.
     *
     * @see MatFormField.floatLabel
     */
    @Input() floatLabel: FloatLabelType = 'auto';

    /**
     * Enables a value tooltip on hover. This is useful for dropdowns containing dynamic options that may be too
     * long for the space provided and end up not fully displaying.
     */
    @Input() tooltipEnabled = false;

    @Output() openChangedEvent: EventEmitter<any> = new EventEmitter();

    @Output() selectedOptionEvent: EventEmitter<any> = new EventEmitter();

    /** Trigger an event when selecting an option in the dropdown */
    @Output() selectionChange = new EventEmitter<MatSelectChange>();

    tooltipText = '';

    private _options: any[];

    /** All of the select menu options. This will be filtered down based on text input into the filterControl. */
    @Input() set options(options: any[]) {
        this._options = options;
        // filter the options once they are loaded (useful for async pipe)
        this.filterControl.updateValueAndValidity({ emitEvent: true });
        // update valueText when an options observable completes
        this.updateValueText();
    }

    get options() {
        // display an empty array if no options have been loaded.
        return this._options || [];
    }

    /** The function converting the value/options to a displayable string. */
    @Input() displayFn: (any) => string = Described.codeMapper;

    /**
     * The function used to compare the option values with the selected value.
     *
     * @see Select.compareWith
     */
    @Input() compareWith = (o1: any, o2: any) => o1 === o2;

    /** The function to filter the options based on the input text. Does a 'startsWith' by default. */
    @Input() filterFn = (searchText: string) =>
        this.options.filter((s) => this.displayFn(s).toLowerCase().startsWith(searchText.toLowerCase()));

    /** The function to display the values in the dropdown in a specific way. Displays the option as is by default. */
    @Input() valueFn = (value: any) => value;

    /** Controls the loading icon. If no options provided, assume they are still loading. */
    get loading(): boolean {
        return isNullOrUndefined(this._options);
    }

    ngOnInit() {
        this.filteredOptions$
            .pipe(
                takeUntil(this._destroyed),
                distinctUntilChanged(isEqual) // reduce duplicate logging if things don't change
            )
            .subscribe((opts) => this.logger.debug(() => `filteredOptions$ updated to: ${opts.map(this.displayFn)}`));

        // setup store selects filter logic
        this.filterControl.valueChanges //
            .pipe(takeUntil(this._destroyed))
            .subscribe((searchText) => this.filteredOptions$.next(this.filterFn(searchText)));
        // trigger initial filtering (this should just result in all options being displayed)
        this.filterControl.updateValueAndValidity({ emitEvent: true });
        // maintain the value text and tooltip text based on the value selected
        this.valueControl.valueChanges
            .pipe(takeUntil(this._destroyed), startWith(this.valueControl.value))
            .subscribe(() => this.updateValueText());
    }

    private updateTooltip(): void {
        if (this.tooltipEnabled) {
            this.tooltipText = this.valueText;
        } else {
            this.tooltipText = '';
        }
    }

    /** Maintain a value text based on the displayFn of the options, and not necessarily the value of the control. */
    private updateValueText(): void {
        // find the option that matches the value set
        const selectedOption = this.options.find((o) => this.compareWith(this.valueFn(o), this.valueControl?.value));
        if (selectedOption) {
            // find the display text and set it as the tooltip
            this.valueText = this.displayFn(selectedOption);
        } else {
            this.valueText = '';
        }
        // update tooltip when valueText changes
        this.updateTooltip();
    }

    // Maintain All selection in dropdown with multiple selection
    selectedOption(event): void {
        this.selectedOptionEvent.emit(event);
    }

    // This is for the ngIf on the placeHolder value. We don't need placeholders on search lines
    hasClass(event): boolean {
        if (event.placeHolder == 'Field' || event.placeHolder == 'Comparator' || event.placeHolder == 'Value') {
            return true;
        }
        return false;
    }

    // Triggered during opening and closing of selection popup.
    openChanged(event: boolean): void {
        this.openChangedEvent.emit(event);
    }
    ngOnDestroy(): void {
        this._destroyed.next();
    }
}
