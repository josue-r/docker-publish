import { HttpClient } from '@angular/common/http';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { VendorFacade } from '@vioc-angular/central-ui/inventory/data-access-vendor';
import { FeatureSharedStoreSelectionMockModule } from '@vioc-angular/central-ui/organization/feature-shared-store-selection';
import { StoreProduct } from '@vioc-angular/central-ui/product/data-access-store-product';
import { FeatureSharedProductSelectionMockModule } from '@vioc-angular/central-ui/product/feature-shared-product-selection';
import { QueryPage, QuerySearch, QuerySort, SearchLine } from '@vioc-angular/shared/common-api-models';
import { CommonFunctionalityModule, Described } from '@vioc-angular/shared/common-functionality';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { FeatureMassUpdateMockModule } from '@vioc-angular/shared/feature-mass-update';
import { MockLoadingOverlayComponent, UiLoadingMockModule } from '@vioc-angular/shared/ui-loading';
import { UiStepperNavigationMockModule } from '@vioc-angular/shared/ui-stepper-navigation';
import { GATEWAY_TOKEN, ResponseEntity } from '@vioc-angular/shared/util-api';
import {
    AbstractDropdownColumn,
    Column,
    Columns,
    Comparators,
    UtilColumnModule,
} from '@vioc-angular/shared/util-column';
import { FormFactory, UtilFormMockModule } from '@vioc-angular/shared/util-form';
import { of, Subject } from 'rxjs';
import { StoreProductModuleForms } from '../../store-product-module-forms';
import { StoreProductMassUpdateComponent } from './store-product-mass-update.component';

