import { FormBuilder } from '@angular/forms';
import { Offer, StoreDiscount } from '@vioc-angular/central-ui/discount/data-access-offers';
import { Store } from '@vioc-angular/central-ui/organization/data-access-store';
import { isNullOrUndefined } from '@vioc-angular/shared/common-functionality';
import { FormFactory, FormCreator, TypedFormGroup, CentralValidators } from '@vioc-angular/shared/util-form';

export class OfferModuleForms {
    constructor(private readonly formBuilder: FormBuilder, private readonly formFactory: FormFactory) {}

    static registerForms(formFactory: FormFactory, formBuilder: FormBuilder) {
        const forms = new OfferModuleForms(formBuilder, formFactory);
        formFactory.register('Offer', forms.offerFormCreator);
        formFactory.register('StoreDiscount', forms.storeDiscountFormCreator);
        formFactory.register('Store', forms.storeFormCreator);
    }

    private readonly offerFormCreator: FormCreator<Offer> = (model, componentDestroyed) => {
        const form = new TypedFormGroup<Offer>(this.formBuilder.group(model), componentDestroyed);

        // Remove array based controls and re-add as FormArrays
        form.removeControl('storeDiscounts');
        // Build a FormArray for the storeDiscounts
        form.setControl(
            'storeDiscounts',
            this.formFactory.array('StoreDiscount', model.storeDiscounts, componentDestroyed)
        );

        // active defaults to null, convert to false
        if (isNullOrUndefined(form.getControlValue('active'))) {
            form.setControlValue('active', false);
        }

        form.addFormControlValidators('amount', CentralValidators.integer({ min: 1 }));
        form.addFormControlValidators(
            'daysToExpire',
            CentralValidators.integer({ min: 1 }),
            // only one of daysToExpire or expirationDate is allowed
            CentralValidators.requiredIfFieldNotPresent(form, 'expirationDate'),
            // one of daysToExpire or expirationDate is required
            CentralValidators.oneOfRequired(form, 'expirationDate')
        );
        form.addFormControlValidators(
            'expirationDate',
            CentralValidators.dateAfterTodayValidator(),
            // only one of daysToExpire or expirationDate is allowed
            CentralValidators.requiredIfFieldNotPresent(form, 'daysToExpire'),
            // one of daysToExpire or expirationDate is required
            CentralValidators.oneOfRequired(form, 'daysToExpire')
        );
        form.addFormValidationGroup('daysToExpire', 'expirationDate');
        return form;
    };

    private readonly storeDiscountFormCreator: FormCreator<StoreDiscount> = (model, componentDestroyed) => {
        const form = new TypedFormGroup<StoreDiscount>(this.formBuilder.group(model), componentDestroyed);
        return form;
    };

    private readonly storeFormCreator: FormCreator<Store> = (model, componentDestroyed) => {
        const form = new TypedFormGroup<Store>(this.formBuilder.group(model), componentDestroyed);
        // Add a control for assigned for sorting purposes, this gets set in the component
        form.addControl('assigned', this.formBuilder.control(null));
        return form;
    };
}
