import { FormBuilder, Validators } from '@angular/forms';
import {
    ReceiptOfMaterial,
    ReceiptOfMaterialProduct,
} from '@vioc-angular/central-ui/inventory/data-access-receipt-of-material';
import { CentralValidators, FormCreator, FormFactory, TypedFormGroup } from '@vioc-angular/shared/util-form';

export class ReceiptOfMaterialModuleForm {
    constructor(private readonly formBuilder: FormBuilder, private readonly formFactory: FormFactory) {}

    static registerForms(formFactory: FormFactory, formBuilder: FormBuilder) {
        const forms = new ReceiptOfMaterialModuleForm(formBuilder, formFactory);
        formFactory.register('ReceiptOfMaterial', forms.receiptOfMaterialFormCreator);
        formFactory.register('ReceiptOfMaterialProduct', forms.receiptOfMaterialProductFormCreator);
    }

    private readonly receiptOfMaterialFormCreator: FormCreator<ReceiptOfMaterial> = (
        model,
        componentDestroyed,
        opts
    ) => {
        const form = new TypedFormGroup<ReceiptOfMaterial>(this.formBuilder.group(model, opts), componentDestroyed);
        // Remove array based controls and re-add as FormArrays
        form.removeControl('receiptProducts');
        // Build a FormArray if there are any Receipt Products present.
        form.setControl(
            'receiptProducts',
            this.formFactory.array('ReceiptOfMaterialProduct', model.receiptProducts, componentDestroyed, opts)
        );
        // Require at least 1 product
        form.getControl('receiptProducts').setValidators(Validators.required);

        if (opts.accessMode.isAdd) {
            form.addFormControlValidators('store', Validators.required);
            form.addFormControlValidators('vendor', Validators.required);
            form.addFormControlValidators('receiptType', Validators.required);
        } else {
            form.getControl('store').disable();
            form.getControl('vendor').disable();
            form.getControl('receiptType').disable();
        }

        // The editable fields are receiptDate, poNumber, deliveryTicket, invoiceNumber, comments, and quantityReceived
        form.getControl('number').disable();
        form.getControl('shipTo').disable();
        form.getControl('status').disable();
        form.getControl('originalNumber').disable();
        form.getControl('source').disable();
        form.getControl('finalizedOn').disable();
        form.getControl('receiptDate').disable();
        form.addFormControlValidators('comments', Validators.maxLength(255));
        form.addFormControlValidators('poNumber', Validators.maxLength(10));
        form.addFormControlValidators('deliveryTicket', Validators.maxLength(10));
        form.addFormControlValidators('invoiceNumber', Validators.maxLength(10));
        return form;
    };

    private readonly receiptOfMaterialProductFormCreator: FormCreator<ReceiptOfMaterialProduct> = (
        v,
        componentDestroyed,
        opts
    ) => {
        const form = new TypedFormGroup<ReceiptOfMaterialProduct>(this.formBuilder.group(v, opts), componentDestroyed);
        form.addClearOnClearedListener('product', [
            'quantityReceived',
            'quantityOrdered',
            'wholesalePrice',
            'uom',
            'sapNumber',
            'secondLevelCategory',
        ]);

        //  Quantity Received is editable and required
        form.addFormControlValidators('quantityReceived', Validators.required);
        // Quantity Received has to be whole number if uom comparator is EACH and cannot be negative
        if (form.getControlValue('uom').code === 'EACH') {
            form.addFormControlValidators('quantityReceived', CentralValidators.integer({ min: 0 }));
        } else {
            // Quantity Received can contain decimals if uom is not EACH, but cannot be negative
            form.addFormControlValidators('quantityReceived', CentralValidators.decimal({ min: 0.0 }));
        }

        return form;
    };
}
