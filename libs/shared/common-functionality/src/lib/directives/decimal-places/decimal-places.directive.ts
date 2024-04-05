import { formatNumber } from '@angular/common';
import { Directive, ElementRef, forwardRef, HostListener, Inject, Input, LOCALE_ID, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * This directive provides support for inputs to limit the number of decimal places that are
 * allowed. This directive should be applied directly to an input and that input should not be
 * set to be a number input. The HostListener intercepts keyboard events and prevents the user
 * from typing anything invalid based on the current input, so will not allow them to type more
 * decimals if already maxed out and will not allow alpha characters etc. The one scenario this
 * doesn't cover is copying and pasting values in, a form validatior should be used in conjuction
 * with this directive to ensure that bad data is not allowed to be saved.
 *
 * This directive also provides a custom ControlValueAccessor. This ensures that even though
 * the input is not of type number, a number is still what is set in the form rather than a
 * string.
 */
@Directive({
    selector: 'input[viocAngularDecimalPlaces]',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => DecimalPlacesDirective),
            multi: true,
        },
    ],
})
export class DecimalPlacesDirective implements OnInit, ControlValueAccessor {
    /**
     * Number of decimal places allowed for the field. Defaults is `2`.
     */
    @Input() decimalPlaces = 2;

    /**
     * Regex that restricts the field to the given decimal places.
     */
    private regex: RegExp;

    /**
     * Keys that should always be supported.
     */
    private readonly uncheckedKeys = [
        'Backspace',
        'Tab',
        'End',
        'Home',
        'ArrowLeft',
        'ArrowRight',
        'ArrowUp',
        'ArrowDown',
        'Delete',
    ];

    /**
     * Keys you are allowed to press if holding ctrl.
     */
    private readonly controllableKeys = ['a', 'c', 'v', 'x'];

    onChange = (_: any) => {};

    onTouched = () => {};

    constructor(private readonly elementRef: ElementRef, @Inject(LOCALE_ID) private readonly locale: string) {}

    ngOnInit(): void {
        // sets the regex based on the number of decimal places allowed
        this.regex = new RegExp(`^-?\\d*\\.?\\d{0,${this.decimalPlaces}}$`);
        // sets the initial value to always have one number before the decimal and the number of decimal places after
        if (this.elementRef.nativeElement.value) {
            this.elementRef.nativeElement.value = formatNumber(
                this.elementRef.nativeElement.value,
                this.locale,
                `1.${this.decimalPlaces}-${this.decimalPlaces}`
            );
        }
    }

    /**
     * Checks KeyboardEvent to validate if the event would make the field invalid. If so prevents the
     * KeyboardEvent from happening.
     */
    @HostListener('keydown', ['$event']) onKeyDown(event: KeyboardEvent): void {
        // determines if the event needs to be ignored
        if (
            !this.uncheckedKeys.find((key) => key === event.key) &&
            !(event.ctrlKey && this.controllableKeys.find((key) => key === event.key))
        ) {
            // key is not unchecked or controllable
            const current: string = this.elementRef.nativeElement.value;
            // account for the selection if user has higlighted text they are typing over
            const positionStart = this.elementRef.nativeElement.selectionStart;
            const positionEnd = this.elementRef.nativeElement.selectionEnd;
            // build what the input would be, if it's invalid prevent the key from processing
            const next: string = [current.slice(0, positionStart), event.key, current.slice(positionEnd)].join('');
            if (next && !next.match(this.regex)) {
                event.preventDefault();
            }
        }
    }

    @HostListener('change', ['$event']) handleChange(event: any) {
        this.onChange(event.target.value);
    }

    @HostListener('input', ['$event']) handleInput(event: any) {
        this.onChange(event.target.value);
    }

    @HostListener('blur') handleBlur() {
        this.onTouched();
    }

    writeValue(value: number): void {
        this.elementRef.nativeElement.value =
            value == null ? '' : formatNumber(value, this.locale, `1.${this.decimalPlaces}-${this.decimalPlaces}`);
    }

    registerOnChange(fn: (_: number | null) => void): void {
        this.onChange = (value) => {
            fn(value === '' ? null : parseFloat(value));
        };
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.elementRef.nativeElement.disabled = isDisabled;
    }
}
