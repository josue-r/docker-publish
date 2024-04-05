import { FormBuilder, Validators } from '@angular/forms';
import { Service, ServiceProduct } from '@vioc-angular/central-ui/service/data-access-service';
import {
    ProductExtraCharge,
    ServiceExtraCharge,
    StoreService,
    StoreServiceMassAdd,
} from '@vioc-angular/central-ui/service/data-access-store-service';
import { isNullOrUndefined } from '@vioc-angular/shared/common-functionality';
import {
    CentralValidators,
    FormCreator,
    FormFactory,
    FormFactoryOptions,
    TypedFormGroup,
} from '@vioc-angular/shared/util-form';
import { EMPTY, throwError } from 'rxjs';
import { catchError, switchMap, takeUntil } from 'rxjs/operators';

/**
 * Collection of FormCreators for entities maintained by the StoreServiceModule.
 *
 * @export
 */
export class StoreServiceModuleForms {
    constructor(private readonly fb: FormBuilder, private readonly formFactory: FormFactory) {}

    static registerForms(formFactory: FormFactory, fb: FormBuilder) {
        const forms = new StoreServiceModuleForms(fb, formFactory);
        formFactory.register('StoreService', forms.storeServiceFormCreator);
        formFactory.register('ProductExtraCharge', forms.productExtraChargeFormCreator);
        formFactory.register('ServiceExtraCharge', forms.serviceExtraChargeFormCreator);
        formFactory.register('StoreServiceMassAdd', forms.storeServiceMassAddFormCreator);
    }

    private readonly storeServiceFormCreator: FormCreator<StoreService> = (model, componentDestroyed, opts) => {
        const form = new TypedFormGroup<StoreService>(this.fb.group(model, opts), componentDestroyed);
        FormFactoryOptions.validateRequiredOptions(opts, 'changeDetector');

        const massUpdate = opts.scope === 'MASS_UPDATE';
        if (!massUpdate) {
            if (!(opts.accessMode && opts.accessMode.isAdd)) {
                form.addFormControlValidators('service', Validators.required);
                if (!isNullOrUndefined(form.getControlValue('service'))) {
                    form.getControl('service').disable({ emitEvent: false });
                }
                if (!isNullOrUndefined(form.getControlValue('store'))) {
                    form.getControl('store').disable({ emitEvent: false });
                }
            }

            // Displaying priceOverridable related fields as disabled when priceOverridable is unchecked and
            // enabled when priceOverridable is checked
            form.getControl('priceOverridable')
                .valueChanges.pipe(takeUntil(componentDestroyed))
                .subscribe((value) => {
                    if (value) {
                        form.getControl('priceOverrideMin').enable();
                        form.getControl('priceOverrideMax').enable();
                        form.getControl('priceOverrideMinMaxOverrideable').enable();
                    } else {
                        form.getControl('priceOverrideMin').disable();
                        form.getControl('priceOverrideMax').disable();
                        form.getControl('priceOverrideMinMaxOverrideable').disable();
                    }
                });
            form.getControl('priceOverridable').updateValueAndValidity();

            // defaults
            if (isNullOrUndefined(form.getControlValue('active'))) {
                form.patchControlValue('active', true, { emitEvent: false });
            }
            if (isNullOrUndefined(form.getControlValue('priceOverridable'))) {
                form.patchControlValue('priceOverridable', false, { emitEvent: false });
            }
            if (isNullOrUndefined(form.getControlValue('taxable'))) {
                form.patchControlValue('taxable', true, { emitEvent: false });
            }
        }
        const requiredCondition = massUpdate ? 'if-dirty' : 'always';
        form.addFormControlValidators(
            'servicePrice',
            CentralValidators.required(requiredCondition),
            CentralValidators.currency()
        );
        form.addFormControlValidators(
            'laborAmount',
            CentralValidators.required(requiredCondition),
            CentralValidators.currency()
        );
        form.addFormControlValidators('priceOverridable', CentralValidators.required(requiredCondition));
        form.addFormControlValidators('priceOverrideMinMaxOverrideable', CentralValidators.required(requiredCondition));

        // All scheduled price change fields fields are required if any of them are set
        form.addRequiredFieldGrouping(['scheduledChangePrice', 'scheduledChangeDate'], 'scheduledPriceChange');
        form.addFormControlValidators('scheduledChangeDate', CentralValidators.dateAfterTodayValidator());
        form.addFormControlValidators('scheduledChangePrice', CentralValidators.currency());

        // All promotional fields are required if any of them are set
        // by default If any of these fields are updated, it retrigger validation on the others
        form.addRequiredFieldGrouping([
            'promotionStartDate',
            'promotionEndDate',
            'promotionPrice',
            'promotionLaborAmount',
        ]);

        // promotionEndDate can be after promotionStartDate or on same day in case of single day promotion
        form.addFormControlValidators(
            'promotionEndDate',
            CentralValidators.dateAfterValidator(form.getControl('promotionStartDate'), true)
        );

        form.addFormControlValidators('promotionPrice', CentralValidators.currency());
        form.addFormControlValidators('promotionLaborAmount', CentralValidators.currency());

        // Remove array based controls and re-add as FormArrays
        form.removeControl('productExtraCharges');
        form.removeControl('extraCharge1');
        form.removeControl('extraCharge2');
        if (opts.scope !== 'GRID') {
            // Build a FormArray if there are any ProductExtraCharges present.
            form.setControl(
                'productExtraCharges',
                this.formFactory.array('ProductExtraCharge', model.productExtraCharges, componentDestroyed, opts)
            );

            // Build a FormGroups if there are any serviceExtraCharges present.
            const extraCharge = {
                amount: undefined,
                charge: undefined,
                taxable: undefined,
            } as ServiceExtraCharge;
            form.setControl(
                'extraCharge1',
                this.formFactory.group(
                    'ServiceExtraCharge',
                    model.extraCharge1 ? model.extraCharge1 : extraCharge,
                    componentDestroyed,
                    opts
                )
            );
            form.setControl(
                'extraCharge2',
                this.formFactory.group(
                    'ServiceExtraCharge',
                    model.extraCharge2 ? model.extraCharge2 : extraCharge,
                    componentDestroyed,
                    opts
                )
            );

            // If scheduledChangeDate is cleared, clear scheduledChangePrice.
            form.addClearOnClearedListener('scheduledChangeDate', ['scheduledChangePrice']);
        } else {
            // does not apply to grid view
        }

        return form;
    };

