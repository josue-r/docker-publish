import { SelectionModel } from '@angular/cdk/collections';
import { ChangeDetectorRef } from '@angular/core';
import { fakeAsync, flush, TestBed } from '@angular/core/testing';
import { FormArray, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Service, ServiceProduct } from '@vioc-angular/central-ui/service/data-access-service';
import {
    ProductExtraCharge,
    ServiceExtraCharge,
    StoreService,
    StoreServiceMassAdd,
} from '@vioc-angular/central-ui/service/data-access-store-service';
import { Described } from '@vioc-angular/shared/common-functionality';
import { FormFactory, TypedFormGroup } from '@vioc-angular/shared/util-form';
import * as moment from 'moment';
import { Observable, of, ReplaySubject } from 'rxjs';
import { StoreServiceModuleForms } from './store-service-module-forms';

describe('StoreServiceModuleForms', () => {
    let storeService: StoreService;

    describe('validations', () => {
        let formFactory: FormFactory;
        let formBuilder: FormBuilder;
        let componentDestroyed: ReplaySubject<any>;
        let changeDetector: ChangeDetectorRef;

        beforeEach(async () => {
            storeService = {
                active: true,
                id: { storeId: 1234, serviceId: 8888 },
                store: { id: 4444, code: 'S4444', description: 'Test Store', version: 1 },
                service: { id: 2, code: 'SERVICE_1', description: 'Service 1', version: 1 },
                servicePrice: 9.99,
                laborAmount: 4,
                priceOverridable: true,
                priceOverrideMax: 100,
                priceOverrideMin: 2,
                priceOverrideMinMaxOverrideable: false,
                productExtraCharges: [
                    {
                        id: 2222,
                        charge: { id: 1, code: 'EXTRCHRG1', description: 'Extra Charge 1', version: 1 },
                        productCategory: { id: 1, code: 'OIL_CAT', description: 'Oil', version: 1 },
                        amount: 5.99,
                        quantityIncluded: 4,
                        beginExtraCharge: 4.25,
                        taxable: true,
                        version: 1,
                    } as ProductExtraCharge,
                ],
                promotionStartDate: '2017-01-01',
                promotionEndDate: '2017-01-01',
                promotionLaborAmount: 4,
                promotionPrice: 8.99,
                scheduledChangeDate: '2017-01-01',
                scheduledChangePrice: 10.99,
                extraCharge1: {
                    amount: 1,
                    charge: { code: 'extraCharge1', description: 'extraCharge1', id: 1, version: 1 },
                    taxable: true,
                } as ServiceExtraCharge,
                extraCharge2: {
                    amount: 2,
                    charge: { code: 'extraCharge2', description: 'extraCharge2', id: 2, version: 2 },
                    taxable: false,
                } as ServiceExtraCharge,
                taxable: true,
                updatedBy: 'a414583',
                updatedOn: '2017-01-01',
            };

            await TestBed.configureTestingModule({
                declarations: [],
                imports: [ReactiveFormsModule],
                providers: [FormFactory, ChangeDetectorRef],
            }).compileComponents();

            formFactory = TestBed.inject(FormFactory);
            formBuilder = TestBed.inject(FormBuilder);
            changeDetector = TestBed.inject(ChangeDetectorRef);
            StoreServiceModuleForms.registerForms(formFactory, formBuilder);
            componentDestroyed = new ReplaySubject(1);
        });

        afterEach(() => {
            componentDestroyed.next();
            componentDestroyed.unsubscribe();
        });

        describe('storeService', () => {
            describe('initialized fields', () => {
                it('should disabled non-editable fields', () => {
                    const group = formFactory.group('StoreService', storeService, componentDestroyed, {
                        changeDetector,
                    });

                    expect(group.getControl('store').disabled).toBe(true); // store should be disabled with no value
                    expect(group.getControl('service').disabled).toBe(true); // store should be disabled with no value
                });

                it('should initialize with default values for fields if they are null', () => {
                    const group = formFactory.group('StoreService', new StoreService(), componentDestroyed, {
                        changeDetector,
                    });

                    expect(group.getControlValue('active')).toEqual(true);
                    expect(group.getControlValue('priceOverridable')).toEqual(false);
                    expect(group.getControlValue('taxable')).toEqual(true);
                });

                it('should not initialize with default values for fields if scope is MASS_UPDATE', () => {
                    const group = formFactory.group('StoreService', new StoreService(), componentDestroyed, {
                        changeDetector,
                        scope: 'MASS_UPDATE',
                    });

                    expect(group.getControlValue('active')).toEqual(null);
                    expect(group.getControlValue('priceOverridable')).toEqual(null);
                    expect(group.getControlValue('taxable')).toEqual(null);
                });
            });

            describe('scheduledPrice dateChange', () => {
                const today = moment().startOf('day');

                describe.each`
                    newPrice     | changeDate                           | changeDateErrorType | expectError
                    ${undefined} | ${today.clone().subtract(2, 'days')} | ${'dateAfter'}      | ${false}
                    ${'1'}       | ${today.clone()}                     | ${'dateAfter'}      | ${false}
                    ${'1'}       | ${today.clone().add(1, 'day')}       | ${'dateAfter'}      | ${null}
                `(`with changeDate=$changeDate`, ({ newPrice, changeDate, changeDateErrorType, expectError }) => {
                    let value;
                    let group;
                    beforeEach(() => {
                        value = {
                            ...storeService,
                            scheduledChangeDate: changeDate,
                            scheduledChangePrice: newPrice,
                        };

                        group = formFactory.group('StoreService', value, componentDestroyed, { changeDetector });

                        group.getControl('scheduledChangePrice').updateValueAndValidity();
                        group.getControl('scheduledChangeDate').updateValueAndValidity();
                    });

                    // invalid if a date is in anything in past or today
                    it(`should be ${
                        changeDate <= new Date() ? 'invalid' : 'valid'
                    } when scheduledChangeDate is a date in ${changeDate <= new Date() ? 'past' : 'future'}`, () => {
                        if (expectError !== null) {
                            expect(group.getControl('scheduledChangeDate').getError(changeDateErrorType).valid).toBe(
                                expectError
                            );
                        } else {
                            expect(group.getControl('scheduledChangeDate').getError(changeDateErrorType)).toBe(
                                expectError
                            );
                        }
                    });
                });
            });

            describe('scheduledChangePrice', () => {
                it('should be invalid when scheduledChangePrice is not set and scheduledChangeDate is', () => {
                    const value = {
                        ...storeService,
                        scheduledChangeDate: '2017-01-01',
                        scheduledChangePrice: undefined,
                    };
                    const group = formFactory.group('StoreService', value, componentDestroyed, { changeDetector });

                    group.getControl('scheduledChangePrice').updateValueAndValidity();
                    group.getControl('scheduledChangeDate').updateValueAndValidity();

                    // Expected scheduledChangeDate to have requiredRelated error
                    expect(group.getControl('scheduledChangeDate').getError('requiredRelated')).toBe(true);
                    // Expected scheduledChangePrice to have required error
                    expect(group.getControl('scheduledChangePrice').getError('required')).toBe(true);
                });

                it('should clear scheduledChangePrice when scheduledChangeDate is cleared', () => {
                    const group = formFactory.group('StoreService', storeService, componentDestroyed, {
                        changeDetector,
                    });

                    group.patchControlValue('scheduledChangePrice', 2.0);
                    group.patchControlValue('scheduledChangeDate', undefined);

                    group.getControl('scheduledChangePrice').updateValueAndValidity();
                    group.getControl('scheduledChangeDate').updateValueAndValidity();

                    // Expected scheduledChangeDate to be undefined
                    expect(group.getControlValue('scheduledChangeDate')).toBeUndefined();
                    // Expected scheduledChangePrice to be null
                    expect(group.getControlValue('scheduledChangePrice')).toBeNull();
                });

                it('should not clear scheduledChangePrice when scheduledChangeDate is cleared if in grid mode', () => {
                    const array = formFactory.grid('StoreService', [storeService], componentDestroyed, {
                        changeDetector,
                        selectionModel: new SelectionModel(),
                    });
                    const group = (array.get('data') as FormArray).at(0) as TypedFormGroup<StoreService>;

                    group.patchControlValue('scheduledChangeDate', undefined);
                    group.getControl('scheduledChangePrice').updateValueAndValidity();
                    group.getControl('scheduledChangeDate').updateValueAndValidity();

                    // Expected scheduledChangeDate to be undefined
                    expect(group.getControlValue('scheduledChangeDate')).toBeUndefined();
                    // Expected scheduledChangePrice to be null
                    expect(group.getControlValue('scheduledChangePrice')).toEqual(storeService.scheduledChangePrice);
                });
            });

            describe('promotion fields', () => {
                it('should require other promotion fields if promotionStartDate is set', () => {
                    const value = {
                        ...storeService,
                        promotionEndDate: undefined,
                        promotionPrice: undefined,
                        promotionLaborAmount: undefined,
                    };
                    const group = formFactory.group('StoreService', value, componentDestroyed, { changeDetector });

                    group.getControl('promotionStartDate').updateValueAndValidity();
                    group.getControl('promotionEndDate').updateValueAndValidity();
                    group.getControl('promotionPrice').updateValueAndValidity();
                    group.getControl('promotionLaborAmount').updateValueAndValidity();

                    expect(group.getControl('promotionStartDate').hasError('requiredRelated')).toBe(true);
                    expect(group.getControl('promotionEndDate').hasError('required')).toBe(true);
                    expect(group.getControl('promotionPrice').hasError('required')).toBe(true);
                    expect(group.getControl('promotionLaborAmount').hasError('required')).toBe(true);
                });

                it('should require other promotion fields if promotionEndDate is set', () => {
                    const value = {
                        ...storeService,
                        promotionStartDate: undefined,
                        promotionPrice: undefined,
                        promotionLaborAmount: undefined,
                    };
                    const group = formFactory.group('StoreService', value, componentDestroyed, { changeDetector });

                    group.getControl('promotionStartDate').updateValueAndValidity();
                    group.getControl('promotionEndDate').updateValueAndValidity();
                    group.getControl('promotionPrice').updateValueAndValidity();
                    group.getControl('promotionLaborAmount').updateValueAndValidity();

                    expect(group.getControl('promotionEndDate').hasError('requiredRelated')).toBe(true);
                    expect(group.getControl('promotionStartDate').hasError('required')).toBe(true);
                    expect(group.getControl('promotionPrice').hasError('required')).toBe(true);
                    expect(group.getControl('promotionLaborAmount').hasError('required')).toBe(true);
                });

                it('should require other promotion fields if promotionPrice is set', () => {
                    const value = {
                        ...storeService,
                        promotionStartDate: undefined,
                        promotionEndDate: undefined,
                        promotionLaborAmount: undefined,
                    };
                    const group = formFactory.group('StoreService', value, componentDestroyed, { changeDetector });

                    group.getControl('promotionStartDate').updateValueAndValidity();
                    group.getControl('promotionEndDate').updateValueAndValidity();
                    group.getControl('promotionPrice').updateValueAndValidity();
                    group.getControl('promotionLaborAmount').updateValueAndValidity();

                    expect(group.getControl('promotionPrice').hasError('requiredRelated')).toBe(true);
                    expect(group.getControl('promotionStartDate').hasError('required')).toBe(true);
                    expect(group.getControl('promotionEndDate').hasError('required')).toBe(true);
                    expect(group.getControl('promotionLaborAmount').hasError('required')).toBe(true);
                });

                it('should require other promotion fields if promotionLaborAmount is set', () => {
                    const value = {
                        ...storeService,
                        promotionStartDate: undefined,
                        promotionEndDate: undefined,
                        promotionPrice: undefined,
                    };
                    const group = formFactory.group('StoreService', value, componentDestroyed, { changeDetector });

                    group.getControl('promotionStartDate').updateValueAndValidity();
                    group.getControl('promotionEndDate').updateValueAndValidity();
                    group.getControl('promotionPrice').updateValueAndValidity();
                    group.getControl('promotionLaborAmount').updateValueAndValidity();

                    expect(group.getControl('promotionLaborAmount').hasError('requiredRelated')).toBe(true);
                    expect(group.getControl('promotionStartDate').hasError('required')).toBe(true);
                    expect(group.getControl('promotionEndDate').hasError('required')).toBe(true);
                    expect(group.getControl('promotionPrice').hasError('required')).toBe(true);
                });

                describe('promotionEndDate', () => {
                    it('should be invalid if before the promotionStartDate', () => {
                        const value = {
                            ...storeService,
                            promotionPrice: 2.0,
                            promotionStartDate: '2020-01-01',
                            promotionEndDate: '2000-01-01',
                        };

                        const group = formFactory.group('StoreService', value, componentDestroyed, { changeDetector });

                        group.getControl('promotionEndDate').updateValueAndValidity();

                        // promotionEndDate should be invalid when before the promotionStartDate
                        expect(group.getControl('promotionEndDate').getError('dateAfter').valid).toBe(false);
                    });

                    it('should be valid if before the promotionStartDate or on same day', () => {
                        const group = formFactory.group('StoreService', storeService, componentDestroyed, {
                            changeDetector,
                        });

                        expect(group.getControl('promotionEndDate').hasError('dateAfter')).toBe(false);
                    });
                });
            });

            describe('service field', () => {
                it('should disable service and store if not mass update', () => {
                    const group = formFactory.group('StoreService', storeService, componentDestroyed, {
                        changeDetector,
                    });

                    expect(group.getControl('service').disabled).toBe(true);
                    expect(group.getControl('store').disabled).toBe(true);
                });

                it('should enable service and store if mass update', () => {
                    const group = formFactory.group('StoreService', storeService, componentDestroyed, {
                        changeDetector,
                        scope: 'MASS_UPDATE',
                    });

                    expect(group.getControl('service').disabled).toBe(false);
                    expect(group.getControl('store').disabled).toBe(false);
                });
            });

            describe('when initialized without GRID scope', () => {
                it('should set productExtraCharges', () => {
                    const group = formFactory.group('StoreService', storeService, componentDestroyed, {
                        changeDetector,
                    });

                    expect(group.getControlValue('productExtraCharges')).toEqual(storeService.productExtraCharges);
                });

                it('should set a default extra charge if one is not present', () => {
                    const value = { ...storeService, extraCharge1: undefined, extraCharge2: undefined };
                    const group = formFactory.group('StoreService', value, componentDestroyed, { changeDetector });

                    // Expected extraCharge1 not to be null or undefined
                    expect(group.getControlValue('extraCharge1') == null).toBe(false);
                    // Expected extraCharge2 not to be null or undefined
                    expect(group.getControlValue('extraCharge2') == null).toBe(false);
                });

                it('should set extra charges if one is present', () => {
                    const group = formFactory.group('StoreService', storeService, componentDestroyed, {
                        changeDetector,
                    });

                    expect(group.getControlValue('extraCharge1')).toEqual(storeService.extraCharge1);
                    expect(group.getControlValue('extraCharge2')).toEqual(storeService.extraCharge2);
                });
            });

            describe('productExtraCharge', () => {
                let completedProductExtraCharge;
                let updateFormValueAndValidity;
                beforeEach(() => {
                    completedProductExtraCharge = storeService.productExtraCharges[0];

                    updateFormValueAndValidity = (group: TypedFormGroup<ProductExtraCharge>) => {
                        group.getControl('charge').updateValueAndValidity();
                        group.getControl('amount').updateValueAndValidity();
                        group.getControl('quantityIncluded').updateValueAndValidity();
                        group.getControl('beginExtraCharge').updateValueAndValidity();
                        group.getControl('taxable').updateValueAndValidity();
                    };
                });

                it('should clear other fields when charge is cleared', () => {
                    const group = formFactory.group(
                        'ProductExtraCharge',
                        completedProductExtraCharge,
                        componentDestroyed
                    );
                    group.patchControlValue('amount', 2);
                    group.patchControlValue('quantityIncluded', 3);
                    group.patchControlValue('beginExtraCharge', 4);
                    group.patchControlValue('taxable', true);

                    group.patchControlValue('charge', undefined);
                    updateFormValueAndValidity(group);

                    // Expected amount to be null
                    expect(group.getControlValue('amount')).toBeNull();
                    // Expected quantityIncluded to be null
                    expect(group.getControlValue('quantityIncluded')).toBeNull();
                    // Expected amounbeginExtraCharget to be null
                    expect(group.getControlValue('beginExtraCharge')).toBeNull();
                    // Expected taxable to be null
                    expect(group.getControlValue('taxable')).toBeNull();
                });

                describe.each`
                    field                 | value
                    ${'amount'}           | ${1}
                    ${'quantityIncluded'} | ${2}
                    ${'beginExtraCharge'} | ${3}
                `('required field group', ({ field, value }) => {
                    it(`should require other fields in the group if ${field} is set`, fakeAsync(() => {
                        // Cannot test charge since other fields get cleared when a related field's validity is updated and charge doesn't have a value
                        const fields = ['amount', 'quantityIncluded', 'beginExtraCharge'];
                        const formValue = {
                            charge: {},
                            amount: null,
                            quantityIncluded: null,
                            beginExtraCharge: null,
                            taxable: null,
                        };
                        const group = formFactory.group('ProductExtraCharge', formValue, componentDestroyed);
                        group.setControlValue(field, value);
                        flush();
                        expect(group.getControl(field).hasError('requiredRelated')).toBe(true);
                        expect(group.getControl('charge').hasError('requiredRelated')).toBe(true);
                        fields
                            .filter((f) => f !== field)
                            .forEach((f) => expect(group.getControl(f as any).hasError('required')).toBe(true));
                    }));
                });

                it('should show beginExtraCharge as invalid since quantityIncluded is greater', () => {
                    const value = {
                        ...completedProductExtraCharge,
                        amount: undefined,
                        quantityIncluded: 5,
                        beginExtraCharge: 4,
                        taxable: undefined,
                    };
                    const group = formFactory.group('ProductExtraCharge', value, componentDestroyed);

                    updateFormValueAndValidity(group);

                    // Expected beginExtraCharge to have required error
                    expect(group.getControl('beginExtraCharge').hasError('numberGreaterThan')).toBe(true);
                });
            });

            describe('serviceExtraCharge', () => {
                let completedServiceExtraCharge;
                beforeEach(() => {
                    completedServiceExtraCharge = storeService.extraCharge1;
                });

                it('should required amount if charge is set', () => {
                    const value = { ...completedServiceExtraCharge, amount: undefined };
                    const group = formFactory.group('ServiceExtraCharge', value, componentDestroyed);

                    group.getControl('charge').updateValueAndValidity();
                    group.getControl('amount').updateValueAndValidity();

                    // Expected charge to have requiredRelated error
                    expect(group.getControl('charge').hasError('requiredRelated')).toBe(true);
                    // Expected amount to have required error
                    expect(group.getControl('amount').hasError('required')).toBe(true);
                });

                it('should required charge if amount is set', () => {
                    const value = { ...completedServiceExtraCharge, charge: undefined };
                    const group = formFactory.group('ServiceExtraCharge', value, componentDestroyed);

                    group.getControl('charge').updateValueAndValidity();
                    group.getControl('amount').updateValueAndValidity();

                    // Expected amount to have requiredRelated error
                    expect(group.getControl('amount').hasError('requiredRelated')).toBe(true);
                    // Expected charge to have required error
                    expect(group.getControl('charge').hasError('required')).toBe(true);
                });

                it('should default taxable if charge is set', () => {
                    const value = { ...completedServiceExtraCharge, taxable: undefined };
                    const group = formFactory.group('ServiceExtraCharge', value, componentDestroyed);

                    group.getControl('charge').updateValueAndValidity();

                    // Expected taxable to have been defaulted to true
                    expect(group.getControl('taxable').value).toBe(true);
                });
            });

            describe('StoreServiceMassAdd', () => {
                let testStoreServiceMassAdd: StoreServiceMassAdd;
                let storeServiceMassAddGroup: TypedFormGroup<StoreServiceMassAdd>;

                const createForm = (fullStoreService?: StoreService) => {
                    const serviceFacade = {
                        findByCode(code: string): Observable<any> {
                            return of(fullStoreService);
                        },
                    };

                    testStoreServiceMassAdd = {
                        stores: [],
                        service: new Service(),
                        storeService: new StoreService(),
                    };
                    storeServiceMassAddGroup = formFactory.group(
                        'StoreServiceMassAdd',
                        testStoreServiceMassAdd,
                        componentDestroyed,
                        { changeDetector, serviceFacade }
                    );
                };

                it('should update store service product extra charges', () => {
                    const selection = { id: 1, code: 'Sr1', description: 'Service 1' } as Service;

                    const productCategory = { id: 1, code: '123', description: 'desc' };

                    const storeServiceReturn = {
                        ...selection,
                        serviceProducts: [{ productCategory: productCategory }] as ServiceProduct[],
                    };

                    createForm(storeServiceReturn);

                    storeServiceMassAddGroup.getControl('service').setValue([selection]);
                    storeServiceMassAddGroup.getControl('service').updateValueAndValidity();

                    expect(storeServiceMassAddGroup.getControl('service').value).toEqual(storeServiceReturn);
                    expect(storeServiceMassAddGroup.getControl('storeService').value.productExtraCharges).toEqual([
                        { ...new ProductExtraCharge(), productCategory: productCategory },
                    ]);
                });

                it('should not update store service if no service selected', () => {
                    const selection = { id: 1, code: 'Sr1', description: 'Service 1' } as Service;

                    const productCategory = { id: 1, code: '123', description: 'desc' };

                    const storeServiceReturn = {
                        ...selection,
                        serviceProducts: [{ productCategory: productCategory }] as ServiceProduct[],
                    };

                    createForm(storeServiceReturn);

                    storeServiceMassAddGroup.getControl('service').setValue([]);
                    storeServiceMassAddGroup.getControl('service').updateValueAndValidity();

                    expect(storeServiceMassAddGroup.getControl('service').value).toEqual([]);
                    expect(storeServiceMassAddGroup.getControl('storeService').value.productExtraCharges).toEqual([]);
                });

                it('should reset the service selection if api returns an error', fakeAsync(() => {
                    const mockServiceFacade = { findByCode: jest.fn() };
                    jest.spyOn(mockServiceFacade, 'findByCode').mockRejectedValue(new Error('Stubbed API error'));

                    testStoreServiceMassAdd = {
                        stores: [],
                        service: new Service(),
                        storeService: new StoreService(),
                    };
                    storeServiceMassAddGroup = formFactory.group(
                        'StoreServiceMassAdd',
                        testStoreServiceMassAdd,
                        componentDestroyed,
                        { changeDetector, serviceFacade: mockServiceFacade }
                    );

                    const selection = { id: 1, code: 'Sr1', description: 'Service 1' } as Service;

                    storeServiceMassAddGroup.getControl('service').setValue([selection]);

                    // Expect an exception to be thrown when trying to fetch from API
                    expect(() => {
                        storeServiceMassAddGroup.getControl('service').updateValueAndValidity();
                        flush();
                    }).toThrowError();

                    expect(storeServiceMassAddGroup.getControl('service').value).toEqual(null);
                    expect(storeServiceMassAddGroup.getControl('storeService').value.productExtraCharges).toEqual([]);
                }));

                it('should not update store service product extra charges if service has no service products selected', () => {
                    const selection = { id: 1, code: 'Sr1', description: 'Service 1' } as Service;

                    const storeServiceReturn = {
                        ...selection,
                        serviceProducts: [] as ServiceProduct[],
                    };

                    createForm(storeServiceReturn);

                    storeServiceMassAddGroup.getControl('service').setValue([selection]);
                    storeServiceMassAddGroup.getControl('service').updateValueAndValidity();

                    expect(storeServiceMassAddGroup.getControl('service').value).toEqual(storeServiceReturn);
                    expect(storeServiceMassAddGroup.getControl('storeService').value.productExtraCharges).toEqual([]);
                });

                it('should require at least one store to be selected', () => {
                    createForm();
                    const selection = { id: 1, code: 'S1', description: 'Store 1' } as Described;

                    // patch in an empty array and expect it to be invalid
                    storeServiceMassAddGroup.patchControlValue('stores', [], { emitEvent: false });
                    storeServiceMassAddGroup.getControl('stores').updateValueAndValidity();
                    expect(storeServiceMassAddGroup.getControl('stores').valid).toBe(false);

                    // patch in an array containing a value and expect it to be valid
                    storeServiceMassAddGroup.patchControlValue('stores', [selection], { emitEvent: false });
                    storeServiceMassAddGroup.getControl('stores').updateValueAndValidity();
                    expect(storeServiceMassAddGroup.getControl('stores').valid).toBe(true);
                });

                it('should require at least one service to be selected', () => {
                    createForm();
                    const selection = { id: 1, code: 'Sr1', description: 'Service 1' } as Service;

                    // patch in an empty array and expect it to be invalid
                    storeServiceMassAddGroup.patchControlValue('service', undefined, { emitEvent: false });
                    storeServiceMassAddGroup.getControl('service').updateValueAndValidity();
                    expect(storeServiceMassAddGroup.getControl('service').valid).toBe(false);

                    // patch in an array containing a value and expect it to be valid
                    storeServiceMassAddGroup.patchControlValue('service', selection, { emitEvent: false });
                    storeServiceMassAddGroup.getControl('service').updateValueAndValidity();
                    expect(storeServiceMassAddGroup.getControl('service').valid).toBe(true);
                });

                describe('storeService', () => {
                    it('should delegate to the storeServiceFormCreator for massAdd StoreService validation', () => {
                        createForm();
                        const createGroupSpy = jest.spyOn(formFactory, 'group');
                        formFactory.group('StoreServiceMassAdd', testStoreServiceMassAdd, componentDestroyed, {
                            changeDetector,
                        });
                        expect(createGroupSpy.mock.calls[1]).toEqual([
                            'StoreService',
                            new StoreService(),
                            componentDestroyed,
                            { _modelType: 'ServiceExtraCharge', changeDetector },
                        ]);
                    });
                });
            });
        });
    });
});