describe('StoreProductMassUpdateComponent', () => {
    let component: StoreProductMassUpdateComponent;
    let fixture: ComponentFixture<StoreProductMassUpdateComponent>;
    let stepper: MatStepper;
    let messageFacade: MessageFacade;
    let vendorFacade: VendorFacade;

    const store1 = { id: 11, code: 'STORE1', description: 'Test Store 1' };
    const store2 = { id: 12, code: 'STORE2', description: 'Test Store 2' };
    const product1 = { id: 21, code: 'PROD1', description: 'Test Product 1' };
    const product2 = { id: 22, code: 'PROD2', description: 'Test Product 2' };
    const defaultStoreProduct = new StoreProduct();

    const storeSelectionIndex = 0;
    const productSelectionIndex = 1;
    const storeProductUpdateIndex = 2;
    const previewIndex = 3;
    const maxPreviewableStores = 55;
    const maxPreviewableProducts = 25;

    const nextStep = (index?: number) => {
        stepper.next();
        if (index) {
            expect(stepper.selectedIndex).toEqual(index);
        }
    };

    const completeStoreSelectionStep = () => {
        component.storesControl.setValue([store1, store2]);
        fixture.detectChanges();
        nextStep(productSelectionIndex);
    };

    const completeStoreSelectionStep_exceedsMaxNumStores = () => {
        component.storesControl.setValue(Array(maxPreviewableStores + 1).fill(store1));
        nextStep(productSelectionIndex);
    };

    const completeProductSelectionStep = () => {
        component.productsControl.setValue([product1, product2]);
        nextStep(storeProductUpdateIndex);
        fixture.detectChanges();
    };

    const completeProductSelectionStep_exceedsMaxNumProducts = () => {
        component.productsControl.setValue(Array(maxPreviewableProducts + 1).fill(product1));
        nextStep(storeProductUpdateIndex);
    };

    const completeStoreProductUpdateStep = () => {
        component.patchControl.get('active').setValue(true);
        component.patchControl.get('active').markAsDirty();
        component.patchControl.updateValueAndValidity();
        nextStep(previewIndex);
        fixture.detectChanges();
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                MatStepperModule,
                UiStepperNavigationMockModule,
                MatSelectModule,
                NoopAnimationsModule,
                UiLoadingMockModule,
                ReactiveFormsModule,
                UtilFormMockModule,
                UtilColumnModule,
                FeatureMassUpdateMockModule,
                FeatureSharedProductSelectionMockModule,
                FeatureSharedStoreSelectionMockModule,
                MatListModule,
                CommonFunctionalityModule,
            ],
            declarations: [StoreProductMassUpdateComponent],
            providers: [
                { provide: GATEWAY_TOKEN, useValue: '//gateway/' },
                {
                    provide: HttpClient,
                    useValue: {
                        get() {
                            return of([]);
                        },
                    },
                },
                VendorFacade,
                FormFactory,
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        StoreProductModuleForms.registerForms(TestBed.inject(FormFactory), TestBed.inject(FormBuilder));
        fixture = TestBed.createComponent(StoreProductMassUpdateComponent);
        messageFacade = TestBed.inject(MessageFacade);
        vendorFacade = TestBed.inject(VendorFacade);
        component = fixture.componentInstance;
        fixture.detectChanges();
        stepper = fixture.debugElement.query(By.directive(MatStepper)).componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('unsavedChanges', () => {
        it('should return false if form is clean', () => {
            expect(component.unsavedChanges).toBeFalsy();
        });

        it('should return true if form is dirty', () => {
            component.form.markAsDirty();
            expect(component.unsavedChanges).toBeTruthy();
        });

        it('should return false if form is undefined', () => {
            component.form = undefined;
            expect(component.unsavedChanges).toBeFalsy();
        });
    });

    describe('store selection', () => {
        it('should pass security to store selection component', () => {
            expect(component.storeSelection.accessRoles).toEqual(['ROLE_STORE_PRODUCT_UPDATE']);
        });

        it('should be able to select stores', () => {
            component.storeSelection.control.setValue([store1, store2]);
            expect(component.storesControl.value).toEqual([store1, store2]);
        });

        it('should prevent going to the next step until a store is selected', () => {
            // stepper should not move to the next step
            stepper.next();
            expect(stepper.selectedIndex).toEqual(storeSelectionIndex);

            component.storeSelection.control.setValue([store1]);
            nextStep(productSelectionIndex);
        });

        it('should clear the product selection search results when the value changes changes', fakeAsync(() => {
            jest.spyOn(component['resourceFacade'], 'searchStoresByRoles').mockImplementation();
            jest.spyOn(component.productSelection, 'clear');
            component.storeSelection.control.setValue([store1]);
            flush();
            expect(component.productSelection.clear).toHaveBeenCalled();
        }));

        it('should update the vendor column with the selected stores', fakeAsync(() => {
            const vendorDropdown = () =>
                vendorFacade.searchColumns.dropdown(
                    {
                        name: 'Vendor',
                        storeNumbers: [store1.code],
                        apiFieldPath: 'vendor',
                    },
                    { mapToTableDisplay: Described.codeAndDescriptionMapper }
                );
            jest.spyOn(component['resourceFacade'], 'searchStoresByRoles').mockImplementation();
            component.storeSelection.control.setValue([store1]);
            flush();
            expect(
                JSON.stringify(Columns.toColumn(component.columns['vendor'] as () => AbstractDropdownColumn<any>))
            ).toEqual(JSON.stringify(Columns.toColumn(vendorDropdown)));
            expect(component.massUpdate.columns).toEqual(component.columns);
        }));
    });

    describe('product selection', () => {
        beforeEach(() => {
            completeStoreSelectionStep();
        });

        it('should be able to select products', fakeAsync(() => {
            component.productSelection.control.setValue([product1, product2]);
            expect(component.productsControl.value).toEqual([product1, product2]);
        }));

        it('should search for only the selected stores', async () => {
            const responseEntity: ResponseEntity<Described> = {
                content: [product1, product2],
                totalElements: 2,
            };
            const productSearchSpy = jest
                .spyOn(component['storeProductFacade'], 'searchAssignedProductsByStore')
                .mockReturnValue(of(responseEntity));
            const column: Column = Column.of({
                apiFieldPath: 'code',
                name: 'Product Code',
                type: 'string',
            });
            const querySearch: QuerySearch = {
                queryRestrictions: [new SearchLine(column, Comparators.startsWith, 's').toQueryRestriction()],
                page: new QueryPage(0, 10),
                sort: new QuerySort(column),
            };
            component.productSelection.searchFn(querySearch);
            // should use the stores selected in the store selection component
            expect(productSearchSpy).toHaveBeenCalledWith(querySearch, [store1, store2]);
        });

        it('should prevent going to the next step until a product is selected', () => {
            // stepper should not move to the next step
            stepper.next();
            expect(stepper.selectedIndex).toEqual(productSelectionIndex);

            component.productSelection.control.setValue([product1]);
            nextStep(storeProductUpdateIndex);
        });
    });

    describe('service information', () => {
        beforeEach(() => {
            completeStoreSelectionStep();
            completeProductSelectionStep();
        });

        it('should pass the form and columns', () => {
            expect(component.patchControl.value).toEqual(component.massUpdate.updatableFieldForm.value);
            expect(component.massUpdate.columns).toEqual(component.columns);
            component.massUpdate.updatableFieldForm.setValue({ ...defaultStoreProduct, active: true });
            expect(component.patchControl.value).toEqual(component.massUpdate.updatableFieldForm.value);
        });

        it('should have no defaulted values', () => {
            expect(component.patchControl.getRawValue()).toEqual({
                ...new StoreProduct(),
            });
        });

        it('should prevent going to the next screen until field has been selected', () => {
            // stepper should not move to the next step
            stepper.next();
            expect(stepper.selectedIndex).toEqual(storeProductUpdateIndex);

            component.massUpdate.updatableFieldForm.get('active').markAsDirty();
            component.massUpdate.updatableFieldForm.updateValueAndValidity();
            nextStep(previewIndex);
        });
    });

    describe('read more option', () => {
        it('should not display read more option for store and product lists', () => {
            completeStoreSelectionStep();
            completeProductSelectionStep();
            completeStoreProductUpdateStep();
            fixture.detectChanges();

            let storeLabel = fixture.debugElement.query(By.css('#store-label'));
            let productLabel = fixture.debugElement.query(By.css('#product-label'));

            expect(storeLabel).toBeFalsy();
            expect(productLabel).toBeFalsy();
        });

        it('should display read more option for store and product lists', () => {
            completeStoreSelectionStep_exceedsMaxNumStores();
            completeProductSelectionStep_exceedsMaxNumProducts();
            completeStoreProductUpdateStep();
            fixture.detectChanges();

            let storeLabel = fixture.debugElement.query(By.css('#store-label'));
            let productLabel = fixture.debugElement.query(By.css('#product-label'));

            expect(storeLabel).toBeTruthy();
            expect(productLabel).toBeTruthy();
        });
    });

    describe('preview', () => {
        const clickUpdateButton = () => fixture.debugElement.query(By.css('#update-action')).nativeElement.click();

        beforeEach(() => {
            completeStoreSelectionStep();
            completeProductSelectionStep();
            completeStoreProductUpdateStep();
        });

        it('should display preview', () => {
            expect(fixture.debugElement.query(By.css('#preview')).nativeElement.textContent).toContain(
                'These products will be updated:  PROD1, PROD2At the following applicable stores: STORE1, STORE2'
            );

            let products = fixture.debugElement.query(By.css('#product-list')).nativeElement.textContent;
            let stores = fixture.debugElement.query(By.css('#store-list')).nativeElement.textContent;
            expect(products).toContain('PROD1, PROD2');
            expect(stores).toContain('STORE1, STORE2');

            component.massUpdate.updatableFieldForm.get('retailPrice').markAsDirty();
            component.massUpdate.updatableFieldForm.updateValueAndValidity();
            fixture.detectChanges();

            products = fixture.debugElement.query(By.css('#product-list')).nativeElement.textContent;
            stores = fixture.debugElement.query(By.css('#store-list')).nativeElement.textContent;
            expect(products).toContain('PROD1, PROD2');
            expect(stores).toContain('STORE1, STORE2');
        });

        it('should update once when update button is clicked mutiple times', fakeAsync(() => {
            jest.spyOn(component['storeProductFacade'], 'massUpdate').mockReturnValue(of(4));
            clickUpdateButton();
            clickUpdateButton();
            clickUpdateButton();
            tick(600);
            fixture.detectChanges();
            // values from complete<Step> methods
            expect(component['storeProductFacade'].massUpdate).toHaveBeenNthCalledWith(
                1,
                {
                    stores: [store1, store2],
                    products: [product1, product2],
                    patch: { ...component.patchControl.value, active: true },
                },
                ['active']
            );
        }));

        it('should display loading overlay while processing', fakeAsync(() => {
            const updateSubject = new Subject<number>();
            const loadingOverlay: MockLoadingOverlayComponent = fixture.debugElement.query(
                By.directive(MockLoadingOverlayComponent)
            ).componentInstance;
            component['storeProductFacade'].massUpdate = jest.fn(() => updateSubject);
            expect(loadingOverlay.loading).toEqual(false);

            clickUpdateButton();
            tick(600);
            fixture.detectChanges();
            expect(loadingOverlay.loading).toEqual(true);

            updateSubject.next(4);
            flush();
            fixture.detectChanges();

            expect(loadingOverlay.loading).toEqual(false);
        }));

        it('should cancel loading if an update error occurs', fakeAsync(() => {
            const updateSubject = new Subject<number>();
            const loadingOverlay: MockLoadingOverlayComponent = fixture.debugElement.query(
                By.directive(MockLoadingOverlayComponent)
            ).componentInstance;
            component['storeProductFacade'].massUpdate = jest.fn(() => updateSubject);
            expect(loadingOverlay.loading).toEqual(false);

            clickUpdateButton();
            tick(600);
            fixture.detectChanges();
            expect(loadingOverlay.loading).toEqual(true);

            expect(() => {
                updateSubject.error('An error occurred');
                flush();
            }).toThrow();
            fixture.detectChanges();

            expect(loadingOverlay.loading).toEqual(false);
        }));

        it('should display a message with the number of updated records', fakeAsync(() => {
            component['storeProductFacade'].massUpdate = jest.fn(() => of(4));
            jest.spyOn(messageFacade, 'addSaveCountMessage');
            clickUpdateButton();
            tick(600);
            fixture.detectChanges();

            expect(messageFacade.addSaveCountMessage).toHaveBeenCalledWith(4, 'updated');
        }));

        it('should reset stepper when update has completed', fakeAsync(() => {
            component['storeProductFacade'].massUpdate = jest.fn(() => of(4));
            jest.spyOn(component.stepper, 'reset');
            clickUpdateButton();
            tick(600);
            fixture.detectChanges();

            expect(component.stepper.reset).toHaveBeenCalled();
        }));

        it('should reset selection components and mass update component on update', fakeAsync(() => {
            component['storeProductFacade'].massUpdate = jest.fn(() => of(4));
            jest.spyOn(component.storeSelection, 'clear');
            jest.spyOn(component.productSelection, 'clear');
            jest.spyOn(component.massUpdate, 'reset');
            clickUpdateButton();
            tick(600);
            fixture.detectChanges();

            expect(component.storeSelection.clear).toHaveBeenCalled();
            expect(component.productSelection.clear).toHaveBeenCalled();
            expect(component.massUpdate.reset).toHaveBeenCalledTimes(1);
        }));
    });
});
