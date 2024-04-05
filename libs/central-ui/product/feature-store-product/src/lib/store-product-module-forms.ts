import { AbstractControl, FormBuilder, ValidatorFn, Validators } from '@angular/forms';
import {
    StoreProduct,
    StoreProductMassAdd,
    StoreProductMassUpdate,
} from '@vioc-angular/central-ui/product/data-access-store-product';
import { isNullOrUndefined } from '@vioc-angular/shared/common-functionality';
import {
    CentralValidators,
    FormCreator,
    FormErrorMapping,
    FormFactory,
    FormFactoryOptions,
    TypedFormGroup,
} from '@vioc-angular/shared/util-form';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/**
 * Collection of FormCreators for entities maintained by the StoreProductModule.
 */
export class StoreProductModuleForms {
    constructor(private readonly formBuilder: FormBuilder, private readonly formFactory: FormFactory) {}

    /**
     * Error mapping for when minimum order is less than quantity per pack.
     */
    static minOrderQuantityErrorMapping = {
        // key must match corresponding validator error
        invalidMinOrderQuantity() {
            return 'Must be a multiple of Quantity Per Pack';
        },
    } as FormErrorMapping;

    static registerForms(formFactory: FormFactory, formBuilder: FormBuilder) {
        const forms = new StoreProductModuleForms(formBuilder, formFactory);
        formFactory.register('StoreProduct', forms.storeProductFormCreator);
        // storeProductMassAddFormCreator depends on storeProductFormCreator, so must be registered after it
        formFactory.register('StoreProductMassAdd', forms.storeProductMassAddFormCreator);
        // TODO: Enable with MassUpdate
        formFactory.register('StoreProductMassUpdate', forms.storeProductMassUpdateFormCreator);
    }

    /**
     * Creates a `Store Product` form with appropriate validators for edit screens.
     */
    private readonly storeProductFormCreator: FormCreator<StoreProduct> = (model, componentDestroyed, opts) => {
        const form = new TypedFormGroup<StoreProduct>(this.formBuilder.group(model, opts), componentDestroyed);
        if (opts.accessMode && opts.accessMode.isAddLike) {
            // Cloning to a new store
            form.getControl('store').setValidators(Validators.required);
            form.patchControlValue('store', undefined, { emitEvent: false });
            // override active in case of cloning an inactive StoreProduct
            form.patchControlValue('active', true, { emitEvent: false });
        } else {
            // product should not be editable in view or edit and will be assigned during mass add
            form.getControl('product').disable({ emitEvent: false });
            // store should not be editable in view or edit and will be assigned during mass add
            form.getControl('store').disable({ emitEvent: false });
        }

        if (opts.scope === 'GRID') {
            form.getControl('active').disable({ emitEvent: false });
        }

        form.getControl('averageDailyUsage').disable({ emitEvent: false });
        form.getControl('quantityOnHand').disable({ emitEvent: false });

        const massUpdate = opts.scope === 'MASS-UPDATE';
        if (!massUpdate) {
            // Default values
            if (isNullOrUndefined(form.getControlValue('active'))) {
                form.patchControlValue('active', true, { emitEvent: false });
            }
            if (isNullOrUndefined(form.getControlValue('taxable'))) {
                form.patchControlValue('taxable', true, { emitEvent: false });
            }
            if (isNullOrUndefined(form.getControlValue('overridable'))) {
                form.patchControlValue('overridable', false, { emitEvent: false });
            }
            if (isNullOrUndefined(form.getControlValue('minMaxOverridable'))) {
                form.patchControlValue('minMaxOverridable', false, { emitEvent: false });
            }
            if (isNullOrUndefined(form.getControlValue('includeInCount'))) {
                form.patchControlValue('includeInCount', true, { emitEvent: false });
            }

            form.getControl('overridable')
                .valueChanges.pipe(takeUntil(componentDestroyed))
                .subscribe((value) => {
                    if (value) {
                        form.getControl('minOverridePrice').enable();
                        form.getControl('maxOverridePrice').enable();
                        form.getControl('minMaxOverridable').enable();
                    } else {
                        form.getControl('minOverridePrice').disable();
                        form.getControl('maxOverridePrice').disable();
                        form.getControl('minMaxOverridable').disable();
                    }
                });
            form.getControl('overridable').updateValueAndValidity();
        }

        const requiredCondition = massUpdate ? 'if-dirty' : 'always';
        form.addFormControlValidators('taxable', CentralValidators.required(requiredCondition));
        form.addFormControlValidators('overridable', CentralValidators.required(requiredCondition));
        form.addFormControlValidators('includeInCount', CentralValidators.required(requiredCondition));
        // TODO: The following are required because they're NOTNULL in the db, but probably should only be required based on the includeInCount field
        form.addFormControlValidators('countFrequency', CentralValidators.required(requiredCondition));
        form.addFormControlValidators('reportOrder', CentralValidators.required(requiredCondition));

        form.addFormControlValidators('wholesalePrice', CentralValidators.required(requiredCondition));
        form.addFormControlValidators('retailPrice', CentralValidators.required(requiredCondition));

        form.addFormControlValidators('quantityPerPack', CentralValidators.required(requiredCondition));
        form.addFormControlValidators('minOrderQuantity', CentralValidators.required(requiredCondition));

        form.addFormControlValidators('active', CentralValidators.required(requiredCondition));
        form.addFormControlValidators('minMaxOverridable', CentralValidators.required(requiredCondition));

        this.storeProductFormValidations(form, opts);

        return form;
    };

