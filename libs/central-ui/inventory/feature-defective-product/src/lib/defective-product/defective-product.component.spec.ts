import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatMomentDateModule, MomentDateModule } from '@angular/material-moment-adapter';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, ActivatedRouteSnapshot, convertToParamMap, Router } from '@angular/router';
import {
    DefectiveProduct,
    DefectiveProductFacade,
} from '@vioc-angular/central-ui/inventory/data-access-defective-product';
import { StoreProductFacade } from '@vioc-angular/central-ui/product/data-access-store-product';
import {
    FeatureSharedProductAddInputMockModule,
    ProductAddInputComponent,
} from '@vioc-angular/central-ui/product/feature-shared-product-add-input';
import { RouterService } from '@vioc-angular/central-ui/util-router';
import { CommonFunctionalityModule, Described } from '@vioc-angular/shared/common-functionality';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { UiActionBarModule } from '@vioc-angular/shared/ui-action-bar';
import { UiAuditModule } from '@vioc-angular/shared/ui-audit';
import { UiButtonModule } from '@vioc-angular/shared/ui-button';
import { UiDialogMockModule } from '@vioc-angular/shared/ui-dialog';
import { MockFilteredInputComponent, UiFilteredInputMockModule } from '@vioc-angular/shared/ui-filtered-input';
import { UiInfoButtonModule } from '@vioc-angular/shared/ui-info-button';
import { UiLoadingMockModule } from '@vioc-angular/shared/ui-loading';
import { UiSelectAndGoMockModule } from '@vioc-angular/shared/ui-select-and-go';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { FormFactory, UtilFormModule } from '@vioc-angular/shared/util-form';
import { expectInput } from '@vioc-angular/test/util-test';
import { of, Subject } from 'rxjs';
import { DefectiveProductModuleForm } from '../defective-product-module-form';
import { DefectiveProductComponent } from './defective-product.component';

