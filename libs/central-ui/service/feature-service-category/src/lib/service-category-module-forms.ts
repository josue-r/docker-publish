import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, AsyncValidatorFn, FormBuilder, Validators } from '@angular/forms';
import { ServiceCategoryCarFaxMapping } from '@vioc-angular/central-ui/service/data-access-car-fax-mapping';
import {
    PreventativeMaintenanceQualifier,
    ServiceCategory,
    ServiceCategoryFacade,
    ServiceCategoryInfo,
    ServiceCategoryMotorInfo,
} from '@vioc-angular/central-ui/service/data-access-service-category';
import { isNullOrUndefined } from '@vioc-angular/shared/common-functionality';
import { instanceOfApiErrorResponse } from '@vioc-angular/shared/util-api';
import {
    CentralValidators,
    FormCreator,
    FormErrorMapping,
    FormFactory,
    TypedFormGroup,
} from '@vioc-angular/shared/util-form';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

/**
 * Collection of FormCreators for entities maintained by the ServiceCategoryModule.
 *
 * @export
 */
export class ServiceCategoryModuleForms {
    constructor(private readonly formBuilder: FormBuilder, private readonly formFactory: FormFactory) {}

    /**
     * Error mapping for failed parent category validations
     */
    static parentCategoryErrorMapping = {
        parentCategoryNotFound() {
            return 'Category was not found';
        },
        parentCategoryInactive() {
            return 'Category is not active';
        },
        parentCategoryCircularHierarchy() {
            return 'Parent category has a circular hierarchy reference';
        },
    } as FormErrorMapping;

    static categoryCodeErrorMapping = {
        pattern() {
            return 'Can only contain uppercase letters, numbers, spaces, and dashes';
        },
    };

    static registerForms(formFactory: FormFactory, formBuilder: FormBuilder) {
        const forms = new ServiceCategoryModuleForms(formBuilder, formFactory);
        formFactory.register('ServiceCategory', forms.serviceCategoryFormCreator);
        formFactory.register('ServiceCategoryCarFaxMapping', forms.serviceCategoryCarFaxMappingFormCreator);
        formFactory.register('ServiceCategoryMotorInfo', forms.serviceCategoryMotorInfoFormCreator);
        formFactory.register('PreventativeMaintenanceQualifier', forms.preventativeMaintenanceQualifierFormCreator);
    }

    /**
     * Creates a `Service Category` form
     */
    private readonly serviceCategoryFormCreator: FormCreator<ServiceCategory> = (
        model,
        componentDestroyed,
        options
    ) => {
        const form = new TypedFormGroup<ServiceCategory>(this.formBuilder.group(model, options), componentDestroyed);
        // remove all editable objects; will replace with form controls

        // if a root category, apply required validations
        form.removeControl('serviceInfo');
        form.removeControl('carFaxMapping');
        form.removeControl('motorInfo');
        form.removeControl('preventativeMaintenanceQualifiers');
        const isRootCategory = !model.parentCategory;
        if (isRootCategory) {
            // service info validation
            const serviceInfo = model.serviceInfo ? model.serviceInfo : new ServiceCategoryInfo();
            form.addControl(
                'serviceInfo',
                new TypedFormGroup<ServiceCategoryInfo>(
                    this.formBuilder.group(serviceInfo, options),
                    componentDestroyed
                )
            );

            // This should always be present for root categories.  Don't fail if it isn't
            form.getControl('serviceInfo').get('appearOnWorkOrder').setValidators(Validators.required);
            form.getControl('serviceInfo').get('serviceTime').setValidators(Validators.maxLength(50));
            form.getControl('serviceInfo')
                .get('competitivePrice')
                .setValidators([Validators.min(0), Validators.max(9999999999.9999)]);
            form.getControl('serviceInfo').get('importance').setValidators(Validators.maxLength(255));
            form.getControl('serviceInfo').get('customerDisplayName').setValidators(Validators.maxLength(200));
            form.getControl('serviceInfo')
                .get('recommendationOrder')
                .setValidators(CentralValidators.integer({ min: 0, max: 999 }));

            // car fax mapping validation
            const carFaxMapping = model.carFaxMapping ? model.carFaxMapping : [new ServiceCategoryCarFaxMapping()];
            form.setControl(
                'carFaxMapping',
                this.formFactory.array('ServiceCategoryCarFaxMapping', carFaxMapping, componentDestroyed, options)
            );

            // motor info validation
            const motorInfo = model.motorInfo ? model.motorInfo : [new ServiceCategoryMotorInfo()];
            form.setControl(
                'motorInfo',
                this.formFactory.array('ServiceCategoryMotorInfo', motorInfo, componentDestroyed, options)
            );
            // preventative maintenance qualifiers validation
            const preventativeMaintenanceQualifiers = model.preventativeMaintenanceQualifiers
                ? model.preventativeMaintenanceQualifiers
                : [new PreventativeMaintenanceQualifier()];
            form.setControl(
                'preventativeMaintenanceQualifiers',
                this.formFactory.array(
                    'PreventativeMaintenanceQualifier',
                    preventativeMaintenanceQualifiers,
                    componentDestroyed,
                    options
                )
            );

            if (isNullOrUndefined(form.getArrayValue('carFaxMapping'))) {
                form.setArrayValue('carFaxMapping', []);
            }

            if (isNullOrUndefined(form.getArrayValue('motorInfo'))) {
                form.setArrayValue('motorInfo', []);
            }

            if (isNullOrUndefined(form.getArrayValue('preventativeMaintenanceQualifiers'))) {
                form.setArrayValue('preventativeMaintenanceQualifiers', []);
            }
        }

        // code field validation
        if (!options.accessMode?.isAdd) {
            form.getControl('code').disable({ emitEvent: false });
        } else {
            form.getControl('code').setValidators([Validators.pattern(/^[A-Z0-9 -]*$/), Validators.maxLength(25)]);
        }

        // set validation or disable fields based on accessMode
        if (options.accessMode) {
            if (options.accessMode.isEdit) {
                if (form.getControlValue('active')) {
                    form.getControl('active').disable({ emitEvent: false });
                }

                form.getControl('parentCategory').setAsyncValidators(
                    this.parentCategoryValidator(form, options.serviceCategoryFacade)
                );
            } else {
                form.getControl('defaultService').disable({ emitEvent: false });
            }
        }

        form.addFormControlValidators('description', Validators.required, Validators.maxLength(50));
        form.addFormControlValidators('active', Validators.required);
        form.addFormControlValidators('nacsProductCode', Validators.required);

        return form;
    };

