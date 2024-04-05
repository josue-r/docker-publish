import { fakeAsync } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { DefectiveProduct } from '@vioc-angular/central-ui/inventory/data-access-defective-product';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { FormFactory } from '@vioc-angular/shared/util-form';
import { ReplaySubject } from 'rxjs';
import { DefectiveProductModuleForm } from './defective-product-module-form';

describe('DefectiveProductForms', () => {
    describe('registerForms', () => {
        it('should register Defective product models', () => {
            const mockFormFactory = ({ register: jest.fn() } as unknown) as FormFactory;
            DefectiveProductModuleForm.registerForms(mockFormFactory, undefined);
            expect(mockFormFactory.register).toHaveBeenCalledWith('DefectiveProduct', expect.any(Function));
        });
    });

    describe('validations', () => {
        const formBuilder = new FormBuilder();
        const formFactory = new FormFactory(formBuilder);
        let componentDestroyed: ReplaySubject<any>;

        beforeAll(() => DefectiveProductModuleForm.registerForms(formFactory, formBuilder));
        beforeEach(() => (componentDestroyed = new ReplaySubject(1)));
        afterEach(() => componentDestroyed.next());

        describe('Defective Products', () => {
            describe('validates', () => {
                describe.each`
                    control           | accessMode        | disabled
                    ${'store'}        | ${AccessMode.ADD} | ${false}
                    ${'vendor'}       | ${AccessMode.ADD} | ${false}
                    ${'storeProduct'} | ${AccessMode.ADD} | ${false}
                    ${'adjustment'}   | ${AccessMode.ADD} | ${false}
                    ${'quantity'}     | ${AccessMode.ADD} | ${false}
                    ${'reason'}       | ${AccessMode.ADD} | ${false}
                    ${'defectDate'}   | ${AccessMode.ADD} | ${true}
                    ${'product'}      | ${AccessMode.ADD} | ${false}
                    ${'comments'}     | ${AccessMode.ADD} | ${false}
                    ${'updatedBy'}    | ${AccessMode.ADD} | ${true}
                    ${'updatedOn'}    | ${AccessMode.ADD} | ${true}
                `('values', ({ control, accessMode, disabled }) => {
                    it(`should ${disabled ? '' : 'not '}disable ${control} in ${accessMode} mode`, fakeAsync(() => {
                        const group = formFactory.group(
                            'DefectiveProduct',
                            { ...new DefectiveProduct() },
                            componentDestroyed,
                            {
                                accessMode,
                            }
                        );
                        expect(group.getControl(control).disabled).toBe(disabled);
                    }));
                });

                describe.each`
                    field         | maxlength
                    ${'comments'} | ${255}
                `('maxlength', ({ field, maxlength }) => {
                    it(`should limit ${field} to ${maxlength} characters`, () => {
                        // verify with invalid length
                        const model = new DefectiveProduct();
                        model[field] = 'a'.repeat(maxlength + 1);
                        const groupMaxLengthError = formFactory.group('DefectiveProduct', model, componentDestroyed, {
                            accessMode: AccessMode.ADD,
                        });
                        groupMaxLengthError.getControl(field).updateValueAndValidity();
                        expect(groupMaxLengthError.getControl(field).hasError('maxlength')).toBe(true);
                        // verify with valid length
                        model[field] = 'a'.repeat(maxlength);
                        const group = formFactory.group('DefectiveProduct', model, componentDestroyed, {
                            accessMode: AccessMode.EDIT,
                        });
                        group.getControl(field).updateValueAndValidity();
                        expect(group.getControl(field).hasError('maxlength')).toBe(false);
                    });
                });

                describe('DefectiveProduct', () => {
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
                                'DefectiveProduct',
                                { ...new DefectiveProduct(), storeProduct: { companyProduct: { uom: { code: uom } } } },
                                componentDestroyed,
                                {
                                    accessMode: AccessMode.ADD,
                                }
                            );
                            const quantityControl = group.getControl('quantity');
                            quantityControl.patchValue(value);
                            quantityControl.updateValueAndValidity();

                            expect(quantityControl.hasError(error)).toBe(present);
                        });
                    });
                });

                describe('ValidateProduct', () => {
                    describe.each`
                        value                       | error         | present
                        ${null}                     | ${'required'} | ${true}
                        ${{ id: 2, code: 'prod2' }} | ${'required'} | ${false}
                    `('should validate product', ({ value, error, present }) => {
                        it(`with value ${value} ${present ? 'has' : 'does not have'} error ${error}`, () => {
                            const group = formFactory.group(
                                'DefectiveProduct',
                                { ...new DefectiveProduct(), product: value },
                                componentDestroyed,
                                {
                                    accessMode: AccessMode.ADD,
                                }
                            );
                            const productControl = group.getControl('product');
                            productControl.updateValueAndValidity();
                            expect(productControl.hasError(error)).toBe(present);
                        });
                    });
                });

                describe('ValidateStore', () => {
                    describe.each`
                        value                       | error         | present
                        ${null}                     | ${'required'} | ${true}
                        ${{ id: 2, code: 'store' }} | ${'required'} | ${false}
                    `('should validate store', ({ value, error, present }) => {
                        it(`with value ${value} ${present ? 'has' : 'does not have'} error ${error}`, () => {
                            const group = formFactory.group(
                                'DefectiveProduct',
                                { ...new DefectiveProduct(), store: value },
                                componentDestroyed,
                                {
                                    accessMode: AccessMode.ADD,
                                }
                            );
                            const storeControl = group.getControl('store');
                            storeControl.updateValueAndValidity();
                            expect(storeControl.hasError(error)).toBe(present);
                        });
                    });
                });

                describe('ValidateVendor', () => {
                    describe.each`
                        value                        | error         | present
                        ${null}                      | ${'required'} | ${true}
                        ${{ id: 2, code: 'vendor' }} | ${'required'} | ${false}
                    `('should validate store', ({ value, error, present }) => {
                        it(`with value ${value} ${present ? 'has' : 'does not have'} error ${error}`, () => {
                            const group = formFactory.group(
                                'DefectiveProduct',
                                { ...new DefectiveProduct(), vendor: value },
                                componentDestroyed,
                                {
                                    accessMode: AccessMode.ADD,
                                }
                            );
                            const vendorControl = group.getControl('vendor');
                            vendorControl.updateValueAndValidity();
                            expect(vendorControl.hasError(error)).toBe(present);
                        });
                    });
                });
            });
        });
    });
});
