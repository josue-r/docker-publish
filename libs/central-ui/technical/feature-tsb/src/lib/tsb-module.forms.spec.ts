import { fakeAsync, flush } from '@angular/core/testing';
import { FormArray, FormBuilder } from '@angular/forms';
import { CommonTechnicalModuleForms } from '@vioc-angular/central-ui/technical/common-technical';
import { Tsb, YearMakeModelEngine } from '@vioc-angular/central-ui/technical/data-access-tsb';
import { FormFactory } from '@vioc-angular/shared/util-form';
import { ReplaySubject } from 'rxjs';
import { TsbForms } from './tsb-module.forms';

describe('TsbForms', () => {
    const formBuilder = new FormBuilder();
    const formFactory = new FormFactory(formBuilder);
    let componentDestroyed: ReplaySubject<any>;

    const vehicle = { ...new YearMakeModelEngine(), yearStart: 1980, yearEnd: 1985 };

    const buildTsbFormGroup = (modelOpts: Tsb = {}) => {
        const model = { ...new Tsb(), ...modelOpts };
        return formFactory.group('Tsb', model, componentDestroyed);
    };

    beforeAll(() => {
        TsbForms.registerForms(formFactory, formBuilder);
        CommonTechnicalModuleForms.registerForms(formFactory, formBuilder);
    });

    beforeEach(() => (componentDestroyed = new ReplaySubject(1)));

    afterEach(() => componentDestroyed.next());

    describe('registerForms', () => {
        it('should register the tsb form creator', () => {
            const mockFormFactory = ({ register: jest.fn() } as unknown) as FormFactory;
            TsbForms.registerForms(mockFormFactory, formBuilder);
            expect(mockFormFactory.register).toHaveBeenCalledWith('Tsb', expect.any(Function));
        });
    });

    describe('validations', () => {
        describe('Tsb', () => {
            describe.each`
                value             | expectedError
                ${'Valid Name'}   | ${null}
                ${null}           | ${'required'}
                ${'a'.repeat(61)} | ${'maxlength'}
            `('name', ({ value, expectedError }) => {
                it(`should have ${expectedError} error when value is ${value}`, () => {
                    const group = buildTsbFormGroup({ name: value });
                    const control = group.getControl('name');
                    control.updateValueAndValidity();
                    if (expectedError) {
                        expect(control.getError(expectedError)).toBeTruthy();
                    } else {
                        expect(control.getError(expectedError)).toBeFalsy();
                    }
                });
            });

            describe('serviceCategory', () => {
                const serviceCategory = { id: 3, code: 'Test Cat' };

                describe.each`
                    modelOpts                                                     | expectError
                    ${{}}                                                         | ${false}
                    ${{ serviceCategory, vehicles: [vehicle] }}                   | ${false}
                    ${{ serviceCategory }}                                        | ${true}
                    ${{ serviceCategory, vehicles: [new YearMakeModelEngine()] }} | ${true}
                `('requiresVehicleSpecification', ({ modelOpts, expectError }) => {
                    it(`should ${expectError ? '' : 'not '}error with model=${JSON.stringify(modelOpts)}`, () => {
                        const group = buildTsbFormGroup(modelOpts);
                        const control = group.getControl('serviceCategory');
                        control.updateValueAndValidity();
                        expect(control.invalid).toEqual(expectError);
                    });
                });

                it('should validate service category if the vehicles change', fakeAsync(() => {
                    const vehicles = [vehicle];
                    const group = buildTsbFormGroup({ vehicles });
                    const updateSpy = jest.spyOn(group.getControl('serviceCategory'), 'updateValueAndValidity');
                    group.getArray('vehicles').get('0').get('yearStart').setValue(2021);
                    flush();
                    expect(updateSpy).toHaveBeenCalled();
                }));
            });

            describe('documentFile', () => {
                const documentFile = { id: 3, fileName: 'Test.pdf', document: 'abc=', mimeType: 'application/pdf' };
                const externalLink = 'https://www.google.com';

                describe.each`
                    modelOpts                                     | expectError
                    ${{ documentFile, externalLink }}             | ${false}
                    ${{ documentFile: null, externalLink }}       | ${false}
                    ${{ documentFile, externalLink: null }}       | ${false}
                    ${{ documentFile: null, externalLink: null }} | ${true}
                `('oneOfRequired', ({ modelOpts, expectError }) => {
                    it(`should ${expectError ? '' : 'not '}error with model=${JSON.stringify(modelOpts)}`, () => {
                        const group = buildTsbFormGroup(modelOpts);
                        const control = group.getControl('documentFile');
                        control.updateValueAndValidity();
                        expect(control.invalid).toEqual(expectError);
                    });
                });
            });

            it('should validate externalLink url', () => {
                const group = buildTsbFormGroup({ externalLink: 'invalid url' });
                const control = group.getControl('externalLink');
                control.updateValueAndValidity();
                expect(control.hasError('invalidUrl')).toBeTruthy();
            });
        });
    });

    describe('defaults', () => {
        describe('Tsb', () => {
            describe.each`
                value    | expected
                ${null}  | ${true}
                ${true}  | ${true}
                ${false} | ${false}
            `('active', ({ value, expected }) => {
                it(`should be ${expected} if the model value is ${value}`, () => {
                    const group = buildTsbFormGroup({ active: value });
                    expect(group.getControlValue('active')).toEqual(expected);
                });
            });
        });
    });

    describe('child forms', () => {
        it('should create a formArray for the vehicles', () => {
            const vehicles = [vehicle];
            const formArraySpy = jest.spyOn(formFactory, 'array');
            const group = buildTsbFormGroup({ vehicles });
            expect(formArraySpy).toHaveBeenCalledWith(
                'YearMakeModelEngine',
                vehicles,
                componentDestroyed,
                expect.anything()
            );
            expect(group.getControl('vehicles')).toBeInstanceOf(FormArray);
        });
    });
});
