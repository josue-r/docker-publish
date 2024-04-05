import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { HttpClient } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Store } from '@vioc-angular/central-ui/organization/data-access-resources';
import { FeatureSharedStoreSelectionMockModule } from '@vioc-angular/central-ui/organization/feature-shared-store-selection';
import { CompanyProduct } from '@vioc-angular/central-ui/product/data-access-company-product';
import { Product } from '@vioc-angular/central-ui/product/data-access-product';
import { StoreProduct, StoreProductMassAddPreview } from '@vioc-angular/central-ui/product/data-access-store-product';
import { FeatureSharedProductSelectionMockModule } from '@vioc-angular/central-ui/product/feature-shared-product-selection';
import { CentralFormUiModule } from '@vioc-angular/central-ui/ui-modules';
import { CommonFunctionalityModule, Described } from '@vioc-angular/shared/common-functionality';
import { UiStepperNavigationMockModule } from '@vioc-angular/shared/ui-stepper-navigation';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { FormFactory } from '@vioc-angular/shared/util-form';
import { of, throwError } from 'rxjs';
import { StoreProductModuleForms } from '../../store-product-module-forms';
import { StoreProductMassAddComponent } from './store-product-mass-add.component';

@Component({
    selector: 'vioc-angular-store-product',
    template: ``,
})
class MockStoreProductComponent {
    @Input() massAddForm: any;
}

