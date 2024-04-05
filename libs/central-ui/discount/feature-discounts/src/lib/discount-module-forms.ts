import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Discount, StoreDiscount } from '@vioc-angular/central-ui/discount/data-access-discount';
import { isNullOrUndefined } from '@vioc-angular/shared/common-functionality';
import { Store } from '@vioc-angular/central-ui/organization/data-access-resources';
import { CentralValidators, FormCreator, FormFactory, TypedFormGroup } from '@vioc-angular/shared/util-form';
import { DiscountCategory } from 'libs/central-ui/discount/data-access-discount/src/lib/model/discount-category.model';
import { takeUntil } from 'rxjs/operators';

export class DiscountModuleForms {
    constructor(private readonly formBuilder: FormBuilder, private readonly formFactory: FormFactory) {}

    static registerForms(formFactory: FormFactory, formBuilder: FormBuilder) {
        const forms = new DiscountModuleForms(formBuilder, formFactory);
        formFactory.register('Discount', forms.discountFormCreator);
        formFactory.register('DiscountCategory', forms.discountCategoriesFormCreator);
        formFactory.register('StoreDiscount', forms.storeDiscountFormCreator);
        formFactory.register('Store', forms.storeFormCreator);
    }

    private readonly discountFormCreator: FormCreator<Discount> = (model, componentDestroyed, opts) => {
        const DISCOUNT_LINE_ITEM = 'LINEITEM';

        const DISCOUNT_EXCLUDE_LINE_ITEM = 'EXCLUDE_LINEITEM';

        const form = new TypedFormGroup<Discount>(this.formBuilder.group(model), componentDestroyed);
        // Remove array based controls and re-add as FormArrays
        form.removeControl('storeDiscounts');
        // Build a FormArray for the storeDiscounts
        form.setControl(
            'storeDiscounts',
            this.formFactory.array('StoreDiscount', model.storeDiscounts, componentDestroyed)
        );

        // Disable un-editable fields
        if (opts.accessMode?.isEdit) {
            form.getControl('company').disable({ emitEvent: false });
            form.getControl('code').disable({ emitEvent: false });
            form.getControl('startDate').disable({ emitEvent: false });
        }

        // Validators for add page
        if (opts.accessMode?.isAdd) {
            form.addFormControlValidators('code', Validators.required, Validators.maxLength(5));
            form.addFormControlValidators('startDate', CentralValidators.dateAfterTodayValidator(true));
        }

        //  Defaults booleans to false, not null - to protect against active being saved as null
        if (isNullOrUndefined(form.getControlValue('active'))) {
            form.setControlValue('active', false);
        }
        if (isNullOrUndefined(form.getControlValue('uniqueCodeRequired'))) {
            form.setControlValue('uniqueCodeRequired', false);
        }
        if (isNullOrUndefined(form.getControlValue('fleetOnly'))) {
            form.setControlValue('fleetOnly', false);
        }
        if (isNullOrUndefined(form.getControlValue('extraChargesSupported'))) {
            form.setControlValue('extraChargesSupported', false);
        }
        if (isNullOrUndefined(form.getControlValue('overridable'))) {
            form.setControlValue('overridable', false);
        }
        if (isNullOrUndefined(form.getControlValue('explanationRequired'))) {
            form.setControlValue('explanationRequired', false);
        }

        form.addFormControlValidators('description', Validators.required, Validators.maxLength(100));

        // End Date is required and must be after Start Date and must be after Expiration Date and not earlier than current date
        form.addFormControlValidators(
            'endDate',
            Validators.required,
            CentralValidators.dateAfterValidator(form.getControl('startDate'), true),
            CentralValidators.dateAfterValidator(form.getControl('expirationDate'), false),
            CentralValidators.dateAfterTodayValidator(true)
        );

        // Expiration Date is required and must be before End Date and must be after Start Date and not earlier than current date
        form.addFormControlValidators(
            'expirationDate',
            CentralValidators.dateBeforeValidator(form.getControl('endDate'), false),
            CentralValidators.dateAfterValidator(form.getControl('startDate'), false),
            CentralValidators.dateAfterTodayValidator(true)
        );

        // Min/Max override amount
        form.addFormControlValidators(
            'overrideMinAmount',
            CentralValidators.decimal({ decimalPlaces: 2 }),
            // if max override value present, require min override
            CentralValidators.requiredIfFieldPresent(form, 'overrideMaxAmount')
        );
        form.addFormControlValidators(
            'overrideMaxAmount',
            // max override must be greater than min override/min override must be less than max override
            CentralValidators.decimal({ decimalPlaces: 2 }),
            CentralValidators.numberGreaterThanValidator(form.getControl('overrideMinAmount')),
            // if min override value present, require max override
            CentralValidators.requiredIfFieldPresent(form, 'overrideMinAmount')
        );

        form.addFormControlValidators('maxUses', CentralValidators.integer({ min: 0, max: 999999 }));

        let typeControl = form.getControl('type');
        let amountControl = form.getControl('amount');
        let approachControl = form.getControl('approach');
        if (typeControl?.value?.code != DISCOUNT_LINE_ITEM) {
            amountControl.setValidators([Validators.required, CentralValidators.decimal({ decimalPlaces: 2 })]);
            approachControl.setValidators(Validators.required);
        }
        form.addFormValidationGroup('overrideMinAmount', 'overrideMaxAmount');

        // Max percentage
        form.addFormControlValidators('percentMaxAmount', CentralValidators.decimal({ decimalPlaces: 2 }));

        // Remove array based controls and re-add as FormArrays
        form.removeControl('discountCategories');
        // Build a FormArray for the discountCategories
        form.setControl(
            'discountCategories',
            this.formFactory.array('DiscountCategory', model.discountCategories, componentDestroyed, opts)
        );
        if (typeControl?.value?.code == DISCOUNT_LINE_ITEM) {
            form.getControl('discountCategories').setValidators(Validators.required);
            form.getArray('discountCategories').controls.forEach((c: FormGroup) => {
                const { amount, approach } = c.controls;
                amount.setValidators([Validators.required, CentralValidators.decimal({ decimalPlaces: 2 })]);
                approach.setValidators(Validators.required);
                amount.updateValueAndValidity();
                approach.updateValueAndValidity();
            });
        } else if (typeControl?.value?.code === DISCOUNT_EXCLUDE_LINE_ITEM) {
            form.getControl('discountCategories').setValidators(Validators.required);
        }
        form.updateValueAndValidity();
        // Trigger input validators to add/clear error messages to dependent inputs
        form.getControl('endDate')
            .valueChanges.pipe(takeUntil(componentDestroyed))
            .subscribe(() => form.getControl('expirationDate').updateValueAndValidity({ emitEvent: false }));
        form.getControl('expirationDate')
            .valueChanges.pipe(takeUntil(componentDestroyed))
            .subscribe(() => form.getControl('endDate').updateValueAndValidity({ emitEvent: false }));
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

    private readonly discountCategoriesFormCreator: FormCreator<DiscountCategory> = (
        model,
        componentDestroyed,
        opts
    ) => {
        return new TypedFormGroup<DiscountCategory>(this.formBuilder.group(model, opts), componentDestroyed);
    };
}
