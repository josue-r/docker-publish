import { FormBuilder } from '@angular/forms';
import {
    NonInventoryOrder,
    NonInventoryOrderItem,
} from '@vioc-angular/central-ui/inventory/data-access-non-inventory-order';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { Described } from '@vioc-angular/shared/common-functionality';
import { FormFactory } from '@vioc-angular/shared/util-form';
import { ReplaySubject } from 'rxjs';
import { NonInventoryOrderForms } from './non-inventory-order-module-forms';

describe('NonInventoryOrderForms', () => {
    describe('registerForms', () => {
        it('should register Non inventory order model', () => {
            const mockFormFactory = { register: jest.fn() } as unknown as FormFactory;
            NonInventoryOrderForms.registerForms(mockFormFactory, undefined);
            expect(mockFormFactory.register).toHaveBeenCalledWith('NonInventoryOrder', expect.any(Function));
            expect(mockFormFactory.register).toHaveBeenCalledWith('NonInventoryOrderItem', expect.any(Function));
        });
    });
    const formBuilder = new FormBuilder();
    const formFactory = new FormFactory(formBuilder);
    let componentDestroyed: ReplaySubject<any>;

    beforeAll(() => NonInventoryOrderForms.registerForms(formFactory, formBuilder));
    beforeEach(() => (componentDestroyed = new ReplaySubject(1)));
    afterEach(() => componentDestroyed.next());

    describe('validations', () => {
        describe('NonInventoryOrder', () => {
            describe.each`
                field         | value                                    | error          | showError
                ${'comments'} | ${'a'.repeat(256)}                       | ${'maxlength'} | ${true}
                ${'comments'} | ${'a'.repeat(255)}                       | ${'maxlength'} | ${false}
                ${'store'}    | ${null}                                  | ${'required'}  | ${true}
                ${'store'}    | ${{ ...new Described(), code: 'STORE' }} | ${'required'}  | ${false}
            `('form', ({ field, value, error, showError }) => {
                it(`should show ${showError ? '' : 'not '}error ${error} for field ${field} with ADD access`, () => {
                    const group = formFactory.group('NonInventoryOrder', new NonInventoryOrder(), componentDestroyed, {
                        accessMode: AccessMode.ADD,
                    });
                    group.getControl(field).setValue(value);
                    group.getControl(field).updateValueAndValidity();
                    expect(group.getControl(field).hasError(error)).toBe(showError);
                });
            });

            describe.each`
                field                       | value                                                          | error         | showError
                ${'nonInventoryOrderItems'} | ${[]}                                                          | ${'required'} | ${true}
                ${'nonInventoryOrderItems'} | ${[{ ...new NonInventoryOrderItem(), uom: { code: 'EACH' } }]} | ${'required'} | ${false}
            `('form', ({ field, value, error, showError }) => {
                it(`should show ${showError ? '' : 'not '}error ${error} for field ${field} with ADD access`, () => {
                    const group = formFactory.group(
                        'NonInventoryOrder',
                        { ...new NonInventoryOrder(), nonInventoryOrderItems: value },
                        componentDestroyed,
                        {
                            accessMode: AccessMode.ADD,
                        }
                    );
                    group.getArray(field).updateValueAndValidity();
                    expect(group.getArray(field).hasError(error)).toBe(showError);
                });
            });

            describe.each`
                field                       | accessMode         | isDisabled
                ${'id'}                     | ${AccessMode.ADD}  | ${true}
                ${'store'}                  | ${AccessMode.ADD}  | ${false}
                ${'store'}                  | ${AccessMode.VIEW} | ${true}
                ${'store'}                  | ${AccessMode.EDIT} | ${true}
                ${'comments'}               | ${AccessMode.ADD}  | ${false}
                ${'comments'}               | ${AccessMode.VIEW} | ${true}
                ${'comments'}               | ${AccessMode.EDIT} | ${false}
                ${'status'}                 | ${AccessMode.ADD}  | ${true}
                ${'orderDate'}              | ${AccessMode.ADD}  | ${true}
                ${'orderDate'}              | ${AccessMode.VIEW} | ${true}
                ${'orderDate'}              | ${AccessMode.EDIT} | ${true}
                ${'orderNumber'}            | ${AccessMode.ADD}  | ${true}
                ${'orderNumber'}            | ${AccessMode.EDIT} | ${true}
                ${'orderNumber'}            | ${AccessMode.VIEW} | ${true}
                ${'createdByEmployee'}      | ${AccessMode.ADD}  | ${true}
                ${'createdByEmployee'}      | ${AccessMode.VIEW} | ${true}
                ${'createdByEmployee'}      | ${AccessMode.EDIT} | ${true}
                ${'updatedOn'}              | ${AccessMode.ADD}  | ${true}
                ${'updatedOn'}              | ${AccessMode.VIEW} | ${true}
                ${'updatedOn'}              | ${AccessMode.EDIT} | ${true}
                ${'updatedBy'}              | ${AccessMode.ADD}  | ${true}
                ${'updatedBy'}              | ${AccessMode.VIEW} | ${true}
                ${'updatedBy'}              | ${AccessMode.EDIT} | ${true}
                ${'nonInventoryOrderItems'} | ${AccessMode.ADD}  | ${false}
                ${'nonInventoryOrderItems'} | ${AccessMode.VIEW} | ${true}
            `('form', ({ field, accessMode, isDisabled }) => {
                it(`should ${isDisabled ? '' : 'not '}disable ${field} with ${accessMode.urlSegement} access`, () => {
                    const group = formFactory.group(
                        'NonInventoryOrder',
                        { ...new NonInventoryOrder(), uom: { code: 'EACH' } },
                        componentDestroyed,
                        {
                            accessMode: accessMode,
                        }
                    );
                    expect(group.getControl(field).disabled).toBe(isDisabled);
                });
            });
        });

        describe('NonInventoryOrderItem', () => {
            describe.each`
                uom                  | value    | error                           | showError
                ${{ code: 'EACH' }}  | ${10}    | ${''}                           | ${false}
                ${{ code: 'QUART' }} | ${10.1}  | ${''}                           | ${false}
                ${{ code: 'EACH' }}  | ${null}  | ${'required'}                   | ${true}
                ${{ code: 'EACH' }}  | ${-10}   | ${'min'}                        | ${true}
                ${{ code: 'QUART' }} | ${-10.1} | ${'min'}                        | ${true}
                ${{ code: 'EACH' }}  | ${10.1}  | ${'invalidInteger'}             | ${true}
                ${{ code: 'QUART' }} | ${22}    | ${'invalidForMaxOrderQuantity'} | ${true}
                ${{ code: 'EACH' }}  | ${5}     | ${'invalidForMinOrderQuantity'} | ${true}
                ${{ code: 'QUART' }} | ${11}    | ${'invalidForQuantityPerPack'}  | ${true}
                ${{ code: 'QUART' }} | ${10.5}  | ${'invalidForQuantityPerPack'}  | ${true}
                ${{ code: 'QUART' }} | ${15}    | ${'invalidForQuantityPerPack'}  | ${false}
                ${{ code: 'EACH' }}  | ${12}    | ${'invalidForQuantityPerPack'}  | ${true}
                ${{ code: 'EACH' }}  | ${15}    | ${'invalidForQuantityPerPack'}  | ${false}
            `('form', ({ uom, value, error, showError }) => {
                it(`should ${showError ? '' : 'not '}show error ${error} for quantity of ${value} and uom ${
                    uom.code
                }`, () => {
                    const group = formFactory.group(
                        'NonInventoryOrderItem',
                        {
                            ...new NonInventoryOrderItem(),
                            nonInventoryCatalog: { minimumQuantity: 10, maximumQuantity: 20, quantityPerPack: 5 },
                            uom: uom,
                        },
                        componentDestroyed,
                        {
                            accessMode: AccessMode.EDIT,
                        }
                    );
                    group.getControl('quantity').setValue(value);
                    group.getControl('quantity').updateValueAndValidity();
                    expect(group.getControl('quantity').hasError(error)).toBe(showError);
                });
            });
        });
    });
});
