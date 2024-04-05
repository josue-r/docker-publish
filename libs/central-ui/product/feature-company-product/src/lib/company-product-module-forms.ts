import { FormBuilder, Validators } from '@angular/forms';
import { CompanyExportValidators } from '@vioc-angular/central-ui/organization/company/data-access-company-export';
import { CompanyProduct, CompanyProductMassAdd } from '@vioc-angular/central-ui/product/data-access-company-product';
import { Described, isNullOrUndefined } from '@vioc-angular/shared/common-functionality';
import { CentralValidators, FormCreator, FormFactory, TypedFormGroup } from '@vioc-angular/shared/util-form';

/**
 * Collection of FormCreators for entities maintained by the CompanyProductModule.
 */
export class CompanyProductModuleForms {
    constructor(
        private readonly formBuilder: FormBuilder,
        private readonly formFactory: FormFactory,
        private readonly companyExportValidators: CompanyExportValidators
    ) {}

    static registerForms(
        formFactory: FormFactory,
        formBuilder: FormBuilder,
        companyExportValidators: CompanyExportValidators
    ) {
        const forms = new CompanyProductModuleForms(formBuilder, formFactory, companyExportValidators);
        formFactory.register('CompanyProduct', forms.companyProductFormCreator);
        formFactory.register('CompanyProductMassAdd', forms.companyProductMassAddFormCreator);
    }

    /**
     * Creates a `Company Product` form with appropriate validators for edit screens.
     */
    private readonly companyProductFormCreator: FormCreator<CompanyProduct> = (model, componentDestroyed, opts) => {
        const form = new TypedFormGroup<CompanyProduct>(this.formBuilder.group(model, opts), componentDestroyed);
        form.addFormControlValidators('reportOrder', Validators.required, Validators.maxLength(6));

        if (opts.scope === 'GRID') {
            this.formFactory.extendGroup(form, 'costAccount', componentDestroyed, new Described());
            this.formFactory.extendGroup(form, 'salesAccount', componentDestroyed, new Described());
            const costAccountForm = form.getControl('costAccount') as TypedFormGroup<Described>;
            costAccountForm.addFormControlValidators(
                'code',
                CentralValidators.requiredIfFieldPresent(
                    form.getControl('salesAccount') as TypedFormGroup<Described>,
                    'code'
                )
            );
            costAccountForm
                .getControl('code')
                .setAsyncValidators(
                    this.companyExportValidators.costSalesAccountValidator(
                        costAccountForm,
                        form.getControlValue('company').code,
                        'COST',
                        opts.scope,
                        opts.companyExportFacade
                    )
                );

            const salesAccountForm = form.getControl('salesAccount') as TypedFormGroup<Described>;
            salesAccountForm.addFormControlValidators(
                'code',
                CentralValidators.requiredIfFieldPresent(costAccountForm, 'code')
            );
            salesAccountForm
                .getControl('code')
                .setAsyncValidators(
                    this.companyExportValidators.costSalesAccountValidator(
                        salesAccountForm,
                        form.getControlValue('company').code,
                        'SALES',
                        opts.scope,
                        opts.companyExportFacade
                    )
                );

            this.companyExportValidators.accountValueChangeValidation(
                form.getControl('costAccount').get('code'),
                form.getControl('salesAccount').get('code'),
                componentDestroyed
            );
        } else {
            form.addFormControlValidators(
                'costAccount',
                CentralValidators.requiredIfFieldPresent(form, 'salesAccount')
            );
            form.addFormControlValidators(
                'salesAccount',
                CentralValidators.requiredIfFieldPresent(form, 'costAccount')
            );
            this.companyExportValidators.accountValueChangeValidation(
                form.getControl('salesAccount'),
                form.getControl('costAccount'),
                componentDestroyed
            );
        }

        if (!isNullOrUndefined(form.getControlValue('product'))) {
            // product should not be editable if the company product has already been created
            form.getControl('product').disable({ emitEvent: false });
        }
        if (!isNullOrUndefined(form.getControlValue('company'))) {
            // company should not be editable if the company product has already been created
            form.getControl('company').disable({ emitEvent: false });
        }
        if (form.getControlValue('id') && form.getControlValue('active') === true) {
            // must go throught the deactivation process in case store products are active
            form.getControl('active').disable({ emitEvent: false });
        }
        if (isNullOrUndefined(form.getControlValue('active'))) {
            form.patchControlValue('active', true, { emitEvent: false });
        }
        form.addFormControlValidators('uom', Validators.required);
        return form;
    };

    private readonly companyProductMassAddFormCreator: FormCreator<CompanyProductMassAdd> = (
        model,
        componentDestroyed,
        opts
    ) => {
        const form = new TypedFormGroup<CompanyProductMassAdd>(this.formBuilder.group(model, opts), componentDestroyed);
        form.addFormControlValidators('company', Validators.required);
        form.addFormControlValidators('products', Validators.required, CentralValidators.arrayMinLength(1));
        form.removeControl('companyProduct');
        form.addControl(
            'companyProduct',
            this.formFactory.group('CompanyProduct', model.companyProduct, componentDestroyed, opts)
        );
        form.addFormControlValidators('preview', Validators.requiredTrue);
        return form;
    };
}
