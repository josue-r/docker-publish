import { FormArray, FormBuilder } from '@angular/forms';
import { CommonTechnicalModuleForms } from '@vioc-angular/central-ui/technical/common-technical';
import { TechnicalAlert } from '@vioc-angular/central-ui/technical/data-access-technical-alert';
import { YearMakeModelEngine } from '@vioc-angular/central-ui/technical/data-access-tsb';
import { FormFactory } from '@vioc-angular/shared/util-form';
import { ReplaySubject } from 'rxjs';
import { TechnicalAlertForms } from './technical-alert-module.forms';

describe('TechnicalAlertForms', () => {
    const formBuilder = new FormBuilder();
    const formFactory = new FormFactory(formBuilder);
    let componentDestroyed: ReplaySubject<any>;

    const vehicle = { ...new YearMakeModelEngine(), yearStart: 1980, yearEnd: 1985 };

    beforeAll(() => {
        TechnicalAlertForms.registerForms(formFactory, formBuilder);
        CommonTechnicalModuleForms.registerForms(formFactory, formBuilder);
    });

    beforeEach(() => (componentDestroyed = new ReplaySubject(1)));

    afterEach(() => componentDestroyed.next());

    describe('registerForms', () => {
        it('should register the TechnicalAlert form creator', () => {
            const mockFormFactory = ({ register: jest.fn() } as unknown) as FormFactory;
            TechnicalAlertForms.registerForms(mockFormFactory, formBuilder);
            expect(mockFormFactory.register).toHaveBeenCalledWith('TechnicalAlert', expect.any(Function));
        });
    });

    describe('validations', () => {
        describe('TechnicalAlert', () => {
            describe.each`
                field         | value               | expectedError
                ${'name'}     | ${'Valid Name'}     | ${null}
                ${'name'}     | ${null}             | ${'required'}
                ${'name'}     | ${'a'.repeat(61)}   | ${'maxlength'}
                ${'comments'} | ${'Valid Comment'}  | ${null}
                ${'comments'} | ${null}             | ${'required'}
                ${'comments'} | ${'a'.repeat(4001)} | ${'maxlength'}
            `('$field', ({ field, value, expectedError }) => {
                it(`should receive ${expectedError ? expectedError : `no error`} when the value is ${value}`, () => {
                    const technicalAlert = new TechnicalAlert();
                    technicalAlert[field] = value;
                    const group = formFactory.group('TechnicalAlert', technicalAlert, componentDestroyed);
                    const control = group.getControl(field);
                    control.updateValueAndValidity();
                    if (expectedError) {
                        expect(control.getError(expectedError)).toBeTruthy();
                    } else {
                        expect(control.getError(expectedError)).toBeFalsy();
                    }
                });
            });
        });

        describe('documentFile', () => {
            it('should validate externalLink url', () => {
                const group = formFactory.group(
                    'TechnicalAlert',
                    { ...new TechnicalAlert(), externalLink: 'invalid url' },
                    componentDestroyed
                );
                const control = group.getControl('externalLink');
                control.updateValueAndValidity();
                expect(control.hasError('invalidUrl')).toBeTruthy();
            });
        });
    });

    describe('defaults', () => {
        describe('TechnicalAlert', () => {
            describe.each`
                value    | expected
                ${null}  | ${true}
                ${true}  | ${true}
                ${false} | ${false}
            `('active', ({ value, expected }) => {
                it(`should be ${expected} if the model value is ${value}`, () => {
                    const group = formFactory.group(
                        'TechnicalAlert',
                        { ...new TechnicalAlert(), active: value },
                        componentDestroyed
                    );
                    expect(group.getControlValue('active')).toEqual(expected);
                });
            });
        });
    });

    describe('vehicles', () => {
        it('should create a formArray', () => {
            const vehicles = [{ ...new YearMakeModelEngine(), yearStart: 1990, yearEnd: 2000 }];
            jest.spyOn(formFactory, 'array');
            const group = formFactory.group(
                'TechnicalAlert',
                { ...new TechnicalAlert(), vehicles },
                componentDestroyed
            );
            expect(formFactory.array).toHaveBeenCalledWith(
                'YearMakeModelEngine',
                vehicles,
                componentDestroyed,
                expect.anything()
            );
            expect(group.getControl('vehicles')).toBeInstanceOf(FormArray);
        });
    });
});
