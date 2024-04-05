import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { formatMoment, isEmptyInputValue, isNullOrUndefined } from '@vioc-angular/shared/common-functionality';
import * as moment from 'moment';
import { Moment } from 'moment';
import { TypedFormGroup } from '../form/typed-form-group';
import { DecimalOptions } from './decimal-options';
import { IntegerOptions } from './integer-options';

export class CentralValidators {
    static arrayMinLength(min: number): ValidatorFn {
        return (c: AbstractControl) => {
            if (Array.isArray(c.value) && c.value.length < min) {
                return { minLengthArray: { valid: false } };
            }
            return null;
        };
    }

    static arrayMaxLength(max: number): ValidatorFn {
        return (c: AbstractControl) => {
            if (Array.isArray(c.value) && c.value.length > max) {
                return { maxLengthArray: { valid: false } };
            }
            return null;
        };
    }

    /**
     * Validates that the control value is in decimal format and greater than or equal to the minValue.
     *
     * @param minValue minimum valid value, default is zero.
     */
    static currency(minValue = 0): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            return this.decimal({ min: minValue })(control);
        };
    }

    /**
     * Validates that the control value is in decimal format.
     */
    static decimal(options?: DecimalOptions): ValidatorFn {
        const defaultOptions = { decimalPlaces: 2, min: 0, max: 9999.99 } as DecimalOptions;
        options = Object.assign(defaultOptions, options);
        // const decimalRegex = new RegExp(`^\\d*(?:[.]\\d{1,${decimalPlaces}})?$`);
        // create validator function array
        const validators: ValidatorFn[] = [Validators.min(options.min), Validators.max(options.max)];
        // push custom decimal places validator function
        validators.push((c: AbstractControl) => {
            if (isNullOrUndefined(c.value)) {
                return null; // valid
            }
            const value: string = (c.value + '').trim(); // convert to string (faster than .toString())
            if (value.length === 0) {
                // valid for empty string
                return null;
            }
            const numberValue: number = parseFloat(value);

            // check for number
            if (isNaN(numberValue) || !isFinite(numberValue)) {
                return { invalidDecimal: { valid: false } };
            }

            // check decimal places
            if (parseFloat(numberValue.toFixed(options.decimalPlaces)) !== numberValue) {
                return { invalidDecimal: { valid: false, decimalPlaces: options.decimalPlaces } };
            }
            return null;
        });
        // combine validator functions
        return Validators.compose(validators);
    }

    static integer(options?: IntegerOptions): ValidatorFn {
        const defaultOptions = { min: 0, max: 9999 } as IntegerOptions;
        options = Object.assign(defaultOptions, options);
        const integerRegex = /^\d*$/;
        // create validator function array
        const validators: ValidatorFn[] = [Validators.min(options.min), Validators.max(options.max)];
        // push custom decimal places validator function
        validators.push((control) => {
            if (control.value && !integerRegex.test(control.value)) {
                return { invalidInteger: { valid: false } };
            } else {
                return null;
            }
        });
        // combine validator functions
        return Validators.compose(validators);
    }

    /**
     * Validates that the control is a date that is after the passed control.
     */
    static dateBeforeValidator(controlWithLaterDate: AbstractControl, inclusive = false) {
        return (control: AbstractControl) => {
            return this.validateDateIsBefore(control.value, controlWithLaterDate.value, inclusive);
        };
    }

    /**
     * Validates that the control is a date that is after the passed control.
     */
    static dateAfterValidator(controlWithEarlierDate: AbstractControl, inclusive = false) {
        return (control: AbstractControl) => {
            return this.validateDateIsAfter(control.value, controlWithEarlierDate.value, inclusive);
        };
    }

    /**
     * Validates that the control is a date that is after today.
     */
    static dateAfterTodayValidator(inclusive = false) {
        return (control: AbstractControl) => {
            return this.validateDateIsAfter(control.value, moment().startOf('day'), inclusive);
        };
    }

    /**
     * Validates that the selectedDate is a date that is after the comparisonDate.
     *
     * The following values for [`comparisonDate`, `selectedDate`] will pass:
     * <ul>
     * <li>[1, 2]</li>
     * <li>["a", "b"]</li>
     * <li>[1, null/undefined]</li>
     * <li>[null/undefined, null/undefined]</li>
     * </ul>
     * and these values will fail
     * <ul>
     * <li>[2,1]</li>
     * <li>["b","a"</li>
     * <li>[null/undefined, 2]</li>
     * </ul>
     */
    private static validateDateIsAfter(
        selectedDate: Moment | string,
        comparisonDate: Moment | string,
        inclusive = false
    ) {
        let isValid: boolean;
        let reason: string;
        if (!isNullOrUndefined(comparisonDate) && !isNullOrUndefined(selectedDate)) {
            selectedDate = moment(selectedDate);
            comparisonDate = moment(comparisonDate);
            isValid = inclusive ? selectedDate.isSameOrAfter(comparisonDate) : selectedDate.isAfter(comparisonDate);
            reason = `${inclusive ? 'in' : 'ex'}clusive comparison`;
        } else {
            isValid = true; // empty input => valid, if a value is required then that validator should do that work
        }

        if (!isValid) {
            return {
                dateAfter: {
                    valid: false,
                    inclusive,
                    reason,
                    date: formatMoment(comparisonDate, true),
                },
            };
        } else {
            return null;
        }
    }

    /**
     * Validates that the selectedDate is a date that is before the comparisonDate.
     *
     * The following values for [`comparisonDate`, `selectedDate`] will pass:
     * <ul>
     * <li>[2, 1]</li>
     * <li>["b", "a"]</li>
     * <li>[1, null/undefined]</li>
     * <li>[null/undefined, null/undefined]</li>
     * </ul>
     * and these values will fail
     * <ul>
     * <li>[1, 2]</li>
     * <li>["a", "b"]</li>
     * <li>[null/undefined, 1]</li>
     * </ul>
     */
    private static validateDateIsBefore(
        selectedDate: Moment | string,
        comparisonDate: Moment | string,
        inclusive = false
    ) {
        let isValid: boolean;
        let reason: string;
        if (!isNullOrUndefined(comparisonDate) && !isNullOrUndefined(selectedDate)) {
            selectedDate = moment(selectedDate);
            comparisonDate = moment(comparisonDate);
            isValid = inclusive ? selectedDate.isSameOrBefore(comparisonDate) : selectedDate.isBefore(comparisonDate);
            reason = `${inclusive ? 'in' : 'ex'}clusive comparison`;
        } else {
            isValid = true; // empty input -> valid
        }

        if (!isValid) {
            return {
                dateBefore: {
                    valid: false,
                    inclusive,
                    reason,
                    date: formatMoment(comparisonDate, true),
                },
            };
        } else {
            return null;
        }
    }

    static numberGreaterThanValidator(lessThanControl: AbstractControl, inclusive = false) {
        return (control: AbstractControl) => {
            const lessThanValue = lessThanControl.value;
            const currentValue = control.value;

            let isValid: boolean;
            let reason: string;
            if (!isNullOrUndefined(lessThanValue) && !isNullOrUndefined(currentValue)) {
                isValid = inclusive ? lessThanValue <= currentValue : lessThanValue < currentValue;
                reason = `${inclusive ? 'in' : 'ex'}clusive comparison`;
            } else {
                isValid = true;
            }

            if (!isValid) {
                return {
                    numberGreaterThan: {
                        valid: false,
                        inclusive,
                        reason,
                        number: lessThanValue,
                    },
                };
            } else {
                return null;
            }
        };
    }

    /**
     * Marks a field as requried if the passed in checkedField is true. Assumes the checkedField
     * represents a boolean field in the model.
     */
    static requiredIfFieldChecked<T>(form: TypedFormGroup<T>, checkedField: keyof T) {
        return (control: AbstractControl) => {
            if (!isNullOrUndefined(form.getControl(checkedField)) && form.getControlValue(checkedField)) {
                return isNullOrUndefined(control.value) ? { required: true } : undefined;
            } else {
                return null;
            }
        };
    }
    /**
     * Marks a field as requried if the passed in field has a value
     */
    static requiredIfFieldPresent<T>(form: TypedFormGroup<T>, field: keyof T) {
        return (control: AbstractControl) => {
            if (!isNullOrUndefined(form.getControl(field)) && !isEmptyInputValue(form.getControlValue(field))) {
                return isEmptyInputValue(control.value) ? { required: true } : undefined;
            } else {
                return null;
            }
        };
    }

    /**
     * Marks a field as onlyOneRequired if the passed in field and control field both have a value
     */
    static requiredIfFieldNotPresent<T>(form: TypedFormGroup<T>, field: keyof T) {
        return (control: AbstractControl) => {
            if (
                !isNullOrUndefined(form.getControl(field)) &&
                !isEmptyInputValue(form.getControlValue(field)) &&
                !isEmptyInputValue(control.value)
            ) {
                return { onlyOneRequired: true };
            } else {
                return null;
            }
        };
    }

    /**
     * Replacement for Validators.required that adds additional conditions for when the required error
     * should be returned.
     *
     * @param codition - whether the control should always be required or only required if it's dirty
     */
    static required(condition: 'always' | 'if-dirty' = 'always') {
        return (control: AbstractControl) => {
            if (condition === 'always' || (condition === 'if-dirty' && control.dirty)) {
                return Validators.required(control);
            } else {
                return null;
            }
        };
    }

    /** The control will be considered invalid if it doesn't have a value and the given 'otherFields' also do not have a value. */
    static oneOfRequired<T>(form: TypedFormGroup<T>, ...otherFields: Array<keyof T>): ValidatorFn {
        if (!Array.isArray(otherFields) || otherFields.length < 1) {
            throw new Error('CentralValidator oneOfRequired needs at least one other field provided.');
        }
        return (control) => {
            if (
                isEmptyInputValue(control.value) &&
                otherFields.every((controlName) => isEmptyInputValue(form.getControlValue(controlName)))
            ) {
                return { oneOfRequired: true };
            }
            return null;
        };
    }

    static url(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            // this creates an element from the document, however because it is never associated with the DOM it will be
            // garbage collected once it is no longer referenced. This is done to utilize the existing url validation
            const input: HTMLInputElement = document.createElement('input');
            input.type = 'url';
            input.value = control.value;
            const isValid = input.checkValidity();
            if (!isValid) {
                return { invalidUrl: true };
            }
            return null;
        };
    }
}