describe('StoreProductMassAddComponent', () => {
    let component: StoreProductMassAddComponent;
    let fixture: ComponentFixture<StoreProductMassAddComponent>;
    let formFactory: FormFactory;

    const fakeStore = { id: 1, desc: 'store1' } as Store;
    const fakeProduct = { id: 2, desc: 'prod2' } as Product;
    const fakeCompanyProduct: CompanyProduct = { ...new CompanyProduct(), id: { companyId: 1, productId: 2 } };
    const countFrequency: Described = { id: 5, code: 'CF', description: 'Weely', version: 0 };

    const vendorDirectShip: Described = { id: 3, code: 'VDS', description: 'Valvoline Direct Ship', version: 0 };
    const fakeStoreProduct: StoreProduct = {
        ...new StoreProduct(),
        id: { storeId: 1, productId: 2 },
        store: fakeStore,
        product: fakeProduct,
        companyProduct: fakeCompanyProduct,
        vendor: vendorDirectShip,
        taxable: true,
        overridable: false,
        active: true,
        reportOrder: '1',
        includeInCount: true,
        countFrequency: countFrequency,
        wholesalePrice: 20,
        retailPrice: 30,
        quantityPerPack: 1,
        minOrderQuantity: 1,
        minMaxOverridable: true,
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                CentralFormUiModule,
                FeatureSharedStoreSelectionMockModule,
                MatStepperModule,
                MatListModule,
                MatTableModule,
                MatPaginatorModule,
                UiStepperNavigationMockModule,
                FeatureSharedProductSelectionMockModule,
                CommonFunctionalityModule,
            ],
            declarations: [StoreProductMassAddComponent, MockStoreProductComponent],
            providers: [
                { provide: GATEWAY_TOKEN, useValue: '//gateway/' },
                { provide: HttpClient, useValue: { get: jest.fn(() => of()) } },
                FormFactory,
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(StoreProductMassAddComponent);
        component = fixture.componentInstance;
        formFactory = TestBed.inject(FormFactory);
        StoreProductModuleForms.registerForms(formFactory, TestBed.inject(FormBuilder));
    });

    it('should create', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should setup the StoreProductMassAdd form', () => {
            jest.spyOn(formFactory, 'group');
            // execute ngOnInit via first detectChanges call
            fixture.detectChanges();
            expect(formFactory.group).toHaveBeenCalledWith(
                'StoreProductMassAdd',
                {
                    stores: [],
                    products: [],
                    useDefaultVendor: undefined,
                    useDefaultReportOrder: undefined,
                    storeProduct: new StoreProduct(),
                },
                component['_destroyed']
            );
        });
    });

    describe('after initialized', () => {
        beforeEach(() => fixture.detectChanges());

        describe('preview subscription logic', () => {
            it('should be marked dirty when the store selection changes', () => {
                expect(component.previewDirty).toBeFalsy();
                // execute subscription via a value update
                component.storesControl.setValue([fakeStore]);
                expect(component.previewDirty).toBeTruthy();
            });
            it('should be marked dirty when the store product changes', () => {
                expect(component.previewDirty).toBeFalsy();
                // execute subscription via a value update
                component.productsControl.setValue([fakeProduct]);
                expect(component.previewDirty).toBeTruthy();
            });
            it.each`
                previewDirty | selectedStep | updateExpected
                ${true}      | ${0}         | ${false}
                ${true}      | ${1}         | ${false}
                ${true}      | ${2}         | ${true}
                ${true}      | ${3}         | ${true}
                ${false}     | ${0}         | ${false}
                ${false}     | ${1}         | ${false}
                ${false}     | ${2}         | ${false}
                ${false}     | ${3}         | ${false}
            `(
                'when previewDirty=$previewDirty and selectedStep=$selectedStep, updateExpected=$updateExpected',
                ({ previewDirty, selectedStep, updateExpected }) => {
                    jest.spyOn(component, 'previewMassAdd').mockImplementation();
                    component.previewDirty = previewDirty;
                    // execute subscription via a stepper event
                    component.stepper.selectionChange.next({
                        selectedIndex: selectedStep,
                    } as unknown as StepperSelectionEvent);
                    expect(component.previewMassAdd).toHaveBeenCalledTimes(updateExpected ? 1 : 0);
                }
            );
        });

        describe('previewMassAdd', () => {
            beforeEach(() => {
                component.storesControl.setValue([fakeStore]);
                component.productsControl.setValue([fakeProduct]);
                component.previewDirty = true;
            });

            it('should use the selected stores and products to configure the preview data table', fakeAsync(() => {
                const previewSpy = jest
                    .spyOn(component['storeProductFacade'], 'previewMassAdd')
                    .mockImplementation(() => {
                        expect(component.loadingPreview).toBeTruthy();
                        return of([{ storeNumber: '001', prodCodes: ['PR1', 'PR2'] }]);
                    });
                // execute
                component.previewMassAdd();
                flush();
                expect(previewSpy).toHaveBeenCalled();
            }));
            it('should hide the loading overlay on error', fakeAsync(() => {
                const previewSpy = jest
                    .spyOn(component['storeProductFacade'], 'previewMassAdd')
                    .mockReturnValue(throwError('test'));
                // execute
                component.previewMassAdd();
                flush();
                expect(previewSpy).toHaveBeenCalled();
                expect(component.loadingPreview).toBeFalsy();
            }));
        });

        describe('addStoreProducts', () => {
            it('should add product only once when button clicked more than once', fakeAsync(() => {
                const addSpy = jest.spyOn(component['storeProductFacade'], 'add').mockImplementation(() => {
                    // verify that loading overlay shows
                    expect(component.loadingPreview).toBeTruthy();
                    return of(1);
                });
                jest.spyOn(component['storeProductFacade'], 'previewMassAdd').mockImplementation(() => {
                    expect(component.loadingPreview).toBeTruthy();
                    return of([{ storeNumber: '001', prodCodes: ['PR1', 'PR2'] }]);
                });
                component.storesControl.setValue([fakeStore]);
                component.productsControl.setValue([fakeProduct]);
                component.storeProductControl.setValue(fakeStoreProduct);
                component.useDefaultReportOrderControl.setValue(true);
                component.useDefaultVendorControl.setValue(true);
                fixture.detectChanges();
                component.preview = new MatTableDataSource<StoreProductMassAddPreview>([
                    {
                        storeNumber: 'testStore',
                        prodCodes: ['prodCode'],
                    },
                ]);
                component.loadingPreview = false;
                fixture.detectChanges();
                // execute
                const addProductsButton = fixture.debugElement.query(By.css('#addProduct'));
                expect(addProductsButton).toBeTruthy();
                addProductsButton.nativeElement.click();
                addProductsButton.nativeElement.click();
                addProductsButton.nativeElement.click();
                tick(600);
                fixture.detectChanges();
                expect(addSpy).toHaveBeenCalledTimes(1);
            }));

            it('should add using the form values and reset the stepper state', fakeAsync(() => {
                const testCount = 1;
                jest.spyOn(component.form, 'getRawValue');
                const addSpy = jest.spyOn(component['storeProductFacade'], 'add').mockImplementation(() => {
                    // verify that loading overlay shows
                    expect(component.loadingPreview).toBeTruthy();
                    return of(testCount);
                });
                const messageSpy = jest.spyOn(component['messageFacade'], 'addSaveCountMessage');
                const resetSpy = jest.spyOn(component['_reset'], 'next');
                jest.spyOn(component.stepper, 'reset');
                jest.spyOn(component, 'initializeForm').mockImplementation();
                jest.spyOn(component.storeSelection, 'clear').mockImplementation();
                jest.spyOn(component.productSelection, 'clear').mockImplementation();
                // execute
                component.addStoreProducts();
                flush();
                expect(component.loadingPreview).toBeFalsy();
                expect(component.form.getRawValue).toHaveBeenCalled();
                expect(addSpy).toHaveBeenCalled();
                expect(messageSpy).toHaveBeenCalledWith(testCount, 'added');
                expect(component.storeSelection.clear).toHaveBeenCalled();
                expect(component.productSelection.clear).toHaveBeenCalled();
                expect(component.stepper.reset).toHaveBeenCalled();
                expect(resetSpy).toHaveBeenCalled();
                expect(component.initializeForm).toHaveBeenCalled();
            }));

            it('should hide the loading overlay on error', fakeAsync(() => {
                const error = 'test';
                const addSpy = jest.spyOn(component['storeProductFacade'], 'add').mockReturnValue(throwError(error));
                // execute
                expect(() => {
                    component.addStoreProducts();
                    flush();
                }).toThrow(error);
                expect(addSpy).toHaveBeenCalled();
                expect(component.loadingPreview).toBeFalsy();
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
    });
});