    private readonly storeProductMassUpdateFormCreator: FormCreator<StoreProductMassUpdate> = (
        model,
        componentDestroyed,
        opts
    ) => {
        const form = new TypedFormGroup<StoreProductMassUpdate>(
            this.formBuilder.group(model, opts),
            componentDestroyed
        );
        form.addFormControlValidators('stores', Validators.required, CentralValidators.arrayMinLength(1));
        form.addFormControlValidators('products', Validators.required, CentralValidators.arrayMinLength(1));

        const patchForm = this.formFactory.group<StoreProduct>('StoreProduct', model.patch, componentDestroyed, {
            ...opts,
            scope: 'MASS-UPDATE',
        });
        form.setControl('patch', patchForm);

        // Validates that the entered data in the store product edit step is valid and that a field has been selected/updated.
        const requiredFieldSelection = (control: TypedFormGroup<StoreProduct>) => {
            const keys = Object.keys(control.controls);
            return keys.every((key) => control.get(key).valid || control.get(key).disabled) &&
                keys.some((key) => control.get(key).dirty)
                ? null
                : { required: true };
        };
        form.addFormControlValidators('patch', requiredFieldSelection);
        return form;
    };

    /**
     * Adds validators for a `Store Product` form with appropriate edit form.
     */
    private storeProductFormValidations(
        form: TypedFormGroup<StoreProduct>,
        opts: FormFactoryOptions
    ): TypedFormGroup<StoreProduct> {
        /**
         * Validates if the control value is less than the compareControl value. If so,
         * then the control is flagged as invalid.
         *
         * @param compareControl AbstractControl to be compared with the control being validated.
         */
        const minOrderQuantityValidator = (): ValidatorFn => {
            return (minOrderQuantityControl: AbstractControl): { [key: string]: boolean } | null => {
                const quantityPerPackControl = form.getControl('quantityPerPack');
                if (
                    minOrderQuantityControl.value &&
                    quantityPerPackControl.value &&
                    minOrderQuantityControl.value % quantityPerPackControl.value !== 0
                ) {
                    return { invalidMinOrderQuantity: true };
                }
                return null;
            };
        };

        const massUpdate = opts.scope === 'MASS-UPDATE';
        const requiredCondition = massUpdate ? 'if-dirty' : 'always';
        form.addFormControlValidators('vendor', CentralValidators.required(requiredCondition));
        form.addFormControlValidators(
            'reportOrder',
            CentralValidators.required(requiredCondition),
            Validators.maxLength(6)
        );

        form.addFormControlValidators(
            'wholesalePrice',
            CentralValidators.required(requiredCondition),
            Validators.min(0),
            CentralValidators.decimal({ decimalPlaces: 3 })
        );
        form.addFormControlValidators(
            'retailPrice',
            CentralValidators.required(requiredCondition),
            CentralValidators.currency()
        );

        // Price Overrides
        //
        form.addFormControlValidators(
            'minOverridePrice',
            CentralValidators.currency(),
            CentralValidators.requiredIfFieldChecked(form, 'overridable')
        );
        form.addFormControlValidators(
            'maxOverridePrice',
            CentralValidators.currency(),
            CentralValidators.requiredIfFieldChecked(form, 'overridable'),
            CentralValidators.numberGreaterThanValidator(form.getControl('minOverridePrice'))
        );
        form.addFormValidationGroup('overridable', 'minOverridePrice', 'maxOverridePrice');

        // Stock Limits
        //
        form.addFormControlValidators(
            'maxStockLimit',
            CentralValidators.decimal({ max: 99999.99 }),
            CentralValidators.numberGreaterThanValidator(form.getControl('minStockLimit'))
        );
        form.addFormControlValidators(
            'minStockLimit',
            CentralValidators.decimal({ min: 0 }),
            // if minStockEndDate, require min stock amount
            CentralValidators.requiredIfFieldPresent(form, 'minStockLimitEndDate')
        );
        form.addFormValidationGroup('minStockLimit', 'minStockLimitEndDate');

        form.addFormControlValidators('safetyFactorOverride', CentralValidators.decimal());
        form.addFormControlValidators(
            'quantityPerPack',
            CentralValidators.required(requiredCondition),
            CentralValidators.integer({ min: 1 })
        );
        form.addFormControlValidators(
            'minOrderQuantity',
            CentralValidators.required(requiredCondition),
            CentralValidators.integer({ min: 1 }),
            minOrderQuantityValidator()
        );
        // if quantityPerPack or minOrderQuantity are updated, retrigger validation on the other
        form.addFormValidationGroup('quantityPerPack', 'minOrderQuantity');

        // all scheduled price change fields are required if any are set
        // by default if any scheduled price change fields are updated, it re-triggers validation on the others
        form.addRequiredFieldGrouping(['schedulePriceChange', 'schedulePriceDate'], 'retailPriceChange');

        form.addFormControlValidators('schedulePriceDate', CentralValidators.dateAfterTodayValidator());
        form.addFormControlValidators('schedulePriceChange', CentralValidators.currency());

        // all wholesalePriceChange fields are required if any are set
        // by default if any wholesalePriceChange fields are updated, it re-triggers validation on the others
        form.addRequiredFieldGrouping(['wholesalePriceChangeDate', 'wholesalePriceChange'], 'wholesalePriceChange');

        form.addFormControlValidators('wholesalePriceChangeDate', CentralValidators.dateAfterTodayValidator());
        form.addFormControlValidators('wholesalePriceChange', CentralValidators.decimal({ decimalPlaces: 3, min: 0 }));

        // all promotional fields are required if any are set
        // by default if any promotional fields are updated, it re-triggers validation on the others
        form.addRequiredFieldGrouping(
            ['promotionPriceStartDate', 'promotionPrice', 'promotionPriceEndDate'],
            'promotion'
        );

        form.addFormControlValidators(
            'promotionPriceEndDate',
            CentralValidators.dateAfterValidator(form.getControl('promotionPriceStartDate'))
        );
        form.addFormControlValidators('promotionPrice', CentralValidators.currency());

        // extra charge amount and description are required if either are set
        // by default if any extra charge fields are updated, it re-triggers validation on the others
        form.addRequiredFieldGrouping(['extraChargeAmount', 'extraChargeDescription'], 'extraCharge');

        // Once it is set, default taxable to checked
        form.addDefaultWhenSetListener('extraChargeAmount', 'extraChargeTaxable', true);

        if (opts.scope !== 'GRID') {
            // if wholesalePriceChangeDate is cleared, clear wholesalePriceChange.
            form.addClearOnClearedListener('wholesalePriceChangeDate', ['wholesalePriceChange']);
            // if promotionPriceStartDate is cleared, clear promotionPrice and promotionPriceEndDate
            form.addClearOnClearedListener('promotionPriceStartDate', ['promotionPriceEndDate', 'promotionPrice']);
            // if extraChargeAmount is cleared, clear extraChargeDescription and extraChargeTaxable
            form.addClearOnClearedListener('extraChargeAmount', ['extraChargeDescription', 'extraChargeTaxable']);
            // if schedulePriceDate is cleared, clear schedulePriceChange.
            form.addClearOnClearedListener('schedulePriceDate', ['schedulePriceChange']);
        }
        return form;
    }