    private readonly productExtraChargeFormCreator: FormCreator<ProductExtraCharge> = (v, componentDestroyed, opts) => {
        const form = new TypedFormGroup<ProductExtraCharge>(this.fb.group(v, opts), componentDestroyed);
        form.addClearOnClearedListener('charge', ['amount', 'quantityIncluded', 'beginExtraCharge', 'taxable']);
        form.addDefaultWhenSetListener('charge', 'taxable', true);
        // Not including taxable because there are a large amount of existing records with a taxable value but no charge set.
        // Once we can ensure that records will always have both taxable and a extraChargeItem or neither, we can add taxable back.
        form.addRequiredFieldGrouping(['charge', 'amount', 'quantityIncluded', 'beginExtraCharge'], 'extraCharge');
        form.addFormControlValidators('amount', CentralValidators.currency());
        form.addFormControlValidators('quantityIncluded', CentralValidators.decimal());
        form.addFormControlValidators(
            'beginExtraCharge',
            CentralValidators.decimal(),
            CentralValidators.numberGreaterThanValidator(form.getControl('quantityIncluded'))
        );
        return form;
    };

    private readonly serviceExtraChargeFormCreator: FormCreator<ServiceExtraCharge> = (v, componentDestroyed, opts) => {
        const form = new TypedFormGroup<ServiceExtraCharge>(this.fb.group(v, opts), componentDestroyed);
        form.addDefaultWhenSetListener('charge', 'taxable', true);
        form.addRequiredFieldGrouping(['charge', 'amount']);
        form.addFormControlValidators('amount', CentralValidators.currency());
        return form;
    };

    /**
     * Create a `StoreServiceMassAdd` form building upon the above `StoreService` validation. To be used on the add store service screen.
     */
    private readonly storeServiceMassAddFormCreator: FormCreator<StoreServiceMassAdd> = (
        model,
        componentDestroyed,
        opts
    ) => {
        const form = new TypedFormGroup<StoreServiceMassAdd>(this.fb.group(model, opts), componentDestroyed);
        // Require at least one store and one service
        form.addFormControlValidators('stores', Validators.required, CentralValidators.arrayMinLength(1));
        form.addFormControlValidators('service', Validators.required);
        // Start with the standard StoreService validation
        const storeServiceForm = this.formFactory.group<StoreService>(
            'StoreService',
            model.storeService,
            componentDestroyed,
            opts
        );
        form.setControl('storeService', storeServiceForm);

        form.getControl('service')
            .valueChanges.pipe(
                takeUntil(componentDestroyed),
                switchMap((service: Service) => {
                    // checking if service[0] since table selection always returns an array even though we expect a single object here
                    if (service?.[0]) {
                        return opts.serviceFacade.findByCode(service[0].code);
                    } else {
                        return EMPTY;
                    }
                }),
                catchError((err) => {
                    form.getControl('service').reset(null);
                    return throwError(err);
                })
            )
            .subscribe((fullService: Service) => {
                form.setControlValue('service', fullService);
                // Build a FormArray if there are any ProductExtraCharges present.
                storeServiceForm.removeControl('productExtraCharges');
                // setting product extra charges based on service prducts contained in service
                storeServiceForm.setControl(
                    'productExtraCharges',
                    this.formFactory.array(
                        'ProductExtraCharge',
                        fullService.serviceProducts?.map((sp: ServiceProduct) => {
                            const productExtraCharge = new ProductExtraCharge();
                            productExtraCharge.productCategory = sp.productCategory;
                            return productExtraCharge;
                        }),
                        componentDestroyed,
                        opts
                    )
                );
                form.setControl('storeService', storeServiceForm);
            });
        return form;
    };
}
