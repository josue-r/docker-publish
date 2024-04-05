import { FormBuilder } from '@angular/forms';
import { Attribute, YearMakeModelEngine } from '@vioc-angular/central-ui/technical/data-access-tsb';
import { Described, isNullOrUndefined } from '@vioc-angular/shared/common-functionality';
import { FormFactory, TypedFormGroup } from '@vioc-angular/shared/util-form';
import { ReplaySubject } from 'rxjs';
import { CommonTechnicalModuleForms } from './common-technical-module-forms';

describe('CommonTechnicalModuleForms', () => {
    describe('registerForms', () => {
        it('should register YearMakeModelEngine models', () => {
            const mockFormFactory = ({ register: jest.fn() } as unknown) as FormFactory;
            CommonTechnicalModuleForms.registerForms(mockFormFactory, undefined);
            expect(mockFormFactory.register).toHaveBeenCalledWith('YearMakeModelEngine', expect.any(Function));
        });

        it('should register Attribute models', () => {
            const mockFormFactory = ({ register: jest.fn() } as unknown) as FormFactory;
            CommonTechnicalModuleForms.registerForms(mockFormFactory, undefined);
            expect(mockFormFactory.register).toHaveBeenCalledWith('Attribute', expect.any(Function));
        });
    });

    describe('validations', () => {
        let componentDestroyed: ReplaySubject<any>;

        const formBuilder = new FormBuilder();
        const formFactory = new FormFactory(formBuilder);
        const testYearMakeModelEngine: YearMakeModelEngine = {
            id: 1,
            yearStart: 1999,
            yearEnd: 2001,
            makeId: 1000,
            modelId: 1001,
            engineConfigId: 1002,
            attributes: [],
        };

        beforeAll(() => CommonTechnicalModuleForms.registerForms(formFactory, formBuilder));
        beforeEach(() => (componentDestroyed = new ReplaySubject(1)));
        afterEach(() => componentDestroyed.next());

        describe('YearMakeModelEngine', () => {
            it('should create a form', () => {
                const control = formFactory.group('YearMakeModelEngine', new YearMakeModelEngine(), componentDestroyed);
                expect(isNullOrUndefined(control)).toEqual(false);
            });

            describe('validations', () => {
                it.each`
                    field          | value                              | error                 | hasError
                    ${'yearStart'} | ${'aaaa'}                          | ${'invalidInteger'}   | ${true}
                    ${'yearStart'} | ${199}                             | ${'invalidYear'}      | ${true}
                    ${'yearStart'} | ${2020}                            | ${'invalidStartYear'} | ${true}
                    ${'yearStart'} | ${testYearMakeModelEngine.yearEnd} | ${'invalidStartYear'} | ${false}
                    ${'yearEnd'}   | ${'aaaba'}                         | ${'invalidInteger'}   | ${true}
                    ${'yearEnd'}   | ${100}                             | ${'invalidYear'}      | ${true}
                `(
                    `should validate the $field error state for $error is $hasError`,
                    ({ field, value, error, hasError }) => {
                        const control = formFactory.group(
                            'YearMakeModelEngine',
                            testYearMakeModelEngine,
                            componentDestroyed
                        );
                        control.get(field).patchValue(value);
                        control.updateValueAndValidity();
                        expect(control.get(field).hasError(error)).toEqual(hasError);
                    }
                );
            });

            describe.each`
                changedField | initialValue | newValue | clears   | clearableFields
                ${'makeId'}  | ${3}         | ${4}     | ${true}  | ${['modelId', 'engineConfigId']}
                ${'modelId'} | ${20}        | ${21}    | ${true}  | ${['engineConfigId']}
                ${'makeId'}  | ${3}         | ${null}  | ${true}  | ${['modelId', 'engineConfigId']}
                ${'modelId'} | ${20}        | ${null}  | ${true}  | ${['engineConfigId']}
                ${'makeId'}  | ${5}         | ${5}     | ${false} | ${['modelId', 'engineConfigId']}
                ${'modelId'} | ${25}        | ${25}    | ${false} | ${['engineConfigId']}
            `(
                'clearing fields on $changedField change',
                ({ changedField, initialValue, newValue, clears, clearableFields }) => {
                    it(`should ${
                        clears ? '' : 'not '
                    }clear ${clearableFields} when changing from ${initialValue} to ${newValue}`, () => {
                        const model = testYearMakeModelEngine;
                        model[changedField] = initialValue;
                        const control = formFactory.group('YearMakeModelEngine', model, componentDestroyed);
                        // verify that the fields have a starting value
                        clearableFields.forEach((f) => expect(control.get(f).value).not.toBeNull());
                        // update to the new value
                        control.get(changedField).patchValue(newValue);
                        control.updateValueAndValidity();
                        if (clears) {
                            clearableFields.forEach((f) => expect(control.get(f).value).toBeNull());
                        } else {
                            clearableFields.forEach((f) => expect(control.get(f).value).not.toBeNull());
                        }
                    });
                }
            );
        });

        describe('Attribute', () => {
            let control: TypedFormGroup<Attribute>;
            const testAttribute: Attribute = {
                type: { id: 1, code: 'TEST', description: 'Test Type', version: 0 },
                key: 100,
            };

            beforeEach(() => {
                control = formFactory.group('Attribute', testAttribute, componentDestroyed);
            });

            it('should create a form', () => {
                expect(isNullOrUndefined(control)).toEqual(false);
            });

            it('should clear the Key field when the Type field changes', () => {
                control.getControl('type').patchValue(new Described());
                expect(control.getControlValue('key')).toBeNull();
            });

            it('should require the key if the type has a value', () => {
                control.getControl('type').patchValue(new Described());
                expect(control.getControl('key').hasError('required')).toEqual(true);
            });
        });
    });
});
