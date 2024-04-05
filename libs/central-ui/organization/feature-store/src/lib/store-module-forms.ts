import { FormBuilder, Validators } from '@angular/forms';
import { Store } from '@vioc-angular/central-ui/organization/data-access-store';
import { isNullOrUndefined } from '@vioc-angular/shared/common-functionality';
import { CentralValidators, FormCreator, FormFactory, TypedFormGroup } from '@vioc-angular/shared/util-form';

export class StoreModuleForms {
    constructor(private readonly formBuilder: FormBuilder, private readonly formFactory: FormFactory) {}

    static registerForms(formFactory: FormFactory, formBuilder: FormBuilder) {
        const forms = new StoreModuleForms(formBuilder, formFactory);
        formFactory.register('Store', forms.storeFormCreator);
    }

    private readonly storeFormCreator: FormCreator<Store> = (model, componentDestroyed) => {
        const form = new TypedFormGroup<Store>(this.formBuilder.group(model), componentDestroyed);

        form.getControl('code').disable({ emitEvent: false });
        form.getControl('description').disable({ emitEvent: false });
        form.getControl('active').disable({ emitEvent: false });
        form.getControl('phone').disable({ emitEvent: false });
        form.getControl('fax').disable({ emitEvent: false });
        form.getControl('emergencyPhone').disable({ emitEvent: false });

        form.addFormControlValidators(
            'latitude',
            CentralValidators.decimal({ decimalPlaces: 5, min: -90, max: 90 }),
            // if longitude value present, require latitude
            CentralValidators.requiredIfFieldPresent(form, 'longitude')
        );
        form.addFormControlValidators(
            'longitude',
            CentralValidators.decimal({ decimalPlaces: 5, min: -180, max: 180 }),
            // if latitude value present, require longitude
            CentralValidators.requiredIfFieldPresent(form, 'latitude')
        );
        form.addFormValidationGroup('latitude', 'longitude');
        form.addFormControlValidators('locationDirections', Validators.maxLength(1024));
        form.addFormControlValidators('communitiesServed', Validators.maxLength(255));

        // sameStoreReporting defaults to null, convert to false
        if (isNullOrUndefined(form.getControlValue('sameStoreReporting'))) {
            form.setControlValue('sameStoreReporting', false);
        }
        return form;
    };
}
