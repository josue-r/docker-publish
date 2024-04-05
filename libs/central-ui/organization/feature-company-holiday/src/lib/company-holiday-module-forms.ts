import { FormBuilder, Validators } from '@angular/forms';
// tslint:disable-next-line: nx-enforce-module-boundaries
import { CompanyHoliday, StoreHoliday } from '@vioc-angular/central-ui/organization/data-access-company-holiday';
import { FormCreator, FormFactory, TypedFormGroup } from '@vioc-angular/shared/util-form';

/**
 * FormCreators for the entities that are maintained by the CompanyHolidayModule.
 */
export class CompanyHolidayForms {
    constructor(private readonly formBuilder: FormBuilder, private readonly formFactory: FormFactory) {}

    static registerForms(formFactory: FormFactory, formBuilder: FormBuilder) {
        const forms = new CompanyHolidayForms(formBuilder, formFactory);
        formFactory.register('CompanyHoliday', forms.companyHolidayFormCreator);
        formFactory.register('StoreHoliday', forms.storeHolidayFormCreator);
    }

    private readonly companyHolidayFormCreator: FormCreator<CompanyHoliday> = (model, componentDestroyed, opts) => {
        const form = new TypedFormGroup<CompanyHoliday>(this.formBuilder.group(model, opts), componentDestroyed);

        // Remove array based controls and re-add as FormArrays
        form.removeControl('storeHolidays');
        // Build a FormArray for the storeHolidays
        form.setControl(
            'storeHolidays',
            this.formFactory.array('StoreHoliday', model.storeHolidays, componentDestroyed, opts)
        );
        return form;
    };

    private readonly storeHolidayFormCreator: FormCreator<StoreHoliday> = (model, componentDestroyed, opts) => {
        const form = new TypedFormGroup<StoreHoliday>(this.formBuilder.group(model, opts), componentDestroyed);
        form.addFormControlValidators('store', Validators.required);
        return form;
    };
}
