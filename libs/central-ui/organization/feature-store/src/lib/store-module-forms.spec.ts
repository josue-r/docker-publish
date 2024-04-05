import { fakeAsync } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { Store } from '@vioc-angular/central-ui/organization/data-access-store';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { FormFactory } from '@vioc-angular/shared/util-form';
import { ReplaySubject } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
import { StoreModuleForms } from './store-module-forms';

describe('StoreModuleForms', () => {
    describe('registerForms', () => {
        it('should register Store models', () => {
            const mockFormFactory = { register: jest.fn() } as unknown as FormFactory;
            StoreModuleForms.registerForms(mockFormFactory, undefined);
            expect(mockFormFactory.register).toHaveBeenCalledWith('Store', expect.any(Function));
        });
    });

    describe('validations', () => {
        const formBuilder = new FormBuilder();
        const formFactory = new FormFactory(formBuilder);
        const changeDetector = {} as ChangeDetectorRef;
        let componentDestroyed: ReplaySubject<any>;

        beforeAll(() => StoreModuleForms.registerForms(formFactory, formBuilder));
        beforeEach(() => (componentDestroyed = new ReplaySubject(1)));
        afterEach(() => componentDestroyed.next());

        describe('Store', () => {
            describe('validations', () => {
                const testStore: Store = {
                    id: 123456,
                    code: 'testStore',
                    description: 'Test Store',
                    active: true,
                    version: 0,
                    phone: '111-222-3333',
                    fax: '444-555-6666',
                    emergencyPhone: '777-888-9999',
                    latitude: 10,
                    longitude: 5,
                    locationDirections: 'Directions to Store',
                    communitiesServed: 'Test Data: Bloomington',
                    sameStoreReporting: true,
                };

                describe.each`
                    control             | accessMode         | disabled
                    ${'code'}           | ${AccessMode.EDIT} | ${true}
                    ${'description'}    | ${AccessMode.EDIT} | ${true}
                    ${'active'}         | ${AccessMode.EDIT} | ${true}
                    ${'phone'}          | ${AccessMode.EDIT} | ${true}
                    ${'fax'}            | ${AccessMode.EDIT} | ${true}
                    ${'emergencyPhone'} | ${AccessMode.EDIT} | ${true}
                `('values', ({ control, accessMode, disabled }) => {
                    it(`should ${disabled ? '' : 'not '}disable ${control} in ${accessMode} mode`, fakeAsync(() => {
                        const group = formFactory.group('Store', { ...new Store() }, componentDestroyed, {
                            accessMode,
                        });
                        expect(group.getControl(control).disabled).toBe(disabled);
                    }));
                });

                describe.each`
                    field                   | maxLength
                    ${'locationDirections'} | ${1024}
                    ${'communitiesServed'}  | ${255}
                `('maxLength', ({ field, maxLength }) => {
                    it(`should limit ${field} to ${maxLength} characters`, () => {
                        // verify with invalid length
                        const model = new Store();
                        model[field] = 'a'.repeat(maxLength + 1);
                        const groupMaxLengthError = formFactory.group('Store', model, componentDestroyed, {
                            accessMode: AccessMode.EDIT,
                        });
                        groupMaxLengthError.getControl(field).updateValueAndValidity();
                        expect(groupMaxLengthError.getControl(field).hasError('maxlength')).toBe(true);
                        // verify with valid length
                        model[field] = 'a'.repeat(maxLength);
                        const group = formFactory.group('Store', model, componentDestroyed, {
                            accessMode: AccessMode.EDIT,
                        });
                        group.getControl(field).updateValueAndValidity();
                        expect(group.getControl(field).hasError('maxlength')).toBe(false);
                    });
                });

                describe('latitude', () => {
                    describe.each`
                        value        | error               | present
                        ${90}        | ${'max'}            | ${false}
                        ${91}        | ${'max'}            | ${true}
                        ${-90}       | ${'min'}            | ${false}
                        ${-91}       | ${'min'}            | ${true}
                        ${10.12345}  | ${'invalidDecimal'} | ${false}
                        ${10.123456} | ${'invalidDecimal'} | ${true}
                    `('should validate latitude min/max value', ({ value, error, present }) => {
                        it(`with value ${value} ${present ? 'has' : 'does not have'} error ${error}`, () => {
                            const group = formFactory.group('Store', testStore, componentDestroyed, {
                                accessMode: AccessMode.EDIT,
                            });
                            const quantityControl = group.getControl('latitude');
                            quantityControl.patchValue(value);
                            quantityControl.updateValueAndValidity();

                            expect(quantityControl.hasError(error)).toBe(present);
                        });
                    });

                    describe.each`
                        longitude | latitude | hasRequiredError
                        ${10}     | ${5}     | ${false}
                        ${null}   | ${null}  | ${false}
                        ${10}     | ${null}  | ${true}
                        ${null}   | ${5}     | ${false}
                        ${0}      | ${null}  | ${true}
                        ${null}   | ${0}     | ${false}
                        ${0}      | ${0}     | ${false}
                    `('should be validated', ({ latitude, longitude, hasRequiredError }) => {
                        it(`should ${hasRequiredError ? '' : 'not '}require latitude`, fakeAsync(() => {
                            const group = formFactory.group('Store', testStore, componentDestroyed);

                            group.getControl('latitude').setValue(latitude);
                            group.getControl('longitude').setValue(longitude);

                            expect(group.getControl('latitude').hasError('required')).toBe(hasRequiredError);
                        }));
                    });
                });

                describe('longitude', () => {
                    describe.each`
                        value        | error               | present
                        ${180}       | ${'max'}            | ${false}
                        ${181}       | ${'max'}            | ${true}
                        ${-180}      | ${'min'}            | ${false}
                        ${-181}      | ${'min'}            | ${true}
                        ${10.12345}  | ${'invalidDecimal'} | ${false}
                        ${10.123456} | ${'invalidDecimal'} | ${true}
                    `('should validate longitude min/max value', ({ value, error, present }) => {
                        it(`with value ${value} ${present ? 'has' : 'does not have'} error ${error}`, () => {
                            const group = formFactory.group('Store', testStore, componentDestroyed, {
                                accessMode: AccessMode.EDIT,
                            });
                            const quantityControl = group.getControl('longitude');
                            quantityControl.patchValue(value);
                            quantityControl.updateValueAndValidity();

                            expect(quantityControl.hasError(error)).toBe(present);
                        });
                    });

                    describe.each`
                        longitude | latitude | hasRequiredError
                        ${10}     | ${5}     | ${false}
                        ${null}   | ${null}  | ${false}
                        ${10}     | ${null}  | ${false}
                        ${null}   | ${5}     | ${true}
                        ${0}      | ${null}  | ${false}
                        ${null}   | ${0}     | ${true}
                        ${0}      | ${0}     | ${false}
                    `('should be validated', ({ latitude, longitude, hasRequiredError }) => {
                        it(`should ${hasRequiredError ? '' : 'not '}require longitude`, fakeAsync(() => {
                            const group = formFactory.group('Store', testStore, componentDestroyed);

                            group.getControl('latitude').setValue(latitude);
                            group.getControl('longitude').setValue(longitude);

                            expect(group.getControl('longitude').hasError('required')).toBe(hasRequiredError);
                        }));
                    });
                });

                describe.each`
                    initialValue | expected
                    ${null}      | ${false}
                    ${false}     | ${false}
                    ${true}      | ${true}
                `('should set sameStoreReporting', ({ initialValue, expected }) => {
                    it(`to ${expected} if it is ${initialValue}`, fakeAsync(() => {
                        const value: Store = { ...new Store(), sameStoreReporting: initialValue };
                        const group = formFactory.group('Store', value, componentDestroyed, {
                            changeDetector,
                            accessMode: AccessMode.EDIT,
                        });
                        expect(group.getControlValue('sameStoreReporting')).toEqual(expected);
                    }));
                });
            });
        });
    });
});
