import { FormArray, FormBuilder } from '@angular/forms';
import {
    PhysicalInventory,
    PhysicalInventoryCount,
} from '@vioc-angular/central-ui/inventory/data-access-physical-inventory';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { FormFactory } from '@vioc-angular/shared/util-form';
import { ReplaySubject } from 'rxjs';
import { PhysicalInventoryForms } from './physical-inventory-module-forms';

describe('PhysicalInventoryForms', () => {
    describe('registerForms', () => {
        it('should register PhysicalInventory form', () => {
            const mockFormFactory = { register: jest.fn() } as unknown as FormFactory;
            PhysicalInventoryForms.registerForms(mockFormFactory, undefined);
            expect(mockFormFactory.register).toHaveBeenCalledWith('PhysicalInventory', expect.any(Function));
            expect(mockFormFactory.register).toHaveBeenCalledWith('PhysicalInventoryCount', expect.any(Function));
        });
    });

    describe('validation', () => {
        const formBuilder = new FormBuilder();
        const formFactory = new FormFactory(formBuilder);
        let componentDestroyed: ReplaySubject<any>;

        beforeAll(() => PhysicalInventoryForms.registerForms(formFactory, formBuilder));
        beforeEach(() => (componentDestroyed = new ReplaySubject(1)));
        afterEach(() => componentDestroyed.next());

        describe('PhysicalInventory', () => {
            it('should disable the form', () => {
                const group = formFactory.group('PhysicalInventory', new PhysicalInventory(), componentDestroyed);
                expect(group.disabled).toEqual(true);
            });

            it('should not convert counts to a FormArray', () => {
                // this functionality will be handled by the PhysicalInventoryProductsComponent
                const group = formFactory.group('PhysicalInventory', new PhysicalInventory(), componentDestroyed, {
                    accessMode: AccessMode.EDIT,
                });
                expect(group.getControl('counts') instanceof FormArray).toBeFalsy();
            });
        });

        describe('PhysicalInventoryCount', () => {
            describe.each`
                value    | uom        | error               | present
                ${-1}    | ${'EACH'}  | ${'min'}            | ${true}
                ${0}     | ${'EACH'}  | ${'min'}            | ${false}
                ${1}     | ${'EACH'}  | ${'min'}            | ${false}
                ${1}     | ${'EACH'}  | ${'invalidInteger'} | ${false}
                ${0.01}  | ${'EACH'}  | ${'invalidInteger'} | ${true}
                ${-0.01} | ${'QUART'} | ${'min'}            | ${true}
                ${0}     | ${'QUART'} | ${'min'}            | ${false}
                ${0.01}  | ${'QUART'} | ${'min'}            | ${false}
                ${0.01}  | ${'QUART'} | ${'invalidDecimal'} | ${false}
                ${0.001} | ${'QUART'} | ${'invalidDecimal'} | ${true}
            `('should validate actualCount', ({ value, uom, error, present }) => {
                it(`with value ${value} ${present ? 'has' : 'does not have'} error ${error}`, () => {
                    const group = formFactory.group(
                        'PhysicalInventoryCount',
                        { ...new PhysicalInventoryCount(), uom: { code: uom }, status: { code: 'OPEN' } },
                        componentDestroyed,
                        { accessMode: AccessMode.EDIT }
                    );
                    const actualCountControl = group.getControl('actualCount');
                    actualCountControl.patchValue(value);
                    actualCountControl.updateValueAndValidity();

                    expect(actualCountControl.hasError(error)).toBe(present);
                });
            });

            describe.each`
                value        | isDirty  | isRequired
                ${10}        | ${true}  | ${false}
                ${10}        | ${false} | ${false}
                ${null}      | ${false} | ${false}
                ${null}      | ${true}  | ${true}
                ${undefined} | ${true}  | ${true}
            `('should validate actualCount', ({ value, isDirty, isRequired }) => {
                it(`${isRequired ? 'is' : 'is not'} required when the form ${
                    isDirty ? 'is' : 'is not'
                } dirty with value ${value}`, () => {
                    const group = formFactory.group(
                        'PhysicalInventoryCount',
                        {
                            ...new PhysicalInventoryCount(),
                            uom: { code: 'EACH' },
                            status: { code: 'OPEN' },
                            actualCount: value,
                        },
                        componentDestroyed,
                        { accessMode: AccessMode.EDIT }
                    );
                    const actualCountControl = group.getControl('actualCount');
                    if (isDirty) {
                        actualCountControl.markAsDirty();
                    }
                    actualCountControl.updateValueAndValidity();

                    expect(actualCountControl.hasError('required')).toBe(isRequired);
                    expect(group.invalid).toBe(isRequired);
                });
            });

            describe.each`
                field                   | accessMode         | isDisabled | status
                ${'id'}                 | ${AccessMode.VIEW} | ${true}    | ${'CLOSED'}
                ${'id'}                 | ${AccessMode.EDIT} | ${true}    | ${'CLOSED'}
                ${'status'}             | ${AccessMode.VIEW} | ${true}    | ${'CLOSED'}
                ${'status'}             | ${AccessMode.EDIT} | ${true}    | ${'CLOSED'}
                ${'closedOn'}           | ${AccessMode.VIEW} | ${true}    | ${'CLOSED'}
                ${'closedOn'}           | ${AccessMode.EDIT} | ${true}    | ${'CLOSED'}
                ${'product'}            | ${AccessMode.VIEW} | ${true}    | ${'CLOSED'}
                ${'product'}            | ${AccessMode.EDIT} | ${true}    | ${'CLOSED'}
                ${'category'}           | ${AccessMode.VIEW} | ${true}    | ${'CLOSED'}
                ${'category'}           | ${AccessMode.EDIT} | ${true}    | ${'CLOSED'}
                ${'uom'}                | ${AccessMode.VIEW} | ${true}    | ${'OPEN'}
                ${'uom'}                | ${AccessMode.EDIT} | ${true}    | ${'CLOSED'}
                ${'uom'}                | ${AccessMode.EDIT} | ${true}    | ${'FINALIZED'}
                ${'uom'}                | ${AccessMode.EDIT} | ${false}   | ${'OPEN'}
                ${'actualCount'}        | ${AccessMode.VIEW} | ${true}    | ${'OPEN'}
                ${'actualCount'}        | ${AccessMode.EDIT} | ${true}    | ${'CLOSED'}
                ${'actualCount'}        | ${AccessMode.EDIT} | ${true}    | ${'FINALIZED'}
                ${'actualCount'}        | ${AccessMode.EDIT} | ${false}   | ${'OPEN'}
                ${'variance'}           | ${AccessMode.VIEW} | ${true}    | ${'OPEN'}
                ${'variance'}           | ${AccessMode.EDIT} | ${true}    | ${'OPEN'}
                ${'qohCountWhenClosed'} | ${AccessMode.VIEW} | ${true}    | ${'OPEN'}
                ${'qohCountWhenClosed'} | ${AccessMode.EDIT} | ${true}    | ${'OPEN'}
                ${'qohCountWhenOpened'} | ${AccessMode.VIEW} | ${true}    | ${'OPEN'}
                ${'qohCountWhenOpened'} | ${AccessMode.EDIT} | ${true}    | ${'OPEN'}
            `('form', ({ field, accessMode, isDisabled, status }) => {
                it(`should ${isDisabled ? '' : 'not '}disable ${field} with ${
                    accessMode.urlSegement
                } access and ${status} status`, () => {
                    const group = formFactory.group(
                        'PhysicalInventoryCount',
                        { ...new PhysicalInventoryCount(), uom: { code: 'EACH' }, status: { code: status } },
                        componentDestroyed,
                        {
                            accessMode,
                        }
                    );
                    expect(group.getControl(field).disabled).toBe(isDisabled);
                });
            });

            describe('CountLocation', () => {
                describe.each`
                    isCountingByLocation
                    ${true}
                    ${false}
                `('count by location mode', ({ isCountingByLocation }) => {
                    it(`should ${isCountingByLocation ? '' : 'not '}create a form array`, () => {
                        const group = formFactory.group(
                            'PhysicalInventoryCount',
                            {
                                ...new PhysicalInventoryCount(),
                                uom: { code: 'EACH' },
                                status: { code: 'OPEN' },
                                actualCount: 10,
                            },
                            componentDestroyed,
                            { accessMode: AccessMode.EDIT, isCountingByLocation }
                        );

                        if (isCountingByLocation) {
                            expect(group.getControl('countsByLocation') instanceof FormArray).toBeTruthy();
                        } else {
                            expect(group.getControl('countsByLocation')).toBeFalsy();
                        }
                    });

                    it(`should ${
                        isCountingByLocation ? '' : 'not '
                    }set the totalQuantity to the sum of all the locations`, () => {
                        const group = formFactory.group(
                            'PhysicalInventoryCount',
                            {
                                ...new PhysicalInventoryCount(),
                                uom: { code: 'EACH' },
                                status: { code: 'OPEN' },
                                actualCount: 25,
                                countsByLocation: [
                                    { count: 10, location: 'BAY' },
                                    { count: 15, location: 'DISPLAY' },
                                ],
                            },
                            componentDestroyed,
                            { accessMode: AccessMode.EDIT, isCountingByLocation }
                        );

                        expect(group.getControlValue('volumeCalculatorEnabled')).toBeFalsy();
                        if (isCountingByLocation) {
                            expect(group.getControlValue('totalQuantity')).toEqual(25);
                        } else {
                            expect(group.getControlValue('totalQuantity')).toBeNull();
                        }
                    });

                    it(`should ${isCountingByLocation ? '' : 'not '}set the actualCount to the location count`, () => {
                        const group = formFactory.group(
                            'PhysicalInventoryCount',
                            {
                                ...new PhysicalInventoryCount(),
                                uom: { code: 'EACH' },
                                status: { code: 'OPEN' },
                                actualCount: 25,
                                countsByLocation: [
                                    { count: 10, location: 'BAY' },
                                    { count: 15, location: 'DISPLAY' },
                                ],
                            },
                            componentDestroyed,
                            { accessMode: AccessMode.EDIT, isCountingByLocation, currentLocation: 'DISPLAY' }
                        );

                        if (isCountingByLocation) {
                            expect(group.getControlValue('actualCount')).toEqual(15);
                        } else {
                            expect(group.getControlValue('actualCount')).toEqual(25);
                        }
                    });
                });
            });
        });
    });
});
