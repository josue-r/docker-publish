import { FormBuilder, Validators } from '@angular/forms';
import { DefectiveProduct } from '@vioc-angular/central-ui/inventory/data-access-defective-product';
import { CentralValidators, FormCreator, FormFactory, TypedFormGroup } from '@vioc-angular/shared/util-form';

export class DefectiveProductModuleForm {
    constructor(private readonly formBuilder: FormBuilder, private readonly formFactory: FormFactory) {}

    static registerForms(formFactory: FormFactory, formBuilder: FormBuilder) {
        const forms = new DefectiveProductModuleForm(formBuilder, formFactory);
        formFactory.register('DefectiveProduct', forms.defectiveProductFormCreator);
    }

    private readonly defectiveProductFormCreator: FormCreator<DefectiveProduct> = (model, componentDestroyed, opts) => {
        const form = new TypedFormGroup<DefectiveProduct>(this.formBuilder.group(model, opts), componentDestroyed);

        if (opts.accessMode.isAdd) {
            form.getControl('defectDate').disable();
            form.getControl('updatedBy').disable();
            form.getControl('updatedOn').disable();
            form.addFormControlValidators('store', Validators.required);
            form.addFormControlValidators('product', Validators.required);
            form.addFormControlValidators('vendor', Validators.required);
            form.addFormControlValidators('reason', Validators.required);
            form.addFormControlValidators('comments', Validators.maxLength(255));
            form.addFormControlValidators('quantity', Validators.required);
            if (model.storeProduct?.companyProduct?.uom.code === 'EACH') {
                form.addFormControlValidators('quantity', CentralValidators.integer({ min: 1 }));
            } else {
                form.addFormControlValidators('quantity', CentralValidators.decimal({ min: 0.01 }));
            }
        }
        return form;
    };
}
