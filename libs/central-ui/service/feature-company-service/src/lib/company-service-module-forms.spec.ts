import { TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import {
    CompanyExportFacade,
    CompanyExportValidators,
} from '@vioc-angular/central-ui/organization/company/data-access-company-export';
import {
    CompanyService,
    CompanyServiceMassAdd,
    PricingStrategy,
} from '@vioc-angular/central-ui/service/data-access-company-service';
import { Service } from '@vioc-angular/central-ui/service/data-access-service';
import { Described } from '@vioc-angular/shared/common-functionality';
import { FormFactory } from '@vioc-angular/shared/util-form';
import { ReplaySubject } from 'rxjs';
import { CompanyServiceModuleForms } from './company-service-module-forms';

describe('CompanyServiceModuleForms', () => {
    function fakeDescribed(id: any): Described {
        return { id, code: 'code-' + id, description: 'description-' + id, version: 0 };
    }

    describe('validations', () => {
        const testCompanyService: CompanyService = {
            id: { serviceId: 21, companyId: 11 },
            version: 0,
            active: true,
            company: fakeDescribed(11),
            service: fakeDescribed(21),
            salesAccount: fakeDescribed(31),
            costAccount: fakeDescribed(41),
            pricingStrategy: PricingStrategy.PRODUCT,
        };

        let formFactory: FormFactory;
        let formBuilder: FormBuilder;
        const companyExportValidators = new CompanyExportValidators();

        let componentDestroyed;

        beforeEach(async () => {
            await TestBed.configureTestingModule({
                declarations: [],
                imports: [ReactiveFormsModule],
                providers: [FormFactory, CompanyExportValidators],
            }).compileComponents();
            formFactory = TestBed.inject(FormFactory);
            formBuilder = TestBed.inject(FormBuilder);
            CompanyServiceModuleForms.registerForms(formFactory, formBuilder, companyExportValidators);
            componentDestroyed = new ReplaySubject(1);
        });

        afterEach(() => {
            componentDestroyed.next();
            componentDestroyed.unsubscribe();
        });

        describe('active', () => {
            it('should be defaulted to true if null', () => {
                const value = {
                    ...testCompanyService,
                    active: null,
                };
                const group = formFactory.group('CompanyService', value, componentDestroyed);

                group.getControl('active').updateValueAndValidity();

                expect(group.getControlValue('active')).toBeTruthy();
            });
        });

        describe('salesAccount', () => {
            describe.each`
                compService                                                         | validity | isRequired
                ${{ ...testCompanyService }}                                        | ${true}  | ${false}
                ${{ ...testCompanyService, salesAccount: null, costAccount: null }} | ${true}  | ${false}
                ${{ ...testCompanyService, salesAccount: null }}                    | ${false} | ${true}
            `('should be validated', ({ compService, validity, isRequired }) => {
                it('swith costAccount', () => {
                    const group = formFactory.group('CompanyService', compService, componentDestroyed);

                    group.getControl('salesAccount').updateValueAndValidity();

                    expect(group.getControl('salesAccount').valid).toBe(validity);
                    expect(group.getControl('salesAccount').hasError('required')).toBe(isRequired);
                });

                it('with costAccount in grid mode', () => {
                    const companyExportFacade = new CompanyExportFacade(null, null, null);
                    const group = formFactory.group('CompanyService', compService, componentDestroyed, {
                        scope: 'GRID',
                        companyExportFacade,
                    });

                    expect(group.getControl('salesAccount').get('code')).toBeTruthy();
                    if (compService.salesAccount) {
                        expect(group.getControl('salesAccount').get('code').value).toEqual(
                            compService.salesAccount.code
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
                compService                                                         | validity | isRequired
                ${{ ...testCompanyService }}                                        | ${true}  | ${false}
                ${{ ...testCompanyService, salesAccount: null, costAccount: null }} | ${true}  | ${false}
                ${{ ...testCompanyService, costAccount: null }}                     | ${false} | ${true}
            `('should be validated', ({ compService, validity, isRequired }) => {
                it('with salesAccount', () => {
                    const group = formFactory.group('CompanyService', compService, componentDestroyed);

                    group.getControl('costAccount').updateValueAndValidity();

                    expect(group.getControl('costAccount').valid).toBe(validity);
                    expect(group.getControl('costAccount').hasError('required')).toBe(isRequired);
                });

                it('with salesAccount in grid mode', () => {
                    const companyExportFacade = new CompanyExportFacade(null, null, null);
                    const group = formFactory.group('CompanyService', compService, componentDestroyed, {
                        scope: 'GRID',
                        companyExportFacade,
                    });

                    expect(group.getControl('costAccount').get('code')).toBeTruthy();
                    if (compService.costAccount) {
                        expect(group.getControl('costAccount').get('code').value).toEqual(compService.costAccount.code);
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

        describe('companyServiceMassAdd', () => {
            const testModel: CompanyServiceMassAdd = {
                companies: undefined,
                services: undefined,
                companyService: testCompanyService,
                preview: undefined,
            };

            describe('companies', () => {
                it('should be invalid without a value', () => {
                    const group = formFactory.group('CompanyServiceMassAdd', testModel, componentDestroyed);
                    group.getControl('companies').updateValueAndValidity();
                    expect(group.getControl('companies').hasError('required')).toBe(true);
                });
                it('should be valid with a value', () => {
                    const group = formFactory.group('CompanyServiceMassAdd', testModel, componentDestroyed);
                    group.patchControlValue('companies', [fakeDescribed(13)]);
                    expect(group.getControl('companies').valid).toBe(true);
                });
            });

            describe('services', () => {
                it('should be invalid with an less than 1 value', () => {
                    const group = formFactory.group('CompanyServiceMassAdd', testModel, componentDestroyed);
                    group.patchControlValue('services', []);
                    expect(group.getControl('services').hasError('minLengthArray')).toBe(true);
                });
                it('should be valid with at least 1 value', () => {
                    const group = formFactory.group('CompanyServiceMassAdd', testModel, componentDestroyed);
                    group.patchControlValue('services', [fakeDescribed(11)] as Service[]);
                    expect(group.getControl('services').valid).toBe(true);
                });
            });

            describe('preview', () => {
                it('should be invalid when false', () => {
                    const group = formFactory.group('CompanyServiceMassAdd', testModel, componentDestroyed);
                    group.getControl('preview').updateValueAndValidity();
                    expect(group.getControl('preview').hasError('required')).toBe(true);
                });
                it('should be valid when true', () => {
                    const group = formFactory.group('CompanyServiceMassAdd', testModel, componentDestroyed);
                    group.patchControlValue('preview', true);
                    expect(group.getControl('preview').valid).toBe(true);
                });
            });
        });
    });
});
