import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
// tslint:disable-next-line: nx-enforce-module-boundaries
import { CommonCode } from '@vioc-angular/central-ui/config/data-access-common-code';
import {
    CentralValidators,
    FormCreator,
    FormErrorMapping,
    FormFactory,
    FormFactoryOptions,
    TypedFormGroup,
} from '@vioc-angular/shared/util-form';

export class CommonCodeForms {
    constructor(private readonly formBuilder: FormBuilder, private readonly formFactory: FormFactory) {}

    /**
     * Error mapping for when the Common Code does not match the required pattern.
     */
    static commonCodeErrorMapping = {
        commonCodePatternError() {
            return 'Can only contain letters, numbers, and _';
        },
    } as FormErrorMapping;

    static registerForms(formFactory: FormFactory, formBuilder: FormBuilder) {
        const forms = new CommonCodeForms(formBuilder, formFactory);
        formFactory.register('CommonCode', forms.commonCodeFormCreator);
    }

    private readonly commonCodeFormCreator: FormCreator<CommonCode> = (model, componentDestroyed, opts) => {
        const form = new TypedFormGroup<CommonCode>(this.formBuilder.group(model, opts), componentDestroyed);
        FormFactoryOptions.validateRequiredOptions(opts, 'changeDetector');

        form.addFormControlValidators('type', Validators.required);
        form.addFormControlValidators(
            'code',
            Validators.required,
            Validators.maxLength(25),
            this.commonCodeValidator()
        );
        form.addFormControlValidators('reportOrder', Validators.required, CentralValidators.integer({ max: 999 }));
        form.addFormControlValidators('active', Validators.required);
        form.addFormControlValidators('description', Validators.required, Validators.maxLength(60));

        if (!opts.accessMode?.isAdd) {
            form.getControl('type').disable();
            form.getControl('code').disable();
        }
        return form;
    };

    private commonCodeValidator() {
        const regex = new RegExp(/^[A-Za-z0-9_]+$/);
        return (control: AbstractControl): ValidationErrors | null => {
            const errors = Validators.pattern(regex)(control);
            return errors ? { commonCodePatternError: true } : null;
        };
    }
}
