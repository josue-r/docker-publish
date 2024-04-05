import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, AsyncValidatorFn, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { Product, ProductFacade, ProductMotorMapping } from '@vioc-angular/central-ui/product/data-access-product';
import { ProductCategoryFacade } from '@vioc-angular/central-ui/product/data-access-product-category';
import { isNullOrUndefined } from '@vioc-angular/shared/common-functionality';
import { instanceOfApiErrorResponse } from '@vioc-angular/shared/util-api';
import {
    FormCreator,
    FormErrorMapping,
    FormFactory,
    FormFactoryOptions,
    TypedFormGroup,
} from '@vioc-angular/shared/util-form';
import { Observable, of } from 'rxjs';
import { catchError, map, pairwise, startWith, takeUntil } from 'rxjs/operators';

export class ProductModuleForms {
    constructor(private readonly formBuilder: FormBuilder, private readonly formFactory: FormFactory) {}

    static categoryErrorMapping = {
        categoryInvalid() {
            return 'Category is inactive or a parent. Please select a new one or resolve category issues.';
        },
    } as FormErrorMapping;

    static registerForms(formFactory: FormFactory, formBuilder: FormBuilder) {
        const forms = new ProductModuleForms(formBuilder, formFactory);
        formFactory.register('Product', forms.productFormCreator);
        formFactory.register('ProductMotorMapping', forms.productMotorMappingFormCreator);
    }

    private readonly productFormCreator: FormCreator<Product> = (model, componentDestroyed, opts) => {
        const form = new TypedFormGroup<Product>(this.formBuilder.group(model, opts), componentDestroyed);
        FormFactoryOptions.validateRequiredOptions(opts, 'changeDetector');
        form.addFormControlValidators(
            'code',
            Validators.required,
            Validators.maxLength(15),
            // Validate the product code entered to ensure it is a valid code: it starts with numbers or letters and
            // it contains only letters, numbers, -, _, and /. There are two validators so each validator
            // displays an appropiate message to the problem being addressed.
            this.productCodeValidator(),
            this.productCodeStartValidator()
        );
        if (!isNullOrUndefined(form.getControlValue('code'))) {
            // code should not be editable if the product has already been created
            form.getControl('code').disable({ emitEvent: false });
            if (form.getControlValue('active') === true) {
                // must go through the deactivation process in case company/store products are active
                form.getControl('active').disable({ emitEvent: false });
            }
        } else {
            // update the related product value when the product code is set
            form.getControl('code')
                .valueChanges.pipe(
                    // startWith is only deprecated for implementations providing a scheduler, and null is matching that signature.
                    // Adding the strictNullChecks argument may fix this warning: https://github.com/ReactiveX/rxjs/issues/4772
                    // tslint:disable-next-line:deprecation
                    startWith(null),
                    pairwise(),
                    takeUntil(componentDestroyed)
                )
                .subscribe(([previousValue, currentValue]) => {
                    if (form.getControlValue('relatedProductCode') === previousValue) {
                        form.patchControlValue('relatedProductCode', currentValue);
                    }
                });
        }
        form.addFormControlValidators('relatedProductCode', Validators.required);
        form.getControl('relatedProductCode').setAsyncValidators(
            this.relatedProductValidator(form, opts.productFacade)
        );

        form.addFormControlValidators('description', Validators.required, Validators.maxLength(50));
        form.addFormControlValidators('inventoryDescription', Validators.required, Validators.maxLength(50));
        form.addFormControlValidators('productCategory', Validators.required);
        form.addFormControlValidators('defaultUom', Validators.required);
        form.addFormControlValidators('active', Validators.required);
        form.addFormControlValidators('bulk', Validators.required);
        form.addFormControlValidators('tankStorage', Validators.required);
        form.addFormControlValidators('type', Validators.required);
        form.addFormControlValidators('vendorType', Validators.required);
        form.addFormControlValidators('reportOrder', Validators.required, Validators.maxLength(6));
        form.addFormControlValidators('sapNumber', Validators.maxLength(18), this.sapNumberValidator());
        form.addFormControlValidators('upc', Validators.maxLength(12), Validators.minLength(11), this.upcValidator());
        form.removeControl('productMotorMapping');
        // build a FormArray for the product motor mapping
        if (opts.scope !== 'GRID') {
            form.setControl(
                'productMotorMapping',
                this.formFactory.array('ProductMotorMapping', model.productMotorMapping, componentDestroyed, opts)
            );
        }

        // validate for if category is invalid
        if (opts.accessMode?.isEdit) {
            if (form.getControl('productCategory')) {
                form.getControl('productCategory').setAsyncValidators(
                    this.categoryValidator(form, opts.productCategoryFacade)
                );
            }
        }

        // supportsECommerce defaults to null, convert to false
        if (isNullOrUndefined(form.getControlValue('supportsECommerce'))) {
            form.setControlValue('supportsECommerce', false);
        }

        return form;
    };

