import { SelectionModel } from '@angular/cdk/collections';
import { ChangeDetectorRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormArray, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Product } from '@vioc-angular/central-ui/product/data-access-product';
import {
    StoreProduct,
    StoreProductMassAdd,
    StoreProductMassUpdate,
} from '@vioc-angular/central-ui/product/data-access-store-product';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { Described } from '@vioc-angular/shared/common-functionality';
import { FormFactory, TypedFormGroup } from '@vioc-angular/shared/util-form';
import { ReplaySubject } from 'rxjs';
import { StoreProductModuleForms } from './store-product-module-forms';

describe('StoreProductModuleForms', () => {
    const testDescribe: Described = {
        id: 1,
        code: 'CODE',
        description: 'DESC',
        version: 0,
    };

    describe('validations', () => {
        let formFactory: FormFactory;
        let formBuilder: FormBuilder;
        let componentDestroyed: ReplaySubject<any>;
        const validateField = (
            testValue: StoreProduct,
            testProperty: keyof StoreProduct,
            error: string,
            showError: boolean = true
        ) => {
            const group = formFactory.group('StoreProduct', testValue, componentDestroyed);
            group.getControl(testProperty).updateValueAndValidity();
            expect(group.getControl(testProperty).hasError(error)).toBe(showError);
        };

        const testStoreProduct: StoreProduct = new StoreProduct();

        beforeEach(async () => {
            await TestBed.configureTestingModule({
                declarations: [],
                imports: [ReactiveFormsModule],
                providers: [FormFactory],
            }).compileComponents();
        });

        beforeEach(() => {
            formFactory = TestBed.inject(FormFactory);
            formBuilder = TestBed.inject(FormBuilder);
            StoreProductModuleForms.registerForms(formFactory, formBuilder);
            componentDestroyed = new ReplaySubject(1);
        });

        afterEach(() => {
            componentDestroyed.next();
            componentDestroyed.unsubscribe();
        });

        describe('storeProduct', () => {
            describe('initialized fields', () => {
                it('should disabled non-editable fields', () => {
                    let group = formFactory.group('StoreProduct', testStoreProduct, componentDestroyed);

                    expect(group.getControl('product').disabled).toBe(true); // product should be disabled with no value
                    expect(group.getControl('store').disabled).toBe(true); // store should be disabled with no value
                    // 'averageDailyUsage should be disabled'
                    expect(group.getControl('averageDailyUsage').disabled).toBe(true);
                    expect(group.getControl('quantityOnHand').disabled).toBe(true); // quantityOnHand should be disabled

                    const value: StoreProduct = {
                        ...testStoreProduct,
                        product: { ...testDescribe },
                        store: { ...testDescribe },
                        averageDailyUsage: 10,
                        quantityOnHand: 10,
                    };

                    group = formFactory.group('StoreProduct', value, componentDestroyed);

                    expect(group.getControl('product').disabled).toBe(true); // product should be disabled with a value
                    expect(group.getControl('store').disabled).toBe(true); // store should be disabled with a value
                    // 'averageDailyUsage should be disabled'
                    expect(group.getControl('averageDailyUsage').disabled).toBe(true);
                    expect(group.getControl('quantityOnHand').disabled).toBe(true); // quantityOnHand should be disabled
                });

                it('should set default values for uninitialized fields', () => {
                    const group = formFactory.group('StoreProduct', testStoreProduct, componentDestroyed);

                    expect(group.getControlValue('taxable')).toEqual(true); // taxable value should be patched to true
                    // 'overridable should be patched to false'
                    expect(group.getControlValue('overridable')).toEqual(false);
                    // 'minMaxOverridable should be patched to false'
                    expect(group.getControlValue('minMaxOverridable')).toEqual(false);
                    // 'includeInCount should be patched to true'
                    expect(group.getControlValue('includeInCount')).toEqual(true);
                });
            });

            describe('GRID scope', () => {
                it('should disabled fields', () => {
                    const group = formFactory.group('StoreProduct', testStoreProduct, componentDestroyed, {
                        scope: 'GRID',
                    });

                    expect(group.getControl('active').disabled).toBe(true); // active should be disabled in GRID scope
                });
            });

            describe('MASS-UPDATE scope', () => {
                let group: TypedFormGroup<StoreProduct>;
                beforeEach(() => {
                    group = formFactory.group('StoreProduct', testStoreProduct, componentDestroyed, {
                        scope: 'MASS-UPDATE',
                    });
                });

                it('should not initialize default fields', () => {
                    expect(group.getControlValue('active')).toEqual(null);
                    expect(group.getControlValue('taxable')).toEqual(null);
                    expect(group.getControlValue('overridable')).toEqual(null);
                    expect(group.getControlValue('minMaxOverridable')).toEqual(null);
                    expect(group.getControlValue('includeInCount')).toEqual(null);
                });

                it('should not add required validators', () => {
                    group.updateValueAndValidity();
                    expect(group.getControl('taxable').getError('required')).toBeNull();
                    expect(group.getControl('overridable').getError('required')).toBeNull();
                    expect(group.getControl('includeInCount').getError('required')).toBeNull();
                    expect(group.getControl('countFrequency').getError('required')).toBeNull();
                    expect(group.getControl('reportOrder').getError('required')).toBeNull();
                    expect(group.getControl('wholesalePrice').getError('required')).toBeNull();
                    expect(group.getControl('retailPrice').getError('required')).toBeNull();
                    expect(group.getControl('quantityPerPack').getError('required')).toBeNull();
                    expect(group.getControl('minOrderQuantity').getError('required')).toBeNull();
                    expect(group.getControl('vendor').getError('required')).toBeNull();
                    expect(group.getControl('reportOrder').getError('required')).toBeNull();
                    expect(group.getControl('wholesalePrice').getError('required')).toBeNull();
                });
            });

            describe('add-like accessMode', () => {
                let group: TypedFormGroup<StoreProduct>;
                beforeEach(() => {
                    const model = { ...new StoreProduct(), store: { id: 1, code: 'STORE1' } };
                    group = formFactory.group('StoreProduct', model, componentDestroyed, {
                        accessMode: AccessMode.ADD_LIKE,
                    });
                });

                it('should default active to true', () => {
                    expect(group.getControlValue('active')).toEqual(true);
                });

                it('should clear out any existing store and require one to be selected', () => {
                    const storeControl = group.getControl('store');
                    expect(storeControl.value).toBeUndefined();
                    expect(storeControl.valid).toBeFalsy();
                    storeControl.patchValue({ id: 2, code: 'STORE2' });
                    storeControl.updateValueAndValidity();
                    expect(storeControl.valid).toBeTruthy();
                });
            });

            describe('minOrderQuantity', () => {
                it.each`
                    moq  | qpp  | expectedError
                    ${1} | ${3} | ${'invalidMinOrderQuantity'}
                    ${2} | ${3} | ${'invalidMinOrderQuantity'}
                    ${3} | ${3} | ${null}
                    ${4} | ${3} | ${'invalidMinOrderQuantity'}
                    ${5} | ${3} | ${'invalidMinOrderQuantity'}
                    ${6} | ${3} | ${null}
                `('should be a multiple of quantityPerPack', ({ moq, qpp, expectedError }) => {
                    const value: StoreProduct = {
                        ...testStoreProduct,
                        quantityPerPack: qpp,
                        minOrderQuantity: moq,
                    };

                    const group = formFactory.group('StoreProduct', value, componentDestroyed);

                    group.getControl('minOrderQuantity').updateValueAndValidity();

                    if (expectedError) {
                        expect(group.getControl('minOrderQuantity').getError(expectedError)).toBeTruthy();
                    } else {
                        expect(group.getControl('minOrderQuantity').getError(expectedError)).toBeFalsy();
                    }
                });

                describe.each`
                    value     | errorCode | showError
                    ${10_000} | ${'max'}  | ${true}
                    ${9_999}  | ${'max'}  | ${false}
                    ${1}      | ${'min'}  | ${false}
                    ${0}      | ${'min'}  | ${true}
                `('validation', ({ value, errorCode, showError }) => {
                    // quantity per pack and min order quantity must be equal or 'invalidMinOrderQuantity' is shown
                    const testValue: StoreProduct = {
                        ...testStoreProduct,
                        minOrderQuantity: value,
                    };
                    it(`should ${
                        showError ? '' : 'not '
                    }show the '${errorCode}' error if the value is ${value}`, () => {
                        validateField(testValue, 'minOrderQuantity', errorCode, showError);
                    });
                });
            });

            describe('quantityPerPack', () => {
                it('should validate that quantityPerPack is required', () => {
                    validateField(testStoreProduct, 'quantityPerPack', 'required');
                });

                describe.each`
                    value     | errorCode | showError
                    ${10_000} | ${'max'}  | ${true}
                    ${9_999}  | ${'max'}  | ${false}
                    ${1}      | ${'min'}  | ${false}
                    ${0}      | ${'min'}  | ${true}
                `('validation', ({ value, errorCode, showError }) => {
                    const testValue: StoreProduct = {
                        ...testStoreProduct,
                        quantityPerPack: value,
                    };
                    it(`should ${
                        showError ? '' : 'not '
                    }show the '${errorCode}' error if the value is ${value}`, () => {
                        validateField(testValue, 'quantityPerPack', errorCode, showError);
                    });
                });
            });

            describe('schedulePriceChange', () => {
                it('should require schedulePriceDate to be set', () => {
                    const value: StoreProduct = {
                        ...testStoreProduct,
                        schedulePriceChange: 2.0,
                    };
                    const group = formFactory.group('StoreProduct', value, componentDestroyed);

                    group.getControl('schedulePriceChange').updateValueAndValidity({ emitEvent: false });
                    group.getControl('schedulePriceDate').updateValueAndValidity({ emitEvent: false });

                    // 'schedulePriceChange should be invalid when schedulePriceDate is not set'
                    expect(group.getControl('schedulePriceChange').getError('requiredRelated')).toBe(true);
                    // 'schedulePriceDate is required when schedulePriceChange is set'
                    expect(group.getControl('schedulePriceDate').getError('required')).toBe(true);
                });
            });

            describe('schedulePriceDate', () => {
                it('should require schedulePriceChange to be set', () => {
                    const value: StoreProduct = {
                        ...testStoreProduct,
                        schedulePriceDate: new Date().toString(),
                    };
                    const group = formFactory.group('StoreProduct', value, componentDestroyed);

                    group.getControl('schedulePriceDate').updateValueAndValidity();

                    // 'schedulePriceDate should be invalid when schedulePriceChange is not set'
                    expect(group.getControl('schedulePriceDate').getError('requiredRelated')).toBe(true);
                    // schedulePriceChange is required when schedulePriceDate is set
                    expect(group.getControl('schedulePriceChange').getError('required')).toBe(true);
                });

                it('should clear schedulePriceChange when cleared', () => {
                    const value: StoreProduct = {
                        ...testStoreProduct,
                        schedulePriceDate: new Date().toString(),
                    };

                    const group = formFactory.group('StoreProduct', value, componentDestroyed);

                    group.patchControlValue('schedulePriceChange', 1.0);
                    group.patchControlValue('schedulePriceDate', undefined);
                    group.getControl('schedulePriceDate').updateValueAndValidity();

                    // 'schedulePriceChange should be null when schedulePriceDate is cleared'
                    expect(group.getControlValue('schedulePriceChange')).toBeNull();
                });

                it('should not clear schedulePriceChange if grid mode', () => {
                    const value: StoreProduct = {
                        ...testStoreProduct,
                        schedulePriceDate: new Date().toString(),
                        schedulePriceChange: 2.0,
                    };

                    const array = formFactory.grid('StoreProduct', [value], componentDestroyed, {
                        changeDetector: {} as ChangeDetectorRef,
                        selectionModel: new SelectionModel(),
                    });
                    const group = (array.get('data') as FormArray).at(0) as TypedFormGroup<StoreProduct>;

                    group.patchControlValue('schedulePriceDate', undefined);
                    group.getControl('schedulePriceDate').updateValueAndValidity();

                    expect(group.getControlValue('schedulePriceChange')).toEqual(value.schedulePriceChange);
                });
            });

            describe('retailPrice', () => {
                it('should validate that retailPrice is required', () => {
                    validateField(testStoreProduct, 'retailPrice', 'required');
                });
            });

            describe('wholesalePriceChange', () => {
                it('should require wholesalePriceChangeDate to be set', () => {
                    const value: StoreProduct = {
                        ...testStoreProduct,
                        wholesalePriceChange: 2.0,
                    };
                    const group = formFactory.group('StoreProduct', value, componentDestroyed);

                    group.getControl('wholesalePriceChange').updateValueAndValidity({ emitEvent: false });
                    group.getControl('wholesalePriceChangeDate').updateValueAndValidity({ emitEvent: false });

                    // 'wholesalePriceChange should be invalid when wholesalePriceChangeDate is not set'
                    expect(group.getControl('wholesalePriceChange').getError('requiredRelated')).toBe(true);
                    // 'wholesalePriceChangeDate is required when wholesalePriceChange is set'
                    expect(group.getControl('wholesalePriceChangeDate').getError('required')).toBe(true);
                });

                it('should give error message if decimal places are more than 4', () => {
                    const value: StoreProduct = {
                        ...testStoreProduct,
                        wholesalePriceChange: 2.123456,
                    };
                    const group = formFactory.group('StoreProduct', value, componentDestroyed);

                    group.getControl('wholesalePriceChange').updateValueAndValidity({ emitEvent: false });

                    expect(group.getControl('wholesalePriceChange').getError('invalidDecimal').valid).toBe(false);
                });
            });

            describe('wholesalePrice', () => {
                it('should give error message if decimal places are more than 4', () => {
                    const group = formFactory.group('StoreProduct', testStoreProduct, componentDestroyed);

                    group.patchControlValue('wholesalePrice', 2.789654);
                    group.getControl('wholesalePrice').updateValueAndValidity();

                    expect(group.getControl('wholesalePrice').getError('invalidDecimal').valid).toBe(false);
                });

                it('should validate that wholesalePrice is required', () => {
                    validateField(testStoreProduct, 'wholesalePrice', 'required');
                });
            });

            describe('wholesalePriceChangeDate', () => {
                it('should require wholesalePriceChange to be set', () => {
                    const value: StoreProduct = {
                        ...testStoreProduct,
                        wholesalePriceChangeDate: new Date().toString(),
                    };
                    const group = formFactory.group('StoreProduct', value, componentDestroyed);

                    group.getControl('wholesalePriceChangeDate').updateValueAndValidity();

                    // 'wholesalePriceChangeDate should be invalid when wholesalePriceChange is not set'
                    expect(group.getControl('wholesalePriceChangeDate').getError('requiredRelated')).toBe(true);
                    // 'wholesalePriceChange is required when wholesalePriceChangeDate is set'
                    expect(group.getControl('wholesalePriceChange').getError('required')).toBe(true);
                });

                it('should clear wholesalePriceChange when cleared', () => {
                    const value: StoreProduct = {
                        ...testStoreProduct,
                        wholesalePriceChangeDate: new Date().toString(),
                    };

                    const group = formFactory.group('StoreProduct', value, componentDestroyed);

                    group.patchControlValue('wholesalePriceChange', 2.0);
                    group.patchControlValue('wholesalePriceChangeDate', undefined);
                    group.getControl('wholesalePriceChangeDate').updateValueAndValidity();

                    // 'wholesalePriceChange should be null when wholesalePriceChangeDate is cleared'
                    expect(group.getControlValue('wholesalePriceChange')).toBeNull();
                });

                it('should not clear wholesalePriceChange if grid', () => {
                    const value: StoreProduct = {
                        ...testStoreProduct,
                        wholesalePriceChangeDate: new Date().toString(),
                        wholesalePriceChange: 2.0,
                    };

                    const array = formFactory.grid('StoreProduct', [value], componentDestroyed, {
                        changeDetector: {} as ChangeDetectorRef,
                        selectionModel: new SelectionModel(),
                    });
                    const group = (array.get('data') as FormArray).at(0) as TypedFormGroup<StoreProduct>;

                    group.patchControlValue('wholesalePriceChangeDate', undefined);
                    group.getControl('wholesalePriceChangeDate').updateValueAndValidity();

                    expect(group.getControlValue('wholesalePriceChange')).toEqual(value.wholesalePriceChange);
                });
            });

            describe('promotionPrice', () => {
                it('should require promotionPriceStartDate and promotionPriceEndDate to be set', () => {
                    const value: StoreProduct = {
                        ...testStoreProduct,
                        promotionPrice: 2.0,
                    };
                    const group = formFactory.group('StoreProduct', value, componentDestroyed);

                    group.getControl('promotionPrice').updateValueAndValidity({ emitEvent: false });

                    // 'promotionPrice should be invalid when promotionPriceStartDate and promotionPriceEndDate are not set'
                    expect(group.getControl('promotionPrice').getError('requiredRelated')).toBe(true);
                });
            });

            describe('promotionPriceStartDate', () => {
                it('should require promotionPrice and promotionPriceEndDate to be set', () => {
                    const value: StoreProduct = {
                        ...testStoreProduct,
                        promotionPriceStartDate: new Date().toString(),
                    };
                    const group = formFactory.group('StoreProduct', value, componentDestroyed);

                    group.getControl('promotionPriceStartDate').updateValueAndValidity();

                    // 'promotionPriceStartDate should be invalid when promotionPrice and promotionPriceEndDate are not set'
                    expect(group.getControl('promotionPriceStartDate').getError('requiredRelated')).toBe(true);
                    // 'promotionPrice is required when promotionPriceStartDate is set'
                    expect(group.getControl('promotionPrice').getError('required')).toBe(true);
                    // 'promotionPriceEndDate is required when promotionPriceStartDate is set'
                    expect(group.getControl('promotionPriceEndDate').getError('required')).toBe(true);
                });

                it('should clear promotionPrice and promotionPriceEndDate when cleared', () => {
                    const value: StoreProduct = {
                        ...testStoreProduct,
                        promotionPriceStartDate: new Date().toString(),
                    };

                    const group = formFactory.group('StoreProduct', value, componentDestroyed);
                    group.patchControlValue('promotionPrice', 3.0);
                    group.patchControlValue('promotionPriceEndDate', new Date().toString());
                    group.patchControlValue('promotionPriceStartDate', undefined);
                    group.getControl('promotionPriceStartDate').updateValueAndValidity();

                    // 'promotionPrice should be null when promotionPriceStartDate is cleared'
                    expect(group.getControlValue('promotionPrice')).toBeNull();
                    // 'promotionPriceEndDate should be null when promotionPriceStartDate is cleared'
                    expect(group.getControlValue('promotionPriceEndDate')).toBeNull();
                });

                it('should not clear promotionPrice and promotionPriceEndDate if grid', () => {
                    const value: StoreProduct = {
                        ...testStoreProduct,
                        promotionPrice: 2.0,
                        promotionPriceStartDate: new Date().toString(),
                        promotionPriceEndDate: new Date().toString(),
                    };

                    const array = formFactory.grid('StoreProduct', [value], componentDestroyed, {
                        changeDetector: {} as ChangeDetectorRef,
                        selectionModel: new SelectionModel(),
                    });
                    const group = (array.get('data') as FormArray).at(0) as TypedFormGroup<StoreProduct>;

                    group.patchControlValue('promotionPriceStartDate', undefined);
                    group.getControl('promotionPriceStartDate').updateValueAndValidity();

                    expect(group.getControlValue('promotionPrice')).toEqual(value.promotionPrice);
                    expect(group.getControlValue('promotionPriceEndDate')).toEqual(value.promotionPriceEndDate);
                });
            });

            describe('promotionPriceEndDate', () => {
                it('should require promotionPrice and promotionPriceStartDate to be set', () => {
                    const value: StoreProduct = {
                        ...testStoreProduct,
                        promotionPriceEndDate: new Date().toString(),
                    };
                    const group = formFactory.group('StoreProduct', value, componentDestroyed);

                    group.getControl('promotionPriceEndDate').updateValueAndValidity({ emitEvent: false });
                    group.getControl('promotionPrice').updateValueAndValidity({ emitEvent: false });
                    group.getControl('promotionPriceStartDate').updateValueAndValidity({ emitEvent: false });

                    // 'promotionPriceEndDate should be invalid when promotionPrice and promotionPriceStartDate are not set'
                    expect(group.getControl('promotionPriceEndDate').getError('requiredRelated')).toBe(true);
                    // 'promotionPrice is required when promotionPriceEndDate is set'
                    expect(group.getControl('promotionPrice').getError('required')).toBe(true);
                    // 'promotionPriceStartDate is required when promotionPriceEndDate is set'
                    expect(group.getControl('promotionPriceStartDate').getError('required')).toBe(true);
                });

                it('should be invalid if before the promotionPriceStartDate', () => {
                    const value: StoreProduct = {
                        ...testStoreProduct,
                        promotionPrice: 2.0,
                        promotionPriceStartDate: new Date().toString(),
                        promotionPriceEndDate: new Date('01/01/2000').toString(),
                    };

                    const group = formFactory.group('StoreProduct', value, componentDestroyed);

                    group.getControl('promotionPriceEndDate').updateValueAndValidity();

                    // 'promotionPriceEndDate should be invalid when before the promotionPriceStartDate'
                    expect(group.getControl('promotionPriceEndDate').getError('dateAfter').valid).toBe(false);
                });
            });

            describe('extraChargeAmount', () => {
                it('should require extraChargeDescription to be set', () => {
                    const value: StoreProduct = {
                        ...testStoreProduct,
                        extraChargeAmount: 2.0,
                    };
                    const group = formFactory.group('StoreProduct', value, componentDestroyed);

                    group.getControl('extraChargeAmount').updateValueAndValidity();

                    // 'extraChargeAmount should be invalid when extraChargeDescription is not set'
                    expect(group.getControl('extraChargeAmount').getError('requiredRelated')).toBe(true);
                    // 'extraChargeDescription is required when extraChargeAmount is set'
                    expect(group.getControl('extraChargeDescription').getError('required')).toBe(true);
                });

                it('should clear extraChargeDescription and extraChargeTaxable when cleared', () => {
                    const value: StoreProduct = {
                        ...testStoreProduct,
                        extraChargeAmount: 2.0,
                    };

                    const group = formFactory.group('StoreProduct', value, componentDestroyed);

                    group.patchControlValue('extraChargeDescription', 'test description');
                    group.patchControlValue('extraChargeTaxable', true);
                    group.patchControlValue('extraChargeAmount', undefined);
                    group.getControl('extraChargeAmount').updateValueAndValidity();

                    // 'extraChargeDescription should be null when extraChargeAmount is cleared'
                    expect(group.getControlValue('extraChargeDescription')).toBeNull();
                    expect(group.getControlValue('extraChargeTaxable')).toBeNull();
                });

                it('should not clear extraChargeDescription and extraChargeTaxable when grid', () => {
                    const value: StoreProduct = {
                        ...testStoreProduct,
                        extraChargeAmount: 2.0,
                        extraChargeDescription: 'test description',
                    };

                    const array = formFactory.grid('StoreProduct', [value], componentDestroyed, {
                        changeDetector: {} as ChangeDetectorRef,
                        selectionModel: new SelectionModel(),
                    });
                    const group = (array.get('data') as FormArray).at(0) as TypedFormGroup<StoreProduct>;

                    group.patchControlValue('extraChargeAmount', undefined);
                    group.getControl('extraChargeAmount').updateValueAndValidity();

                    expect(group.getControlValue('extraChargeDescription')).toEqual(value.extraChargeDescription);
                    expect(group.getControlValue('extraChargeTaxable')).toEqual(value.extraChargeTaxable);
                });

                it('should default extraChargeTaxable to true when not null', () => {
                    const value: StoreProduct = {
                        ...testStoreProduct,
                        extraChargeAmount: null,
                        extraChargeTaxable: null, // start with null, so that it gets set to true
                    };
                    const group = formFactory.group('StoreProduct', value, componentDestroyed);

                    group.patchControlValue('extraChargeAmount', 5.0);
                    group.getControl('extraChargeAmount').updateValueAndValidity();

                    // extraChargeTaxable should be true when extraChargeAmount is set
                    expect(group.getControlValue('extraChargeTaxable')).toEqual(true);
                });
            });

            describe('extraChargeDescription', () => {
                it('should require extraChargeAmount to be set', () => {
                    const value: StoreProduct = {
                        ...testStoreProduct,
                        extraChargeDescription: 'test description',
                    };
                    const group = formFactory.group('StoreProduct', value, componentDestroyed);

                    group.getControl('extraChargeDescription').updateValueAndValidity({ emitEvent: false });
                    group.getControl('extraChargeAmount').updateValueAndValidity({ emitEvent: false });

                    // 'extraChargeDescription should be invalid when extraChargeAmount is not set'
                    expect(group.getControl('extraChargeDescription').getError('requiredRelated')).toBe(true);
                    // 'extraChargeAmount is required when extraChargeDescription is set'
                    expect(group.getControl('extraChargeAmount').getError('required')).toBe(true);
                });
            });
        });

        describe('StoreProductMassAdd', () => {
            const testStoreProductMassAdd: StoreProductMassAdd = {
                stores: [],
                products: [],
                storeProduct: new StoreProduct(),
                useDefaultVendor: undefined,
                useDefaultReportOrder: undefined,
            };
            let storeProductMassAddGroup: TypedFormGroup<StoreProductMassAdd>;

            const expectSelectionRequired = (selectionField: 'stores' | 'products', selection: Described | Product) => {
                // patch in an empty array and expect it to be invalid
                storeProductMassAddGroup.patchControlValue(selectionField, [], { emitEvent: false });
                storeProductMassAddGroup.getControl(selectionField).updateValueAndValidity();
                expect(storeProductMassAddGroup.getControl(selectionField).valid).toBe(false);
                // patch in an array containing a value and expect it to be valid
                storeProductMassAddGroup.patchControlValue(selectionField, [selection], { emitEvent: false });
                storeProductMassAddGroup.getControl(selectionField).updateValueAndValidity();
                expect(storeProductMassAddGroup.getControl(selectionField).valid).toBe(true);
            };

            beforeEach(() => {
                storeProductMassAddGroup = formFactory.group(
                    'StoreProductMassAdd',
                    testStoreProductMassAdd,
                    componentDestroyed
                );
            });

            it('should require at least one store to be selected', () => {
                expectSelectionRequired('stores', { id: 1, code: 'S1', description: 'Store 1' } as Described);
            });

            it('should require at least one product to be selected', () => {
                expectSelectionRequired('products', { id: 1, code: 'P1', description: 'Prod 1' } as Product);
            });

            describe('storeProduct', () => {
                let storeProductControl: TypedFormGroup<StoreProduct>;

                const expectDefaultUnselection = (
                    defaultField: 'useDefaultVendor' | 'useDefaultReportOrder',
                    updatedField: 'vendor' | 'reportOrder',
                    newValue: string | Described
                ) => {
                    expect(storeProductMassAddGroup.getControlValue(defaultField)).toBe(true);
                    storeProductControl.patchControlValue(updatedField, newValue);
                    storeProductControl.updateValueAndValidity();
                    expect(storeProductMassAddGroup.getControlValue(defaultField)).toBe(false);
                };

                const expectValueClearOnDefaultSelection = (
                    defaultField: 'useDefaultVendor' | 'useDefaultReportOrder',
                    clearedOutField: 'vendor' | 'reportOrder',
                    initialValue: string | Described
                ) => {
                    storeProductControl.patchControlValue(clearedOutField, initialValue);
                    storeProductControl.getControl(clearedOutField).updateValueAndValidity();
                    expect(storeProductMassAddGroup.getControlValue(defaultField)).toBe(false);
                    storeProductMassAddGroup.patchControlValue(defaultField, true);
                    storeProductMassAddGroup.getControl(defaultField).updateValueAndValidity();
                    expect(storeProductControl.getControlValue(clearedOutField)).toBeNull();
                };

                const expectRequiredOrDefaultedError = (
                    valueField: 'vendor' | 'reportOrder',
                    defaultField: 'useDefaultVendor' | 'useDefaultReportOrder'
                ) => {
                    storeProductControl.patchControlValue(valueField, null);
                    storeProductMassAddGroup.patchControlValue(defaultField, false);
                    storeProductControl.getControl(valueField).updateValueAndValidity();
                    expect(storeProductControl.getControl(valueField).hasError('requiredOrDefaulted')).toBeTruthy();
                };

                beforeEach(() => {
                    storeProductControl = storeProductMassAddGroup.getControl(
                        'storeProduct'
                    ) as TypedFormGroup<StoreProduct>;
                });

                it('should delegate to the StoreProduct validation for the massAdd storeProduct', () => {
                    const groupSpy = jest.spyOn(formFactory, 'group');
                    formFactory.group('StoreProductMassAdd', testStoreProductMassAdd, componentDestroyed);
                    const secondCall = groupSpy.mock.calls[1];
                    expect(secondCall).toEqual([
                        'StoreProduct',
                        testStoreProduct,
                        componentDestroyed,
                        { _modelType: 'StoreProduct' },
                    ]);
                });

                describe('vendor', () => {
                    const testVendor = { id: 1, code: 'V1', description: 'Vendor 1' } as Described;

                    it('should default to using the default vendor', () => {
                        expect(storeProductMassAddGroup.getControlValue('useDefaultVendor')).toBe(true);
                    });

                    it('should deselect useDefaultVendor once a vendor is chosen', () => {
                        expectDefaultUnselection('useDefaultVendor', 'vendor', testVendor);
                    });

                    it('should clear out the vendor once useDefaultVendor is selected', () => {
                        expectValueClearOnDefaultSelection('useDefaultVendor', 'vendor', testVendor);
                    });

                    it('should require a value if not defaulting', () => {
                        expectRequiredOrDefaultedError('vendor', 'useDefaultVendor');
                    });
                });

                describe('reportOrder', () => {
                    it('should default to using the default reportOrder', () => {
                        expect(storeProductMassAddGroup.getControlValue('useDefaultReportOrder')).toBe(true);
                    });

                    it('should deselect useDefaultReportOrder once a reportOrder is entered', () => {
                        expectDefaultUnselection('useDefaultReportOrder', 'reportOrder', 'test1');
                    });

                    it('should clear out the reportOrder once useDefaultReportOrder is selected', () => {
                        expectValueClearOnDefaultSelection('useDefaultReportOrder', 'reportOrder', 'test1');
                    });

                    it('should select useDefaultReportOrder if reportOrder is cleared out', () => {
                        storeProductControl.patchControlValue('reportOrder', 'initialValue');
                        storeProductControl.getControl('reportOrder').updateValueAndValidity();
                        expect(storeProductMassAddGroup.getControlValue('useDefaultReportOrder')).toBe(false);
                        storeProductControl.patchControlValue('reportOrder', null);
                        storeProductControl.getControl('reportOrder').updateValueAndValidity();
                        expect(storeProductMassAddGroup.getControlValue('useDefaultReportOrder')).toBe(true);
                    });

                    it('should require a value if not defaulting', () => {
                        expectRequiredOrDefaultedError('reportOrder', 'useDefaultReportOrder');
                    });

                    it('should validate that reportOrder cannot have more than the max number of characters', () => {
                        storeProductControl.patchControlValue('reportOrder', 'a'.repeat(7));
                        storeProductControl.getControl('reportOrder').updateValueAndValidity();
                        expect(storeProductControl.getControl('reportOrder').hasError('maxlength')).toBeTruthy();
                    });
                });
            });
        });

        describe('storeProductMassUpdate', () => {
            const testStoreProductMassUpdate: StoreProductMassUpdate = {
                stores: [],
                products: [],
                patch: new StoreProduct(),
            };
            let storeProductMassUpdateForm: TypedFormGroup<StoreProductMassUpdate>;

            beforeEach(() => {
                storeProductMassUpdateForm = formFactory.group(
                    'StoreProductMassUpdate',
                    testStoreProductMassUpdate,
                    componentDestroyed
                );
            });

            it('should require at least one store to be selected', () => {
                const selectedStore = { id: 1, code: 'STORE', description: 'Test Store 1' };
                // patch in an empty array and expect it to be invalid
                storeProductMassUpdateForm.patchControlValue('stores', [], { emitEvent: false });
                storeProductMassUpdateForm.getControl('stores').updateValueAndValidity();
                expect(storeProductMassUpdateForm.getControl('stores').valid).toBe(false);
                // patch in an array containing a value and expect it to be valid
                storeProductMassUpdateForm.patchControlValue('stores', [selectedStore], { emitEvent: false });
                storeProductMassUpdateForm.getControl('stores').updateValueAndValidity();
                expect(storeProductMassUpdateForm.getControl('stores').valid).toBe(true);
            });

            it('should require at least one product to be selected', () => {
                const selectedProduct = { id: 1, code: 'PROD', description: 'Test Product 1' };
                // patch in an empty array and expect it to be invalid
                storeProductMassUpdateForm.patchControlValue('products', [], { emitEvent: false });
                storeProductMassUpdateForm.getControl('products').updateValueAndValidity();
                expect(storeProductMassUpdateForm.getControl('products').valid).toBe(false);
                // patch in an array containing a value and expect it to be valid
                storeProductMassUpdateForm.patchControlValue('products', [selectedProduct], { emitEvent: false });
                storeProductMassUpdateForm.getControl('products').updateValueAndValidity();
                expect(storeProductMassUpdateForm.getControl('products').valid).toBe(true);
            });

            it('should require at least one field to be selected for update', () => {
                // patch in an empty store product and expect it to be invalid
                storeProductMassUpdateForm.patchControlValue('patch', new StoreProduct(), { emitEvent: false });
                storeProductMassUpdateForm.getControl('patch').updateValueAndValidity();
                expect(storeProductMassUpdateForm.getControl('patch').valid).toBe(false);
                // mark a single field as dirty and expect it to be valid
                storeProductMassUpdateForm.getControl('patch').get('active').markAsDirty();
                storeProductMassUpdateForm.getControl('patch').updateValueAndValidity();
                expect(storeProductMassUpdateForm.getControl('patch').valid).toBe(true);
            });
        });
    });
});
