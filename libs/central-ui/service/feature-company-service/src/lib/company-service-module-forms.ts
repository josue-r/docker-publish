import { FormBuilder, Validators } from '@angular/forms';
import { CompanyExportValidators } from '@vioc-angular/central-ui/organization/company/data-access-company-export';
import { CompanyService, CompanyServiceMassAdd } from '@vioc-angular/central-ui/service/data-access-company-service';
import { Described, isNullOrUndefined } from '@vioc-angular/shared/common-functionality';
import { CentralValidators, FormCreator, FormFactory, TypedFormGroup } from '@vioc-angular/shared/util-form';

/**
 * Collection of FormCreators for entities maintained by the CompanyServiceModule.
 *
 * @export
 */
export class CompanyServiceModuleForms {
    constructor(
        private readonly formFactory: FormFactory,
        private readonly fb: FormBuilder,
        private readonly companyExportValidators: CompanyExportValidators
    ) {}

    static registerForms(formFactory: FormFactory, fb: FormBuilder, companyExportValidators: CompanyExportValidators) {
        const forms = new CompanyServiceModuleForms(formFactory, fb, companyExportValidators);
        formFactory.register('CompanyService', forms.companyServiceFormCreator);
        formFactory.register('CompanyServiceMassAdd', forms.companyServiceMassAddFormCreator);
    }

    private readonly companyServiceFormCreator: FormCreator<CompanyService> = (cs, componentDestroyed, opts) => {
        const form = new TypedFormGroup<CompanyService>(this.fb.group(cs, opts), componentDestroyed);
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
            form.addFormValidationGroup('costAccount', 'salesAccount');
        }

        // only disable active if it is true and an existing record
        if (form.getControlValue('id') && form.getControlValue('active') === true) {
            // Deactivating must go through process incase store services are active
            form.getControl('active').disable({ emitEvent: false });
        }

        if (isNullOrUndefined(form.getControlValue('active'))) {
            form.patchControlValue('active', true, { emitEvent: false });
        }

        form.addFormControlValidators('pricingStrategy', Validators.required);

        if (!isNullOrUndefined(form.getControlValue('service'))) {
            form.getControl('service').disable({ emitEvent: false });
        }
        if (!isNullOrUndefined(form.getControlValue('company'))) {
            form.getControl('company').disable({ emitEvent: false });
        }
        return form;
    };

    private readonly companyServiceMassAddFormCreator: FormCreator<CompanyServiceMassAdd> = (
        model,
        componentDestroyed,
        opts
    ) => {
        const form = new TypedFormGroup<CompanyServiceMassAdd>(this.fb.group(model, opts), componentDestroyed);
        form.addFormControlValidators('companies', Validators.required);
        form.addFormControlValidators('services', Validators.required, CentralValidators.arrayMinLength(1));
        form.removeControl('companyService');
        form.addControl(
            'companyService',
            this.formFactory.group('CompanyService', model.companyService, componentDestroyed, opts)
        );
        form.addFormControlValidators('preview', Validators.requiredTrue);
        return form;
    };
}
