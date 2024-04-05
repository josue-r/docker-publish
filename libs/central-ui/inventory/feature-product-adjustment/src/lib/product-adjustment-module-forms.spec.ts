import { FormBuilder } from '@angular/forms';
import {
    ProductAdjustment,
    ProductAdjustmentDetail,
} from '@vioc-angular/central-ui/inventory/data-access-product-adjustment';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { Described } from '@vioc-angular/shared/common-functionality';
import { FormFactory } from '@vioc-angular/shared/util-form';
import { ReplaySubject } from 'rxjs';
import { ProductAdjustmentForms } from './product-adjustment-module-forms';

describe('ProductAdjustmentForms', () => {
    describe('registerForms', () => {
        it('should register ProductAdjustment and ProductAdjustmentDetail forms', () => {
            const mockFormFactory = ({ register: jest.fn() } as unknown) as FormFactory;
            ProductAdjustmentForms.registerForms(mockFormFactory, undefined);
            expect(mockFormFactory.register).toHaveBeenCalledWith('ProductAdjustment', expect.any(Function));
            expect(mockFormFactory.register).toHaveBeenCalledWith('ProductAdjustmentDetail', expect.any(Function));
        });
    });

    describe('validations', () => {
        const formBuilder = new FormBuilder();
        const formFactory = new FormFactory(formBuilder);
        let componentDestroyed: ReplaySubject<any>;

        const adjustmentProduct = {
            id: { lineNumber: 1, adjustmentNumber: 1 },
            sign: '+',
            lineNumber: 1,
            quantity: 10,
            wholesalePrice: 1,
            unitOfMeasure: { code: 'EACH' },
            adjustmentReason: { code: 'REASON' },
            product: { code: 'PROD' },
            Adjustment: { id: 1 },
            createdDate: '2020-01-01',
            updatedBy: 'Test User',
            updatedOn: '2020-01-02',
        };

        beforeAll(() => ProductAdjustmentForms.registerForms(formFactory, formBuilder));
        beforeEach(() => (componentDestroyed = new ReplaySubject(1)));
        afterEach(() => componentDestroyed.next());

        describe('ProductAdjustment', () => {
            describe.each`
                field         | value                                    | error          | showError
                ${'store'}    | ${null}                                  | ${'required'}  | ${true}
                ${'store'}    | ${{ ...new Described(), code: 'STORE' }} | ${'required'}  | ${false}
                ${'comments'} | ${'a'.repeat(255)}                       | ${'maxlength'} | ${false}
                ${'comments'} | ${'a'.repeat(256)}                       | ${'maxlength'} | ${true}
            `('form', ({ field, value, error, showError }) => {
                it(`should ${showError ? '' : 'not '}error ${error} for field ${field} with ADD access`, () => {
                    const group = formFactory.group('ProductAdjustment', new ProductAdjustment(), componentDestroyed, {
                        accessMode: AccessMode.ADD,
                    });
                    group.getControl(field).setValue(value);
                    group.getControl(field).updateValueAndValidity();
                    expect(group.getControl(field).hasError(error)).toBe(showError);
                });
            });

            describe.each`
                field                   | value                  | error               | showError
                ${'adjustmentProducts'} | ${[]}                  | ${'minLengthArray'} | ${true}
                ${'adjustmentProducts'} | ${[adjustmentProduct]} | ${'minLengthArray'} | ${false}
            `('form', ({ field, value, error, showError }) => {
                it(`should ${showError ? '' : 'not '}error ${error} for field ${field} with ADD access`, () => {
                    const group = formFactory.group(
                        'ProductAdjustment',
                        { ...new ProductAdjustment(), adjustmentProducts: value },
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
                field                   | accessMode         | isDisabled
                ${'id'}                 | ${AccessMode.VIEW} | ${true}
                ${'id'}                 | ${AccessMode.EDIT} | ${true}
                ${'store'}              | ${AccessMode.VIEW} | ${true}
                ${'store'}              | ${AccessMode.EDIT} | ${true}
                ${'store'}              | ${AccessMode.ADD}  | ${false}
                ${'status'}             | ${AccessMode.VIEW} | ${true}
                ${'status'}             | ${AccessMode.EDIT} | ${true}
                ${'createdDate'}        | ${AccessMode.VIEW} | ${true}
                ${'createdDate'}        | ${AccessMode.EDIT} | ${true}
                ${'createdByEmployee'}  | ${AccessMode.VIEW} | ${true}
                ${'createdByEmployee'}  | ${AccessMode.EDIT} | ${true}
                ${'comments'}           | ${AccessMode.EDIT} | ${false}
                ${'comments'}           | ${AccessMode.ADD}  | ${false}
                ${'adjustmentProducts'} | ${AccessMode.EDIT} | ${false}
                ${'adjustmentProducts'} | ${AccessMode.ADD}  | ${false}
            `('form', ({ field, accessMode, isDisabled }) => {
                it(`should ${isDisabled ? '' : 'not '}disable ${field} with ${accessMode.urlSegement} access`, () => {
                    const group = formFactory.group(
                        'ProductAdjustment',
                        { ...new ProductAdjustment(), status: { code: 'FINALIZED' } },
                        componentDestroyed,
                        {
                            accessMode: accessMode,
                        }
                    );
                    expect(group.getControl(field).disabled).toBe(isDisabled);
                });
            });
        });

        describe('ProductAdjustmentDetail', () => {
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
                        'ProductAdjustmentDetail',
                        { ...new ProductAdjustmentDetail(), unitOfMeasure: { code: uom } },
                        componentDestroyed
                    );
                    const quantityControl = group.getControl('quantity');
                    quantityControl.patchValue(value);
                    quantityControl.updateValueAndValidity();

                    expect(quantityControl.hasError(error)).toBe(present);
                });
            });
        });
    });
});
