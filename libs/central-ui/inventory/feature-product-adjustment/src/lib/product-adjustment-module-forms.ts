import { FormBuilder, Validators } from '@angular/forms';
import {
    ProductAdjustment,
    ProductAdjustmentDetail,
} from '@vioc-angular/central-ui/inventory/data-access-product-adjustment';
import { CentralValidators, FormCreator, FormFactory, TypedFormGroup } from '@vioc-angular/shared/util-form';

export class ProductAdjustmentForms {
    constructor(private readonly formBuilder: FormBuilder, private readonly formFactory: FormFactory) {}

    static registerForms(formFactory: FormFactory, formBuilder: FormBuilder) {
        const forms = new ProductAdjustmentForms(formBuilder, formFactory);
        formFactory.register('ProductAdjustment', forms.productAdjustmentFormCreator);
        formFactory.register('ProductAdjustmentDetail', forms.productAdjustmentDetailFormCreator);
    }

    private readonly productAdjustmentFormCreator: FormCreator<ProductAdjustment> = (
        model,
        componentDestroyed,
        opts
    ) => {
        const form = new TypedFormGroup<ProductAdjustment>(this.formBuilder.group(model, opts), componentDestroyed);

        // Remove array based controls and re-add as FormArrays
        form.removeControl('adjustmentProducts');
        // Build a FormArray for the productAdjustmentDetails
        form.setControl(
            'adjustmentProducts',
            this.formFactory.array('ProductAdjustmentDetail', model.adjustmentProducts, componentDestroyed, opts)
        );
        form.addFormControlValidators('adjustmentProducts', Validators.required, CentralValidators.arrayMinLength(1));

        // Disable fields and/or add validation
        if (opts.accessMode.isAdd) {
            form.addFormControlValidators('store', Validators.required);
        } else {
            form.getControl('store').disable();
        }

        // These fields should only be updated by the API
        form.getControl('id').disable();
        form.getControl('status').disable();
        form.getControl('createdDate').disable();
        form.getControl('createdByEmployee').disable();
        form.getControl('updatedOn').disable();
        form.getControl('updatedBy').disable();

        form.addFormControlValidators('comments', Validators.maxLength(255));

        return form;
    };

    private readonly productAdjustmentDetailFormCreator: FormCreator<ProductAdjustmentDetail> = (
        model,
        componentDestroyed,
        opts
    ) => {
        const form = new TypedFormGroup<ProductAdjustmentDetail>(
            this.formBuilder.group(model, opts),
            componentDestroyed
        );

        // These fields should only be updated by the API
        form.getControl('product').disable();
        form.getControl('unitOfMeasure').disable();

        form.addFormControlValidators('quantity', Validators.required);
        if (model.unitOfMeasure.code === 'EACH') {
            form.addFormControlValidators('quantity', CentralValidators.integer({ min: 1 }));
        } else {
            form.addFormControlValidators('quantity', CentralValidators.decimal({ min: 0.01 }));
        }
        form.getControl('quantity').enable();

        return form;
    };
}