    /**
     * Create a `StoreProductMassAdd` form building upon the above `StoreProduct` validation. To be used on the add store product screen.
     */
    private readonly storeProductMassAddFormCreator: FormCreator<StoreProductMassAdd> = (
        model,
        componentDestroyed,
        opts
    ) => {
        const form = new TypedFormGroup<StoreProductMassAdd>(this.formBuilder.group(model, opts), componentDestroyed);
        // Default useDefaultVendor and useDefaultReportOrder to true
        if (isNullOrUndefined(form.getControlValue('useDefaultVendor'))) {
            form.patchControlValue('useDefaultVendor', true, { emitEvent: false });
        }
        if (isNullOrUndefined(form.getControlValue('useDefaultReportOrder'))) {
            form.patchControlValue('useDefaultReportOrder', true, { emitEvent: false });
        }
        // Require at least one store and one product
        form.addFormControlValidators('stores', Validators.required, CentralValidators.arrayMinLength(1));
        form.addFormControlValidators('products', Validators.required, CentralValidators.arrayMinLength(1));
        // Start with the standard StoreProduct validation
        const storeProductForm = this.formFactory.group<StoreProduct>(
            'StoreProduct',
            model.storeProduct,
            componentDestroyed,
            opts
        );
        this.requiredOrDefaulted(
            storeProductForm.getControl('vendor'),
            form.getControl('useDefaultVendor'),
            componentDestroyed
        );
        this.requiredOrDefaulted(
            storeProductForm.getControl('reportOrder'),
            form.getControl('useDefaultReportOrder'),
            componentDestroyed,
            Validators.maxLength(6)
        );
        form.setControl('storeProduct', storeProductForm);
        return form;
    };

