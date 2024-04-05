import { ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import {
    ProductCategory,
    ProductCategoryMotorInfo,
} from '@vioc-angular/central-ui/product/data-access-product-category';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { FormFactory } from '@vioc-angular/shared/util-form';
import { ReplaySubject } from 'rxjs';
import { ProductCategoryModuleForms } from './product-category-module-forms';

describe('ProductCategoryModuleForms', () => {
    describe('registerForms', () => {
        it('should register ProductCategory models', () => {
            const mockFormFactory = ({ register: jest.fn() } as unknown) as FormFactory;
            ProductCategoryModuleForms.registerForms(mockFormFactory, undefined);
            expect(mockFormFactory.register).toHaveBeenCalledWith('ProductCategory', expect.any(Function));
            expect(mockFormFactory.register).toHaveBeenCalledWith('ProductCategoryMotorInfo', expect.any(Function));
        });
    });

    describe('validations', () => {
        const formBuilder = new FormBuilder();
        const formFactory = new FormFactory(formBuilder);
        const testProductCategory: ProductCategory = new ProductCategory();
        const testMotorInfo: ProductCategoryMotorInfo = {
            primaryTable: 'Primary Table',
            primaryColumn: 'Primary Column',
            secondaryTable: 'Secondary Table',
            secondaryColumn: 'Secondary Column',
        };
        const changeDetector = {} as ChangeDetectorRef;
        let componentDestroyed: ReplaySubject<any>;
        let control: FormControl;

        const validateField = (value: any, error: string, toBe: boolean) => {
            control.patchValue(value);
            control.updateValueAndValidity();
            expect(control.hasError(error)).toBe(toBe);
        };

        beforeAll(() => ProductCategoryModuleForms.registerForms(formFactory, formBuilder));
        beforeEach(() => (componentDestroyed = new ReplaySubject(1)));
        afterEach(() => componentDestroyed.next());

        it('should require changeDetector', () => {
            expect(() => formFactory.group('ProductCategory', new ProductCategory(), componentDestroyed)).toThrow();
        });

        describe('ProductCategory', () => {
            it('should disable non-editable fields', () => {
                const group = formFactory.group('ProductCategory', testProductCategory, componentDestroyed, {
                    changeDetector,
                });
                expect(group.getControl('code').disabled).toBe(true);
            });

            describe.each`
                field
                ${'code'}
                ${'active'}
                ${'description'}
                ${'nacsProductCode'}
            `('required fields', ({ field }) => {
                it(`should validate that ${field} is required`, () => {
                    const group = formFactory.group('ProductCategory', testProductCategory, componentDestroyed, {
                        changeDetector,
                        accessMode: AccessMode.ADD,
                    });
                    group.getControl(field).updateValueAndValidity();
                    expect(group.getControl(field).hasError('required')).toBe(true);
                });
            });

            describe.each`
                field            | maxLength
                ${'code'}        | ${25}
                ${'description'} | ${50}
            `('max length of fields', ({ field, maxLength }) => {
                it(`should validate that ${field} cannot have more than ${maxLength} characters`, () => {
                    const group = formFactory.group('ProductCategory', testProductCategory, componentDestroyed, {
                        changeDetector,
                        accessMode: AccessMode.ADD,
                    });
                    control = group.getControl(field) as FormControl;

                    validateField('a'.repeat(maxLength + 1), 'maxlength', true);
                    validateField('a'.repeat(maxLength), 'maxlength', false);
                });
            });

            describe.each`
                fieldName                  | value        | errorCode | showError
                ${'productRatingPriority'} | ${1_000}     | ${'max'}  | ${true}
                ${'productRatingPriority'} | ${999}       | ${'max'}  | ${false}
                ${'productRatingPriority'} | ${0}         | ${'min'}  | ${false}
                ${'productRatingPriority'} | ${-1}        | ${'min'}  | ${true}
                ${'reportOrder'}           | ${1_000_000} | ${'max'}  | ${true}
                ${'reportOrder'}           | ${999_999}   | ${'max'}  | ${false}
                ${'reportOrder'}           | ${0}         | ${'min'}  | ${false}
                ${'reportOrder'}           | ${-1}        | ${'min'}  | ${true}
            `('integer fields', ({ fieldName, value, errorCode, showError }) => {
                it(`should ${
                    showError ? '' : 'not '
                }show the '${errorCode}' error for ${fieldName} if the value is ${value}`, () => {
                    const group = formFactory.group('ProductCategory', testProductCategory, componentDestroyed, {
                        changeDetector,
                    });
                    control = group.getControl(fieldName) as FormControl;
                    validateField(value, errorCode, showError);
                });
            });

            describe.each`
                character | allowed
                ${'!'}    | ${false}
                ${'@'}    | ${false}
                ${'#'}    | ${false}
                ${'$'}    | ${false}
                ${'%'}    | ${false}
                ${'^'}    | ${false}
                ${'&'}    | ${false}
                ${'*'}    | ${false}
                ${'+'}    | ${false}
                ${'='}    | ${false}
                ${'/'}    | ${false}
                ${'_'}    | ${false}
                ${'a'}    | ${false}
                ${' '}    | ${true}
                ${'A'}    | ${true}
                ${'0'}    | ${true}
                ${'-'}    | ${true}
            `('code', ({ character, allowed }) => {
                let codeControl: FormControl;
                const validateCode = (value: string, error: string, toBe: boolean) => {
                    codeControl.patchValue(value);
                    codeControl.updateValueAndValidity();
                    expect(codeControl.hasError(error)).toBe(toBe);
                };
                it(`should ${allowed ? '' : 'not '}allow '${character}'`, () => {
                    const group = formFactory.group('ProductCategory', new ProductCategory(), componentDestroyed, {
                        changeDetector,
                        accessMode: AccessMode.ADD,
                    });
                    codeControl = group.getControl('code') as FormControl;
                    validateCode('ABC' + character, 'productCategoryCodePatternError', !allowed);
                });
            });
        });

        describe('ProductCategoryMotorInfo', () => {
            describe.each`
                field                | maxLength
                ${'primaryTable'}    | ${100}
                ${'primaryColumn'}   | ${100}
                ${'secondaryTable'}  | ${100}
                ${'secondaryColumn'} | ${100}
            `('max length of fields', ({ field, maxLength }) => {
                it(`should validate that ${field} cannot have more than ${maxLength} characters`, () => {
                    const group = formFactory.group('ProductCategoryMotorInfo', testMotorInfo, componentDestroyed, {
                        changeDetector,
                    });
                    control = group.getControl(field) as FormControl;
                    validateField('a'.repeat(maxLength + 1), 'maxlength', true);
                    validateField('a'.repeat(maxLength), 'maxlength', false);
                });
            });

            describe.each`
                field                | requiredField
                ${'primaryTable'}    | ${'primaryColumn'}
                ${'primaryColumn'}   | ${'primaryTable'}
                ${'secondaryTable'}  | ${'secondaryColumn'}
                ${'secondaryColumn'} | ${'secondaryTable'}
            `('required field grouping', ({ field, requiredField }) => {
                it(`should validate that ${field} requires ${requiredField} to be set`, () => {
                    const group = formFactory.group('ProductCategoryMotorInfo', testMotorInfo, componentDestroyed, {
                        changeDetector,
                    });
                    group.patchControlValue(requiredField, null);
                    group.getControl(field).updateValueAndValidity();

                    expect(group.getControl(field).getError('requiredRelated')).toBe(true);
                    expect(group.getControl(requiredField).getError('required')).toBe(true);
                });
            });

            describe.each`
                field                | requiredField
                ${'secondaryTable'}  | ${'primaryTable'}
                ${'secondaryColumn'} | ${'primaryColumn'}
            `('required if field present', ({ field, requiredField }) => {
                it(`should validate that ${field} requires ${requiredField} to be present`, () => {
                    const group = formFactory.group('ProductCategoryMotorInfo', testMotorInfo, componentDestroyed, {
                        changeDetector,
                    });
                    group.patchControlValue(requiredField, null);
                    group.getControl(field).updateValueAndValidity();

                    expect(group.getControl(requiredField).getError('required')).toBe(true);
                });
            });
        });
    });
});
