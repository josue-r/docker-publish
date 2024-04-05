import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { Service, ServiceProduct } from '@vioc-angular/central-ui/service/data-access-service';
import { isNullOrUndefined } from '@vioc-angular/shared/common-functionality';
import { FormCreator, FormFactory, TypedFormGroup } from '@vioc-angular/shared/util-form';

/**
 * Collection of FormCreators for entities maintained by the ServiceModule.
 *
 * @export
 */
export class ServiceCatalogModuleForms {
    constructor(private readonly formBuilder: FormBuilder, private readonly formFactory: FormFactory) {}

    static registerForms(formFactory: FormFactory, formBuilder: FormBuilder) {
        const forms = new ServiceCatalogModuleForms(formBuilder, formFactory);
        formFactory.register('Service', forms.serviceFormCreator);
        formFactory.register('ServiceProduct', forms.serviceProductFormCreator);
    }

    /**
     * Creates a `Service Catalog` form with the appropriate validators for edit screens.
     */
    private readonly serviceFormCreator: FormCreator<Service> = (model, componentDestroyed, options) => {
        const form = new TypedFormGroup<Service>(this.formBuilder.group(model, options), componentDestroyed);
        form.addFormControlValidators(
            'code',
            Validators.required,
            Validators.maxLength(15),
            this.serviceCodeInvalidPatternValidator()
        );

        if (!isNullOrUndefined(form.getControlValue('code'))) {
            form.getControl('code').disable({ emitEvent: false });
        }

        form.addFormControlValidators('description', Validators.required, Validators.maxLength(50));
        form.addFormControlValidators('serviceCategory', Validators.required);
        form.addFormControlValidators('active', Validators.required);

        if (form.getControlValue('active') === true) {
            // Deactivating must go through process incase company services are active
            form.getControl('active').disable({ emitEvent: false });
        }

        form.addFormControlValidators('requiresApproval', Validators.required);
        form.addFormControlValidators('supportsQuickSale', Validators.required);
        form.addFormControlValidators('supportsQuickInvoice', Validators.required);
        form.addFormControlValidators('supportsRegularInvoice', Validators.required);
        form.addFormControlValidators('supportsRefillInvoice', Validators.required);
        form.addFormControlValidators('supportsTireCheckInvoice', Validators.required);

        // Remove the serviceProducts Array and create formArray if present
        form.removeControl('serviceProducts');
        if (!isNullOrUndefined(model.serviceProducts)) {
            // Default to disabled.  Should enable if necessary afterwards
            const serviceProductsFA = this.formFactory.array(
                'ServiceProduct',
                model.serviceProducts,
                componentDestroyed,
                options
            );
            form.addControl('serviceProducts', serviceProductsFA);
        }

        // supportsECommerce defaults to null, convert to false
        if (isNullOrUndefined(form.getControlValue('supportsECommerce'))) {
            form.setControlValue('supportsECommerce', false);
        }

        return form;
    };

    private readonly serviceProductFormCreator: FormCreator<ServiceProduct> = (model, componentDestroyed, opts) => {
        // Default to disabled.  Will enable if necessary
        const form = new TypedFormGroup<ServiceProduct>(this.formBuilder.group(model, opts), componentDestroyed);
        form.addFormControlValidators('productCategory', Validators.required);
        form.addFormControlValidators('defaultQuantity', Validators.min(0));
        return form;
    };

    private serviceCodeInvalidPatternValidator() {
        const regex = new RegExp(/^[A-Za-z0-9][A-Za-z0-9 .-]*$/);
        return (control: AbstractControl): ValidationErrors | null => {
            const errors = Validators.pattern(regex)(control);
            return errors ? { serviceCodeInvalidPattern: true } : null;
        };
    }
}
