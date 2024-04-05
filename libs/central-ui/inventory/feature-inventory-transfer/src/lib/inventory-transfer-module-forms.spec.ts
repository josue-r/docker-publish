import { FormBuilder } from '@angular/forms';
import {
    InventoryTransfer,
    InventoryTransferProduct,
} from '@vioc-angular/central-ui/inventory/data-access-inventory-transfer';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { Described } from '@vioc-angular/shared/common-functionality';
import { FormFactory } from '@vioc-angular/shared/util-form';
import { ReplaySubject } from 'rxjs';
import { InventoryTransferForms } from './inventory-transfer-module-forms';

describe('InventoryTransferForms', () => {
    describe('registerForms', () => {
        it('should register InventoryTransfer and InventoryTransferProduct forms', () => {
            const mockFormFactory = ({ register: jest.fn() } as unknown) as FormFactory;
            InventoryTransferForms.registerForms(mockFormFactory, undefined);
            expect(mockFormFactory.register).toHaveBeenCalledWith('InventoryTransfer', expect.any(Function));
            expect(mockFormFactory.register).toHaveBeenCalledWith('InventoryTransferProduct', expect.any(Function));
        });
    });

    describe('validations', () => {
        const formBuilder = new FormBuilder();
        const formFactory = new FormFactory(formBuilder);
        let componentDestroyed: ReplaySubject<any>;

        beforeAll(() => InventoryTransferForms.registerForms(formFactory, formBuilder));
        beforeEach(() => (componentDestroyed = new ReplaySubject(1)));
        afterEach(() => componentDestroyed.next());

        describe('InventoryTransfer', () => {
            describe.each`
                field          | value                                    | error          | showError
                ${'fromStore'} | ${null}                                  | ${'required'}  | ${true}
                ${'fromStore'} | ${{ ...new Described(), code: 'STORE' }} | ${'required'}  | ${false}
                ${'toStore'}   | ${null}                                  | ${'required'}  | ${true}
                ${'toStore'}   | ${{ ...new Described(), code: 'STORE' }} | ${'required'}  | ${false}
                ${'carrier'}   | ${'a'.repeat(60)}                        | ${'maxlength'} | ${false}
                ${'carrier'}   | ${'a'.repeat(61)}                        | ${'maxlength'} | ${true}
            `('form', ({ field, value, error, showError }) => {
                it(`should ${showError ? '' : 'not '}error ${error} for field ${field} with ADD access`, () => {
                    const group = formFactory.group('InventoryTransfer', new InventoryTransfer(), componentDestroyed, {
                        accessMode: AccessMode.ADD,
                    });
                    group.getControl(field).setValue(value);
                    group.getControl(field).updateValueAndValidity();
                    expect(group.getControl(field).hasError(error)).toBe(showError);
                });
            });

            describe.each`
                field                          | value                                                                                                     | error               | showError
                ${'inventoryTransferProducts'} | ${[]}                                                                                                     | ${'minLengthArray'} | ${true}
                ${'inventoryTransferProducts'} | ${[{ product: { code: 'PROD' }, uom: { code: 'EACH' }, quantity: 10, quantityOnHand: 0, version: null }]} | ${'minLengthArray'} | ${false}
            `('form', ({ field, value, error, showError }) => {
                it(`should ${showError ? '' : 'not '}error ${error} for field ${field} with ADD access`, () => {
                    const group = formFactory.group(
                        'InventoryTransfer',
                        { ...new InventoryTransfer(), inventoryTransferProducts: value },
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
                field                          | accessMode         | isDisabled
                ${'id'}                        | ${AccessMode.VIEW} | ${true}
                ${'id'}                        | ${AccessMode.EDIT} | ${true}
                ${'fromStore'}                 | ${AccessMode.VIEW} | ${true}
                ${'fromStore'}                 | ${AccessMode.EDIT} | ${true}
                ${'fromStore'}                 | ${AccessMode.ADD}  | ${false}
                ${'toStore'}                   | ${AccessMode.VIEW} | ${true}
                ${'toStore'}                   | ${AccessMode.EDIT} | ${true}
                ${'toStore'}                   | ${AccessMode.ADD}  | ${false}
                ${'status'}                    | ${AccessMode.VIEW} | ${true}
                ${'status'}                    | ${AccessMode.EDIT} | ${true}
                ${'createdOn'}                 | ${AccessMode.VIEW} | ${true}
                ${'createdOn'}                 | ${AccessMode.EDIT} | ${true}
                ${'createdByEmployee'}         | ${AccessMode.VIEW} | ${true}
                ${'createdByEmployee'}         | ${AccessMode.EDIT} | ${true}
                ${'finalizedOn'}               | ${AccessMode.VIEW} | ${true}
                ${'finalizedOn'}               | ${AccessMode.EDIT} | ${true}
                ${'finalizedByEmployee'}       | ${AccessMode.VIEW} | ${true}
                ${'finalizedByEmployee'}       | ${AccessMode.EDIT} | ${true}
                ${'carrier'}                   | ${AccessMode.EDIT} | ${false}
                ${'carrier'}                   | ${AccessMode.ADD}  | ${false}
                ${'inventoryTransferProducts'} | ${AccessMode.EDIT} | ${false}
                ${'inventoryTransferProducts'} | ${AccessMode.ADD}  | ${false}
            `('form', ({ field, accessMode, isDisabled }) => {
                it(`should ${isDisabled ? '' : 'not '}disable ${field} with ${accessMode.urlSegement} access`, () => {
                    const group = formFactory.group(
                        'InventoryTransfer',
                        { ...new InventoryTransfer(), status: { code: 'FINALIZED' } },
                        componentDestroyed,
                        {
                            accessMode: accessMode,
                        }
                    );
                    expect(group.getControl(field).disabled).toBe(isDisabled);
                });
            });
        });

        describe('InventoryTransferProduct', () => {
            describe.each`
                value    | uom         | error               | present
                ${null}  | ${'EACH'}   | ${'required'}       | ${true}
                ${10}    | ${'EACH'}   | ${'required'}       | ${false}
                ${-1}    | ${'EACH'}   | ${'min'}            | ${true}
                ${0}     | ${'EACH'}   | ${'min'}            | ${true}
                ${1}     | ${'EACH'}   | ${'min'}            | ${false}
                ${1}     | ${'EACH'}   | ${'invalidInteger'} | ${false}
                ${0.01}  | ${'EACH'}   | ${'invalidInteger'} | ${true}
                ${-0.01} | ${'GALLON'} | ${'min'}            | ${true}
                ${0}     | ${'GALLON'} | ${'min'}            | ${true}
                ${0.01}  | ${'GALLON'} | ${'min'}            | ${false}
                ${0.01}  | ${'GALLON'} | ${'invalidDecimal'} | ${false}
                ${0.001} | ${'GALLON'} | ${'invalidDecimal'} | ${true}
            `('should validate quantity', ({ value, uom, error, present }) => {
                it(`with value ${value} ${present ? 'has' : 'does not have'} error ${error}`, () => {
                    const group = formFactory.group(
                        'InventoryTransferProduct',
                        { ...new InventoryTransferProduct(), uom: { code: uom } },
                        componentDestroyed
                    );
                    const quantityControl = group.getControl('quantity');
                    quantityControl.patchValue(value);
                    quantityControl.updateValueAndValidity();

                    expect(quantityControl.hasError(error)).toBe(present);
                });
            });

            it('should disable all fields except quantity', () => {
                const group = formFactory.group(
                    'InventoryTransferProduct',
                    { ...new InventoryTransferProduct(), uom: { code: 'EACH' } },
                    componentDestroyed
                );
                (Object.keys(new InventoryTransferProduct()) as Array<keyof InventoryTransferProduct>).forEach(
                    (key) => {
                        if (key !== 'quantity') {
                            expect(group.getControl(key).disabled).toBeTruthy();
                        } else {
                            expect(group.getControl(key).enabled).toBeTruthy();
                        }
                    }
                );
            });
        });
    });
});