    private readonly productMotorMappingFormCreator: FormCreator<ProductMotorMapping> = (
        model,
        componentDestroyed,
        opts
    ) => {
        const form = new TypedFormGroup<ProductMotorMapping>(this.formBuilder.group(model, opts), componentDestroyed);
        form.addFormControlValidators('motorKey', Validators.maxLength(255));
        return form;
    };

    /**
     * Validates that the `Product.relatedProductCode` field is a relatable `Product`.
     */
    private readonly relatedProductValidator = (
        form: TypedFormGroup<Product>,
        productFacade: ProductFacade
    ): AsyncValidatorFn => {
        return (control: AbstractControl): Observable<{ [key: string]: boolean } | null> => {
            if (control.dirty) {
                return productFacade.validateRelatedProduct(control.value, form.getControlValue('code')).pipe(
                    catchError((error: HttpErrorResponse) => {
                        if (error.error && instanceOfApiErrorResponse(error.error)) {
                            const apiError = error.error.error;
                            if (apiError.messageKey === 'error.product-api.inactiveRelatedProduct') {
                                return of({ relatedProductInactive: true });
                            } else if (apiError.messageKey === 'error.product-api.notFoundRelatedProduct') {
                                return of({ relatedProductInvalid: true });
                            } else if (apiError.messageKey === 'error.product-api.obsoleteRelatedProduct') {
                                return of({ relatedProductObsolete: true });
                            } else if (apiError.messageKey === 'error.product-api.nestedRelatedProduct') {
                                return of({ relatedProductNested: { code: apiError.errors[0].messageParams[0] } });
                            } else {
                                throw error;
                            }
                        } else {
                            throw error;
                        }
                    })
                );
            } else {
                return of(null);
            }
        };
    };

    /**
     * Validates that the `Product.code` contains only valid characters.
     */
    private productCodeValidator() {
        const regex = new RegExp(/^[A-Za-z0-9-_/ ]*$/);
        return (control: AbstractControl): ValidationErrors | null => {
            const errors = Validators.pattern(regex)(control);
            return errors ? { productCode: true } : null;
        };
    }

    /**
     * Validates that the `Product.code` starts with a valid alphanumeric character.
     */
    private productCodeStartValidator() {
        const regex = new RegExp(/^[A-Za-z0-9].*$/);
        return (control: AbstractControl): ValidationErrors | null => {
            const errors = Validators.pattern(regex)(control);
            return errors ? { productCodeStart: true } : null;
        };
    }

    private sapNumberValidator() {
        const regex = new RegExp(/^[A-Z0-9-_ ]*$/);
        return (control: AbstractControl): ValidationErrors | null => {
            const errors = Validators.pattern(regex)(control);
            return errors ? { sapNumber: true } : null;
        };
    }

    private upcValidator() {
        const regex = new RegExp(/^[a-zA-Z0-9-'. ]*$/);
        return (control: AbstractControl): ValidationErrors | null => {
            const errors = Validators.pattern(regex)(control);
            return errors ? { upc: true } : null;
        };
    }

    private readonly categoryValidator = (
        form: TypedFormGroup<Product>,
        productCategoryFacade: ProductCategoryFacade
    ): AsyncValidatorFn => {
        return (control: AbstractControl): Observable<{ [key: string]: boolean } | null> => {
            if (form.getControlValue('productCategory') != null) {
                return productCategoryFacade.findActive('LEAF').pipe(
                    map((categories) => {
                        // check if category isn't present in valid active categories
                        if (
                            !categories.some(
                                (category) => category.code === form.getControlValue('productCategory').code
                            )
                        ) {
                            return { categoryInvalid: true };
                        } else {
                            return null;
                        }
                    })
                );
            } else {
                return of(null);
            }
        };
    };
}
