import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HttpClient } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatStepperHarness } from '@angular/material/stepper/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CompanyExportValidators } from '@vioc-angular/central-ui/organization/company/data-access-company-export';
import { CompanyProduct, CompanyProductMassAdd } from '@vioc-angular/central-ui/product/data-access-company-product';
import { FeatureSharedProductSelectionMockModule } from '@vioc-angular/central-ui/product/feature-shared-product-selection';
import { UiActionBarModule } from '@vioc-angular/shared/ui-action-bar';
import { MockLoadingOverlayComponent, UiLoadingMockModule } from '@vioc-angular/shared/ui-loading';
import { UiStepperNavigationMockModule } from '@vioc-angular/shared/ui-stepper-navigation';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { FormFactory, UtilFormMockModule } from '@vioc-angular/shared/util-form';
import { of, Subject } from 'rxjs';
import { CompanyProductModuleForms } from '../../company-product-module-forms';
import { CompanyProductMassAddComponent } from './company-product-mass-add.component';

@Component({
    selector: 'vioc-angular-company-product',
    template: ``,
})
class MockCompanyProductComponent {
    @Input() form: any;
}

describe('CompanyProductMassAddComponent', () => {
    let component: CompanyProductMassAddComponent;
    let fixture: ComponentFixture<CompanyProductMassAddComponent>;
    let formFactory: FormFactory;
    let loader: HarnessLoader;

    const testCompany = { id: 1, code: 'COMPANY' };
    const testCompany2 = { id: 2, code: 'COMPANY' };
    const testProduct = { id: 2, code: 'PRODUCT', defaultUom: { code: 'EACH' }, reportOrder: '2', active: true };
    const testProduct2 = { id: 3, code: 'PRODUCT', defaultUom: { code: 'EACH' }, reportOrder: '3', active: true };

    const testCompanyProduct: CompanyProduct = {
        ...new CompanyProduct(),
        company: testCompany,
        uom: { id: 3, code: 'UOM' },
        reportOrder: '1',
    };

    const completeCompanySelectionStep = () => {
        component.companyControl.setValue(testCompany);
        component.stepper.next();
        expect(component.stepper.selectedIndex).toEqual(1);
    };

    const completeProductSelectionStep = () => {
        component.productsControl.setValue([testProduct]);
        component.stepper.next();
        expect(component.stepper.selectedIndex).toEqual(2);
    };

    const completeProductInformationStep = () => {
        component.companyProductControl.setValue(testCompanyProduct);
        component.stepper.next();
        expect(component.stepper.selectedIndex).toEqual(3);
    };

    const getAddProductsButton = () => fixture.debugElement.query(By.css('#add-products'));

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                MatFormFieldModule,
                MatStepperModule,
                MatListModule,
                MatOptionModule,
                MatSelectModule,
                UiLoadingMockModule,
                UiActionBarModule,
                UtilFormMockModule,
                ReactiveFormsModule,
                UiStepperNavigationMockModule,
                FeatureSharedProductSelectionMockModule,
            ],
            declarations: [CompanyProductMassAddComponent, MockCompanyProductComponent],
            providers: [
                { provide: GATEWAY_TOKEN, useValue: '//gateway/' },
                { provide: HttpClient, useValue: { get: jest.fn(() => of()) } },
                FormFactory,
                CompanyExportValidators,
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CompanyProductMassAddComponent);
        component = fixture.componentInstance;
        formFactory = TestBed.inject(FormFactory);
        loader = TestbedHarnessEnvironment.loader(fixture);
        CompanyProductModuleForms.registerForms(
            formFactory,
            TestBed.inject(FormBuilder),
            TestBed.inject(CompanyExportValidators)
        );
    });

    it('should create', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should setup the CompanyProductMassAdd form', () => {
            jest.spyOn(formFactory, 'group');
            fixture.detectChanges();
            expect(formFactory.group).toHaveBeenCalledWith(
                'CompanyProductMassAdd',
                new CompanyProductMassAdd(new CompanyProduct()),
                component['_destroyed']
            );
        });
        it('should load the companies the user has access to', () => {
            const testCompanies = [
                { id: 1, desc: 'desc 1', code: 'CODE1' },
                { id: 2, desc: 'desc 2', code: 'CODE2' },
            ];
            jest.spyOn(component['resourceFacade'], 'findCompaniesByRoles').mockReturnValueOnce(
                of({ resources: testCompanies, allCompanies: false })
            );
            fixture.detectChanges();
            expect(component['resourceFacade'].findCompaniesByRoles).toHaveBeenCalledWith(['ROLE_COMPANY_SERVICE_ADD']);
            expect(component.accessibleCompanies).toEqual(testCompanies);
        });
    });

    describe('after initialized', () => {
        beforeEach(() => fixture.detectChanges());

        it('should be linear', () => {
            expect(component.stepper.linear).toBeTruthy();
        });

        describe.each`
            companyControl | productsControl  | companyProductControl   | isValid
            ${testCompany} | ${[testProduct]} | ${testCompanyProduct}   | ${true}
            ${null}        | ${[testProduct]} | ${testCompanyProduct}   | ${false}
            ${testCompany} | ${[]}            | ${testCompanyProduct}   | ${false}
            ${testCompany} | ${[testProduct]} | ${new CompanyProduct()} | ${false}
        `('previewControl', ({ companyControl, productsControl, companyProductControl, isValid }) => {
            it(`should ${
                isValid ? '' : 'not '
            }allow update when controls are ${companyControl}, ${productsControl}, and ${companyProductControl}`, fakeAsync(async () => {
                jest.spyOn(component.previewControl, 'setValue');
                component.companyControl.patchValue(companyControl);
                component.productsControl.patchValue(productsControl);
                component.companyProductControl.patchValue(companyProductControl);
                fixture.detectChanges();
                flush();
                expect(component.previewControl.value).toEqual(isValid);
            }));
        });

        describe('product selection', () => {
            it('should update the companyProduct.product with selected products', () => {
                expect(component.companyProductControl.get('product').value).toBeNull();
                component.productsControl.patchValue([
                    { id: 1, code: 'prod1' },
                    { id: 2, code: 'prod2' },
                ]);
                expect(component.companyProductControl.get('product').value.code).toEqual('prod1, prod2');
            });

            it('should update the companyProduct.product with null', () => {
                component.productsControl.patchValue(null);
                expect(component.companyProductControl.get('product').value).toBeNull();
            });

            it('should provide the search logic', () => {
                expect(component.productSelection.searchFn).toEqual(component.searchProducts);
            });

            it('should default UOM and Report Order if a single product is selected', fakeAsync(async () => {
                component.selectCompany(testCompany);
                const stepper = await loader.getHarness(MatStepperHarness);
                await stepper.selectStep({ label: 'Select Products' });
                component.productsControl.patchValue([testProduct]);
                await stepper.selectStep({ label: 'Enter Product Information' });
                flush();
                expect(component.companyProductControl.get('reportOrder').value).toEqual(testProduct.reportOrder);
                expect(component.companyProductControl.get('uom').value).toEqual(testProduct.defaultUom);
            }));

            it('should set UOM and Report Order to null if multiple products are selected', fakeAsync(async () => {
                component.selectCompany(testCompany);
                const stepper = await loader.getHarness(MatStepperHarness);
                await stepper.selectStep({ label: 'Select Products' });
                component.productsControl.patchValue([testProduct, { ...testProduct, code: 'CODE2' }]);
                await stepper.selectStep({ label: 'Enter Product Information' });
                flush();
                expect(component.companyProductControl.get('reportOrder').value).toEqual(null);
                expect(component.companyProductControl.get('uom').value).toEqual(null);
            }));
        });
        describe('selectCompany', () => {
            it('should clear the products and update the companyProduct', () => {
                const testAccount = { id: 2, code: 'account' };
                component.companyProductControl.patchValue({
                    ...component.companyProductControl.value,
                    costAccount: testAccount,
                    salesAccount: testAccount,
                });
                jest.spyOn(component.productSelection, 'clear');
                const previousCompanyProduct = component.companyProductControl.value;
                component.selectCompany(testCompany);
                expect(component.productSelection.clear).toHaveBeenCalled();
                expect(component.companyProductControl.value).toEqual({
                    ...previousCompanyProduct,
                    company: testCompany,
                    costAccount: null,
                    salesAccount: null,
                });
            });
        });

        describe('addProducts', () => {
            it('should add a CompanyProduct for every selected product and reset', fakeAsync(() => {
                const products = [
                    { id: 1, code: 'prod1' },
                    { id: 2, code: 'prod2' },
                ];
                component.productsControl.patchValue(products);
                jest.spyOn(component['companyProductFacade'], 'add').mockImplementation((companyProducts: any[]) =>
                    of(companyProducts.length)
                );
                jest.spyOn(component['messageFacade'], 'addSaveCountMessage');
                jest.spyOn(component.formDirective, 'resetForm');
                jest.spyOn(component.stepper, 'reset');

                component.addProducts();
                flush();

                expect(component['companyProductFacade'].add).toHaveBeenCalled();
                expect(component['messageFacade'].addSaveCountMessage).toHaveBeenCalledWith(products.length, 'added');
                expect(component.formDirective.resetForm).toHaveBeenCalled();
                expect(component.stepper.reset).toHaveBeenCalled();
            }));
        });

        describe('unsavedChanges', () => {
            it('should be false if the form is not dirty', () => {
                expect(component.unsavedChanges).toBeFalsy();
            });
            it('should be true if the form is dirty', () => {
                component.form.markAsDirty();
                expect(component.unsavedChanges).toBeTruthy();
            });
            it('should be false if the form is undefined', () => {
                component.form = undefined;
                expect(component.unsavedChanges).toBeFalsy();
            });
        });

        describe('when adding company services', () => {
            beforeEach(() => {
                completeCompanySelectionStep();
                completeProductSelectionStep();
                completeProductInformationStep();
                fixture.detectChanges();
            });

            it('Should not display cancel Button', fakeAsync(() => {
                const actionBar = fixture.debugElement.query(By.css('vioc-angular-action-bar')).componentInstance;
                expect(actionBar.isCancelButtonDisplayed).toBeFalsy();
            }));

            it('should display the loading overlay', fakeAsync(() => {
                const loadingOverlay: MockLoadingOverlayComponent = fixture.debugElement.query(
                    By.directive(MockLoadingOverlayComponent)
                ).componentInstance;
                expect(loadingOverlay.loading).toBeFalsy();
                const addSubject = new Subject<number>();
                jest.spyOn(component['companyProductFacade'], 'add').mockImplementation(() => addSubject);

                getAddProductsButton().nativeElement.click();
                fixture.detectChanges();
                expect(loadingOverlay.loading).toBeTruthy();

                jest.spyOn(component.stepper, 'reset').mockImplementation(() => {});
                jest.spyOn(component.formDirective, 'resetForm').mockImplementation(() => {});
                addSubject.next(1);
                flush();
                fixture.detectChanges();

                expect(loadingOverlay.loading).toBeFalsy();
            }));

            it('should cancel loading overlay if an error occurs', fakeAsync(() => {
                const loadingOverlay: MockLoadingOverlayComponent = fixture.debugElement.query(
                    By.directive(MockLoadingOverlayComponent)
                ).componentInstance;
                expect(loadingOverlay.loading).toBeFalsy();
                const addSubject = new Subject<number>();
                jest.spyOn(component['companyProductFacade'], 'add').mockImplementation(() => addSubject);

                getAddProductsButton().nativeElement.click();
                fixture.detectChanges();
                expect(loadingOverlay.loading).toBeTruthy();

                expect(() => {
                    addSubject.error('An error occurred');
                    flush();
                }).toThrow();
                fixture.detectChanges();

                expect(loadingOverlay.loading).toBeFalsy();
            }));
        });

        describe('adding two products back to back', () => {
            it('should add a product to the first company then adds a product to another compnany', fakeAsync(async () => {
                const numProductsAdded = 1;
                component.selectCompany(testCompany);
                jest.spyOn(component['companyProductFacade'], 'add').mockImplementation((companyProducts: any[]) =>
                    of(companyProducts.length)
                );
                jest.spyOn(component['messageFacade'], 'addSaveCountMessage');

                const stepper = await loader.getHarness(MatStepperHarness);
                await stepper.selectStep({ label: 'Select Products' });
                component.productsControl.patchValue([testProduct]);
                await stepper.selectStep({ label: 'Enter Product Information' });
                flush();

                expect(component.companyProductControl.get('active').value).toEqual(true);
                component.addProducts();
                flush();
                expect(component['messageFacade'].addSaveCountMessage).toHaveBeenCalledWith(numProductsAdded, 'added');

                component.selectCompany(testCompany2);
                await stepper.selectStep({ label: 'Select Products' });
                component.productsControl.patchValue([testProduct2]);
                await stepper.selectStep({ label: 'Enter Product Information' });
                flush();

                expect(component.companyProductControl.get('active').value).toEqual(true);
                component.addProducts();
                flush();
                expect(component['messageFacade'].addSaveCountMessage).toHaveBeenCalledWith(numProductsAdded, 'added');
            }));
        });
    });
});