describe('StoreDefectiveProductComponent', () => {
    let component: DefectiveProductComponent;
    let fixture: ComponentFixture<DefectiveProductComponent>;
    let defectiveProductFacade: DefectiveProductFacade;
    let storeProductFacade: StoreProductFacade;
    const routeParams = new Subject();
    const parentRoute: ActivatedRoute = new ActivatedRoute();

    const testDefectiveProduct: DefectiveProduct = {
        adjustment: { id: 1662403 },
        defectDate: '2021-12-15T04:58:06',
        reason: {
            id: 1,
            code: 'DAMAGED_AT_STORE',
            description: 'Damaged At Store',
        },
        defectProductReason: {
            id: 1,
            code: 'DAMAGED_AT_STORE',
            description: 'Damaged At Store',
        },
        id: 410995,
        quantity: 100,
        storeProduct: {
            id: { storeId: 274130, productId: 30696 },
            product: { code: '0W20EURO', description: 'VAL 0W20 EURO SYNTHETIC QUART', id: 30696 },
            store: { code: '010002', description: 'BLOOMINGTON', id: 274130 },
        },
        store: { code: '010002', description: 'BLOOMINGTON', id: 274130 },
        comments: 'Test comment',
        vendor: {
            id: 1,
            description: 'Test Desc',
        },
    };
    const inventoryDetails = [
        {
            id: { storeId: 1, productId: 3 },
            maxStockLimit: 50,
            uom: { id: 1, code: 'UOM1', description: 'Test UOM' },
            code: 'PROD1',
            vendor: {
                id: 1,
                code: 12,
                description: 'Test Desc',
                valvolineDistributor: true,
            },
            description: 'Test Product',
            sapNumber: '1234',
            secondLevelCategory: { id: 5, code: 'CAT1', description: 'Test Category' },
            active: true,
        },
        {
            id: { storeId: 1, productId: 4 },
            maxStockLimit: 50,
            uom: { id: 1, code: 'UOM1', description: 'Test UOM' },
            code: 'PROD2',
            vendor: {
                id: 1,
                code: 12,
                description: 'Test Desc',
                valvolineDistributor: true,
            },
            description: 'Test Product 2',
            sapNumber: '1235',
            secondLevelCategory: { id: 6, code: 'CAT2', description: 'Test Category 2' },
            active: true,
        },
        {
            id: { storeId: 1, productId: 5 },
            maxStockLimit: 50,
            uom: { id: 1, code: 'UOM2', description: 'Test UOM' },
            code: 'PROD3',
            vendor: {
                id: 1,
                code: 13,
                description: 'Test Desc',
                valvolineDistributor: true,
            },
            description: 'Test Product 3',
            sapNumber: '1235',
            secondLevelCategory: { id: 6, code: 'CAT2', description: 'Test Category 3' },
            active: false,
        },
        {
            id: { storeId: 1, productId: 5 },
            maxStockLimit: 50,
            uom: { id: 1, code: 'UOM2', description: 'Test UOM' },
            code: 'PROD4',
            vendor: {
                id: 1,
                code: 13,
                description: 'Test Desc',
                valvolineDistributor: false,
            },
            description: 'Test Product 4',
            sapNumber: '1235',
            secondLevelCategory: { id: 6, code: 'CAT2', description: 'Test Category 4' },
            active: true,
        },
    ];

    const findById = (id: string) => fixture.debugElement.query(By.css(`#${id}`));

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DefectiveProductComponent],
            imports: [
                NoopAnimationsModule,
                HttpClientTestingModule,
                ReactiveFormsModule,
                MatCheckboxModule,
                MatFormFieldModule,
                MatDatepickerModule,
                MatInputModule,
                MatButtonModule,
                MatIconModule,
                MatSelectModule,
                MatTableModule,
                MatSortModule,
                MatOptionModule,
                MatMomentDateModule,
                MomentDateModule,
                UiActionBarModule,
                UiAuditModule,
                UiInfoButtonModule,
                UtilFormModule,
                UiLoadingMockModule,
                UiDialogMockModule,
                UiButtonModule,
                UiFilteredInputMockModule,
                UiSelectAndGoMockModule,
                FeatureSharedProductAddInputMockModule,
                CommonFunctionalityModule,
            ],
            providers: [
                FormFactory,
                {
                    provide: ActivatedRoute,
                    useValue: { params: routeParams, parent: '/inventory/defective-product' },
                },
                { provide: Router, useValue: { navigate: jest.fn() } },
                { provide: RouterService, useValue: { navigateToSearchPage: jest.fn() } },
                { provide: MessageFacade, useValue: { addMessage: jest.fn() } },
                { provide: GATEWAY_TOKEN, useValue: '//gateway/' },
                { provide: HttpClient, useValue: {} },
                { provide: ActivatedRoute, useValue: { params: new Subject(), parent: parentRoute } },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DefectiveProductComponent);
        component = fixture.componentInstance;
        DefectiveProductModuleForm.registerForms(TestBed.inject(FormFactory), TestBed.inject(FormBuilder));
        defectiveProductFacade = component.defectiveProductFacade;
        storeProductFacade = component.storeProductFacade;
        component.commonCodeFacade.findByType = jest.fn(() => of([]));
        component.resourceFacade.findStoresByRoles = jest.fn(() => of({ resources: [], allCompanies: false }));
        component.vendorFacade.findByStore = jest.fn(() => of([]));
        component.parameterFacade.findStoreParameterValue = jest.fn(() => of(null));
        defectiveProductFacade.finalize = jest.fn(() => of(null));
        storeProductFacade.getInventoryDetails = jest.fn(() => of([]));
    });
    /** Initialize the the component with the given access mode, type and code. */
    const initialize = (
        accessMode: 'view' | 'edit' | 'add',
        model: DefectiveProduct = testDefectiveProduct,
        andflush = true
    ) => {
        const route = TestBed.inject(ActivatedRoute);
        route.snapshot = {
            paramMap: convertToParamMap({
                accessMode: accessMode,
                storeCode: model?.storeProduct.store.code,
                defectId: model?.id,
            }),
        } as ActivatedRouteSnapshot;

        const defectiveProduct = { ...new DefectiveProduct(), ...model };
        jest.spyOn(defectiveProductFacade, 'getDefectiveProduct').mockReturnValue(of(defectiveProduct));

        fixture.detectChanges();
        if (andflush) {
            flush();
        }
    };

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('with cancel button clicked', () => {
        let router: Router;
        beforeEach(() => {
            router = TestBed.inject(Router);
        });
        it('should navigate to the search page when clicking cancel button', fakeAsync(() => {
            initialize('add');
            fixture.debugElement.query(By.css('#cancel-action')).nativeElement.click();

            expect(router.navigate).toHaveBeenCalledWith(['search'], {
                relativeTo: TestBed.inject(ActivatedRoute).parent,
            });
        }));
    });
    describe('ngOnInit', () => {
        describe('view and edit mode', () => {
            describe.each`
                accessMode
                ${'view'}
                ${'edit'}
            `('values', ({ accessMode }) => {
                it('should load defective product data', fakeAsync(() => {
                    jest.spyOn(component.storeProductFacade, 'findByStoreAndProducts').mockReturnValue(
                        of(inventoryDetails)
                    );
                    initialize(accessMode, { ...testDefectiveProduct }, true);
                    expect(defectiveProductFacade.getDefectiveProduct).toHaveBeenCalled();
                    expect(component.form.enabled).toBeFalsy();
                }));
            });

            describe.each`
                control                         | value                              | enabled  | accessMode
                ${{ id: 'vendorDescription' }}  | ${'Test Desc'}                     | ${false} | ${'view'}
                ${{ id: 'productDescription' }} | ${'VAL 0W20 EURO SYNTHETIC QUART'} | ${false} | ${'view'}
                ${'quantity'}                   | ${'100.00'}                        | ${false} | ${'view'}
                ${'comments'}                   | ${'Test comment'}                  | ${false} | ${'view'}
                ${{ id: 'vendorDescription' }}  | ${'Test Desc'}                     | ${false} | ${'edit'}
                ${{ id: 'productDescription' }} | ${'VAL 0W20 EURO SYNTHETIC QUART'} | ${false} | ${'edit'}
                ${'quantity'}                   | ${'100.00'}                        | ${false} | ${'edit'}
                ${'comments'}                   | ${'Test comment'}                  | ${false} | ${'edit'}
            `('values', ({ control, value, enabled, accessMode }) => {
                it(`should display input for ${control} as ${value} and ${
                    enabled ? '' : 'not'
                } be enabled`, fakeAsync(() => {
                    jest.spyOn(component.storeProductFacade, 'findByStoreAndProducts').mockReturnValue(
                        of(inventoryDetails)
                    );
                    initialize(
                        accessMode,
                        {
                            ...testDefectiveProduct,
                        },
                        true
                    );
                    expectInput(fixture, control).toHaveValue(value).toBeEnabled(enabled);
                }));
            });

            describe.each`
                id                | controlName | options                          | editable | placeHolder | displayFn                             | accessMode
                ${'store-input'}  | ${'store'}  | ${[testDefectiveProduct.store]}  | ${false} | ${'Store'}  | ${Described.codeAndDescriptionMapper} | ${'view'}
                ${'reason-input'} | ${'reason'} | ${[testDefectiveProduct.reason]} | ${false} | ${'Reason'} | ${Described.descriptionMapper}        | ${'view'}
                ${'store-input'}  | ${'store'}  | ${[testDefectiveProduct.store]}  | ${false} | ${'Store'}  | ${Described.codeAndDescriptionMapper} | ${'edit'}
                ${'reason-input'} | ${'reason'} | ${[testDefectiveProduct.reason]} | ${false} | ${'Reason'} | ${Described.descriptionMapper}        | ${'edit'}
            `('dropdowns', ({ id, controlName, options, editable, placeHolder, displayFn, accessMode }) => {
                it(`should have the expected configuration for ${controlName}`, fakeAsync(() => {
                    jest.spyOn(component.storeProductFacade, 'findByStoreAndProducts').mockReturnValue(
                        of(inventoryDetails)
                    );
                    initialize(
                        accessMode,
                        {
                            ...testDefectiveProduct,
                        },
                        true
                    );
                    const dropdown = fixture.debugElement
                        .query(By.css(`#${id}`))
                        .injector.get(MockFilteredInputComponent);
                    expect(dropdown.valueControl).toEqual(component.form.getControl(controlName));
                    expect(dropdown.options).toEqual(options);
                    expect(dropdown.editable).toBe(editable);
                    expect(dropdown.placeHolder).toEqual(placeHolder);
                    expect(dropdown.displayFn).toEqual(displayFn);
                    expect(dropdown.nullable).toEqual(false);
                    expect(dropdown.compareWith).toEqual(component.describedEquals);
                }));
            });
        });
        describe('add mode', () => {
            const fieldsViewableAfterGenerated = ['productDescription', 'vendorDescription', 'quantity', 'comments'];

            it('should initially only render a select component with a store dropdown', fakeAsync(async () => {
                initialize('add');
                // Expecting only Store to be rendered
                fieldsViewableAfterGenerated.forEach((control) => expectInput(fixture, control).not.toBePresent());
                // Verify Store dropdowns
                const storeDropdown = findById('store-input').injector.get(MockFilteredInputComponent);
                // Initially, store is selectable and product is disabled
                expect(storeDropdown.editable).toBeTruthy();
                expect(component.vendorFacade.findByStore).not.toHaveBeenCalled();
                expect(component.addDisabled).toBeTruthy();
                // Product input should be enabled after selecting a store
                storeDropdown.valueControl.setValue(testDefectiveProduct.store);
                tick(200); // store value change logic has a 200 debounce time
                fixture.detectChanges();
                expect(component.addDisabled).toBeFalsy();
            }));

            it('should disable store and product', fakeAsync(async () => {
                initialize('add');
                component.form.setControlValue('store', testDefectiveProduct.store);
                flush();
                fixture.detectChanges();
                jest.spyOn(component.storeProductFacade, 'findByStoreAndProducts').mockReturnValue(
                    of(inventoryDetails)
                );
                const addProductsComponent = fixture.debugElement.query(By.css('#product-add-input'));
                addProductsComponent.triggerEventHandler('products', [{ code: inventoryDetails[0].code }]);
                flush();
                fixture.detectChanges();
                // Verify disabled store and go product.
                tick(200); // store value change logic has a 200 debounce time
                expect(component.form.getControl('store').disabled).toBeTruthy();
                expect(component.form.getControl('comments').disabled).toBeFalsy();
                expect(component.form.getControl('reason').disabled).toBeFalsy();
                expect(component.addDisabled).toBeFalsy();
            }));

            it('should configure the search product function', fakeAsync(() => {
                initialize('add');
                component.form.setControlValue('store', testDefectiveProduct.store);
                tick(200); // store value change logic has a 200 debounce time
                fixture.detectChanges();
                const productAddInput = fixture.debugElement.query(By.css('#product-add-input'))
                    .componentInstance as ProductAddInputComponent;
                expect(productAddInput.searchFn).toEqual(component.searchProductFn);
            }));

            it('should filter out products that were not requested', fakeAsync(() => {
                initialize('add');
                jest.spyOn(component.storeProductFacade, 'findByStoreAndProducts').mockReturnValue(
                    of(inventoryDetails)
                );
                const addProductsComponent = fixture.debugElement.query(By.css('#product-add-input'));
                addProductsComponent.triggerEventHandler('products', [{ code: inventoryDetails[1].code }]);
                tick(200);
                flush();
                // expect only the requested product
                expect(component.storeProductModel.product.code).toEqual(inventoryDetails[1].code);
                expect(component.storeProductModel.product.code).not.toEqual(inventoryDetails[0].code);
            }));
            it('should default to the available store if the user only has access to a single store', fakeAsync(() => {
                const store = { id: 1, code: 'S1', description: 'Store 1' };
                jest.spyOn(component.resourceFacade, 'findStoresByRoles').mockReturnValue(
                    of({ resources: [store], allCompanies: false })
                );
                initialize('add');
                tick(200); // store value change logic has a 200 debounce time
                expect(component.form.getControlValue('store')).toEqual(store);
            }));
        });

        describe('unsavedChanges', () => {
            it('should track if the form has been modified', fakeAsync(() => {
                initialize('add');
                expect(component.unsavedChanges).toBeFalsy();
                component.form.markAsDirty();
                expect(component.unsavedChanges).toBeTruthy();
            }));
        });

        it('should throw an error with an unsupported access mode', fakeAsync(() => {
            const route = TestBed.inject(ActivatedRoute);
            route.snapshot = {
                paramMap: convertToParamMap({
                    accessMode: 'add-like',
                }),
            } as ActivatedRouteSnapshot;
            expect(() => fixture.detectChanges()).toThrowError('Unhandled Access Mode: add-like');
        }));
    });
    describe('with finalize button', () => {
        const getFinalizeReceiptButton = () => fixture.debugElement.query(By.css('#finalize-action'));
        const getContinueDialogButton = () => fixture.debugElement.query(By.css('#finalize-continue-button'));
        const getCancelDialogButton = () => fixture.debugElement.query(By.css('#finalize-cancel-button'));
        beforeEach(fakeAsync(() => {
            jest.spyOn(component.defectiveProductFacade, 'finalize').mockReturnValue(of({}));
            jest.spyOn(component, 'openFinalizeDialog');
            jest.spyOn(component.finalizeDialog, 'open');
            jest.spyOn(component.finalizeDialog, 'close');
            jest.spyOn(component, 'finalize');
        }));

        describe('when all the products on the order are completely received', () => {
            beforeEach(fakeAsync(() => {
                initialize('add');
            }));

            it('should prompt user to confirm finalization', fakeAsync(() => {
                // click on finalize button
                jest.spyOn(component, 'finalize');
                jest.spyOn(component.finalizeFacade, 'save');

                // click on finalize button
                getFinalizeReceiptButton().nativeElement.click();
                fixture.detectChanges();
                getContinueDialogButton().nativeElement.click();
                tick(600);
                fixture.detectChanges();

                // validate that dialog was opened
                expect(component.finalize).toHaveBeenCalled();
            }));

            it('should call finalize only once when clicked multiple times', fakeAsync(() => {
                jest.spyOn(component, 'finalize');
                jest.spyOn(component.finalizeFacade, 'save');
                // click on finalize button
                getFinalizeReceiptButton().nativeElement.click();
                fixture.detectChanges();
                // multiple clicks testing
                getContinueDialogButton().nativeElement.click();
                getContinueDialogButton().nativeElement.click();
                getContinueDialogButton().nativeElement.click();
                tick(600);
                fixture.detectChanges();

                expect(component.finalize).toHaveBeenCalled();
                // only one product should be finalized even if finalize is clicked multiple times
                expect(component.messageFacade.addMessage).toHaveBeenCalledTimes(1);
            }));

            it('should call finalize on confirmation', fakeAsync(() => {
                // click on finalize button
                getFinalizeReceiptButton().nativeElement.click();
                fixture.detectChanges();
                expect(component.finalizeDialog.close).not.toHaveBeenCalled();

                // validate finalize was cancelled
                getCancelDialogButton().nativeElement.click();
                fixture.detectChanges();
                expect(component.finalizeDialog.close).toHaveBeenCalled();
                expect(component.finalize).not.toHaveBeenCalled();
            }));

            it('should call the defectiveProductFacade to finalize after confirming', fakeAsync(() => {
                initialize('add');
                jest.spyOn(component.storeProductFacade, 'findByStoreAndProducts').mockReturnValue(
                    of(inventoryDetails)
                );
                const addProductsComponent = fixture.debugElement.query(By.css('#product-add-input'));
                addProductsComponent.triggerEventHandler('products', [{ code: inventoryDetails[1].code }]);
                tick(200);
                flush();
                jest.spyOn(component, 'finalize');
                jest.spyOn(component.finalizeFacade, 'save');

                // click on finalize button
                getFinalizeReceiptButton().nativeElement.click();
                fixture.detectChanges();
                getContinueDialogButton().nativeElement.click();
                tick(600);
                fixture.detectChanges();
                expect(component.messageFacade.addMessage).toHaveBeenCalledWith({
                    message: `Defective Product finalized successfully`,
                    severity: 'info',
                });
                flush();
            }));

            it('should display message', fakeAsync(() => {
                jest.spyOn(component.messageFacade, 'addMessage');

                // click on cancel button
                getFinalizeReceiptButton().nativeElement.click();
                fixture.detectChanges();
                getContinueDialogButton().nativeElement.click();
                tick(600);
                fixture.detectChanges();

                // validate that message is created
                expect(component.messageFacade.addMessage).toHaveBeenCalledWith({
                    message: `Defective Product finalized successfully`,
                    severity: 'info',
                });
            }));

            it('should still finalize defective product when vendor is not Valvoline distributor', fakeAsync(() => {
                jest.spyOn(component.storeProductFacade, 'findByStoreAndProducts').mockReturnValue(
                    of(inventoryDetails)
                );
                const addProductsComponent = fixture.debugElement.query(By.css('#product-add-input'));
                addProductsComponent.triggerEventHandler('products', [{ code: 'PROD4' }]);
                tick(200);
                flush();
                jest.spyOn(component, 'finalize');
                jest.spyOn(component.finalizeFacade, 'save');

                // click on finalize button
                getFinalizeReceiptButton().nativeElement.click();
                getContinueDialogButton().nativeElement.click();
                tick(600);
                fixture.detectChanges();
                expect(component.messageFacade.addMessage).toHaveBeenCalledWith({
                    message: `Defective Product finalized successfully`,
                    severity: 'info',
                });
                flush();
            }));
        });
    });

    describe('product add input', () => {
        const generateDefectiveProduct = () => {
            // initialize test as if they have already clicked the 'go' button
            const store = { id: 1, code: 'S1', description: 'Store 1' };
            initialize('add', null, false);
            component.form.setControlValue('store', store);
            component.generateProduct(component.form.getRawValue());
            fixture.detectChanges();
        };

        describe('in add mode with Defective Product generated', () => {
            beforeEach(() => generateDefectiveProduct());

            it('should configure the search product function', fakeAsync(() => {
                const productAddInput = fixture.debugElement.query(By.css('#product-add-input'))
                    .componentInstance as ProductAddInputComponent;
                expect(productAddInput.searchFn).toEqual(component.searchProductFn);
            }));

            it('should allow products to be added', fakeAsync(() => {
                const inventoryDetail$ = new Subject<any[]>();
                jest.spyOn(component.storeProductFacade, 'findByStoreAndProducts').mockReturnValue(inventoryDetail$);
                const addProductsComponent = fixture.debugElement.query(By.css('#product-add-input'));
                expect(addProductsComponent).not.toBeNull();
                // add products
                addProductsComponent.triggerEventHandler('products', [{ code: inventoryDetails[0].code }]);
                // verify state before storeProductFacade call
                expect(component.isLoading).toBeTruthy();
                expect(component.unsavedChanges).toBeFalsy();
                // complete the storeProductFacade call
                inventoryDetail$.next(inventoryDetails);
                flush();
                tick(500);
                // verify state after storeProductFacade call
                expect(component.isLoading).toBeFalsy();
                expect(component.unsavedChanges).toBeTruthy();
                expect(component.storeProductModel.product.code).toEqual(inventoryDetails[0].code);
            }));

            it('should reset product', fakeAsync(() => {
                component.productReset();
                flush();
                expect(component.productGenerated).toBeFalsy();
            }));

            it('should display an error if not all products requested can be added', fakeAsync(() => {
                const inventoryDetail$ = new Subject<any[]>();

                jest.spyOn(component.storeProductFacade, 'findByStoreAndProducts').mockReturnValue(inventoryDetail$);

                const addProductsComponentTest = fixture.debugElement.query(By.css('#product-add-input'));
                expect(addProductsComponentTest).not.toBeNull();
                // add products
                addProductsComponentTest.triggerEventHandler('products', [{ code: inventoryDetails[0].code }]);
                inventoryDetail$.next(inventoryDetails);
                flush();
                // verify state after storeProductFacade call
                expect(component.isLoading).toBeFalsy();
                expect(component.unsavedChanges).toBeTruthy();
                expect(component.storeProductModel.product.code).toEqual(inventoryDetails[0].code);
                jest.spyOn(component.storeProductFacade, 'findByStoreAndProducts').mockReturnValue(
                    of(inventoryDetails)
                );
                const addProductsComponent = fixture.debugElement.query(By.css('#product-add-input'));
                addProductsComponent.triggerEventHandler('products', [{ code: 'PROD5' }]);
                flush();
                // expect an error message for the 1 it couldn't add
                expect(component.messageFacade.addMessage).toHaveBeenCalledWith({
                    severity: 'error',
                    message: 'Unable to add requested product: PROD5.',
                    hasTimeout: true,
                });
                expect(component.productCodeControl.value).toEqual(component.storeProductModel?.product.code);
            }));

            it('should display an error if product is not active', fakeAsync(() => {
                jest.spyOn(component.storeProductFacade, 'findByStoreAndProducts').mockReturnValue(
                    of(inventoryDetails)
                );
                const addProductsComponent = fixture.debugElement.query(By.css('#product-add-input'));
                addProductsComponent.triggerEventHandler('products', [{ code: 'PROD3' }]);
                flush();
                // expect an error message for the 1 it couldn't add
                expect(component.messageFacade.addMessage).toHaveBeenCalledWith({
                    severity: 'error',
                    message: 'Only active product is allowed.',
                    hasTimeout: true,
                });
            }));
        });
    });
});
