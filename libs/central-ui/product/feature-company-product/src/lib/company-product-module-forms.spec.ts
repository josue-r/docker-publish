import { FormBuilder } from '@angular/forms';
import {
    CompanyExportFacade,
    CompanyExportValidators,
} from '@vioc-angular/central-ui/organization/company/data-access-company-export';
import { CompanyProduct, CompanyProductMassAdd } from '@vioc-angular/central-ui/product/data-access-company-product';
import { Product } from '@vioc-angular/central-ui/product/data-access-product';
import { Described } from '@vioc-angular/shared/common-functionality';
import { FormFactory } from '@vioc-angular/shared/util-form';
import { ReplaySubject } from 'rxjs';
import { CompanyProductModuleForms } from './company-product-module-forms';

describe('CompanyProductModuleForms', () => {
    const testDescribe: Described = {
        id: 1,
        code: 'CODE',
        description: 'DESC',
        version: 0,
    };

    describe('validations', () => {
        const formBuilder = new FormBuilder();
        const formFactory = new FormFactory(formBuilder);
        const companyExportValidators = new CompanyExportValidators();
        let componentDestroyed: ReplaySubject<any>;

        const testCompanyProduct: CompanyProduct = {
            id: undefined,
            company: undefined,
            product: undefined,
            active: undefined,
            costAccount: undefined,
            salesAccount: undefined,
            uom: undefined,
            reportOrder: undefined,
            version: undefined,
        };

        beforeAll(() => CompanyProductModuleForms.registerForms(formFactory, formBuilder, companyExportValidators));
        beforeEach(() => (componentDestroyed = new ReplaySubject(1)));
        afterEach(() => componentDestroyed.next());

        describe('companyProduct', () => {
            it('should validate that reportOrder cannot have more than the max number of characters', () => {
                const value: CompanyProduct = {
                    ...testCompanyProduct,
                    reportOrder: '1234567',
                };
                const group = formFactory.group('CompanyProduct', value, componentDestroyed);
                group.getControl('reportOrder').updateValueAndValidity();
                expect(group.getControl('reportOrder').hasError('maxlength')).toBe(true);
            });

            describe('company', () => {
                it('should be disabled if it has a value', () => {
                    const value: CompanyProduct = {
                        ...testCompanyProduct,
                        company: { ...testDescribe },
                    };

                    const group = formFactory.group('CompanyProduct', value, componentDestroyed);

                    expect(group.getControl('company').disabled).toBe(true);
                });

                it('should be enabled if it has no value', () => {
                    const group = formFactory.group('CompanyProduct', testCompanyProduct, componentDestroyed);

                    expect(group.getControl('company').disabled).toBe(false);
                });
            });

            describe('product', () => {
                it('should be disabled if it has a value', () => {
                    const value: CompanyProduct = {
                        ...testCompanyProduct,
                        product: { ...testDescribe } as Product,
                    };

                    const group = formFactory.group('CompanyProduct', value, componentDestroyed);

                    expect(group.getControl('product').disabled).toBe(true);
                });

                it('should be enabled if it has no value', () => {
                    const group = formFactory.group('CompanyProduct', testCompanyProduct, componentDestroyed);

                    expect(group.getControl('product').disabled).toBe(false);
                });
            });

            describe('active', () => {
                it('should be disabled if active and has an id', () => {
                    const value: CompanyProduct = {
                        ...testCompanyProduct,
                        id: { companyId: 1, productId: 2 },
                        active: true,
                    };

                    const group = formFactory.group('CompanyProduct', value, componentDestroyed);

                    expect(group.getControl('active').disabled).toBe(true);
                });

                it('should be disabled if active and does not have an id', () => {
                    const value: CompanyProduct = {
                        ...testCompanyProduct,
                        active: true,
                    };

                    const group = formFactory.group('CompanyProduct', value, componentDestroyed);

                    expect(group.getControl('active').disabled).toBe(false);
                });

                it('should be enabled if inactive', () => {
                    const value: CompanyProduct = {
                        ...testCompanyProduct,
                        active: false,
                    };

                    const group = formFactory.group('CompanyProduct', value, componentDestroyed);

                    expect(group.getControl('active').disabled).toBe(false);
                });

                it('should be defaulted to true if null', () => {
                    const value = {
                        ...testCompanyProduct,
                        active: null,
                    };
                    const group = formFactory.group('CompanyProduct', value, componentDestroyed);

                    group.getControl('active').updateValueAndValidity();

                    expect(group.getControlValue('active')).toBeTruthy();
                });
            });

            describe('salesAccount', () => {
                describe.each`
                    companyProduct                                                                                                                  | validity | isRequired
                    ${{ ...testCompanyProduct, company: { ...testDescribe }, salesAccount: { ...testDescribe }, costAccount: { ...testDescribe } }} | ${true}  | ${false}
                    ${{ ...testCompanyProduct, company: { ...testDescribe }, salesAccount: null, costAccount: null }}                               | ${true}  | ${false}
                    ${{ ...testCompanyProduct, company: { ...testDescribe }, salesAccount: null, costAccount: { ...testDescribe } }}                | ${false} | ${true}
                `('should be validated', ({ companyProduct, validity, isRequired }) => {
                    it('with costAccount', () => {
                        const group = formFactory.group('CompanyProduct', companyProduct, componentDestroyed);

                        group.getControl('salesAccount').updateValueAndValidity();

                        expect(group.getControl('salesAccount').valid).toBe(validity);
                        expect(group.getControl('salesAccount').hasError('required')).toBe(isRequired);
                    });

                    it('with costAccount in grid mode', () => {
                        const companyExportFacade = new CompanyExportFacade(null, null, null);
                        const group = formFactory.group('CompanyProduct', companyProduct, componentDestroyed, {
                            scope: 'GRID',
                            companyExportFacade,
                        });

                        expect(group.getControl('salesAccount').get('code')).toBeTruthy();
                        if (companyProduct.salesAccount) {
                            expect(group.getControl('salesAccount').get('code').value).toEqual(
                                companyProduct.salesAccount.code
                            );
                        } else {
                            expect(group.getControlValue('salesAccount')).toEqual(new Described());
                            expect(group.getControl('salesAccount').get('code').value).toEqual(null);
                        }
                        group.getControl('salesAccount').get('code').updateValueAndValidity();

                        expect(group.getControl('salesAccount').valid).toBe(validity);
                        expect(group.getControl('salesAccount').get('code').hasError('required')).toBe(isRequired);
                    });
                });
            });

            describe('costAccount', () => {
                describe.each`
                    companyProduct                                                                                                                  | validity | isRequired
                    ${{ ...testCompanyProduct, company: { ...testDescribe }, costAccount: { ...testDescribe }, salesAccount: { ...testDescribe } }} | ${true}  | ${false}
                    ${{ ...testCompanyProduct, company: { ...testDescribe }, costAccount: null, salesAccount: null }}                               | ${true}  | ${false}
                    ${{ ...testCompanyProduct, company: { ...testDescribe }, costAccount: null, salesAccount: { ...testDescribe } }}                | ${false} | ${true}
                `('should be validated', ({ companyProduct, validity, isRequired }) => {
                    it('with salesAccount', () => {
                        const group = formFactory.group('CompanyProduct', companyProduct, componentDestroyed);

                        group.getControl('costAccount').updateValueAndValidity();

                        expect(group.getControl('costAccount').valid).toBe(validity);
                        expect(group.getControl('costAccount').hasError('required')).toBe(isRequired);
                    });

                    it('with salesAccount in grid mode', () => {
                        const companyExportFacade = new CompanyExportFacade(null, null, null);
                        const group = formFactory.group('CompanyProduct', companyProduct, componentDestroyed, {
                            scope: 'GRID',
                            companyExportFacade,
                        });

                        expect(group.getControl('costAccount').get('code')).toBeTruthy();
                        if (companyProduct.costAccount) {
                            expect(group.getControl('costAccount').get('code').value).toEqual(
                                companyProduct.costAccount.code
                            );
                        } else {
                            expect(group.getControlValue('costAccount')).toEqual(new Described());
                            expect(group.getControl('costAccount').get('code').value).toEqual(null);
                        }
                        group.getControl('costAccount').get('code').updateValueAndValidity();

                        expect(group.getControl('costAccount').valid).toBe(validity);
                        expect(group.getControl('costAccount').get('code').hasError('required')).toBe(isRequired);
                    });
                });
            });

            describe('uom', () => {
                it('should be invalid without a value', () => {
                    const group = formFactory.group('CompanyProduct', testCompanyProduct, componentDestroyed);

                    group.getControl('uom').updateValueAndValidity();

                    expect(group.getControl('uom').hasError('required')).toBe(true);
                });

                it('should be valid with a value', () => {
                    const group = formFactory.group('CompanyProduct', testCompanyProduct, componentDestroyed);

                    group.patchControlValue('uom', testDescribe);

                    expect(group.getControl('uom').valid).toBe(true);
                });
            });

            describe('reportOrder', () => {
                it('should be invalid without a value', () => {
                    const group = formFactory.group('CompanyProduct', testCompanyProduct, componentDestroyed);

                    group.getControl('reportOrder').updateValueAndValidity();

                    expect(group.getControl('reportOrder').hasError('required')).toBe(true);
                });

                it('should be invalid with a length greater than 6', () => {
                    const group = formFactory.group('CompanyProduct', testCompanyProduct, componentDestroyed);

                    group.patchControlValue('reportOrder', '000011111111');

                    expect(group.getControl('reportOrder').hasError('maxlength')).toBe(true);
                });

                it('should be valid with a value', () => {
                    const group = formFactory.group('CompanyProduct', testCompanyProduct, componentDestroyed);

                    group.patchControlValue('reportOrder', '00001');

                    expect(group.getControl('reportOrder').valid).toBe(true);
                });
            });
        });

        describe('companyProductMassAdd', () => {
            const testModel: CompanyProductMassAdd = {
                company: undefined,
                products: undefined,
                companyProduct: testCompanyProduct,
                preview: undefined,
            };

            describe('company', () => {
                it('should be invalid without a value', () => {
                    const group = formFactory.group('CompanyProductMassAdd', testModel, componentDestroyed);
                    group.getControl('company').updateValueAndValidity();
                    expect(group.getControl('company').hasError('required')).toBe(true);
                });
                it('should be valid with a value', () => {
                    const group = formFactory.group('CompanyProductMassAdd', testModel, componentDestroyed);
                    group.patchControlValue('company', testDescribe);
                    expect(group.getControl('company').valid).toBe(true);
                });
            });

            describe('products', () => {
                it('should be invalid with an less than 1 value', () => {
                    const group = formFactory.group('CompanyProductMassAdd', testModel, componentDestroyed);
                    group.patchControlValue('products', []);
                    expect(group.getControl('products').hasError('minLengthArray')).toBe(true);
                });
                it('should be valid with at least 1 value', () => {
                    const group = formFactory.group('CompanyProductMassAdd', testModel, componentDestroyed);
                    group.patchControlValue('products', [testDescribe] as Product[]);
                    expect(group.getControl('products').valid).toBe(true);
                });
            });

            describe('preview', () => {
                it('should be invalid when false', () => {
                    const group = formFactory.group('CompanyProductMassAdd', testModel, componentDestroyed);
                    group.getControl('preview').updateValueAndValidity();
                    expect(group.getControl('preview').hasError('required')).toBe(true);
                });
                it('should be valid when true', () => {
                    const group = formFactory.group('CompanyProductMassAdd', testModel, componentDestroyed);
                    group.patchControlValue('preview', true);
                    expect(group.getControl('preview').valid).toBe(true);
                });
            });
        });
    });
});
