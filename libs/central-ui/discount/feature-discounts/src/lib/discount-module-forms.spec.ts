import { fakeAsync } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { Discount } from '@vioc-angular/central-ui/discount/data-access-discount';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { ChangeDetectorRef } from '@angular/core';
import { FormFactory } from '@vioc-angular/shared/util-form';
import { DiscountCategory } from 'libs/central-ui/discount/data-access-discount/src/lib/model/discount-category.model';
import { ReplaySubject } from 'rxjs';
import { DiscountModuleForms } from './discount-module-forms';
import moment = require('moment');

describe('DiscountModuleForms', () => {
    describe('registerForms', () => {
        it('should register Offer models', () => {
            const mockFormFactory = { register: jest.fn() } as unknown as FormFactory;
            DiscountModuleForms.registerForms(mockFormFactory, undefined);
            expect(mockFormFactory.register).toHaveBeenCalledWith('Discount', expect.any(Function));
        });
    });

    describe('validations', () => {
        const formBuilder = new FormBuilder();
        const formFactory = new FormFactory(formBuilder);
        const testDiscount: Discount = new Discount();
        const changeDetector = {} as ChangeDetectorRef;
        let componentDestroyed: ReplaySubject<any>;

        beforeAll(() => DiscountModuleForms.registerForms(formFactory, formBuilder));
        beforeEach(() => (componentDestroyed = new ReplaySubject(1)));
        afterEach(() => componentDestroyed.next());

        describe('Discount', () => {
            const today = moment().startOf('day');
            const startDate = moment().startOf('day').subtract(7, 'days');

            it('should disable non-editable fields', () => {
                const group = formFactory.group(
                    'Discount',
                    {
                        ...new Discount(),
                    },
                    componentDestroyed,
                    {
                        accessMode: AccessMode.EDIT,
                    }
                );
                expect(group.getControl('company').disabled).toBeTruthy();
                expect(group.getControl('code').disabled).toBeTruthy();
                expect(group.getControl('startDate').disabled).toBeTruthy();
            });

            it('should default active to false', fakeAsync(() => {
                const group = formFactory.group('Discount', testDiscount, componentDestroyed, {
                    accessMode: AccessMode.EDIT,
                    changeDetector: changeDetector,
                });
                expect(group.getControlValue('active')).toBe(false);
            }));

            describe.each`
                field                  | value                                | error               | showError
                ${'description'}       | ${'Test description'}                | ${'required'}       | ${false}
                ${'description'}       | ${null}                              | ${'required'}       | ${true}
                ${'description'}       | ${'a'.repeat(101)}                   | ${'maxlength'}      | ${true}
                ${'description'}       | ${'a'.repeat(100)}                   | ${'maxlength'}      | ${false}
                ${'endDate'}           | ${today}                             | ${'required'}       | ${false}
                ${'endDate'}           | ${null}                              | ${'required'}       | ${true}
                ${'overrideMinAmount'} | ${1.11}                              | ${'invalidDecimal'} | ${false}
                ${'overrideMinAmount'} | ${1.111}                             | ${'invalidDecimal'} | ${true}
                ${'overrideMaxAmount'} | ${2.22}                              | ${'invalidDecimal'} | ${false}
                ${'overrideMaxAmount'} | ${2.222}                             | ${'invalidDecimal'} | ${true}
                ${'percentMaxAmount'}  | ${3.33}                              | ${'invalidDecimal'} | ${false}
                ${'percentMaxAmount'}  | ${3.333}                             | ${'invalidDecimal'} | ${true}
                ${'endDate'}           | ${today.clone().subtract(1, 'days')} | ${'dateAfter'}      | ${true}
            `('form', ({ field, value, error, showError }) => {
                it(`should ${showError ? '' : 'not '}show error ${error} for field ${field} with value ${value}
            }`, () => {
                    const group = formFactory.group(
                        'Discount',
                        {
                            ...new Discount(),
                        },
                        componentDestroyed,
                        {
                            accessMode: AccessMode.EDIT,
                        }
                    );
                    group.getControl(field).setValue(value);
                    group.getControl(field).updateValueAndValidity();
                    expect(group.getControl(field).hasError(error)).toBe(showError);
                });
            });

            // Test for overrideMinAmount having to be less than overrideMaxAmount
            describe.each`
                field1                 | field2                 | value1       | value2                                   | error                  | showError
                ${'overrideMinAmount'} | ${'overrideMaxAmount'} | ${1}         | ${2}                                     | ${'numberGreaterThan'} | ${false}
                ${'overrideMinAmount'} | ${'overrideMaxAmount'} | ${4}         | ${3}                                     | ${'numberGreaterThan'} | ${true}
                ${'startDate'}         | ${'endDate'}           | ${startDate} | ${today.clone().add(3, 'days')}          | ${'dateAfter'}         | ${false}
                ${'startDate'}         | ${'endDate'}           | ${startDate} | ${startDate.clone().subtract(4, 'days')} | ${'dateAfter'}         | ${true}
            `('form', ({ field1, field2, value1, value2, error, showError }) => {
                it(`should ${
                    showError ? '' : 'not '
                }show error ${error} for fields ${field1} and ${field2} with values ${value1} and ${value2}
            }`, () => {
                    const group = formFactory.group(
                        'Discount',
                        {
                            ...new Discount(),
                        },
                        componentDestroyed,
                        {
                            accessMode: AccessMode.EDIT,
                        }
                    );
                    group.getControl(field1).setValue(value1);
                    group.getControl(field2).setValue(value2);
                    group.getControl(field1).updateValueAndValidity();
                    group.getControl(field2).updateValueAndValidity();
                    // overrideMaxAmount will show a 'must be greater than' error if minOverrideAmount > maxOverrideAmount
                    expect(group.getControl(field2).hasError(error)).toBe(showError);
                });
            });

            describe.each`
                overrideMinAmount | overrideMaxAmount | hasRequiredError_overrideMinAmt | hasRequiredError_overrideMaxAmt
                ${1}              | ${2}              | ${false}                        | ${false}
                ${null}           | ${null}           | ${false}                        | ${false}
                ${3}              | ${null}           | ${false}                        | ${true}
                ${null}           | ${4}              | ${true}                         | ${false}
            `(
                'should be validated',
                ({
                    overrideMinAmount,
                    overrideMaxAmount,
                    hasRequiredError_overrideMinAmt,
                    hasRequiredError_overrideMaxAmt,
                }) => {
                    it(`should ${hasRequiredError_overrideMinAmt ? '' : 'not '}require overrideMinAmount and 
                should ${hasRequiredError_overrideMaxAmt ? '' : 'not '}require overrideMaxAmount`, fakeAsync(() => {
                        const group = formFactory.group('Discount', new Discount(), componentDestroyed);

                        group.getControl('overrideMinAmount').setValue(overrideMinAmount);
                        group.getControl('overrideMaxAmount').setValue(overrideMaxAmount);

                        // Ensures overrideMinAmount only displays required error when overrideMaxAmount has a value
                        expect(group.getControl('overrideMinAmount').hasError('required')).toBe(
                            hasRequiredError_overrideMinAmt
                        );
                        // Ensures overrideMaxAmount only displays required error when overrideMinAmount has a value
                        expect(group.getControl('overrideMaxAmount').hasError('required')).toBe(
                            hasRequiredError_overrideMaxAmt
                        );
                    }));
                }
            );
        });

        describe.each`
            field                   | value                                                                              | type                  | error         | showError
            ${'discountCategories'} | ${[{ ...new DiscountCategory(), approach: { code: 'PERCENTOFF' }, amount: null }]} | ${'LINEITEM'}         | ${'required'} | ${true}
            ${'discountCategories'} | ${[{ ...new DiscountCategory(), approach: { code: 'PERCENTOFF' }, amount: 20 }]}   | ${'LINEITEM'}         | ${'required'} | ${false}
            ${'discountCategories'} | ${[{ ...new DiscountCategory() }]}                                                 | ${'EXCLUDE_LINEITEM'} | ${'required'} | ${false}
            ${'discountCategories'} | ${[{ ...new DiscountCategory() }]}                                                 | ${'INVOICE'}          | ${'required'} | ${false}
        `('form', ({ field, value, type, error, showError }) => {
            it(`should show ${showError ? '' : 'not '}error ${error} for field ${field} with amount ${
                value[0].amount
            } for type ${type} with ADD access`, () => {
                const group = formFactory.group(
                    'Discount',
                    { ...new Discount(), type: { code: type }, discountCategories: value },
                    componentDestroyed
                );
                group.getArray(field).updateValueAndValidity();
                group.getArray(field).controls.forEach((c: any) => {
                    expect(c.getControl('amount').hasError(error)).toBe(showError);
                });
            });
        });

        describe.each`
            field                   | value | type                  | error         | showError
            ${'discountCategories'} | ${[]} | ${'LINEITEM'}         | ${'required'} | ${true}
            ${'discountCategories'} | ${[]} | ${'EXCLUDE_LINEITEM'} | ${'required'} | ${true}
            ${'discountCategories'} | ${[]} | ${'INVOICE'}          | ${'required'} | ${false}
        `('form', ({ field, value, type, error, showError }) => {
            it(`should test ${
                showError ? '' : 'not '
            } ${error} for field ${field} with value ${value} for type ${type} with ADD access`, () => {
                const group = formFactory.group(
                    'Discount',
                    { ...new Discount(), type: { code: type }, discountCategories: value },
                    componentDestroyed
                );
                group.getArray(field).updateValueAndValidity();
                expect(group.getArray(field).hasError(error)).toBe(showError);
            });
        });

        describe('Add Mode', () => {
            let group = null;

            beforeEach(() => {
                group = formFactory.group('Discount', testDiscount, componentDestroyed, {
                    accessMode: AccessMode.ADD,
                    changeDetector: changeDetector,
                });
            });

            it('should not disable editable fields', () => {
                expect(group.getControl('company').disabled).toBeFalsy();
                expect(group.getControl('code').disabled).toBeFalsy();
                expect(group.getControl('startDate').disabled).toBeFalsy();
            });

            it('should default booleans to false', fakeAsync(() => {
                expect(group.getControlValue('active')).toBe(false);
                expect(group.getControlValue('uniqueCodeRequired')).toBe(false);
                expect(group.getControlValue('fleetOnly')).toBe(false);
                expect(group.getControlValue('extraChargesSupported')).toBe(false);
                expect(group.getControlValue('overridable')).toBe(false);
                expect(group.getControlValue('explanationRequired')).toBe(false);
            }));

            it('should require a discount code', fakeAsync(() => {
                group.getControl('code').setValue(null);
                group.getControl('code').updateValueAndValidity();
                expect(group.getControl('code').hasError('required')).toBe(true);
            }));

            it('should have a max length of 5 on discount code', fakeAsync(() => {
                group.getControl('code').setValue('a'.repeat(8));
                group.getControl('code').updateValueAndValidity();
                expect(group.getControl('code').hasError('maxlength')).toBe(true);
            }));

            it('should not require a company when national discount add role is present', fakeAsync(() => {
                group.getControl('company').updateValueAndValidity();
                expect(group.getControl('company').hasError('required')).toBe(false);
            }));

            it('should require startDate to be on or after current date', fakeAsync(() => {
                const today = moment().startOf('day');
                group.getControl('startDate').setValue(today);
                group.getControl('startDate').updateValueAndValidity();
                expect(group.getControl('startDate').hasError('dateAfter')).toBe(false);
                group.getControl('startDate').setValue(today.clone().subtract(1));
                group.getControl('startDate').updateValueAndValidity();
                expect(group.getControl('startDate').hasError('dateAfter')).toBe(true);
            }));
        });
    });
});
