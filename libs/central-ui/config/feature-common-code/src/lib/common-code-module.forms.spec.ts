import { ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { CommonCode } from '@vioc-angular/central-ui/config/data-access-common-code';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { FormFactory } from '@vioc-angular/shared/util-form';
import { ReplaySubject } from 'rxjs';
import { CommonCodeForms } from './common-code-module.forms';

describe('CommonCodeForms', () => {
    describe('registerForms', () => {
        it('should register CommonCode models', () => {
            const mockFormFactory = ({ register: jest.fn() } as unknown) as FormFactory;
            CommonCodeForms.registerForms(mockFormFactory, undefined);
            expect(mockFormFactory.register).toHaveBeenCalledWith('CommonCode', expect.any(Function));
        });
    });

    describe('validations', () => {
        const formBuilder = new FormBuilder();
        const formFactory = new FormFactory(formBuilder);
        const testCommonCode: CommonCode = new CommonCode();
        const changeDetector = {} as ChangeDetectorRef;
        let componentDestroyed: ReplaySubject<any>;

        beforeAll(() => CommonCodeForms.registerForms(formFactory, formBuilder));
        beforeEach(() => (componentDestroyed = new ReplaySubject(1)));
        afterEach(() => componentDestroyed.next());

        it('should require changeDetector', () => {
            expect(() => formFactory.group('CommonCode', new CommonCode(), componentDestroyed)).toThrow();
        });

        describe('commonCode', () => {
            let control: FormControl;

            const validateField = (value: any, error: string, toBe: boolean) => {
                control.patchValue(value);
                control.updateValueAndValidity();
                expect(control.hasError(error)).toBe(toBe);
            };

            it('should disable non-editable fields', () => {
                const group = formFactory.group('CommonCode', testCommonCode, componentDestroyed, {
                    changeDetector,
                });
                expect(group.getControl('type').disabled).toBe(true);
                expect(group.getControl('code').disabled).toBe(true);
            });

            describe.each`
                field
                ${'type'}
                ${'code'}
                ${'reportOrder'}
                ${'active'}
                ${'description'}
            `('required fields', ({ field }) => {
                it(`should validate that ${field} is required`, () => {
                    const group = formFactory.group('CommonCode', testCommonCode, componentDestroyed, {
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
                ${'description'} | ${60}
            `('max length of fields', ({ field, maxLength }) => {
                it(`should validate that ${field} cannot have more than ${maxLength} characters`, () => {
                    const group = formFactory.group('CommonCode', testCommonCode, componentDestroyed, {
                        changeDetector,
                        accessMode: AccessMode.ADD,
                    });
                    control = group.getControl(field) as FormControl;

                    validateField('a'.repeat(maxLength + 1), 'maxlength', true);
                    validateField('a'.repeat(maxLength), 'maxlength', false);
                });
            });

            describe.each`
                value     | error    | isErrorPresent
                ${'1000'} | ${'max'} | ${true}
                ${'999'}  | ${'max'} | ${false}
                ${'0'}    | ${'min'} | ${false}
                ${'-1'}   | ${'min'} | ${true}
            `('report order', ({ value, error, isErrorPresent }) => {
                it(`should validate that reportOrder can ${isErrorPresent ? 'not ' : ''}be equal to '${value}'`, () => {
                    const group = formFactory.group('CommonCode', new CommonCode(), componentDestroyed, {
                        changeDetector,
                    });
                    control = group.getControl('reportOrder') as FormControl;

                    validateField(value, error, isErrorPresent);
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
                ${'-'}    | ${false}
                ${'/'}    | ${false}
                ${' '}    | ${false}
                ${'A'}    | ${true}
                ${'a'}    | ${true}
                ${'0'}    | ${true}
                ${'_'}    | ${true}
            `('code', ({ character, allowed }) => {
                let codeControl: FormControl;
                const validateCode = (value: string, error: string, toBe: boolean) => {
                    codeControl.patchValue(value);
                    codeControl.updateValueAndValidity();
                    expect(codeControl.hasError(error)).toBe(toBe);
                };

                it(`should ${allowed ? '' : 'not '}allow '${character}'`, () => {
                    const group = formFactory.group('CommonCode', new CommonCode(), componentDestroyed, {
                        changeDetector,
                        accessMode: AccessMode.ADD,
                    });
                    codeControl = group.getControl('code') as FormControl;
                    validateCode('ABC' + character, 'commonCodePatternError', !allowed);
                });
            });
        });
    });
});
