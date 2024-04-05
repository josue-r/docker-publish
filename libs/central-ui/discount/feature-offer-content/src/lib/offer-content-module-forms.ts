import { FormBuilder, Validators } from '@angular/forms';
import { OfferContent } from '@vioc-angular/central-ui/discount/data-access-offer-content';
import { FormCreator, FormFactory, FormFactoryOptions, TypedFormGroup } from '@vioc-angular/shared/util-form';

/**
 * Collection of FormCreators for entities maintained by the OfferContentModule.
 */
export class OfferContentModuleForms {
    constructor(private readonly formBuilder: FormBuilder, private readonly formFactory: FormFactory) {}

    static registerForms(formFactory: FormFactory, formBuilder: FormBuilder) {
        const forms = new OfferContentModuleForms(formBuilder, formFactory);
        formFactory.register('OfferContent', forms.offerContentFormCreator);
    }

    /**
     * Creates a `Offer Content` form without validators for view screens.
     */
    private readonly offerContentFormCreator: FormCreator<OfferContent> = (model, componentDestroyed, opts) => {
        const form = new TypedFormGroup<OfferContent>(this.formBuilder.group(model, opts), componentDestroyed);
        FormFactoryOptions.validateRequiredOptions(opts, 'changeDetector');

        form.addFormControlValidators('active', Validators.required);
        form.addFormControlValidators('name', Validators.required, Validators.maxLength(100));
        form.addFormControlValidators('shortText', Validators.required, Validators.maxLength(512));
        form.addFormControlValidators('longText', Validators.maxLength(2000));
        form.addFormControlValidators('disclaimerShortText', Validators.maxLength(512));
        form.addFormControlValidators('disclaimerLongText', Validators.maxLength(2000));
        form.addFormControlValidators('conditions', Validators.maxLength(2000));

        return form;
    };
}
