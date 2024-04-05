import { fakeAsync } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import {
    ReceiptOfMaterial,
    ReceiptOfMaterialProduct,
} from '@vioc-angular/central-ui/inventory/data-access-receipt-of-material';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { FormFactory } from '@vioc-angular/shared/util-form';
import { ReplaySubject } from 'rxjs';
import { ReceiptOfMaterialModuleForm } from './receipt-of-material-module-form';

describe('ReceiptOfMaterialForms', () => {
    describe('registerForms', () => {
        it('should register ReceiptOfMaterial models', () => {
            const mockFormFactory = ({ register: jest.fn() } as unknown) as FormFactory;
            ReceiptOfMaterialModuleForm.registerForms(mockFormFactory, undefined);
            expect(mockFormFactory.register).toHaveBeenCalledWith('ReceiptOfMaterial', expect.any(Function));
        });
    });

    describe('validations', () => {
        const formBuilder = new FormBuilder();
        const formFactory = new FormFactory(formBuilder);
        let componentDestroyed: ReplaySubject<any>;

        beforeAll(() => ReceiptOfMaterialModuleForm.registerForms(formFactory, formBuilder));
        beforeEach(() => (componentDestroyed = new ReplaySubject(1)));
        afterEach(() => componentDestroyed.next());

        describe('receiptOfMaterial', () => {
            describe('validates', () => {
                const expectFormErrorToBeTrue = (
                    testValue: ReceiptOfMaterial,
                    testProperty: keyof ReceiptOfMaterial,
                    error: string
                ) => {
                    const group = formFactory.group('ReceiptOfMaterial', testValue, componentDestroyed, {
                        accessMode: AccessMode.EDIT,
                    });
                    group.getControl(testProperty).updateValueAndValidity();
                    expect(group.getControl(testProperty).hasError(error)).toBe(true);
                };

                describe.each`
                    control             | accessMode         | disabled
                    ${'number'}         | ${AccessMode.EDIT} | ${true}
                    ${'store'}          | ${AccessMode.EDIT} | ${true}
                    ${'vendor'}         | ${AccessMode.EDIT} | ${true}
                    ${'receiptDate'}    | ${AccessMode.EDIT} | ${true}
                    ${'status'}         | ${AccessMode.EDIT} | ${true}
                    ${'receiptType'}    | ${AccessMode.EDIT} | ${true}
                    ${'finalizedOn'}    | ${AccessMode.EDIT} | ${true}
                    ${'originalNumber'} | ${AccessMode.EDIT} | ${true}
                    ${'poNumber'}       | ${AccessMode.EDIT} | ${false}
                    ${'invoiceNumber'}  | ${AccessMode.EDIT} | ${false}
                    ${'deliveryTicket'} | ${AccessMode.EDIT} | ${false}
                    ${'shipTo'}         | ${AccessMode.EDIT} | ${true}
                    ${'comments'}       | ${AccessMode.EDIT} | ${false}
                    ${'number'}         | ${AccessMode.ADD}  | ${true}
                    ${'store'}          | ${AccessMode.ADD}  | ${false}
                    ${'vendor'}         | ${AccessMode.ADD}  | ${false}
                    ${'receiptDate'}    | ${AccessMode.ADD}  | ${true}
                    ${'status'}         | ${AccessMode.ADD}  | ${true}
                    ${'receiptType'}    | ${AccessMode.ADD}  | ${false}
                    ${'finalizedOn'}    | ${AccessMode.ADD}  | ${true}
                    ${'originalNumber'} | ${AccessMode.ADD}  | ${true}
                    ${'poNumber'}       | ${AccessMode.ADD}  | ${false}
                    ${'invoiceNumber'}  | ${AccessMode.ADD}  | ${false}
                    ${'deliveryTicket'} | ${AccessMode.ADD}  | ${false}
                    ${'shipTo'}         | ${AccessMode.ADD}  | ${true}
                    ${'comments'}       | ${AccessMode.ADD}  | ${false}
                `('values', ({ control, accessMode, disabled }) => {
                    it(`should ${disabled ? '' : 'not '}disable ${control} in ${accessMode} mode`, fakeAsync(() => {
                        const group = formFactory.group(
                            'ReceiptOfMaterial',
                            { ...new ReceiptOfMaterial() },
                            componentDestroyed,
                            {
                                accessMode,
                            }
                        );
                        expect(group.getControl(control).disabled).toBe(disabled);
                    }));
                });

                describe.each`
                    field               | maxlength
                    ${'comments'}       | ${255}
                    ${'poNumber'}       | ${10}
                    ${'deliveryTicket'} | ${10}
                    ${'invoiceNumber'}  | ${10}
                `('maxlength', ({ field, maxlength }) => {
                    it(`should limit ${field} to ${maxlength} characters`, () => {
                        // verify with invalid length
                        const model = new ReceiptOfMaterial();
                        model[field] = 'a'.repeat(maxlength + 1);
                        const groupMaxLengthError = formFactory.group('ReceiptOfMaterial', model, componentDestroyed, {
                            accessMode: AccessMode.EDIT,
                        });
                        groupMaxLengthError.getControl(field).updateValueAndValidity();
                        expect(groupMaxLengthError.getControl(field).hasError('maxlength')).toBe(true);
                        // verify with valid length
                        model[field] = 'a'.repeat(maxlength);
                        const group = formFactory.group('ReceiptOfMaterial', model, componentDestroyed, {
                            accessMode: AccessMode.EDIT,
                        });
                        group.getControl(field).updateValueAndValidity();
                        expect(group.getControl(field).hasError('maxlength')).toBe(false);
                    });
                });

                describe('receiptProducts', () => {
                    const receiptProduct = {
                        lineNumber: 1,
                        quantityReceived: 2,
                        quantityOrdered: 2,
                        product: { id: 1, code: 'prod1' },
                        uom: { id: 1, code: 'test' },
                    };

                    describe.each`
                        products                                                                      | accessMode         | expectError
                        ${[]}                                                                         | ${AccessMode.EDIT} | ${true}
                        ${[]}                                                                         | ${AccessMode.ADD}  | ${true}
                        ${[receiptProduct]}                                                           | ${AccessMode.EDIT} | ${false}
                        ${[receiptProduct]}                                                           | ${AccessMode.ADD}  | ${false}
                        ${[receiptProduct, { ...receiptProduct, product: { id: 2, code: 'prod2' } }]} | ${AccessMode.EDIT} | ${false}
                        ${[receiptProduct, { ...receiptProduct, product: { id: 2, code: 'prod2' } }]} | ${AccessMode.ADD}  | ${false}
                    `('length validation', ({ products, accessMode, expectError }) => {
                        it(`should ${expectError ? '' : 'not '}error for ${JSON.stringify(
                            products
                        )} in ${accessMode} mode`, () => {
                            const group = formFactory.group(
                                'ReceiptOfMaterial',
                                { ...new ReceiptOfMaterial(), receiptProducts: products },
                                componentDestroyed,
                                {
                                    accessMode,
                                }
                            );
                            group.getControl('receiptProducts').updateValueAndValidity();
                            expect(group.getControl('receiptProducts').hasError('required')).toEqual(expectError);
                        });
                    });
                });
            });

            describe('receiptOfMaterialProducts', () => {
                describe.each`
                    uom        | qtyReceived | error
                    ${'EACH'}  | ${0}        | ${null}
                    ${'EACH'}  | ${1}        | ${null}
                    ${'EACH'}  | ${-1}       | ${'min'}
                    ${'EACH'}  | ${1.1}      | ${'invalidInteger'}
                    ${'EACH'}  | ${null}     | ${'required'}
                    ${'QUART'} | ${0}        | ${null}
                    ${'QUART'} | ${1}        | ${null}
                    ${'QUART'} | ${-1}       | ${'min'}
                    ${'QUART'} | ${1.1}      | ${null}
                    ${'QUART'} | ${null}     | ${'required'}
                `('quantityReceived (uom=$uom)', ({ uom, qtyReceived, error }) => {
                    it(`should give ${error ? error : 'no'} error with qtyReceived=${qtyReceived}`, () => {
                        const model = {
                            ...new ReceiptOfMaterialProduct(),
                            uom: { code: uom },
                            quantityReceived: qtyReceived,
                        };
                        const group = formFactory.group('ReceiptOfMaterialProduct', model, componentDestroyed, {
                            accessMode: AccessMode.EDIT,
                        });
                        group.getControl('quantityReceived').updateValueAndValidity();
                        if (error) {
                            expect(group.getControl('quantityReceived').hasError(error)).toBe(true);
                        } else {
                            expect(group.getControl('quantityReceived').valid).toBe(true);
                        }
                    });
                });
            });
        });
    });
});
