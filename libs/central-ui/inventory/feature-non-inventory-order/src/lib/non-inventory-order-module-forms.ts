import { AbstractControl, FormBuilder, ValidatorFn, Validators } from '@angular/forms';
// tslint:disable-next-line: nx-enforce-module-boundaries
import {
    NonInventoryOrder,
    NonInventoryOrderItem,
} from '@vioc-angular/central-ui/inventory/data-access-non-inventory-order';
import {
    CentralValidators,
    FormCreator,
    FormErrorMapping,
    FormFactory,
    TypedFormGroup,
} from '@vioc-angular/shared/util-form';

/**
 * FormCreators for the entities that are maintained by the NonInventoryOrderModule.
 */
export class NonInventoryOrderForms {
    constructor(private readonly formBuilder: FormBuilder, private readonly formFactory: FormFactory) {}

    /**
     * Error mapping for the NonInventoryOrderItem quantity validations.
     */
    static inventoryOrderErrorMapping = {
        invalidForMinOrderQuantity() {
            return 'Cannot be less than the Min Order Qty';
        },
        invalidForMaxOrderQuantity() {
            return 'Cannot be Greater than the Max Order Qty';
        },
        invalidForQuantityPerPack() {
            return 'Must be a multiple of Qty Per Pack';
        },
    } as FormErrorMapping;

    static registerForms(formFactory: FormFactory, formBuilder: FormBuilder) {
        const forms = new NonInventoryOrderForms(formBuilder, formFactory);
        formFactory.register('NonInventoryOrder', forms.nonInventoryOrderFormCreator);
        formFactory.register('NonInventoryOrderItem', forms.nonInventoryOrderItemFormCreator);
    }

    private readonly nonInventoryOrderFormCreator: FormCreator<NonInventoryOrder> = (
        model,
        componentDestroyed,
        opts
    ) => {
        const form = new TypedFormGroup<NonInventoryOrder>(this.formBuilder.group(model, opts), componentDestroyed);

        // Remove array based controls and re-add as FormArrays
        form.removeControl('nonInventoryOrderItems');
        // Build a FormArray for the nonInventoryOrderItems
        form.setControl(
            'nonInventoryOrderItems',
            this.formFactory.array('NonInventoryOrderItem', model.nonInventoryOrderItems, componentDestroyed, opts)
        );

        // fields that are always disabled
        form.getControl('id').disable();
        form.getControl('status').disable();
        form.getControl('orderDate').disable();
        form.getControl('orderNumber').disable();
        form.getControl('updatedByEmployee').disable();
        form.getControl('createdByEmployee').disable();
        form.getControl('updatedOn').disable();
        form.getControl('updatedBy').disable();

        // default validations
        form.getControl('nonInventoryOrderItems').setValidators(Validators.required);
        form.addFormControlValidators('comments', Validators.maxLength(255));
        if (opts.accessMode.isAdd) {
            form.addFormControlValidators('store', Validators.required);
        } else if (opts.accessMode.isView) {
            form.disable();
        } else if (opts.accessMode.isEdit) {
            form.getControl('store').disable();
        }
        return form;
    };

    private readonly nonInventoryOrderItemFormCreator: FormCreator<NonInventoryOrderItem> = (
        model,
        componentDestroyed,
        opts
    ) => {
        const form = new TypedFormGroup<NonInventoryOrderItem>(this.formBuilder.group(model, opts), componentDestroyed);
        if (model.uom.code === 'EACH') {
            form.addFormControlValidators(
                'quantity',
                Validators.required,
                CentralValidators.integer({ min: 1 }),
                this.quantityValidator(form)
            );
        } else {
            // Quantity can contain decimals if uom is not EACH, but cannot be negative
            form.addFormControlValidators(
                'quantity',
                Validators.required,
                CentralValidators.decimal({ min: 0.1 }),
                this.quantityValidator(form)
            );
        }
        form.addFormControlValidators('nonInventoryCatalog', Validators.required);
        return form;
    };

    private quantityValidator = (form: TypedFormGroup<NonInventoryOrderItem>): ValidatorFn => {
        return (quantityControl: AbstractControl): { [key: string]: boolean } | null => {
            const minOrderQuantity = form.getControlValue('nonInventoryCatalog')?.minimumQuantity;
            const maximumOrderQuantity = form.getControlValue('nonInventoryCatalog')?.maximumQuantity;
            const quantityPerPack = form.getControlValue('nonInventoryCatalog')?.quantityPerPack;
            if (quantityControl.value < minOrderQuantity) {
                return { invalidForMinOrderQuantity: true };
            } else if (quantityControl.value > maximumOrderQuantity) {
                return { invalidForMaxOrderQuantity: true };
            } else if (quantityControl.value % quantityPerPack) {
                return { invalidForQuantityPerPack: true };
            }
            return null;
        };
    };
}
