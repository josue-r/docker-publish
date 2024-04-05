import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { FormErrorMapping } from './form-error-mapping';

/**
 * A directive used to provide standard form field error messages. This is meant to build upon the <mat-error> functionality.
 */
@Directive({
    selector: '[viocAngularFormError]',
})
export class FormErrorDirective {
    /**
     * Custom form field errors. The following usage would add one custom error variable named `customError`.
     *
     * @example
     * ````
     * *viocAngularFormError="form.get('controlName').errors; customErrorMapping: customError; let error"
     * ````
     */
    @Input() set viocAngularFormErrorCustomErrorMapping(customMappings: FormErrorMapping) {
        this.mappings = { ...FormErrorDirective.standardErrors, ...customMappings };
    }

    /**
     * Displays the first applicable error of the `ValidationErrors`.
     */
    @Input() set viocAngularFormError(errors: ValidationErrors) {
        // Clear view to remove past errors
        this.view.clear();
        if (errors) {
            // Show the first error.  If we show all errors, it will result in multiple mat-error elements,
            // resulting in a cut-off for longer messages, especially in the grid component.
            const firstErrorKey = Object.keys(errors)[0];
            const mapping = this.mappings[firstErrorKey];
            if (mapping) {
                this.view.createEmbeddedView(this.templateRef, {
                    $implicit: mapping(errors),
                });
            }
        }
    }

    /**
     * Common form errors
     * Note: This gives compiler errors if using lamdas as of ng6
     */
    static standardErrors: FormErrorMapping = {
        required(): string {
            return 'Value is required';
        },
        requiredRelated(): string {
            return 'A related field is required';
        },
        onlyOneRequired(): string {
            return `Only one of these fields can be populated`;
        },
        oneOfRequired(): string {
            return `Must provide a value for one of these fields`;
        },
        min(errors: ValidationErrors): string {
            return `Value cannot be less than ${errors.min.min}`;
        },
        max(errors: ValidationErrors): string {
            return `Value cannot be more than ${errors.max.max}`;
        },
        minlength(errors: ValidationErrors): string {
            return `Value must be at least ${errors.minlength.requiredLength} characters`;
        },
        maxlength(errors: ValidationErrors): string {
            return `Value must be ${errors.maxlength.requiredLength} characters or less`;
        },
        email(): string {
            return 'Value must be a valid email';
        },
        pattern(): string {
            return 'Value is invalid';
        },
        invalidInteger(): string {
            return 'Must be a whole number';
        },
        invalidDecimal(errors: ValidationErrors): string {
            return `Must have no more than ${errors.invalidDecimal.decimalPlaces} decimal places`;
        },
        numberGreaterThan(errors: ValidationErrors): string {
            return `Value must be greater than ${errors.numberGreaterThan.inclusive ? 'or equal to ' : ''}${
                errors.numberGreaterThan.number
            }`;
        },
        dateAfter(errors: ValidationErrors): string {
            return `Should be ${errors.dateAfter.inclusive ? 'on or ' : ''}after ${errors.dateAfter.date}`;
        },
        dateBefore(errors: ValidationErrors): string {
            return `Should be ${errors.dateBefore.inclusive ? 'on or ' : ''}before ${errors.dateBefore.date}`;
        },
        code(): string {
            return 'Should contain only uppercase letters, numbers, spaces, -, and _';
        },
        alphanumeric(): string {
            return "Should contain only letters, numbers, spaces, -, ', and .";
        },
        invalidUrl(): string {
            return 'Not a valid url';
        },
    };

    private mappings = FormErrorDirective.standardErrors;

    constructor(private readonly templateRef: TemplateRef<any>, private readonly view: ViewContainerRef) {}
}