    /**
     * Creates a `CarFax Mapping` form
     */
    private readonly serviceCategoryCarFaxMappingFormCreator: FormCreator<ServiceCategoryCarFaxMapping> = (
        model,
        componentDestroyed,
        options
    ) => {
        const form = new TypedFormGroup<ServiceCategoryCarFaxMapping>(
            this.formBuilder.group(model, options),
            componentDestroyed
        );

        form.addFormControlValidators('carFaxServiceName', Validators.required, Validators.maxLength(50));

        return form;
    };

    /**
     * Creates a `Service Category Motor Info` form
     */
    private readonly serviceCategoryMotorInfoFormCreator: FormCreator<ServiceCategoryMotorInfo> = (
        model,
        componentDestroyed,
        options
    ) => {
        const form = new TypedFormGroup<ServiceCategoryMotorInfo>(
            this.formBuilder.group(model, options),
            componentDestroyed
        );

        form.addFormControlValidators('item', Validators.required, Validators.maxLength(5));
        form.addFormControlValidators('action', Validators.required, Validators.maxLength(5));

        return form;
    };

    /**
     * Creates a `Preventative Maintenance Qualifier` form
     */
    private readonly preventativeMaintenanceQualifierFormCreator: FormCreator<PreventativeMaintenanceQualifier> = (
        model,
        componentDestroyed,
        options
    ) => {
        const form = new TypedFormGroup<PreventativeMaintenanceQualifier>(
            this.formBuilder.group(model, options),
            componentDestroyed
        );

        form.addFormControlValidators('transmissionType', Validators.required);
        form.addFormControlValidators('qualifier', Validators.required, Validators.maxLength(20));

        return form;
    };

    /**
     * Validates that the `ServiceCategory.parentCategory` field
     */
    private readonly parentCategoryValidator = (
        form: TypedFormGroup<ServiceCategory>,
        serviceCategoryFacade: ServiceCategoryFacade
    ): AsyncValidatorFn => {
        return (control: AbstractControl): Observable<{ [key: string]: boolean } | null> => {
            if (control.dirty && form.getControlValue('parentCategory') != null) {
                return serviceCategoryFacade
                    .validateParentCategory(control.value.code, form.getControlValue('code'))
                    .pipe(
                        catchError((error: HttpErrorResponse) => {
                            if (error.error && instanceOfApiErrorResponse(error.error)) {
                                const apiError = error.error.error;
                                if (apiError.messageKey === 'error.service-api.notFoundParentCategory') {
                                    return of({ parentCategoryInvalid: true });
                                } else if (apiError.messageKey === 'error.service-api.inactiveParentCategory') {
                                    return of({ parentCategoryInactive: true });
                                } else if (
                                    apiError.messageKey === 'error.service-api.circularServiceCategoryHierarchy'
                                ) {
                                    return of({ parentCategoryCircularHierarchy: true });
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
}
