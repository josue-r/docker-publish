import { FormBuilder, Validators } from '@angular/forms';
import {
    InventoryTransfer,
    InventoryTransferProduct,
} from '@vioc-angular/central-ui/inventory/data-access-inventory-transfer';
import { CentralValidators, FormCreator, FormFactory, TypedFormGroup } from '@vioc-angular/shared/util-form';

export class InventoryTransferForms {
    constructor(private readonly formBuilder: FormBuilder, private readonly formFactory: FormFactory) {}

    static registerForms(formFactory: FormFactory, formBuilder: FormBuilder) {
        const forms = new InventoryTransferForms(formBuilder, formFactory);
        formFactory.register('InventoryTransfer', forms.inventoryTransferFormCreator);
        formFactory.register('InventoryTransferProduct', forms.inventoryTransferProductFormCreator);
    }

    private readonly inventoryTransferFormCreator: FormCreator<InventoryTransfer> = (
        model,
        componentDestroyed,
        opts
    ) => {
        const form = new TypedFormGroup<InventoryTransfer>(this.formBuilder.group(model, opts), componentDestroyed);

        form.addFormControlValidators('carrier', Validators.maxLength(60));
        // Remove array based controls and re-add as FormArrays
        form.removeControl('inventoryTransferProducts');
        // Build a FormArray for the inventoryTransferProducts
        form.setControl(
            'inventoryTransferProducts',
            this.formFactory.array(
                'InventoryTransferProduct',
                model.inventoryTransferProducts,
                componentDestroyed,
                opts
            )
        );
        form.addFormControlValidators('inventoryTransferProducts', CentralValidators.arrayMinLength(1));
        // Disable fields and/or add validation
        if (opts.accessMode.isAdd) {
            form.addFormControlValidators('fromStore', Validators.required);
            form.addFormControlValidators('toStore', Validators.required);
        } else {
            form.getControl('fromStore').disable();
            form.getControl('toStore').disable();
        }

        // These fields should only be updated by the API
        form.getControl('id').disable();
        form.getControl('status').disable();
        form.getControl('createdOn').disable();
        form.getControl('createdByEmployee').disable();
        form.getControl('finalizedOn').disable();
        form.getControl('finalizedByEmployee').disable();

        return form;
    };

    private readonly inventoryTransferProductFormCreator: FormCreator<InventoryTransferProduct> = (
        model,
        componentDestroyed,
        opts
    ) => {
        const form = new TypedFormGroup<InventoryTransferProduct>(
            this.formBuilder.group(model, opts),
            componentDestroyed
        );
        form.getControl('product').disable();
        form.getControl('uom').disable();
        form.getControl('version').disable();
        form.getControl('quantityOnHand').disable();

        form.addFormControlValidators('quantity', Validators.required);
        if (model.uom.code === 'EACH') {
            form.addFormControlValidators('quantity', CentralValidators.integer({ min: 1 }));
        } else {
            form.addFormControlValidators('quantity', CentralValidators.decimal({ min: 0.01 }));
        }
        form.getControl('quantity').enable();

        return form;
    };
}
