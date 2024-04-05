import { FormBuilder } from '@angular/forms';
import { InventoryOrder, InventoryOrderProduct } from '@vioc-angular/central-ui/inventory/data-access-inventory-order';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { Described } from '@vioc-angular/shared/common-functionality';
import { FormFactory } from '@vioc-angular/shared/util-form';
import { ReplaySubject } from 'rxjs';
import { InventoryOrderForms } from './inventory-order-module-forms';

describe('InventoryOrderForms', () => {
    describe('registerForms', () => {
        it('should register inventory order model', () => {
            const mockFormFactory = ({ register: jest.fn() } as unknown) as FormFactory;
            InventoryOrderForms.registerForms(mockFormFactory, undefined);
            expect(mockFormFactory.register).toHaveBeenCalledWith('InventoryOrder', expect.any(Function));
            expect(mockFormFactory.register).toHaveBeenCalledWith('InventoryOrderProduct', expect.any(Function));
        });
    });
    const formBuilder = new FormBuilder();
    const formFactory = new FormFactory(formBuilder);
    let componentDestroyed: ReplaySubject<any>;

    beforeAll(() => InventoryOrderForms.registerForms(formFactory, formBuilder));
    beforeEach(() => (componentDestroyed = new ReplaySubject(1)));
    afterEach(() => componentDestroyed.next());

    describe('validations', () => {
        describe('InventoryOrder', () => {
            describe.each`
                field         | value                                     | error          | showError
                ${'comments'} | ${'a'.repeat(256)}                        | ${'maxlength'} | ${true}
                ${'comments'} | ${'a'.repeat(255)}                        | ${'maxlength'} | ${false}
                ${'store'}    | ${null}                                   | ${'required'}  | ${true}
                ${'store'}    | ${{ ...new Described(), code: 'STORE' }}  | ${'required'}  | ${false}
                ${'vendor'}   | ${null}                                   | ${'required'}  | ${true}
                ${'vendor'}   | ${{ ...new Described(), code: 'VENDOR' }} | ${'required'}  | ${false}
            `('form', ({ field, value, error, showError }) => {
                it(`should show ${showError ? '' : 'not '}error ${error} for field ${field} with ADD access`, () => {
                    const group = formFactory.group('InventoryOrder', new InventoryOrder(), componentDestroyed, {
                        accessMode: AccessMode.ADD,
                    });
                    group.getControl(field).setValue(value);
                    group.getControl(field).updateValueAndValidity();
                    expect(group.getControl(field).hasError(error)).toBe(showError);
                });
            });

            describe.each`
                field                       | value                                                          | error         | showError
                ${'inventoryOrderProducts'} | ${[]}                                                          | ${'required'} | ${true}
                ${'inventoryOrderProducts'} | ${[{ ...new InventoryOrderProduct(), uom: { code: 'EACH' } }]} | ${'required'} | ${false}
            `('form', ({ field, value, error, showError }) => {
                it(`should show ${showError ? '' : 'not '}error ${error} for field ${field} with ADD access`, () => {
                    const group = formFactory.group(
                        'InventoryOrder',
                        { ...new InventoryOrder(), inventoryOrderProducts: value },
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
                ${'id'}                     | ${AccessMode.VIEW} | ${true}
                ${'id'}                     | ${AccessMode.EDIT} | ${true}
                ${'id'}                     | ${AccessMode.ADD}  | ${true}
                ${'store'}                  | ${AccessMode.VIEW} | ${true}
                ${'store'}                  | ${AccessMode.EDIT} | ${true}
                ${'store'}                  | ${AccessMode.ADD}  | ${false}
                ${'vendor'}                 | ${AccessMode.VIEW} | ${true}
                ${'vendor'}                 | ${AccessMode.EDIT} | ${true}
                ${'vendor'}                 | ${AccessMode.ADD}  | ${false}
                ${'comments'}               | ${AccessMode.VIEW} | ${true}
                ${'comments'}               | ${AccessMode.EDIT} | ${false}
                ${'comments'}               | ${AccessMode.ADD}  | ${false}
                ${'status'}                 | ${AccessMode.VIEW} | ${true}
                ${'status'}                 | ${AccessMode.EDIT} | ${true}
                ${'status'}                 | ${AccessMode.ADD}  | ${true}
                ${'finalizedOn'}            | ${AccessMode.VIEW} | ${true}
                ${'finalizedOn'}            | ${AccessMode.EDIT} | ${true}
                ${'finalizedOn'}            | ${AccessMode.ADD}  | ${true}
                ${'finalizedByEmployee'}    | ${AccessMode.VIEW} | ${true}
                ${'finalizedByEmployee'}    | ${AccessMode.EDIT} | ${true}
                ${'finalizedByEmployee'}    | ${AccessMode.ADD}  | ${true}
                ${'createdOn'}              | ${AccessMode.VIEW} | ${true}
                ${'createdOn'}              | ${AccessMode.EDIT} | ${true}
                ${'createdOn'}              | ${AccessMode.ADD}  | ${true}
                ${'createdByEmployee'}      | ${AccessMode.VIEW} | ${true}
                ${'createdByEmployee'}      | ${AccessMode.EDIT} | ${true}
                ${'createdByEmployee'}      | ${AccessMode.ADD}  | ${true}
                ${'updatedOn'}              | ${AccessMode.VIEW} | ${true}
                ${'updatedOn'}              | ${AccessMode.EDIT} | ${true}
                ${'updatedOn'}              | ${AccessMode.ADD}  | ${true}
                ${'updatedBy'}              | ${AccessMode.VIEW} | ${true}
                ${'updatedBy'}              | ${AccessMode.EDIT} | ${true}
                ${'updatedBy'}              | ${AccessMode.ADD}  | ${true}
                ${'inventoryOrderProducts'} | ${AccessMode.VIEW} | ${true}
                ${'inventoryOrderProducts'} | ${AccessMode.EDIT} | ${false}
                ${'inventoryOrderProducts'} | ${AccessMode.ADD}  | ${false}
            `('form', ({ field, accessMode, isDisabled }) => {
                it(`should ${isDisabled ? '' : 'not '}disable ${field} with ${accessMode.urlSegement} access`, () => {
                    const group = formFactory.group(
                        'InventoryOrder',
                        { ...new InventoryOrder(), uom: { code: 'EACH' } },
                        componentDestroyed,
                        {
                            accessMode: accessMode,
                        }
                    );
                    expect(group.getControl(field).disabled).toBe(isDisabled);
                });
            });
        });

        describe('InventoryOrderProduct', () => {
            describe.each`
                field                     | accessMode         | isDisabled
                ${'secondLevelCategory'}  | ${AccessMode.VIEW} | ${true}
                ${'secondLevelCategory'}  | ${AccessMode.EDIT} | ${true}
                ${'secondLevelCategory'}  | ${AccessMode.ADD}  | ${true}
                ${'uom'}                  | ${AccessMode.VIEW} | ${true}
                ${'uom'}                  | ${AccessMode.EDIT} | ${true}
                ${'uom'}                  | ${AccessMode.ADD}  | ${true}
                ${'minimumOrderQuantity'} | ${AccessMode.VIEW} | ${true}
                ${'minimumOrderQuantity'} | ${AccessMode.EDIT} | ${true}
                ${'minimumOrderQuantity'} | ${AccessMode.ADD}  | ${true}
                ${'quantityOnOrder'}      | ${AccessMode.VIEW} | ${true}
                ${'quantityOnOrder'}      | ${AccessMode.EDIT} | ${true}
                ${'quantityOnOrder'}      | ${AccessMode.ADD}  | ${true}
                ${'suggestedQuantity'}    | ${AccessMode.VIEW} | ${true}
                ${'suggestedQuantity'}    | ${AccessMode.EDIT} | ${true}
                ${'suggestedQuantity'}    | ${AccessMode.ADD}  | ${true}
                ${'quantityPerPack'}      | ${AccessMode.VIEW} | ${true}
                ${'quantityPerPack'}      | ${AccessMode.EDIT} | ${true}
                ${'quantityPerPack'}      | ${AccessMode.ADD}  | ${true}
                ${'quantityOnHand'}       | ${AccessMode.VIEW} | ${true}
                ${'quantityOnHand'}       | ${AccessMode.EDIT} | ${true}
                ${'quantityOnHand'}       | ${AccessMode.ADD}  | ${true}
                ${'averageDailyUsage'}    | ${AccessMode.VIEW} | ${true}
                ${'averageDailyUsage'}    | ${AccessMode.EDIT} | ${true}
                ${'averageDailyUsage'}    | ${AccessMode.ADD}  | ${true}
                ${'quantity'}             | ${AccessMode.VIEW} | ${true}
                ${'quantity'}             | ${AccessMode.EDIT} | ${false}
                ${'quantity'}             | ${AccessMode.ADD}  | ${false}
            `('form', ({ field, accessMode, isDisabled }) => {
                it(`should ${isDisabled ? '' : 'not '}disable ${field} with ${accessMode.urlSegement} access`, () => {
                    const group = formFactory.group(
                        'InventoryOrderProduct',
                        { ...new InventoryOrderProduct(), uom: { code: 'EACH' } },
                        componentDestroyed,
                        {
                            accessMode: accessMode,
                        }
                    );
                    expect(group.getControl(field).disabled).toBe(isDisabled);
                });
            });

            describe.each`
                uom                  | value    | error                           | showError
                ${{ code: 'EACH' }}  | ${10}    | ${''}                           | ${false}
                ${{ code: 'QUART' }} | ${10.1}  | ${''}                           | ${false}
                ${{ code: 'EACH' }}  | ${null}  | ${'required'}                   | ${true}
                ${{ code: 'EACH' }}  | ${-10}   | ${'min'}                        | ${true}
                ${{ code: 'QUART' }} | ${-10.1} | ${'min'}                        | ${true}
                ${{ code: 'EACH' }}  | ${10.1}  | ${'invalidInteger'}             | ${true}
                ${{ code: 'QUART' }} | ${10.5}  | ${'invalidForQuantityPerPack'}  | ${true}
                ${{ code: 'EACH' }}  | ${5}     | ${'invalidForMinOrderQuantity'} | ${true}
            `('form', ({ uom, value, error, showError }) => {
                it(`should ${showError ? '' : 'not '}show error ${error} for quantity of ${value} and uom ${
                    uom.code
                }`, () => {
                    const group = formFactory.group(
                        'InventoryOrderProduct',
                        { ...new InventoryOrderProduct(), minimumOrderQuantity: 10, quantityPerPack: 10, uom: uom },
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

    describe('default form fields', () => {
        describe('InventoryOrderProducts', () => {
            const baseInventoryOrderProduct = {
                secondLevelCategory: null,
                product: null,
                minimumOrderQuantity: null,
                quantityOnHand: null,
                quantityOnOrder: null,
                averageDailyUsage: null,
                uom: { code: 'EACH' },
                quantityPerPack: 5,
            } as InventoryOrderProduct;

            describe.each`
                accessMode         | expectedQuantity | suggestedQuantity
                ${AccessMode.ADD}  | ${10}            | ${10}
                ${AccessMode.VIEW} | ${5}             | ${10}
                ${AccessMode.EDIT} | ${5}             | ${10}
            `(`while in $accessMode.urlSegment`, ({ accessMode, expectedQuantity, suggestedQuantity }) => {
                it(`should default quantity to ${
                    accessMode.isAdd ? `suggested quantity: ${suggestedQuantity}` : `quantity: ${expectedQuantity}`
                }`, () => {
                    // setup product for add or view/edit use cases
                    const formProduct = accessMode.isAdd
                        ? { ...baseInventoryOrderProduct, suggestedQuantity }
                        : { ...baseInventoryOrderProduct, quantity: expectedQuantity, suggestedQuantity };
                    const group = formFactory.group('InventoryOrderProduct', formProduct, componentDestroyed, {
                        accessMode,
                    });
                    expect(group.getControlValue('quantity')).toBe(expectedQuantity);
                });
            });
        });
    });
});
