import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import {
    ProductCategory,
    ProductCategoryMotorInfo,
} from '@vioc-angular/central-ui/product/data-access-product-category';
import {
    CentralValidators,
    FormCreator,
    FormErrorMapping,
    FormFactory,
    FormFactoryOptions,
    TypedFormGroup,
} from '@vioc-angular/shared/util-form';

/**
 * Collection of FormCreators for entities maintained by the ProductCategoryModule.
 */
export class ProductCategoryModuleForms {
    constructor(private readonly formBuilder: FormBuilder, private readonly formFactory: FormFactory) {}

    /**
     * Error mapping for when the Product Category Code does not match the required pattern.
     */
    static productCategoryCodeErrorMapping = {
        productCategoryCodePatternError() {
            return 'Can only contain capital letters, numbers, - and spaces';
        },
    } as FormErrorMapping;

    static registerForms(formFactory: FormFactory, formBuilder: FormBuilder) {
        const forms = new ProductCategoryModuleForms(formBuilder, formFactory);
        formFactory.register('ProductCategory', forms.productCategoryFormCreator);
        formFactory.register('ProductCategoryMotorInfo', forms.productCategoryMotorInfoFormCreator);
    }

    /**
     * Creates a `Product Category` form without validators for view screens.
     */
    private readonly productCategoryFormCreator: FormCreator<ProductCategory> = (model, componentDestroyed, opts) => {
        const form = new TypedFormGroup<ProductCategory>(this.formBuilder.group(model, opts), componentDestroyed);
        FormFactoryOptions.validateRequiredOptions(opts, 'changeDetector');

        form.removeControl('motorInfo');
        // Build a FormGroup if motorInfo is present
        const motorInfo = {
            primaryTable: undefined,
            primaryColumn: undefined,
            secondaryTable: undefined,
            secondaryColumn: undefined,
        } as ProductCategoryMotorInfo;
        form.setControl(
            'motorInfo',
            this.formFactory.group(
                'ProductCategoryMotorInfo',
                model.motorInfo ? model.motorInfo : motorInfo,
                componentDestroyed,
                opts
            )
        );

        form.addFormControlValidators(
            'code',
            Validators.required,
            Validators.maxLength(25),
            this.productCategoryCodeValidator()
        );
        form.addFormControlValidators('description', Validators.required, Validators.maxLength(50));
        form.addFormControlValidators('active', Validators.required);
        form.addFormControlValidators('productRatingPriority', CentralValidators.integer({ max: 999 }));
        form.addFormControlValidators('nacsProductCode', Validators.required);
        form.addFormControlValidators('reportOrder', CentralValidators.integer({ max: 999_999 }));

        if (!opts.accessMode?.isAdd) {
            // Disable the active field if the Product Category is already active
            // This is a temporary change until there is a check added for finding active products using this category
            if (form.getControlValue('active')) {
                form.getControl('active').disable();
            }
            form.getControl('code').disable();
        }
        return form;
    };

    private readonly productCategoryMotorInfoFormCreator: FormCreator<ProductCategoryMotorInfo> = (
        model,
        componentDestroyed,
        opts
    ) => {
        const form = new TypedFormGroup<ProductCategoryMotorInfo>(
            this.formBuilder.group(model, opts),
            componentDestroyed
        );
        form.addFormControlValidators(
            'primaryTable',
            Validators.maxLength(100),
            CentralValidators.requiredIfFieldPresent(form, 'secondaryTable')
        );
        form.addFormControlValidators(
            'primaryColumn',
            Validators.maxLength(100),
            CentralValidators.requiredIfFieldPresent(form, 'secondaryColumn')
        );
        // form validation group added at the bottom
        form.addRequiredFieldGrouping(['primaryTable', 'primaryColumn'], 'primaryMotorInfo', {
            addFormValidationGroup: false,
        });

        form.addFormControlValidators('secondaryTable', Validators.maxLength(100));
        form.addFormControlValidators('secondaryColumn', Validators.maxLength(100));
        // form validation group added at the bottom
        form.addRequiredFieldGrouping(['secondaryTable', 'secondaryColumn'], 'secondaryMotorInfo', {
            addFormValidationGroup: false,
        });

        // Necessary because of `requiredIfFieldPresent` on the primary table/column
        form.addFormValidationGroup('primaryTable', 'primaryColumn', 'secondaryTable', 'secondaryColumn');
        return form;
    };

    private productCategoryCodeValidator() {
        const regex = new RegExp(/^[A-Z0-9 -]+$/);
        return (control: AbstractControl): ValidationErrors | null => {
            const errors = Validators.pattern(regex)(control);
            return errors ? { productCategoryCodePatternError: true } : null;
        };
    }
}
