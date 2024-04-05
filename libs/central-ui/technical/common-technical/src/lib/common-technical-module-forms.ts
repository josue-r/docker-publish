import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { Attribute, YearMakeModelEngine } from '@vioc-angular/central-ui/technical/data-access-tsb';
import { isNullOrUndefined } from '@vioc-angular/shared/common-functionality';
import { CentralValidators, FormCreator, FormFactory, TypedFormGroup } from '@vioc-angular/shared/util-form';

export class CommonTechnicalModuleForms {
    constructor(private readonly formFactory: FormFactory, private readonly formBuilder: FormBuilder) {}

    static registerForms(formFactory: FormFactory, formBuilder: FormBuilder) {
        const forms = new CommonTechnicalModuleForms(formFactory, formBuilder);
        formFactory.register('YearMakeModelEngine', forms.yearMakeModelEngineFormCreator);
        formFactory.register('Attribute', forms.attributeFormCreator);
    }

    private readonly yearMakeModelEngineFormCreator: FormCreator<YearMakeModelEngine> = (
        model,
        componentDestroyed,
        opts
    ) => {
        const form = new TypedFormGroup<YearMakeModelEngine>(this.formBuilder.group(model, opts), componentDestroyed);
        form.addFormControlValidators(
            'yearStart',
            CentralValidators.integer(),
            this.yearDigitValidator(),
            this.yearStartLessThanEqualToYearEndValidator(form.getControl('yearEnd'))
        );
        form.addFormControlValidators('yearEnd', CentralValidators.integer(), this.yearDigitValidator());
        form.addFormValidationGroup('yearStart', 'yearEnd');

        form.addClearOnChangeListener('makeId', ['modelId', 'engineConfigId']);
        form.addClearOnChangeListener('modelId', ['engineConfigId']);

        form.removeControl('attributes');
        form.setControl('attributes', this.formFactory.array('Attribute', model.attributes, componentDestroyed, opts));
        return form;
    };

    private readonly attributeFormCreator: FormCreator<Attribute> = (model, componentDestroyed, opts) => {
        const form = new TypedFormGroup<Attribute>(this.formBuilder.group(model, opts), componentDestroyed);
        form.addClearOnChangeListener('type', ['key']);
        form.addRequiredFieldGrouping(['type', 'key']);
        return form;
    };

    /** Validates that the year entered is formatted to four numeric digits. */
    private yearDigitValidator() {
        const integerRegex = /^\d{4}$/;
        return (control: AbstractControl): ValidationErrors | null => {
            const errors = Validators.pattern(integerRegex)(control);
            return errors ? { invalidYear: true } : null;
        };
    }

    /** Validates that the Year Start field is before the Year End field. */
    private yearStartLessThanEqualToYearEndValidator(endYearControl: AbstractControl) {
        return (control: AbstractControl) => {
            const yearEndValue = endYearControl.value;
            const value = control.value;
            if (!isNullOrUndefined(yearEndValue) && !isNullOrUndefined(value)) {
                return value <= yearEndValue ? null : { invalidStartYear: true };
            } else {
                return null;
            }
        };
    }
}