    /** Replaces existing validation with custom logic to include a 'use default' checkbox's control. */
    private requiredOrDefaulted(
        valueControl: AbstractControl,
        defaultedControl: AbstractControl,
        componentDestroyed: ReplaySubject<any>,
        ...additionalValidators: ValidatorFn[]
    ) {
        const isEmptyValue = (value: any) => value == null || value.length === 0;
        const requiredOrDefaultedValidator = (control: AbstractControl): { [key: string]: boolean } | null => {
            if (isEmptyValue(control.value) && !defaultedControl.value) {
                return { requiredOrDefaulted: true };
            }
            return null;
        };
        // Configure validation
        valueControl.setValidators([requiredOrDefaultedValidator, ...additionalValidators]);
        // Clear out & revalidate value if using default
        defaultedControl.valueChanges.pipe(takeUntil(componentDestroyed)).subscribe((value: boolean) => {
            if (value) {
                valueControl.patchValue(null, { emitEvent: false });
            }
            valueControl.markAsTouched();
            valueControl.updateValueAndValidity({ emitEvent: false });
        });
        // Use default if not providing a value, and uncheck if providing a value
        valueControl.valueChanges.pipe(takeUntil(componentDestroyed)).subscribe((value) => {
            if (isEmptyValue(value)) {
                defaultedControl.patchValue(true, { emitEvent: false });
            } else {
                defaultedControl.patchValue(false, { emitEvent: false });
            }
        });
    }
}
