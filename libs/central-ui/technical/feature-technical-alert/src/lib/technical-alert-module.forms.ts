import { FormBuilder, Validators } from '@angular/forms';
import { TechnicalAlert } from '@vioc-angular/central-ui/technical/data-access-technical-alert';
import { isNullOrUndefined } from '@vioc-angular/shared/common-functionality';
import { CentralValidators, FormCreator, FormFactory, TypedFormGroup } from '@vioc-angular/shared/util-form';

export class TechnicalAlertForms {
    constructor(private readonly formBuilder: FormBuilder, private readonly formFactory: FormFactory) {}

    static registerForms(formFactory: FormFactory, formBuilder: FormBuilder): void {
        const forms = new TechnicalAlertForms(formBuilder, formFactory);
        formFactory.register('TechnicalAlert', forms.technicalAlertFormCreator);
    }

    private readonly technicalAlertFormCreator: FormCreator<TechnicalAlert> = (model, componentDestroyed, opts) => {
        const form = new TypedFormGroup<TechnicalAlert>(this.formBuilder.group(model, opts), componentDestroyed);
        // Validators
        form.addFormControlValidators('name', Validators.required, Validators.maxLength(60));
        form.addFormControlValidators('comments', Validators.required, Validators.maxLength(4000));
        form.addFormControlValidators('externalLink', CentralValidators.url());
        // Defaults
        if (isNullOrUndefined(form.getControlValue('active'))) {
            form.setControlValue('active', true);
        }
        // Create vehicle/screen forms
        form.setControl(
            'vehicles',
            this.formFactory.array('YearMakeModelEngine', model.vehicles, componentDestroyed, opts)
        );
        return form;
    };
}
