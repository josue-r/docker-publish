import { AbstractControl, FormBuilder, ValidatorFn, Validators } from '@angular/forms';
// tslint:disable-next-line: nx-enforce-module-boundaries
import { InventoryOrder, InventoryOrderProduct } from '@vioc-angular/central-ui/inventory/data-access-inventory-order';
import { isNullOrUndefined } from '@vioc-angular/shared/common-functionality';
import {
    CentralValidators,
    FormCreator,
    FormErrorMapping,
    FormFactory,
    TypedFormGroup,
} from '@vioc-angular/shared/util-form';

/**
 * FormCreators for the entities that are maintained by the InventoryOrderModule.
 */
export class InventoryOrderForms {
    constructor(private readonly formBuilder: FormBuilder, private readonly formFactory: FormFactory) {}

    /**
     * Error mapping for the InventoryOrderProduct quantity validations.
     */
    static inventoryOrderErrorMapping = {
        invalidForMinOrderQuantity() {
            return 'Cannot be less than the Min Order Qty';
        },
        invalidForQuantityPerPack() {
            return 'Must be a multiple of Qty Per Pack';
        },
    } as FormErrorMapping;

    static registerForms(formFactory: FormFactory, formBuilder: FormBuilder) {
        const forms = new InventoryOrderForms(formBuilder, formFactory);
        formFactory.register('InventoryOrder', forms.inventoryOrderFormCreator);
        formFactory.register('InventoryOrderProduct', forms.inventoryOrderProductFormCreator);
    }

    private readonly inventoryOrderFormCreator: FormCreator<InventoryOrder> = (model, componentDestroyed, opts) => {
        const form = new TypedFormGroup<InventoryOrder>(this.formBuilder.group(model, opts), componentDestroyed);

        // Remove array based controls and re-add as FormArrays
        form.removeControl('inventoryOrderProducts');
        // Build a FormArray for the inventoryOrderProducts
        form.setControl(
            'inventoryOrderProducts',
            this.formFactory.array('InventoryOrderProduct', model.inventoryOrderProducts, componentDestroyed, opts)
        );

        // fields that are always disabled
        form.getControl('id').disable();
        form.getControl('status').disable();
        form.getControl('finalizedOn').disable();
        form.getControl('finalizedByEmployee').disable();
        form.getControl('createdOn').disable();
        form.getControl('createdByEmployee').disable();
        form.getControl('updatedOn').disable();
        form.getControl('updatedBy').disable();

        // default validations
        form.getControl('inventoryOrderProducts').setValidators(Validators.required);
        form.addFormControlValidators('comments', Validators.maxLength(255));
        if (opts.accessMode.isAdd) {
            form.addFormControlValidators('store', Validators.required);
            form.addFormControlValidators('vendor', Validators.required);
        } else if (opts.accessMode.isView) {
            form.disable();
        } else if (opts.accessMode.isEdit) {
            form.getControl('store').disable();
            form.getControl('vendor').disable();
        }
        return form;
    };

    private readonly inventoryOrderProductFormCreator: FormCreator<InventoryOrderProduct> = (
        model,
        componentDestroyed,
        opts
    ) => {
        const form = new TypedFormGroup<InventoryOrderProduct>(this.formBuilder.group(model, opts), componentDestroyed);

        // if field does not exist on a generated order product, create with default to suggested quantity
        if (opts.accessMode.isAdd && isNullOrUndefined(form.getControl('quantity'))) {
            form.addControl('quantity', this.formBuilder.control(form.getControlValue('suggestedQuantity')));
        }

        // fields that are always disabled
        form.getControl('secondLevelCategory').disable();
        form.getControl('uom').disable();
        form.getControl('minimumOrderQuantity').disable();
        form.getControl('quantityOnOrder').disable();
        form.getControl('suggestedQuantity').disable();
        form.getControl('quantityPerPack').disable();
        form.getControl('quantityOnHand').disable();
        form.getControl('averageDailyUsage').disable();

        // default validations
        if (opts.accessMode.isView) {
            form.disable();
        } else {
            if (model.uom.code === 'EACH') {
                form.addFormControlValidators(
                    'quantity',
                    Validators.required,
                    CentralValidators.integer({ min: 0 }),
                    this.quantityValidator(form)
                );
            } else {
                // Quantity can contain decimals if uom is not EACH, but cannot be negative
                form.addFormControlValidators(
                    'quantity',
                    Validators.required,
                    CentralValidators.decimal({ min: 0.0 }),
                    this.quantityValidator(form)
                );
            }
            form.addFormControlValidators('product', Validators.required);
        }
        return form;
    };

    /**
     * Validates the quantity of the InventoryOrderProduct against the minimumOrderQuantity and the quantityPerPack.
     * If the quantity is less than the minimumOrderQuantity then the validator will throw an invalidForMinOrderQuantity error.
     * If the difference between the quantity and the quantityPerPack is not equal to 0 then throw an invalidForQuantityPerPack error.
     *
     * @param compareControl AbstractControl to be compared with the control being validated.
     */
    private quantityValidator = (form: TypedFormGroup<InventoryOrderProduct>): ValidatorFn => {
        return (quantityControl: AbstractControl): { [key: string]: boolean } | null => {
            const minOrderQuantity = form.getControlValue('minimumOrderQuantity');
            const quantityPerPack = form.getControlValue('quantityPerPack');
            if (minOrderQuantity && quantityControl.value < minOrderQuantity) {
                return { invalidForMinOrderQuantity: true };
            } else if (quantityPerPack && quantityControl.value % quantityPerPack !== 0) {
                return { invalidForQuantityPerPack: true };
            }
            return null;
        };
    };
}
