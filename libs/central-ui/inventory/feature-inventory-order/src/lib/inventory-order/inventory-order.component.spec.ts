import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HttpClient } from '@angular/common/http';
import { DebugElement, Type } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormArray, FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatMomentDateModule, MomentDateModule } from '@angular/material-moment-adapter';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCheckboxHarness } from '@angular/material/checkbox/testing';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { By, HAMMER_LOADER } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, ActivatedRouteSnapshot, convertToParamMap, Router } from '@angular/router';
import { ParameterFacade, ParameterType } from '@vioc-angular/central-ui/config/data-access-parameter';
import {
    InventoryOrder,
    InventoryOrderFacade,
    InventoryOrderProduct,
} from '@vioc-angular/central-ui/inventory/data-access-inventory-order';
import {
    ReceiptOfMaterial,
    ReceiptOfMaterialFacade,
} from '@vioc-angular/central-ui/inventory/data-access-receipt-of-material';
import { VendorFacade } from '@vioc-angular/central-ui/inventory/data-access-vendor';
import { ResourceFacade, Resources } from '@vioc-angular/central-ui/organization/data-access-resources';
import {
    FeatureSharedProductAddInputMockModule,
    MockProductAddInputComponent,
    ProductAddInputComponent,
} from '@vioc-angular/central-ui/product/feature-shared-product-add-input';
import { SapProduct } from 'libs/central-ui/inventory/data-access-inventory-order/src/lib/model/inventory-order-product.model';
import { RouterService } from '@vioc-angular/central-ui/util-router';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { CommonFunctionalityModule, Described, formatMoment } from '@vioc-angular/shared/common-functionality';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { UiActionBarModule } from '@vioc-angular/shared/ui-action-bar';
import { UiAuditModule } from '@vioc-angular/shared/ui-audit';
import { PrintButtonComponent, UiButtonModule } from '@vioc-angular/shared/ui-button';
import { UiCurrencyPrefixModule } from '@vioc-angular/shared/ui-currency-prefix';
import { MockDialogComponent, UiDialogMockModule } from '@vioc-angular/shared/ui-dialog';
import { MockFilteredInputComponent, UiFilteredInputMockModule } from '@vioc-angular/shared/ui-filtered-input';
import { MockLoadingOverlayComponent, UiLoadingMockModule } from '@vioc-angular/shared/ui-loading';
import { MockSelectAndGoComponent, UiSelectAndGoMockModule } from '@vioc-angular/shared/ui-select-and-go';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { FormFactory, UtilFormModule } from '@vioc-angular/shared/util-form';
import {
    expectInput,
    getApplyActionButton,
    getCancelActionButton,
    getSaveActionButton,
} from '@vioc-angular/test/util-test';
import { startCase } from 'lodash';
import { EMPTY, of, Subject, ReplaySubject } from 'rxjs';
import { InventoryOrderForms } from '../inventory-order-module-forms';
import { InventoryOrderComponent } from './inventory-order.component';
import moment = require('moment');

describe('InventoryOrderComponent', () => {
    let component: InventoryOrderComponent;
    let fixture: ComponentFixture<InventoryOrderComponent>;
    let inventoryOrderFacade: InventoryOrderFacade;
    let receiptOfMaterialFacade: ReceiptOfMaterialFacade;
    let formFactory: FormFactory;
    let componentDestroyed: ReplaySubject<any>;
    let routerService: RouterService;
    let resourceFacade: ResourceFacade;
    let vendorFacade: VendorFacade;
    let parameterFacade: ParameterFacade;
    let router: Router;
    let loader: HarnessLoader;
    const routeParams = new Subject();

    // default test data
    const testInventoryOrderProduct2: InventoryOrderProduct = {
        secondLevelCategory: { id: 2, code: 'CAT2', description: 'category-2', version: 0 },
        product: { id: 2, code: '02', description: 'product-2', version: 0, sapNumber: '2' },
        uom: { id: 2, code: 'UOM2', description: 'Unit', version: 0 },
        minimumOrderQuantity: 2,
        quantity: 2,
        suggestedQuantity: 2,
        quantityPerPack: 2,
        quantityOnHand: 2,
        quantityOnOrder: 2,
        averageDailyUsage: 3.3,
    };
    const testInventoryOrderProduct1: InventoryOrderProduct = {
        secondLevelCategory: { id: 1, code: 'CAT1', description: 'category-1', version: 0 },
        product: { id: 1, code: '01', description: 'product-1', version: 0, sapNumber: '1' },
        uom: { id: 1, code: 'UOM2', description: 'Unit', version: 0 },
        minimumOrderQuantity: 1,
        quantity: 1,
        suggestedQuantity: 1,
        quantityPerPack: 1,
        quantityOnHand: 1,
        quantityOnOrder: 1,
        averageDailyUsage: 2.2,
    };
    const testInventoryOrderProduct0: InventoryOrderProduct = {
        secondLevelCategory: { id: 0, code: 'CAT0', description: 'category-0', version: 0 },
        product: { id: 0, code: '00', description: 'product-0', version: 0, sapNumber: '0' },
        uom: { id: 0, code: 'UOM1', description: 'Unit', version: 0 },
        minimumOrderQuantity: 0,
        quantity: 0,
        suggestedQuantity: 0,
        quantityPerPack: 0,
        quantityOnHand: 0,
        quantityOnOrder: 0,
        averageDailyUsage: 1.23,
    };
    const testUnsortedInventoryOrderProducts: InventoryOrderProduct[] = [
        testInventoryOrderProduct1,
        testInventoryOrderProduct2,
        testInventoryOrderProduct0,
    ];
    const testReceiptsOfMaterials: any[] = [
        { id: 0, code: 'RM0', description: 'Receipt 0', version: 0, number: 'R000' },
        { id: 1, code: 'RM1', description: 'Receipt 1', version: 0, number: 'R001' },
    ];
    const testVendor: Described = { id: 0, code: 'ven', description: 'vendor00', version: 0 };
    const testInventoryOrder: InventoryOrder = {
        id: { number: '0', storeId: 0 },
        version: 0,
        store: { id: 0, code: 'st00', description: 'store', version: 0 },
        status: { id: 0, code: 'OPEN', description: 'Open', version: 0 },
        vendor: testVendor,
        inventoryOrderProducts: testUnsortedInventoryOrderProducts,
        comments: 'test comment',
        finalizedOn: '',
        finalizedByEmployee: { name: 'test' },
        createdOn: moment().format('YYYY-MM-DD'),
        createdByEmployee: { name: 'test' },
        updatedBy: '',
        updatedOn: '',
    };

    // Json from an actual response
    const newProduct = {
        uom: { description: 'EA', code: 'EACH', version: 2, id: 2479 },
        quantityOnHand: 2.0,
        averageDailyUsage: 0.0,
        product: { code: 'VA203', description: 'VAL VA203 AIR FILTER', sapNumber: '754794', id: 12670 },
        secondLevelCategory: { description: 'AIR FILTER', code: 'AIR FILTER', version: 41, id: 1055 },
        quantityPerPack: 1,
        quantityOnOrder: 0.0,
        minimumOrderQuantity: 1,
        suggestedQuantity: 1.0,
    };

    const getSelectAndGoComponent = () =>
        fixture.debugElement.query(By.directive(MockSelectAndGoComponent)).injector.get(MockSelectAndGoComponent);

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [InventoryOrderComponent],
            imports: [
                ReactiveFormsModule,
                MatButtonModule,
                MatCheckboxModule,
                MatFormFieldModule,
                MatIconModule,
                MatInputModule,
                MatOptionModule,
                MatPaginatorModule,
                MatMomentDateModule,
                MomentDateModule,
                MatSelectModule,
                MatDatepickerModule,
                MatSortModule,
                MatTableModule,
                MatTooltipModule,
                NoopAnimationsModule,
                FeatureSharedProductAddInputMockModule,
                UiActionBarModule,
                UiAuditModule,
                UiCurrencyPrefixModule,
                UiLoadingMockModule,
                UtilFormModule,
                UiFilteredInputMockModule,
                UiDialogMockModule,
                UiSelectAndGoMockModule,
                UiButtonModule,
                CommonFunctionalityModule,
            ],
            providers: [
                FormFactory,
                {
                    provide: ActivatedRoute,
                    useValue: { params: routeParams, parent: '/inventory/inventory-order' },
                },
                { provide: GATEWAY_TOKEN, useValue: '//gateway/' },
                { provide: HAMMER_LOADER, useValue: () => new Promise(() => {}) },
                { provide: HttpClient, useValue: { get: jest.fn(() => of()) } },
                { provide: MessageFacade, useValue: { addMessage: jest.fn() } },
                { provide: Router, useValue: { navigate: jest.fn() } },
                { provide: RouterService, useValue: { navigateToSearchPage: jest.fn() } },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        InventoryOrderForms.registerForms(TestBed.inject(FormFactory), TestBed.inject(FormBuilder));
        fixture = TestBed.createComponent(InventoryOrderComponent);
        loader = TestbedHarnessEnvironment.loader(fixture);
        component = fixture.componentInstance;
        // API Facade
        inventoryOrderFacade = component['inventoryOrderFacade'];
        receiptOfMaterialFacade = component['receiptOfMaterialFacade'];
        resourceFacade = component['resourceFacade'];
        vendorFacade = component['vendorFacade'];
        parameterFacade = component['parameterFacade'];

        router = TestBed.inject(Router);
        // mock search functionality
        jest.spyOn(receiptOfMaterialFacade, 'findAssociatedReceiptsOfMaterial').mockImplementation(() =>
            of(testReceiptsOfMaterials)
        );
        jest.spyOn(parameterFacade, 'findStoreParameterValue').mockReturnValue(of(30));
        routerService = TestBed.inject(RouterService);
    });

    /** Initialize the the component with the given access mode, store code and order number */
    const initialize = (
        accessMode: 'view' | 'edit' | 'add',
        model: InventoryOrder = testInventoryOrder,
        andFlush = true,
        queryParams = {}
    ) => {
        const route = TestBed.inject(ActivatedRoute);
        route.snapshot = {
            paramMap: convertToParamMap({
                accessMode: accessMode,
                storeCode: model.store?.code,
                orderNumer: model.id?.number,
            }),
            queryParamMap: convertToParamMap(queryParams),
        } as ActivatedRouteSnapshot;

        jest.spyOn(inventoryOrderFacade, 'findByStoreCodeAndOrderNumber').mockReturnValue(of(model));

        fixture.detectChanges();
        if (andFlush) {
            flush();
        }
    };

    const click = async (selector: string) => {
        return (
            await loader.getHarness(
                MatButtonHarness.with({
                    selector,
                })
            )
        ).click();
    };

    const check = async (selector: string) => {
        return (await loader.getHarness(MatCheckboxHarness.with({ selector }))).check();
    };

    const clickGenerateOrder = () => {
        fixture.debugElement.query(By.directive(MockSelectAndGoComponent)).triggerEventHandler('go', {});
    };

    const expectNavigateToSearchPage = () =>
        expect(router.navigate).toHaveBeenCalledWith(['search'], {
            relativeTo: TestBed.inject(ActivatedRoute).parent,
        });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display overlay if it is loading', fakeAsync(() => {
        initialize('view');
        const loadingOverlay: MockLoadingOverlayComponent = fixture.debugElement.query(
            By.directive(MockLoadingOverlayComponent)
        ).componentInstance;

        component.isLoading = false;
        fixture.detectChanges();
        expect(loadingOverlay.loading).toEqual(false);

        component.isLoading = true;
        fixture.detectChanges();
        expect(loadingOverlay.loading).toEqual(true);
    }));
    describe('ngOnInit', () => {
        // common specs for view and edit access modes
        describe.each`
            accessMode
            ${'view'}
            ${'edit'}
        `('has values that', ({ accessMode }) => {
            it(`should load inventory order data in ${accessMode} access mode`, fakeAsync(() => {
                expect(component.model).toBeFalsy();
                initialize(accessMode);
                expect(component.model).toEqual(testInventoryOrder);
            }));

            it(`should navigate to the search page when clicking on cancel button in ${accessMode} access mode`, fakeAsync(() => {
                initialize('edit');
                fixture.debugElement.query(By.css('#cancel-action')).nativeElement.click();
                expect(router.navigate).toHaveBeenCalledWith(['search'], {
                    relativeTo: TestBed.inject(ActivatedRoute).parent,
                });
            }));

            it(`should load associated RMs in ${accessMode} access mode`, fakeAsync(() => {
                initialize(accessMode);

                expect(receiptOfMaterialFacade.findAssociatedReceiptsOfMaterial).toHaveBeenCalledWith(
                    testInventoryOrder.store.code,
                    'REG',
                    testInventoryOrder.id.number,
                    testInventoryOrder.store.code
                );

                component.associatedRms$.subscribe((rms) => {
                    expect(rms).toEqual(testReceiptsOfMaterials);
                });
            }));

            it(`should not load the "Associated RMs" section if there is not an associated RM in ${accessMode} access mode`, fakeAsync(() => {
                jest.spyOn(receiptOfMaterialFacade, 'findAssociatedReceiptsOfMaterial').mockReturnValueOnce(of([]));
                initialize(accessMode);
                expect(fixture.debugElement.query(By.css('#associatedRMs'))).toBeNull();
            }));

            describe(`with inventory order product data in ${accessMode} access mode`, () => {
                it('should load products table', fakeAsync(() => {
                    initialize(accessMode);
                    const table = fixture.debugElement.query(By.css('#products-table'));
                    expect(table).toBeTruthy();
                }));

                it('should load data source', () => {
                    initialize(accessMode, testInventoryOrder, false);
                    expect(component.products$.value.data).toBeTruthy();
                });

                describe.each`
                    header
                    ${'categoryHeader'}
                    ${'productCodeHeader'}
                    ${'productDescHeader'}
                    ${'sapNumberHeader'}
                    ${'unitHeader'}
                    ${'minQuantityHeader'}
                    ${'quantityPerPackHeader'}
                    ${'averageDailyUsageHeader'}
                    ${'suggestedQuantityHeader'}
                    ${'quantityOnHandHeader'}
                    ${'quantityOnOrderHeader'}
                    ${'orderQuantityHeader'}
                `('with headers', ({ header }) => {
                    it(`should call custom sorting accessor when clicking on ${header}`, () => {
                        initialize(accessMode, testInventoryOrder, false);
                        const sort = jest.spyOn(component.products$.value, 'sortingDataAccessor');
                        // find header and click. using nativeElement querySelector due to jest's shallow dom rendering
                        const headerButton = fixture.nativeElement.querySelector(`#${header}`);
                        headerButton.click();
                        fixture.detectChanges();
                        expect(sort).toHaveBeenCalled();
                    });
                });
                it('should display quantity from product', fakeAsync(() => {
                    initialize(accessMode, {
                        ...testInventoryOrder,
                        inventoryOrderProducts: [testInventoryOrderProduct0],
                    });
                    expect(+fixture.nativeElement.querySelector('#orderQuantity-0').value).toEqual(
                        testInventoryOrderProduct0.quantity
                    );
                }));

                it('should calculate 14 day usage', fakeAsync(() => {
                    initialize(accessMode, {
                        ...testInventoryOrder,
                        inventoryOrderProducts: [testInventoryOrderProduct0],
                    });
                    // the result of testInventoryOrderProduct0.averageDailyUsage * 14
                    const expectedDailyUsage = '17.22';
                    expect(fixture.nativeElement.querySelector('#averageDailyUsage-0').textContent).toEqual(
                        expectedDailyUsage
                    );
                }));
            });
        });

        it('should automatically select the store for add if only one is available', fakeAsync(() => {
            const storeSubject = new Subject<Resources>();
            jest.spyOn(resourceFacade, 'findStoresByRoles').mockReturnValue(storeSubject);
            jest.spyOn(vendorFacade, 'findByStore').mockReturnValue(of([]));
            initialize('add');
            expect(component.form.getControlValue('store')).toBeFalsy();

            const store = { id: 0, code: '040066', description: 'Test Store', version: 0 };
            storeSubject.next({
                resources: [store],
                allCompanies: false,
            });
            flush();

            expect(component.form.getControlValue('store')).toEqual(store);
            tick(200); // debounce timer for vendor call
            expect(vendorFacade.findByStore).toHaveBeenLastCalledWith(store.code);
        }));

        it.each`
            accessMode
            ${'edit'}
            ${'view'}
        `(
            'should provide current model values in $accessMode accessMode',
            fakeAsync(async ({ accessMode }) => {
                // dropdowns require the existing value to be an option in order to display properly
                initialize(accessMode);
                // grab each dropdown observable
                expect(component.vendorList).toContain(testInventoryOrder.vendor);
                expect(component.storeList).toContain(testInventoryOrder.store);
            })
        );

        describe('in view mode', () => {
            it('should load a disabled form', fakeAsync(() => {
                initialize('view');
                expect(component.form.enabled).toBeFalsy();
            }));

            describe.each`
                field          | value                                         | enabled
                ${'order'}     | ${testInventoryOrder.id.number}               | ${false}
                ${'status'}    | ${testInventoryOrder.status.description}      | ${false}
                ${'createdBy'} | ${testInventoryOrder.createdByEmployee.name}  | ${false}
                ${'createdOn'} | ${formatMoment(testInventoryOrder.createdOn)} | ${false}
                ${'comments'}  | ${testInventoryOrder.comments}                | ${false}
            `('has values that', ({ field, value, enabled }) => {
                it(`should display a ${
                    enabled === false ? 'disabled' : 'enabled'
                } input for ${field} as ${value}`, fakeAsync(() => {
                    initialize('view');
                    expectInput(fixture, { id: `${field}-input` })
                        .toHaveValue(value)
                        .toBeEnabled(enabled);
                }));
            });

            describe.each`
                status
                ${'Open'}
                ${'Finalized'}
            `('has values that', ({ status }) => {
                it(`should${
                    status === 'Finalized' ? ' ' : ' not '
                }display finalized information if status is ${status}`, fakeAsync(() => {
                    const testStatusInventoryOrder = { ...testInventoryOrder, status: { description: status } };
                    initialize('view', testStatusInventoryOrder);

                    const finalizedByInput = fixture.debugElement.query(By.css('#finalizedBy-input'));
                    const finalizedOnInput = fixture.debugElement.query(By.css('#finalizedOn-input'));
                    if (status === 'Finalized') {
                        expect(finalizedByInput.nativeElement.value).toEqual(
                            testInventoryOrder.finalizedByEmployee.name
                        );
                        expect(finalizedOnInput.nativeElement.value).toEqual(testInventoryOrder.finalizedOn);
                    } else {
                        expect(finalizedByInput).toBeFalsy();
                        expect(finalizedOnInput).toBeFalsy();
                    }
                }));
            });
        });

        describe('in edit mode', () => {
            it('should load a enabled form', fakeAsync(() => {
                initialize('edit');
                expect(component.form.enabled).toBeTruthy();
            }));

            it('should be unmodifiable when order status is finalized', fakeAsync(() => {
                jest.spyOn(parameterFacade, 'findStoreParameterValue').mockReturnValue(of(30));
                const testFinalizedInventoryOrder: InventoryOrder = {
                    ...testInventoryOrder,
                    status: { id: 0, code: 'FINALIZED', description: 'Finalized', version: 0 },
                };

                initialize('edit', testFinalizedInventoryOrder, true);

                expect(component.accessMode).toEqual(AccessMode.VIEW);
                expect(component.form.enabled).toBe(false);
            }));

            describe.each`
                field          | value                                         | enabled
                ${'order'}     | ${testInventoryOrder.id.number}               | ${false}
                ${'createdBy'} | ${testInventoryOrder.createdByEmployee.name}  | ${false}
                ${'createdOn'} | ${formatMoment(testInventoryOrder.createdOn)} | ${false}
                ${'comments'}  | ${testInventoryOrder.comments}                | ${true}
            `('has values that', ({ field, value, enabled }) => {
                it(`should display a ${
                    enabled === false ? 'disabled' : 'enabled'
                } input for ${field} as ${value}`, fakeAsync(() => {
                    jest.spyOn(parameterFacade, 'findStoreParameterValue').mockReturnValue(of(30));
                    initialize('edit');
                    expectInput(fixture, { id: `${field}-input` })
                        .toHaveValue(value)
                        .toBeEnabled(enabled);
                }));
            });
            describe('old order dialog ', () => {
                beforeEach(fakeAsync(() => {
                    jest.spyOn(component.oldOrderDialog, 'open');
                    jest.spyOn(component.oldOrderDialog, 'close');
                    jest.spyOn(component, 'cancelInventoryOrder');
                    jest.spyOn(component, 'generateOrder');
                    jest.spyOn(inventoryOrderFacade, 'cancelInventoryOrder').mockReturnValue(of(null));
                    jest.spyOn(inventoryOrderFacade, 'generateOrderProducts').mockReturnValue(of(null));
                    jest.spyOn(vendorFacade, 'findByStore').mockReturnValue(of(null));
                    component.oldOrderDialog.dialogRef = {
                        closeDisabled: true,
                        backdropClick: () => {
                            return EMPTY;
                        },
                    } as any as MatDialogRef<any>;
                    initialize('edit', {
                        ...testInventoryOrder,
                        createdOn: '2021-06-19',
                    });
                }));
                it('should prompt user old order dialog', () => {
                    //validate that dialog was opened when click to the order
                    expect(component.oldOrderDialog.open).toHaveBeenCalled();
                });
                it('should close prompt and remove order after clicking CANCEL ORDER button', () => {
                    fixture.detectChanges();
                    //validate CANCEL ORDER button had appeared
                    expect(component.oldOrderDialog.open).toHaveBeenCalled();

                    //validate cancel button had appeared
                    const cancelButton = fixture.debugElement.query(By.css('#old-order-cancel-button'));
                    expect(cancelButton).toBeTruthy();

                    // click on CANCEL ORDER button
                    cancelButton.nativeElement.click();
                    fixture.detectChanges();

                    //validate that dialog was closed
                    expect(component.oldOrderDialog.close).toHaveBeenCalled();

                    //validate old order was removed
                    expect(inventoryOrderFacade.cancelInventoryOrder).toHaveBeenCalledWith(
                        testInventoryOrder.store.code,
                        testInventoryOrder.id.number
                    );
                });
                it('should close the old order dialog before calling cancel order when clicking CANCEL ORDER button', fakeAsync(async () => {
                    const cancelSubject = new Subject();
                    jest.spyOn(inventoryOrderFacade, 'cancelInventoryOrder').mockReturnValue(cancelSubject);
                    // click on CANCEL ORDER button
                    const cancelButton = await loader.getHarness(
                        MatButtonHarness.with({ selector: '#old-order-cancel-button' })
                    );
                    await cancelButton.click();

                    expect(component.oldOrderDialog.close).toHaveBeenCalled();
                    expect(inventoryOrderFacade.cancelInventoryOrder).toHaveBeenCalledWith(
                        testInventoryOrder.store.code,
                        testInventoryOrder.id.number
                    );
                }));

                it('should display a successful cancel message and disable page elements when loading after delete old order', () => {
                    jest.spyOn(component.inventoryOrderFacade, 'save').mockReturnValue(of({}));
                    jest.spyOn(component.messageFacade, 'addMessage');

                    // click on CANCEL ORDER button
                    const cancelButton = fixture.debugElement.query(By.css('#old-order-cancel-button'));
                    cancelButton.nativeElement.click();

                    expect(component.messageFacade.addMessage).toHaveBeenCalledWith({
                        message: `Order number ${testInventoryOrder.id.number} has been cancelled.`,
                        severity: 'success',
                    });
                    expect(component.isLoading).toEqual(false);
                });
                it('should navigate back to the search page after clicking CANCEL ORDER button', fakeAsync(() => {
                    //validate CANCEL ORDER button had appeared
                    const cancelButton = fixture.debugElement.query(By.css('#old-order-cancel-button'));
                    // click on CANCEL ORDER button
                    cancelButton.nativeElement.click();
                    fixture.detectChanges();

                    //validate the screen is navigated back to the search screen
                    expectNavigateToSearchPage();
                }));
                it('should display the loading overlay while canceling order', fakeAsync(() => {
                    const deleteSubject = new Subject();
                    jest.spyOn(inventoryOrderFacade, 'cancelInventoryOrder').mockReturnValue(deleteSubject);

                    // click on CANCEL ORDER button
                    const cancelButton = fixture.debugElement.query(By.css('#old-order-cancel-button'));
                    cancelButton.nativeElement.click();
                    fixture.detectChanges();

                    const loadingOverlay: MockLoadingOverlayComponent = fixture.debugElement.query(
                        By.directive(MockLoadingOverlayComponent)
                    ).componentInstance;
                    expect(loadingOverlay.loading).toBeTruthy();

                    deleteSubject.next();
                    flush();
                    fixture.detectChanges();
                    expect(loadingOverlay.loading).toBeFalsy();
                }));
                it('should close the old order dialog before calling cancel order when clicking START NEW ORDER button', fakeAsync(async () => {
                    const cancelSubject = new Subject();
                    jest.spyOn(inventoryOrderFacade, 'cancelInventoryOrder').mockReturnValue(cancelSubject);
                    // click on START NEW ORDER button
                    const startNewOrderButton = await loader.getHarness(
                        MatButtonHarness.with({ selector: '#old-order-create-new-button' })
                    );
                    await startNewOrderButton.click();

                    expect(component.oldOrderDialog.close).toHaveBeenCalled();
                    expect(inventoryOrderFacade.cancelInventoryOrder).toHaveBeenCalledWith(
                        testInventoryOrder.store.code,
                        testInventoryOrder.id.number
                    );
                }));
                it('should not display the loading directive while starting a new order', fakeAsync(async () => {
                    jest.spyOn(inventoryOrderFacade, 'cancelInventoryOrder').mockReturnValue(of({}));

                    // click on CREATE NEW ORDER button
                    const startNewOrderButton = await loader.getHarness(
                        MatButtonHarness.with({ selector: '#old-order-create-new-button' })
                    );
                    await startNewOrderButton.click();

                    expect(fixture.debugElement.query(By.css('form'))).toBeFalsy();
                    expect(component.isOldOrder).toEqual(true);
                }));
                it('should stop preventing the page from loading if an error occurs while starting a new order', fakeAsync(async () => {
                    const cancelSubject = new Subject();
                    jest.spyOn(inventoryOrderFacade, 'cancelInventoryOrder').mockReturnValue(cancelSubject);

                    // click on CREATE NEW ORDER button
                    const startNewOrderButton = await loader.getHarness(
                        MatButtonHarness.with({ selector: '#old-order-create-new-button' })
                    );
                    await startNewOrderButton.click();

                    expect(() => {
                        cancelSubject.error('Error');
                        flush();
                    }).toThrow();
                    fixture.detectChanges();

                    expect(component.isOldOrder).toBeFalsy();
                }));
                it('should let user add new order with the same store and vendor when clicking START NEW ORDER button', () => {
                    //validate START NEW ORDERR button had appeared
                    expect(component.oldOrderDialog.open).toHaveBeenCalled();
                    const startNewOrderButton = fixture.debugElement.query(By.css('#old-order-create-new-button'));
                    expect(startNewOrderButton).toBeTruthy();
                    fixture.detectChanges();

                    // click on START NEW ORDER button
                    startNewOrderButton.nativeElement.click();
                    fixture.detectChanges();

                    // validate that dialog was closed
                    expect(inventoryOrderFacade.cancelInventoryOrder).toHaveBeenCalledWith(
                        testInventoryOrder.store.code,
                        testInventoryOrder.id.number
                    );
                    expect(component.oldOrderDialog.close).toHaveBeenCalled();
                    fixture.detectChanges();

                    // validate the new form has the same store and vendor of the old order
                    expect(router.navigate).toHaveBeenCalledWith(['add'], {
                        queryParams: { store: testInventoryOrder.store.code, vendor: testInventoryOrder.vendor.code },
                        relativeTo: TestBed.inject(ActivatedRoute).parent,
                    });
                });
                it('should verify findStoreParameterValue() is called with expected values', () => {
                    jest.spyOn(parameterFacade, 'findStoreParameterValue').mockReturnValue(of(null));
                    expect(parameterFacade.findStoreParameterValue).toHaveBeenCalledWith(
                        'PRODUCT_ORDER_OLD_HOURS',
                        ParameterType.INTEGER,
                        testInventoryOrder.store.id
                    );
                });
            });

            describe('old order message should not show when', () => {
                beforeEach(fakeAsync(() => {
                    jest.spyOn(component.oldOrderDialog, 'open');
                    jest.spyOn(component.oldOrderDialog, 'close');
                    jest.spyOn(component, 'cancelInventoryOrder');
                    jest.spyOn(component, 'generateOrder');
                    jest.spyOn(inventoryOrderFacade, 'cancelInventoryOrder').mockReturnValue(of(null));
                    jest.spyOn(inventoryOrderFacade, 'generateOrderProducts').mockReturnValue(of(null));
                    jest.spyOn(vendorFacade, 'findByStore').mockReturnValue(of(null));
                    component.oldOrderDialog.dialogRef = {
                        closeDisabled: true,
                        backdropClick: () => {
                            return EMPTY;
                        },
                    } as any as MatDialogRef<any>;
                }));
                it('order status is finalized', fakeAsync(() => {
                    initialize('edit', {
                        ...testInventoryOrder,
                        createdOn: '2021-06-19',
                        status: { code: 'FINALIZED' },
                    });
                    // validate old order dialog had never been opened
                    expect(component.oldOrderDialog.open).toHaveBeenCalledTimes(0);
                }));

                it('product old order parameter is 0', fakeAsync(() => {
                    jest.spyOn(parameterFacade, 'findStoreParameterValue').mockReturnValueOnce(of(0));
                    initialize('edit', {
                        ...testInventoryOrder,
                        createdOn: '2021-06-19',
                    });
                    // validate old order dialog had never been opened
                    expect(component.oldOrderDialog.open).toHaveBeenCalledTimes(0);
                }));
            });
        });

        describe('in add mode', () => {
            const store1 = { id: 0, code: 'STORE1', description: 'store 1', version: 0 };

            beforeEach(fakeAsync(() => {
                jest.spyOn(resourceFacade, 'findStoresByRoles').mockReturnValue(
                    of({
                        resources: [store1, { id: 1, code: 'STORE2', description: 'store 2', version: 0 }],
                        allCompanies: false,
                    })
                );
                jest.spyOn(vendorFacade, 'findByStore').mockReturnValue(of([testVendor]));
            }));

            describe('when auto generating an order', () => {
                beforeEach(() => {
                    jest.spyOn(component, 'generateOrder');
                });

                it('should populate the store and vendor via query parameters', fakeAsync(() => {
                    initialize('add', new InventoryOrder(), true, { store: store1.code, vendor: testVendor.code });

                    expect(component.form.getControlValue('store')).toEqual(store1);
                    tick(200);
                    expect(component.form.getControlValue('vendor')).toEqual(testVendor);
                    expect(component.generateOrder).toHaveBeenCalled();
                }));

                it('should not auto generate order if vendor is not found', fakeAsync(() => {
                    initialize('add', new InventoryOrder(), true, { store: store1.code, vendor: 'NOTFOUND' });

                    expect(component.form.getControlValue('store')).toEqual(store1);
                    tick(200);
                    expect(component.form.getControlValue('vendor')).toBeFalsy();
                    expect(component.generateOrder).not.toHaveBeenCalled();
                }));

                it('should not search for vendors if the store is not found', fakeAsync(() => {
                    initialize('add', new InventoryOrder(), true, { store: 'NOTFOUND', vendor: testVendor.code });

                    expect(component.form.getControlValue('store')).toBeFalsy();
                    expect(vendorFacade.findByStore).not.toHaveBeenCalled();
                    expect(component.generateOrder).not.toHaveBeenCalled();
                }));

                it('should not auto generate order if store is not found, a new store is selected and the vendor is found', fakeAsync(() => {
                    initialize('add', new InventoryOrder(), true, { store: 'NOTFOUND', vendor: testVendor.code });

                    component.form.setControlValue('store', store1);
                    tick(200);
                    expect(vendorFacade.findByStore).toHaveBeenCalledWith(store1.code);
                    expect(component.generateOrder).not.toHaveBeenCalled();
                }));

                it('should handle if user only has access to one store', fakeAsync(() => {
                    jest.spyOn(resourceFacade, 'findStoresByRoles').mockReturnValue(
                        of({
                            resources: [store1],
                            allCompanies: false,
                        })
                    );
                    initialize('add', new InventoryOrder(), true, { store: 'NOTFOUND', vendor: testVendor.code });

                    expect(component.form.getControlValue('store')).toBeFalsy();
                    expect(vendorFacade.findByStore).not.toHaveBeenCalled();
                    expect(component.generateOrder).not.toHaveBeenCalled();
                }));

                describe('with loading overlay', () => {
                    const storesSubject = new Subject<Resources>();
                    const vendorSubject = new Subject<Described[]>();
                    const getLoadingOverlay: () => MockLoadingOverlayComponent = () =>
                        fixture.debugElement.query(By.directive(MockLoadingOverlayComponent)).componentInstance;
                    const loadStores = () => {
                        storesSubject.next({
                            resources: [store1, { id: 1, code: 'STORE2', description: 'store 2', version: 0 }],
                            allCompanies: false,
                        });
                        tick(200);
                        fixture.detectChanges();
                    };
                    const loadVendors = () => {
                        vendorSubject.next([testVendor]);
                        flush();
                        fixture.detectChanges();
                    };

                    beforeEach(() => {
                        jest.spyOn(resourceFacade, 'findStoresByRoles').mockReturnValue(storesSubject);
                        jest.spyOn(vendorFacade, 'findByStore').mockReturnValue(vendorSubject);
                    });

                    it('should display loading while generating', fakeAsync(() => {
                        initialize('add', new InventoryOrder(), true, { store: store1.code, vendor: testVendor.code });
                        const loadingOverlay = getLoadingOverlay();
                        expect(loadingOverlay.loading).toBeTruthy();

                        loadStores();
                        expect(loadingOverlay.loading).toBeTruthy();

                        loadVendors();
                        expect(loadingOverlay.loading).toBeFalsy();
                    }));

                    it('should cancel loading overlay if vendor is not found', fakeAsync(() => {
                        initialize('add', new InventoryOrder(), true, { store: store1.code, vendor: 'NOTFOUND' });
                        const loadingOverlay = getLoadingOverlay();
                        expect(loadingOverlay.loading).toBeTruthy();
                        loadStores();
                        expect(loadingOverlay.loading).toBeTruthy();

                        loadVendors();
                        expect(loadingOverlay.loading).toBeFalsy();
                    }));

                    it('should cancel loading overlay if store is not found', fakeAsync(() => {
                        initialize('add', new InventoryOrder(), true, { store: 'NOTFOUND', vendor: testVendor.code });
                        const loadingOverlay = getLoadingOverlay();

                        loadStores();
                        expect(loadingOverlay.loading).toBeFalsy();
                    }));
                });
            });

            describe('store dropdown', () => {
                beforeEach(fakeAsync(() => {
                    initialize('add', new InventoryOrder());
                }));

                it('should reset the vendor when the store is changed', () => {
                    jest.spyOn(component.form, 'setControlValue');
                    const storeInputElement = fixture.debugElement.query(By.css('#store-input'));
                    const storeInput: MockFilteredInputComponent = storeInputElement.componentInstance;
                    const storeCode = 'STORE';
                    const storeValue = { ...new Described(), code: storeCode };
                    storeInput.valueControl.setValue(storeValue);

                    fixture.detectChanges();

                    expect(component.form.getControlValue('store')).toEqual(storeValue);
                    expect(component.form.getControlValue('vendor')).toEqual(null);
                    expect(component.products$.value.data).toEqual([]);
                });

                describe.each`
                    isGeneratingOrder | isOrderGenerated | editable
                    ${true}           | ${true}          | ${false}
                    ${true}           | ${false}         | ${false}
                    ${false}          | ${true}          | ${false}
                    ${false}          | ${false}         | ${true}
                `('store dropdown', ({ isGeneratingOrder, isOrderGenerated, editable }) => {
                    it(`should ${
                        editable ? '' : 'not '
                    }be editable if isGeneratingOrder=${isGeneratingOrder} and isOrderGenerated=${isOrderGenerated}`, () => {
                        component.isGeneratingOrder = isGeneratingOrder;
                        component.isOrderGenerated = isOrderGenerated;
                        fixture.detectChanges();

                        const storeInputElement = fixture.debugElement.query(By.css('#store-input'));
                        const storeInput: MockFilteredInputComponent = storeInputElement.componentInstance;
                        expect(storeInput.editable).toEqual(editable);
                    });
                });

                describe.each`
                    storeValue           | isGeneratingOrder | isOrderGenerated | editable
                    ${{ code: 'STORE' }} | ${true}           | ${true}          | ${false}
                    ${null}              | ${true}           | ${true}          | ${false}
                    ${{ code: 'STORE' }} | ${false}          | ${true}          | ${false}
                    ${null}              | ${false}          | ${true}          | ${false}
                    ${{ code: 'STORE' }} | ${true}           | ${false}         | ${false}
                    ${null}              | ${true}           | ${false}         | ${false}
                    ${{ code: 'STORE' }} | ${false}          | ${false}         | ${true}
                    ${null}              | ${false}          | ${false}         | ${false}
                `('vendor dropdown', ({ storeValue, isGeneratingOrder, isOrderGenerated, editable }) => {
                    it(`should ${
                        editable ? '' : 'not '
                    }be editable if isGeneratingOrder=${isGeneratingOrder} and isOrderGenerated=${isOrderGenerated} and store=${JSON.stringify(
                        storeValue
                    )}`, () => {
                        component.form.setControlValue('store', storeValue);
                        component.isOrderGenerated = isOrderGenerated;
                        component.isGeneratingOrder = isGeneratingOrder;
                        fixture.detectChanges();

                        const vendorInputElement = fixture.debugElement.query(By.css('#vendor-input'));
                        const vendorInput: MockFilteredInputComponent = vendorInputElement.componentInstance;
                        expect(vendorInput.editable).toEqual(editable);
                    });
                });
            });

            describe('generateOrder', () => {
                beforeEach(fakeAsync(() => {
                    initialize('add', new InventoryOrder());
                    component.form.setControlValue('store', { code: 'TEST_STORE' });
                    tick(200);
                    component.form.setControlValue('vendor', { code: 'TEST_VENDOR' });
                    fixture.detectChanges();
                }));

                it('should check for existing RMs', () => {
                    const openReceiptsSpy = jest
                        .spyOn(receiptOfMaterialFacade, 'findOpenReceiptsOfMaterial')
                        .mockReturnValue(of([]));
                    clickGenerateOrder();

                    expect(openReceiptsSpy).toHaveBeenCalledWith('TEST_STORE', 'TEST_VENDOR');
                });

                it('should show loading overlay if an error occurs while checking for existing RMs', fakeAsync(() => {
                    const receiptSubject = new Subject<ReceiptOfMaterial[]>();
                    jest.spyOn(receiptOfMaterialFacade, 'findOpenReceiptsOfMaterial').mockReturnValue(receiptSubject);
                    clickGenerateOrder();

                    expect(component.isGeneratingOrder).toBeTruthy();

                    expect(() => {
                        receiptSubject.error('Error');
                        flush();
                    }).toThrow();
                    fixture.detectChanges();

                    expect(component.isGeneratingOrder).toBeFalsy();
                }));

                describe('with no existing RMs', () => {
                    beforeEach(() => {
                        jest.spyOn(receiptOfMaterialFacade, 'findOpenReceiptsOfMaterial').mockReturnValue(of([]));
                    });

                    it('should update isGeneratingOrder status, initialize the table, and update the isOrderGeneratedStatus', () => {
                        const generateOrderResponse = new Subject<InventoryOrderProduct[]>();
                        jest.spyOn(inventoryOrderFacade, 'generateOrderProducts').mockReturnValue(
                            generateOrderResponse
                        );
                        jest.spyOn(component, 'initializeTable');
                        // before order generated is called
                        expect(component.isGeneratingOrder).toBeFalsy();
                        expect(component.isOrderGenerated).toBeFalsy();
                        // generateOrder called, but before api call has finished
                        component.generateOrder();
                        expect(component.isGeneratingOrder).toBeTruthy();
                        expect(component.isOrderGenerated).toBeFalsy();
                        generateOrderResponse.next([testInventoryOrderProduct1]);
                        // after api call has finished
                        expect(component.initializeTable).toHaveBeenCalledWith();
                        expect(component.inventoryOrderProducts.getRawValue()).toEqual([testInventoryOrderProduct1]);
                        expect(component.isGeneratingOrder).toBeFalsy();
                    });

                    it('should handle errors', fakeAsync(() => {
                        const testError = 'Test Error';
                        const generateOrderResponse = new Subject<any>();
                        jest.spyOn(inventoryOrderFacade, 'generateOrderProducts').mockReturnValue(
                            generateOrderResponse
                        );
                        // before order generated is called
                        expect(component.isGeneratingOrder).toBeFalsy();
                        // generateOrder called, but before api call has finished
                        component.generateOrder();
                        expect(component.isGeneratingOrder).toBeTruthy();
                        generateOrderResponse.error(testError);
                        // after api call has finished
                        expect(() => {
                            component.products$.subscribe();
                            flush();
                        }).toThrowError(testError);
                        expect(component.isGeneratingOrder).toBeFalsy();
                    }));

                    it('should not open the open receipts dialog', () => {
                        const openDialogSpy = jest.spyOn(component.openReceiptsDialog, 'open');
                        clickGenerateOrder();

                        expect(openDialogSpy).not.toHaveBeenCalled();
                    });

                    it('should not cancel loading overlay', () => {
                        clickGenerateOrder();

                        expect(component.isGeneratingOrder).toBeTruthy();
                    });
                });

                describe('with open receipts of material', () => {
                    const rm1: ReceiptOfMaterial = {
                        number: 'rm1',
                        store: { code: 'TEST_STORE' },
                        vendor: { code: 'TEST_VENDOR' },
                        receiptDate: '2021-01-27',
                    };
                    const rm2: ReceiptOfMaterial = {
                        ...rm1,
                        number: 'rm2',
                        receiptDate: '2021-01-29',
                    };

                    beforeEach(() => {
                        jest.spyOn(receiptOfMaterialFacade, 'findOpenReceiptsOfMaterial').mockReturnValue(
                            of([rm1, rm2])
                        );
                    });

                    it('should open the receipt dialog to show the user open receipts', () => {
                        const openDialogSpy = jest.spyOn(component.openReceiptsDialog, 'open');
                        clickGenerateOrder();

                        expect(openDialogSpy).toHaveBeenCalled();
                    });

                    it('should go back without generating an order if the go back button is clicked', async () => {
                        const closeSpy = jest.spyOn(component.openReceiptsDialog, 'close');
                        const generateOrderSpy = jest.spyOn(component, 'generateOrder');
                        clickGenerateOrder();

                        await click('#open-receipts-cancel-button');
                        expect(closeSpy).toHaveBeenCalled();
                        expect(generateOrderSpy).not.toHaveBeenCalled();
                    });

                    it('should generate the order if the continue button is clicked', async () => {
                        const closeSpy = jest.spyOn(component.openReceiptsDialog, 'close');
                        const generateOrderSpy = jest.spyOn(component, 'generateOrder');
                        clickGenerateOrder();

                        await click('#open-receipts-continue-button');
                        expect(closeSpy).toHaveBeenCalled();
                        expect(generateOrderSpy).toHaveBeenCalled();
                    });

                    it('should display links to navigate to the open receipts', async () => {
                        const closeSpy = jest.spyOn(component.openReceiptsDialog, 'close');
                        const navigateSpy = jest.spyOn(router, 'navigate');
                        clickGenerateOrder();

                        await click('#open-receipt-0');
                        expect(closeSpy).toHaveBeenCalled();
                        expect(navigateSpy).toHaveBeenCalledWith([
                            '/inventory/receipt-of-material',
                            'edit',
                            rm1.store.code,
                            rm1.number,
                        ]);
                    });

                    it('should cancel loading overlay when dialog is opened', () => {
                        clickGenerateOrder();

                        expect(component.isGeneratingOrder).toBeFalsy();
                    });

                    it('should not trigger unsaved changes dialog when user clicks receipt link', () => {
                        clickGenerateOrder();

                        expect(component.unsavedChanges).toBeFalsy();
                    });
                });
            });
        });

        describe('splitProductCodes', () => {
            const productAddInputComponent = () => {
                return fixture.debugElement.query(By.css('#product-add-input'))
                    .componentInstance as ProductAddInputComponent;
            };

            it('should add the product code through user input', fakeAsync(() => {
                const enteredProductCodes = [{ code: ' A101 , B101 ' }];
                const searchedProductCodes = ['A101', 'B101'];
                jest.spyOn(component, 'generateProducts');
                jest.spyOn(component, 'splitDelimitedProducts');
                initialize('edit');
                productAddInputComponent().products.emit(enteredProductCodes);

                expect(component.splitDelimitedProducts).toHaveBeenCalledWith(enteredProductCodes);
                expect(component.generateProducts).toHaveBeenCalledWith(
                    component.form.getArray('inventoryOrderProducts').getRawValue(),
                    searchedProductCodes
                );
            }));

            it('should add the through the search', fakeAsync(() => {
                const addProducts_search = [
                    { id: 0, code: 'A101' },
                    { id: 1, code: 'B101' },
                ];
                jest.spyOn(component, 'generateProducts');
                jest.spyOn(component, 'splitDelimitedProducts');
                initialize('edit');
                productAddInputComponent().products.emit(addProducts_search);

                expect(component.splitDelimitedProducts).toHaveBeenCalledWith(addProducts_search);
                expect(component.generateProducts).toHaveBeenCalledWith(
                    component.form.getArray('inventoryOrderProducts').getRawValue(),
                    addProducts_search.map((p) => p.code)
                );
            }));
        });

        describe('generateProducts', () => {
            const generateOrderResponse = new Subject<InventoryOrderProduct[]>();
            const newProductWithSpace: InventoryOrderProduct = {
                averageDailyUsage: 0,
                minimumOrderQuantity: 1,
                product: {
                    sapNumber: '860780',
                    code: 'BP1255 H11',
                    description: 'BP1255 H11 MINIATURE LAMP',
                    id: 13376,
                },
                quantityOnHand: 16,
                quantityOnOrder: 2,
                quantityPerPack: 1,
                secondLevelCategory: { description: 'BULB', code: 'BULB', id: 1064, version: 5 },
                suggestedQuantity: 0,
                uom: { description: 'EA', code: 'EACH', id: 2479, version: 2 },
            };

            beforeEach(fakeAsync(() => {
                initialize('add');
                component.form.setControlValue('store', { code: 'TEST_STORE' }, { emitEvent: false });
                component.form.setControlValue('vendor', { code: 'TEST_VENDOR' }, { emitEvent: false });
                jest.spyOn(receiptOfMaterialFacade, 'findOpenReceiptsOfMaterial').mockReturnValue(of([]));
            }));

            it('should update the component state', () => {
                jest.spyOn(inventoryOrderFacade, 'generateOrderProducts').mockReturnValue(generateOrderResponse);
                component.isLoading = true;
                component.isGeneratingOrder = true;
                component.isOrderGenerated = false;

                component.generateProducts();
                generateOrderResponse.next([newProduct]);

                expect(component.isLoading).toEqual(false);
                expect(component.isGeneratingOrder).toEqual(false);
                expect(component.isOrderGenerated).toEqual(true);
            });

            it('should initialize generated products with an order quantity equal to suggested order quantity if suggested order quantity is greater than 0', async () => {
                fixture.detectChanges();
                jest.spyOn(inventoryOrderFacade, 'generateOrderProducts').mockReturnValue(of([newProduct]));

                clickGenerateOrder();

                expect(component.inventoryOrderProducts.length).toEqual(1);
                expect(component.inventoryOrderProducts.get('0').get('quantity').value).toEqual(
                    newProduct.suggestedQuantity
                );
            });

            it('should not initialize generated products quantity if suggested order quantity is 0', async () => {
                fixture.detectChanges();
                jest.spyOn(inventoryOrderFacade, 'generateOrderProducts').mockReturnValue(of([]));

                getSelectAndGoComponent().go.emit();
                fixture.detectChanges();

                expect(component.inventoryOrderProducts.length).toEqual(0);

                jest.spyOn(inventoryOrderFacade, 'generateOrderProducts').mockReturnValue(
                    of([{ ...newProduct, suggestedQuantity: 0 }])
                );
                const mockAddProductComponent = fixture.debugElement.query(By.directive(MockProductAddInputComponent))
                    .componentInstance as MockProductAddInputComponent;
                mockAddProductComponent.products.emit([{ code: newProduct.product.code }]);

                expect(component.inventoryOrderProducts.length).toEqual(1);
                expect(component.inventoryOrderProducts.get('0').get('quantity').value).toBeNull();
            });

            it('should generate an order with requested products', () => {
                jest.spyOn(inventoryOrderFacade, 'generateOrderProducts').mockReturnValue(generateOrderResponse);

                // generateOrder called, but before api call has finished
                component.generateProducts(
                    [testInventoryOrderProduct0, testInventoryOrderProduct1, testInventoryOrderProduct2],
                    [newProduct.product.code]
                );
                generateOrderResponse.next([newProduct]);

                // after api call has finished
                const products = component.inventoryOrderProducts.getRawValue();
                expect(products).toContainEqual(testInventoryOrderProduct0);
                expect(products).toContainEqual(testInventoryOrderProduct1);
                expect(products).toContainEqual(testInventoryOrderProduct2);
                // last product should be the newly added one
                const lastProduct: InventoryOrderProduct = products.pop();
                expect(lastProduct.secondLevelCategory).toEqual(newProduct.secondLevelCategory);
                expect(lastProduct.averageDailyUsage).toEqual(newProduct.averageDailyUsage);
                expect(lastProduct.product).toEqual(newProduct.product);
                expect(lastProduct.uom).toEqual(newProduct.uom);
                expect(lastProduct.minimumOrderQuantity).toEqual(newProduct.minimumOrderQuantity);
                expect(lastProduct.quantityPerPack).toEqual(newProduct.quantityPerPack);
                expect(lastProduct.averageDailyUsage).toEqual(newProduct.averageDailyUsage);
                expect(lastProduct.suggestedQuantity).toEqual(newProduct.suggestedQuantity);
                expect(lastProduct.quantityOnHand).toEqual(newProduct.quantityOnHand);
                expect(lastProduct.quantityOnOrder).toEqual(newProduct.quantityOnOrder);
            });

            it('it should add a product whose product code has space', () => {
                jest.spyOn(inventoryOrderFacade, 'generateOrderProducts').mockReturnValue(generateOrderResponse);

                // generateOrder called, but before api call has finished
                component.generateProducts(
                    [testInventoryOrderProduct0, testInventoryOrderProduct1, testInventoryOrderProduct2],
                    [newProductWithSpace.product.code]
                );
                generateOrderResponse.next([newProductWithSpace]);

                // after api call has finished
                const products = component.inventoryOrderProducts.getRawValue();
                expect(products).toContainEqual(testInventoryOrderProduct0);
                expect(products).toContainEqual(testInventoryOrderProduct1);
                expect(products).toContainEqual(testInventoryOrderProduct2);
                // last product should be the newly added one
                const lastProduct: InventoryOrderProduct = products.pop();
                expect(lastProduct.secondLevelCategory).toEqual(newProductWithSpace.secondLevelCategory);
                expect(lastProduct.averageDailyUsage).toEqual(newProductWithSpace.averageDailyUsage);
                expect(lastProduct.product).toEqual(newProductWithSpace.product);
                expect(lastProduct.uom).toEqual(newProductWithSpace.uom);
                expect(lastProduct.minimumOrderQuantity).toEqual(newProductWithSpace.minimumOrderQuantity);
                expect(lastProduct.quantityPerPack).toEqual(newProductWithSpace.quantityPerPack);
                expect(lastProduct.averageDailyUsage).toEqual(newProductWithSpace.averageDailyUsage);
                expect(lastProduct.suggestedQuantity).toEqual(newProductWithSpace.suggestedQuantity);
                expect(lastProduct.quantityOnHand).toEqual(newProductWithSpace.quantityOnHand);
                expect(lastProduct.quantityOnOrder).toEqual(newProductWithSpace.quantityOnOrder);
            });
        });

        it('invalid access mode (ADD-LIKE is unsupported)', () => {
            const route = TestBed.inject(ActivatedRoute);
            route.snapshot = {
                paramMap: convertToParamMap({
                    accessMode: 'add-like',
                    storeCode: testInventoryOrder.store.code,
                    orderNumer: testInventoryOrder.id.number,
                }),
            } as ActivatedRouteSnapshot;

            expect(() => fixture.detectChanges()).toThrowError('Unhandled Access Mode: add-like');
        });

        describe.each`
            accessMode | field       | value                        | editable
            ${'view'}  | ${'store'}  | ${testInventoryOrder.store}  | ${false}
            ${'edit'}  | ${'store'}  | ${testInventoryOrder.store}  | ${false}
            ${'view'}  | ${'vendor'} | ${testInventoryOrder.vendor} | ${false}
            ${'edit'}  | ${'vendor'} | ${testInventoryOrder.vendor} | ${false}
        `('has values that', ({ accessMode, field, value, editable }) => {
            it(`should be ${editable ? 'enabled' : 'disabled'} in ${accessMode} mode for ${field}`, fakeAsync(() => {
                initialize(accessMode);
                const filterInput: MockFilteredInputComponent = fixture.debugElement.query(
                    By.css(`#${field}-input`)
                ).componentInstance;
                expect(filterInput).toBeTruthy();
                expect(filterInput.valueControl.value).toEqual(value);
                expect(filterInput.editable).toEqual(editable);
                expect(filterInput.nullable).toEqual(false);
                expect(filterInput.placeHolder).toEqual(startCase(field));
            }));
        });

        describe('with a finalized order and associated RMs that', () => {
            let receiptNumber: string;
            let button: DebugElement;
            beforeEach(fakeAsync(() => {
                // load a finalized order
                const testStatusInventoryOrder = { ...testInventoryOrder, status: { description: 'Finalized' } };
                initialize('view', testStatusInventoryOrder);
                receiptNumber = testReceiptsOfMaterials[0].number;
                // Get first button
                button = fixture.debugElement.query(By.css('#receipt-button'));
            }));

            it('should render with receipt number', fakeAsync(() => {
                expect(button).toBeTruthy();
                const expectedReceiptNumber = button.nativeElement.textContent.trim();
                expect(expectedReceiptNumber).toEqual(receiptNumber);
            }));

            it('should load clickable buttons to associated RMs', fakeAsync(() => {
                component['router'].navigate = jest.fn();

                expect(button).toBeTruthy();
                button.nativeElement.click();
                fixture.detectChanges();

                expect(component['router'].navigate).toHaveBeenCalledWith([
                    '/inventory/receipt-of-material',
                    component.accessMode.urlSegement,
                    component.storeCode,
                    receiptNumber,
                ]);
            }));
        });

        describe('unsavedChanges', () => {
            it('should track if the form has been modified', fakeAsync(() => {
                initialize('edit');
                expect(component.unsavedChanges).toBeFalsy();
                component.form.markAsDirty();
                expect(component.unsavedChanges).toBeTruthy();
            }));

            it('should filter out related product codes when gathering inventoryOrder Details', fakeAsync(() => {
                const res = [testInventoryOrderProduct0, testInventoryOrderProduct1, testInventoryOrderProduct2];
                initialize('edit', testInventoryOrder);
                const spy = jest
                    .spyOn(component.inventoryOrderFacade, 'generateOrderProducts')
                    .mockReturnValue(of(res));

                jest.spyOn(component, 'mapGeneratedProductToNewProduct');

                component.generateProducts(testInventoryOrder.inventoryOrderProducts, [
                    testInventoryOrderProduct0.product.code,
                ]);

                expect(spy).toHaveBeenCalledWith(testInventoryOrder.store.code, testInventoryOrder.vendor.code, [
                    testInventoryOrderProduct0.product.code,
                ]);

                // method after the filter is only called once because we removed the codes diff from the inserted one
                expect(component.mapGeneratedProductToNewProduct).toHaveBeenCalledTimes(1);
                expect(component.mapGeneratedProductToNewProduct).toBeCalledWith(testInventoryOrderProduct0);
            }));
        });
    });

    describe('when saving', () => {
        function clickSave() {
            getSaveActionButton(fixture).nativeElement.click();
            tick(600); // tick to account for debounce time and timeout to re-enable button
            fixture.detectChanges();
        }
        function clickApply() {
            getApplyActionButton(fixture).nativeElement.click();
            tick(600); // tick to account for debounce time and timeout to re-enable button
            fixture.detectChanges();
            tick(600); // tick to clear timers in queue
        }

        describe('in edit mode', () => {
            beforeEach(fakeAsync(() => {
                initialize('edit');
            }));

            it('should call save only once, even when clicking SAVE multiple times', fakeAsync(() => {
                jest.spyOn(component.inventoryOrderFacade, 'save').mockReturnValue(of({}));
                getSaveActionButton(fixture).nativeElement.click();
                getSaveActionButton(fixture).nativeElement.click();
                getSaveActionButton(fixture).nativeElement.click();
                tick(600); // tick to account for debounce time and timeout to re-enable button
                fixture.detectChanges();

                expect(component.inventoryOrderFacade.save).toHaveBeenCalledTimes(1);
            }));

            it('should call save only once, even when clicking APPLY multiple times', fakeAsync(() => {
                jest.spyOn(component.inventoryOrderFacade, 'save').mockReturnValue(of({}));
                getApplyActionButton(fixture).nativeElement.click();
                getApplyActionButton(fixture).nativeElement.click();
                getApplyActionButton(fixture).nativeElement.click();
                tick(600); // tick to account for debounce time and timeout to re-enable button
                fixture.detectChanges();
                tick(600); // tick to clear timers in queue
                expect(component.inventoryOrderFacade.save).toHaveBeenCalledTimes(1);
            }));

            describe.each`
                button     | clickFunction
                ${'save'}  | ${clickSave}
                ${'apply'} | ${clickApply}
            `('by clicking the $button button', ({ button, clickFunction }) => {
                it('should call the api to save', fakeAsync(() => {
                    jest.spyOn(component.inventoryOrderFacade, 'save').mockReturnValue(of({}));
                    clickFunction();

                    expect(component.inventoryOrderFacade.save).toHaveBeenCalledWith(
                        Object.assign({ ...testInventoryOrder }, component.form.value)
                    );
                }));

                it('should display a successful save message', fakeAsync(() => {
                    jest.spyOn(component.inventoryOrderFacade, 'save').mockReturnValue(of({}));
                    jest.spyOn(component.messageFacade, 'addMessage');
                    clickFunction();

                    expect(component.messageFacade.addMessage).toHaveBeenCalledWith({
                        message: `Inventory Order ${testInventoryOrder.id.number} saved successfully`,
                        severity: 'info',
                    });
                }));

                it('should display the loading overlay while save is occurring', fakeAsync(() => {
                    const apiSubject = new Subject();
                    jest.spyOn(component.inventoryOrderFacade, 'save').mockReturnValue(apiSubject);
                    clickFunction();

                    const loadingOverlay: MockLoadingOverlayComponent = fixture.debugElement.query(
                        By.directive(MockLoadingOverlayComponent)
                    ).componentInstance;
                    expect(loadingOverlay.loading).toBeTruthy();

                    apiSubject.next();
                    fixture.detectChanges();
                    tick(600); // clear timers in queue
                    expect(loadingOverlay.loading).toBeFalsy();
                }));

                it('should stop loading overlay if an error occurs', fakeAsync(() => {
                    const apiSubject = new Subject();
                    jest.spyOn(component.inventoryOrderFacade, 'save').mockReturnValue(apiSubject);
                    clickFunction();

                    const loadingOverlay: MockLoadingOverlayComponent = fixture.debugElement.query(
                        By.directive(MockLoadingOverlayComponent)
                    ).componentInstance;
                    expect(loadingOverlay.loading).toBeTruthy();

                    expect(() => {
                        apiSubject.error('An error occurred');
                        tick(600); // tick to clear timers in queue
                    }).toThrow();
                    fixture.detectChanges();
                    expect(loadingOverlay.loading).toBeFalsy();
                }));
            });

            it('should navigate back to the previous page when clicking save', fakeAsync(() => {
                jest.spyOn(routerService, 'navigateToSearchPage');
                jest.spyOn(component.inventoryOrderFacade, 'save').mockReturnValue(of({}));
                clickSave();
                tick(600); // tick to account for debounce time and timeout to re-enable button

                expect(routerService.navigateToSearchPage).toHaveBeenCalledWith(TestBed.inject(ActivatedRoute));
            }));

            it('should reload the component when clicking apply', fakeAsync(() => {
                jest.spyOn(component.inventoryOrderFacade, 'save').mockReturnValue(of({}));
                jest.spyOn(component, 'ngOnInit').mockImplementation(() => {});
                clickApply();
                tick(600); // tick to account for debounce time and timeout to re-enable button

                expect(component.ngOnInit).toHaveBeenCalled();
                expect(component.form).toBeFalsy();
            }));

            it('maintaining sorted table after applying', fakeAsync(() => {
                jest.spyOn(component.inventoryOrderFacade, 'save').mockReturnValue(of({}));
                const headerButton = fixture.nativeElement.querySelector(`#unitHeader`);
                headerButton.click();

                fixture.detectChanges();
                const previousSortActive = component.products$.value.sort.active;
                const previousSortDirection = component.products$.value.sort.direction;
                const orderSubject = new Subject<InventoryOrder>();
                jest.spyOn(inventoryOrderFacade, 'findByStoreCodeAndOrderNumber').mockReturnValue(orderSubject);
                clickApply();
                tick(600); // tick to account for debounce time and timeout to re-enable button

                fixture.detectChanges();
                orderSubject.next(testInventoryOrder);

                fixture.detectChanges();
                tick(600); // tick to clear timers in queue

                const currentSortActive = component.products$.value.sort.active;
                const currentSortDirection = component.products$.value.sort.direction;
                expect(currentSortActive).toEqual(previousSortActive);
                expect(currentSortDirection).toEqual(previousSortDirection);
            }));
        });

        describe('TypedFormGroupSelectionModel in edit mode', () => {
            const existingProduct: SapProduct = { ...new SapProduct(), sapNumber: 'sap1' };
            const newSapProduct: SapProduct = { ...new SapProduct(), sapNumber: 'sap2' };
            const existingItem: InventoryOrderProduct = {
                ...new InventoryOrderProduct(),
                secondLevelCategory: { id: 0, code: 'CAT0', description: 'category-0', version: 0 },
                uom: { id: 'uomId1', code: 'TestCode1' },
                product: existingProduct,
            };
            const newItems: InventoryOrderProduct[] = [
                {
                    ...new InventoryOrderProduct(),
                    secondLevelCategory: { id: 0, code: 'CAT1', description: 'category-1', version: 0 },
                    uom: { id: 'uomId2', code: 'TestCode2' },
                    product: newSapProduct,
                },
            ];

            const inventoryOrder: InventoryOrder = {
                id: { number: '0', storeId: 0 },
                version: 0,
                store: { id: 0, code: 'st00', description: 'store', version: 0 },
                status: { id: 0, code: 'OPEN', description: 'Open', version: 0 },
                vendor: testVendor,
                inventoryOrderProducts: [existingItem],
                comments: 'test comment',
                finalizedOn: '',
                finalizedByEmployee: { name: 'test' },
                createdOn: moment().format('YYYY-MM-DD'),
                createdByEmployee: { name: 'test' },
                updatedBy: '',
                updatedOn: '',
            };

            beforeEach(fakeAsync(() => {
                initialize('edit', inventoryOrder);
                component.form.setControlValue('store', { code: 'TEST_STORE' }, { emitEvent: false });
                component.form.setControlValue('vendor', { code: 'TEST_VENDOR' }, { emitEvent: false });
            }));

            it('should maintain selected status even when more products are added ', fakeAsync(async () => {
                //initialize form with existing product
                component.form.setControl('inventoryOrderProducts', new FormArray([new FormControl(existingItem)]));
                expect(component.form.getControlValue('inventoryOrderProducts').length).toEqual(1);
                // select
                (await loader.getHarness(MatCheckboxHarness.with({ selector: '#master-checkbox' }))).check();
                flush();
                expect(component.selection.isEmpty()).toEqual(false);
                component['addProductsToForm'](component.form.getControlValue('inventoryOrderProducts'), newItems);
                expect(component.form.getControlValue('inventoryOrderProducts').length).toEqual(2);
                expect(component.selection.selected.length).toEqual(1);
                expect(component.selection.selected[0].value).toEqual(
                    component.form.getControlValue('inventoryOrderProducts')[0]
                );
            }));
        });

        describe('in add mode', () => {
            beforeEach(fakeAsync(() => {
                initialize('add');
                component.form.setControlValue('store', { code: 'TEST_STORE' }, { emitEvent: false });
                component.form.setControlValue('vendor', { code: 'TEST_VENDOR' }, { emitEvent: false });
                fixture.detectChanges();
                jest.spyOn(receiptOfMaterialFacade, 'findOpenReceiptsOfMaterial').mockReturnValue(of([]));
                jest.spyOn(inventoryOrderFacade, 'generateOrderProducts').mockReturnValue(of([newProduct]));
                getSelectAndGoComponent().go.emit();
                fixture.detectChanges();
                tick(600); // tick to clear timers in queue
            }));

            it('should clear dialogs on component destruction', () => {
                expect(component.openReceiptsDialog).toBeTruthy();
                component.ngOnDestroy();
                expect(component.openReceiptsDialog).toBeFalsy();
            });

            it('should not display dialog and show warning if the dialog has been destroyed', fakeAsync(() => {
                const rm1: ReceiptOfMaterial = {
                    number: 'rm1',
                    store: { code: 'TEST_STORE' },
                    vendor: { code: 'TEST_VENDOR' },
                    receiptDate: '2021-01-27',
                };
                const rm2: ReceiptOfMaterial = {
                    ...rm1,
                    number: 'rm2',
                    store: { code: 'TEST_STORE' },
                    vendor: { code: 'TEST_VENDOR' },
                    receiptDate: '2021-01-29',
                };

                jest.spyOn(receiptOfMaterialFacade, 'findOpenReceiptsOfMaterial').mockReturnValue(of([rm1, rm2]));
                jest.spyOn(component.messageFacade, 'addMessage');

                component.openReceiptsDialog = null; // simulate component being destroyed
                getSelectAndGoComponent().go.emit();
                tick(600); // tick to clear timers in queue

                expect(component.messageFacade.addMessage).toHaveBeenCalledWith({
                    message: 'There are open receipts that prevented the order product from being created',
                    severity: 'warn',
                });
            }));

            it('should not display unsaved changes dialog when saving', fakeAsync(() => {
                jest.spyOn(component.inventoryOrderFacade, 'save').mockReturnValue(of({}));
                clickSave();
                tick(600); // tick to account for debounce time and timeout to re-enable button

                expect(component.unsavedChanges).toBeFalsy();
            }));

            it('should finalize an order', fakeAsync(() => {
                const testFinalizeFromAdd: InventoryOrder = {
                    ...new InventoryOrder(),
                    store: { code: 'TEST_STORE' },
                    vendor: { code: 'TEST_VENDOR' },
                    inventoryOrderProducts: [newProduct],
                };
                jest.spyOn(component.inventoryOrderFacade, 'finalize').mockReturnValue(of({}));

                fixture.debugElement.query(By.css('#finalize-order-action')).nativeElement.click();
                fixture.detectChanges();

                fixture.debugElement.query(By.css('#finalize-continue-button')).nativeElement.click();
                tick(600); // tick to account for debounce time and time to re-enable button
                fixture.detectChanges();

                expect(inventoryOrderFacade.finalize).toHaveBeenCalledWith(
                    Object.assign({ ...testFinalizeFromAdd }, component.form.value)
                );
                expect(component.form.pristine).toBeTruthy();
                expect(component.isOrderGenerated).toBeFalsy();
                expect(component.unsavedChanges).toBeFalsy();
            }));

            it('should finalize only one order even on multiple clicks of finalize button', fakeAsync(() => {
                const finalizeButton = fixture.debugElement.query(By.css('#finalize-continue-button')).nativeElement;
                const testFinalizeFromAdd: InventoryOrder = {
                    ...new InventoryOrder(),
                    store: { code: 'TEST_STORE' },
                    vendor: { code: 'TEST_VENDOR' },
                    inventoryOrderProducts: [newProduct],
                };
                jest.spyOn(component.inventoryOrderFacade, 'finalize').mockReturnValue(of({}));

                fixture.debugElement.query(By.css('#finalize-order-action')).nativeElement.click();
                fixture.detectChanges();

                // multiple clicks testing for creation of single order
                finalizeButton.click();
                finalizeButton.click();
                finalizeButton.click();
                tick(600); // tick to account for debounce time and timeout to re-enable button
                fixture.detectChanges();

                expect(inventoryOrderFacade.finalize).toHaveBeenCalledWith(
                    Object.assign({ ...testFinalizeFromAdd }, component.form.value)
                );
                // only one order should be created even if finalize is clicked multiple times
                expect(inventoryOrderFacade.finalize).toHaveBeenCalledTimes(1);
                expect(component.form.pristine).toBeTruthy();
                expect(component.isOrderGenerated).toBeFalsy();
                expect(component.unsavedChanges).toBeFalsy();
            }));

            it('should show the finalize order button', () => {
                expect(fixture.debugElement.query(By.css('#finalize-order-action'))).toBeTruthy();
                expect(fixture.debugElement.query(By.css('#finalize-order-action')).nativeElement.disabled).toBeFalsy();
            });
        });
    });

    describe('with action bar', () => {
        describe.each`
            accessMode | orderStatus    | cancelDisplayed | applyDisplayed | saveDisplayed | cancelOrderDisplayed | finalizeOrderDisplayed
            ${'view'}  | ${'OPEN'}      | ${true}         | ${false}       | ${false}      | ${false}             | ${false}
            ${'view'}  | ${'FINALIZED'} | ${true}         | ${false}       | ${false}      | ${false}             | ${false}
            ${'edit'}  | ${'OPEN'}      | ${true}         | ${true}        | ${true}       | ${true}              | ${true}
            ${'edit'}  | ${'FINALIZED'} | ${true}         | ${false}       | ${false}      | ${false}             | ${false}
        `(
            'while in $accessMode mode with status of $orderStatus',
            ({
                accessMode,
                orderStatus,
                cancelDisplayed,
                applyDisplayed,
                saveDisplayed,
                cancelOrderDisplayed,
                finalizeOrderDisplayed,
            }) => {
                const validateIsDisplayed = (element: DebugElement, shouldBeDisplayed: boolean) => {
                    if (shouldBeDisplayed) {
                        expect(element).toBeTruthy();
                    } else {
                        expect(element).toBeFalsy();
                    }
                };

                beforeEach(fakeAsync(() => {
                    initialize(accessMode, { ...testInventoryOrder, status: { code: orderStatus } });
                }));

                it(`should ${cancelDisplayed ? '' : 'not '}display cancel button`, fakeAsync(() => {
                    validateIsDisplayed(getCancelActionButton(fixture), cancelDisplayed);
                }));
                it(`should ${applyDisplayed ? '' : 'not '}display apply button`, fakeAsync(() => {
                    validateIsDisplayed(getApplyActionButton(fixture), applyDisplayed);
                }));
                it(`should ${saveDisplayed ? '' : 'not '}display save button`, fakeAsync(() => {
                    validateIsDisplayed(getSaveActionButton(fixture), saveDisplayed);
                }));
                it(`should ${cancelOrderDisplayed ? '' : 'not '}display cancel order button`, fakeAsync(() => {
                    validateIsDisplayed(
                        fixture.debugElement.query(By.css('#cancel-order-action')),
                        cancelOrderDisplayed
                    );
                }));
                it(`should ${finalizeOrderDisplayed ? '' : 'not '}display finalize order button`, fakeAsync(() => {
                    validateIsDisplayed(
                        fixture.debugElement.query(By.css('#finalize-order-action')),
                        finalizeOrderDisplayed
                    );
                }));
            }
        );

        it('should navigate to the search page when clicking cancel button', fakeAsync(() => {
            initialize('edit');

            getCancelActionButton(fixture).nativeElement.click();

            expectNavigateToSearchPage();
        }));

        describe("apply, save and finalized order buttons shouldn't be enabled when no products are associated with order", () => {
            beforeEach(fakeAsync(() => {
                initialize('edit', {
                    ...testInventoryOrder,
                    inventoryOrderProducts: [],
                });
            }));

            it("cancel button shouldn't be disabled when no products are associated with order", fakeAsync(() => {
                expect(getCancelActionButton(fixture).nativeElement.disabled).toBe(false);
            }));

            it('apply button should be disabled when no products are associated with order', fakeAsync(() => {
                expect(getApplyActionButton(fixture).nativeElement.disabled).toBe(true);
            }));

            it('save button should be disabled when no products are associated with order', fakeAsync(() => {
                expect(getSaveActionButton(fixture).nativeElement.disabled).toBe(true);
            }));

            it('finalize order button should be disabled when no products are associated with order', fakeAsync(() => {
                expect(fixture.debugElement.query(By.css('#finalize-order-action')).nativeElement.disabled).toBe(true);
            }));
        });

        describe.each`
            formState    | cancelEnabled | applyEnabled | saveEnabled | cancelOrderDisplayed | finalizeOrderDisplayed
            ${'valid'}   | ${true}       | ${true}      | ${true}     | ${true}              | ${true}
            ${'invalid'} | ${true}       | ${false}     | ${false}    | ${true}              | ${false}
        `(
            'with a $formState form',
            ({ formState, cancelEnabled, applyEnabled, saveEnabled, cancelOrderDisplayed, finalizeOrderDisplayed }) => {
                beforeEach(fakeAsync(() => {
                    initialize('edit');
                    if (formState !== 'valid') {
                        component.form.setErrors({ invalid: true });
                    }
                    fixture.detectChanges();
                }));

                it(`cancel button should ${cancelEnabled ? 'en' : 'dis'}abled`, fakeAsync(() => {
                    expect(getCancelActionButton(fixture).nativeElement.disabled).toBe(!cancelEnabled);
                }));
                it(`apply button should ${applyEnabled ? 'en' : 'dis'}abled`, fakeAsync(() => {
                    expect(getApplyActionButton(fixture).nativeElement.disabled).toBe(!applyEnabled);
                }));
                it(`save button should ${saveEnabled ? 'en' : 'dis'}abled`, fakeAsync(() => {
                    expect(getSaveActionButton(fixture).nativeElement.disabled).toBe(!saveEnabled);
                }));
                it(`finalize button should ${cancelOrderDisplayed ? 'en' : 'dis'}abled`, fakeAsync(() => {
                    expect(fixture.debugElement.query(By.css('#cancel-order-action')).nativeElement.disabled).toBe(
                        !cancelOrderDisplayed
                    );
                }));
                it(`finalize button should ${finalizeOrderDisplayed ? 'en' : 'dis'}abled`, fakeAsync(() => {
                    expect(fixture.debugElement.query(By.css('#finalize-order-action')).nativeElement.disabled).toBe(
                        !finalizeOrderDisplayed
                    );
                }));
            }
        );

        describe('Cancel Order Button', () => {
            let cancelOrderButton: DebugElement;
            let continueButton: DebugElement;
            let cancelButton: DebugElement;
            let messageFacade: MessageFacade;

            beforeEach(fakeAsync(() => {
                messageFacade = TestBed.inject(MessageFacade as Type<MessageFacade>);
                jest.spyOn(component.cancelDialog, 'open');
                jest.spyOn(component.cancelDialog, 'close');
                jest.spyOn(component, 'openCancelOrderDialog');
                jest.spyOn(component, 'closeCancelOrderDialog');
                jest.spyOn(component, 'cancelInventoryOrder');
                jest.spyOn(component, 'isCancelOrderButtonShown').mockReturnValue(true);
                jest.spyOn(inventoryOrderFacade, 'cancelInventoryOrder').mockReturnValue(of(testInventoryOrder));
                initialize('edit');
                cancelOrderButton = fixture.debugElement.query(By.css('#cancel-order-action'));
                continueButton = fixture.debugElement.query(By.css('#continue-button'));
                cancelButton = fixture.debugElement.query(By.css('#cancel-button'));
            }));

            function clickCancelOrderButton() {
                expect(cancelOrderButton).toBeTruthy();
                cancelOrderButton.nativeElement.click();
                expect(component.cancelDialog.open).toHaveBeenCalled();
                expect(fixture.debugElement.query(By.css('#cancel-order-dialog'))).toBeTruthy();
            }

            function clickContinueButton() {
                expect(continueButton).toBeTruthy();
                continueButton.nativeElement.click();
                expect(component.form).toBeNull();
                expect(component.cancelInventoryOrder).toHaveBeenCalled();
                expect(messageFacade.addMessage).toHaveBeenCalledWith({
                    message: `Order number ${testInventoryOrder.id.number} has been cancelled.`,
                    severity: 'success',
                });
                expectNavigateToSearchPage();
                expect(component.isLoading).toBeFalsy();
                expect(component.cancelDialog.close).toHaveBeenCalled();
            }

            describe.each`
                cancelOrder
                ${true}
                ${false}
            `('Cancel Order Dialog', ({ cancelOrder }) => {
                it(`should ${cancelOrder ? '' : 'not '}cancel the order`, fakeAsync(() => {
                    clickCancelOrderButton();

                    if (cancelOrder) {
                        clickContinueButton();
                    } else {
                        expect(cancelButton).toBeTruthy();
                        cancelButton.nativeElement.click();
                        expect(component.closeCancelOrderDialog).toHaveBeenCalled();
                        expect(component.isLoading).toBeFalsy();
                        expect(component.cancelDialog.close).toHaveBeenCalled();
                    }
                }));
            });

            it('should not show unsaved changes prompt if the form is dirty and cancelling an order', fakeAsync(() => {
                component.form.markAsDirty();
                expect(component.unsavedChanges).toBeTruthy();

                clickCancelOrderButton();
                clickContinueButton();
                expect(component.unsavedChanges).toBeFalsy();
            }));

            it('should display the loading overlay while cancel is occurring', fakeAsync(() => {
                const apiSubject = new Subject();
                jest.spyOn(component.inventoryOrderFacade, 'cancelInventoryOrder').mockReturnValue(apiSubject);
                clickCancelOrderButton();
                continueButton.nativeElement.click();
                fixture.detectChanges();

                const loadingOverlay: MockLoadingOverlayComponent = fixture.debugElement.query(
                    By.directive(MockLoadingOverlayComponent)
                ).componentInstance;
                expect(loadingOverlay.loading).toBeTruthy();

                apiSubject.next();
                tick(600);
                fixture.detectChanges();

                expect(loadingOverlay.loading).toBeFalsy();
            }));

            it('should close the cancel dialog box after continuing to cancel order', fakeAsync(() => {
                const apiSubject = new Subject();
                jest.spyOn(component.inventoryOrderFacade, 'cancelInventoryOrder').mockReturnValue(apiSubject);
                clickCancelOrderButton();
                continueButton.nativeElement.click();
                tick(600);
                fixture.detectChanges();
                expect(component.cancelDialog.close).toHaveBeenCalled();
            }));
        });

        describe('with finalize button', () => {
            beforeEach(fakeAsync(() => {
                jest.spyOn(component.finalizeDialog, 'open');
                jest.spyOn(component.finalizeDialog, 'close');
                jest.spyOn(component, 'finalize');
                jest.spyOn(component.messageFacade, 'addMessage');
                jest.spyOn(component.finalizeFacade, 'save');
                jest.spyOn(inventoryOrderFacade, 'finalize').mockReturnValue(of({}));
                initialize('edit');
            }));

            it('should prompt user to confirm finalization', () => {
                // open dialog
                fixture.debugElement.query(By.css('#finalize-order-action')).nativeElement.click();
                fixture.detectChanges();

                // validate that dialog was opened
                expect(component.finalizeDialog.open).toHaveBeenCalled();
            });

            it('should close prompt after cancelling finalization', () => {
                // open dialog
                fixture.debugElement.query(By.css('#finalize-order-action')).nativeElement.click();
                fixture.detectChanges();

                // validate that button had appeared
                expect(component.finalizeDialog.open).toHaveBeenCalled();
                const cancelButton = fixture.debugElement.query(By.css('#finalize-cancel-button'));
                expect(cancelButton).toBeTruthy();
                // click on cancel button
                cancelButton.nativeElement.click();
                fixture.detectChanges();

                // validate that dialog was closed
                expect(component.finalizeDialog.close).toHaveBeenCalled();
            });

            it('should call the inventoryOrderFacade to finalize the order after confirming', fakeAsync(() => {
                // open dialog
                fixture.debugElement.query(By.css('#finalize-order-action')).nativeElement.click();
                fixture.detectChanges();
                // continue past dialog
                fixture.debugElement.query(By.css('#finalize-continue-button')).nativeElement.click();
                tick(600); // tick to account for debounce time and button timeout to re-enable
                fixture.detectChanges();
                // validate that order calls facade to finalize
                expect(component.finalize).toHaveBeenCalled();
                expect(component.finalizeFacade.save).toHaveBeenCalledWith(
                    component.form,
                    testInventoryOrder,
                    expect.anything() //routing testing in another test
                );
                expect(inventoryOrderFacade.finalize).toHaveBeenCalledWith(
                    Object.assign({ ...testInventoryOrder }, component.form.value)
                );
                // validate that success message displays
                expect(component.messageFacade.addMessage).toHaveBeenCalledWith({
                    message: `Inventory Order ${testInventoryOrder.id.number} finalized successfully`,
                    severity: 'info',
                });
            }));

            it('should navigate the user back to the search page', fakeAsync(() => {
                // open dialog
                jest.spyOn(routerService, 'navigateToSearchPage');
                fixture.debugElement.query(By.css('#finalize-order-action')).nativeElement.click();
                fixture.detectChanges();
                // continue past dialog
                fixture.debugElement.query(By.css('#finalize-continue-button')).nativeElement.click();
                tick(600); // tick to account for debounce time and button timeout to re-enable
                fixture.detectChanges();
                expect(routerService.navigateToSearchPage).toHaveBeenCalled();
            }));

            describe.each`
                disabled
                ${true}
                ${false}
            `('when form is', ({ disabled }) => {
                it(`${disabled ? 'invalid' : 'valid'} then the button should be ${
                    disabled ? 'disabled' : 'enabled'
                }`, () => {
                    if (disabled) {
                        component.form.setControlValue('comments', 'a'.repeat(256));
                        fixture.detectChanges();
                    }
                    expect(fixture.debugElement.query(By.css('#finalize-order-action')).nativeElement.disabled).toBe(
                        disabled
                    );
                });
            });
        });
    });

    describe.each`
        accessMode | expectedContent
        ${'edit'}  | ${'Are you sure you want to finalize order number 0?'}
        ${'add'}   | ${'Are you sure you want to finalize the order?'}
    `('finalize dialog content in $accessMode mode', ({ accessMode, expectedContent }) => {
        it('should prompt the user for confirmation when finalizing', fakeAsync(() => {
            initialize(accessMode);
            // open finalize dialog
            fixture.debugElement.query(By.css('#finalize-order-dialog')).injector.get(MockDialogComponent).open();
            // find it's content div's inner html
            const dialogContent: string = fixture.nativeElement.querySelector('#finalize-confirmation').innerHTML;
            // trim extra spaces and verify
            expect(dialogContent.trim()).toEqual(expectedContent);
        }));
    });

    describe('generateOrder button', () => {
        beforeEach(() => jest.spyOn(component, 'generateOrder').mockImplementation());

        describe.each`
            accessMode | isOrderGenerated | rendered
            ${'add'}   | ${true}          | ${false}
            ${'add'}   | ${false}         | ${true}
            ${'edit'}  | ${true}          | ${false}
            ${'edit'}  | ${false}         | ${false}
            ${'view'}  | ${true}          | ${false}
            ${'view'}  | ${false}         | ${false}
        `('generate order button rendering', ({ accessMode, isOrderGenerated, rendered }) => {
            it(`should ${
                rendered ? '' : 'not '
            }be rendered if accessMode=${accessMode} and isOrderGenerated=${isOrderGenerated}`, () => {
                initialize(accessMode, testInventoryOrder, false);
                component.isOrderGenerated = isOrderGenerated;
                fixture.detectChanges();

                const selectAndGo = getSelectAndGoComponent();
                expect(selectAndGo.goButtonDisplayed).toBe(rendered);
            });
        });

        describe.each`
            isGeneratingOrder | vendor                     | disabled
            ${true}           | ${null}                    | ${true}
            ${false}          | ${null}                    | ${true}
            ${true}           | ${{ code: 'TEST_VENDOR' }} | ${true}
            ${false}          | ${{ code: 'TEST_VENDOR' }} | ${false}
        `('generate order button disabling', ({ isGeneratingOrder, vendor, disabled }) => {
            it(`should be ${
                disabled ? 'disabled' : 'enabled'
            } if isGeneratingOrder=${isGeneratingOrder} and vendor=${vendor}`, () => {
                initialize('add', testInventoryOrder, false); // only applicable to add
                component.form.setControlValue('store', { code: 'TEST_STORE' });
                component.form.setControlValue('vendor', vendor);
                component.isGeneratingOrder = isGeneratingOrder;
                fixture.detectChanges();

                const selectAndGo = getSelectAndGoComponent();
                expect(selectAndGo.goButtonDisabled).toEqual(disabled);
            });
        });
    });

    describe('with inventory order product table', () => {
        describe('with "Remove Products" button', () => {
            const getRowsWithCheckboxes = () => fixture.nativeElement.querySelectorAll('mat-checkbox');
            const getRemoveProductsButton = () => fixture.nativeElement.querySelector('#remove-products-button');

            const selectProduct = (checkbox: number) => {
                // precheck: expect one header, three products
                const productRows = getRowsWithCheckboxes();
                expect(productRows.length).toBe(4);

                // click checkbox on `checkbox`th row
                productRows[checkbox].querySelector('input').click();
                fixture.detectChanges();
            };

            it('should be disabled there are no products selected', fakeAsync(() => {
                initialize('edit');
                expect(getRemoveProductsButton().disabled).toEqual(true);
            }));

            it('should be enabled if products are selected', fakeAsync(() => {
                initialize('edit');
                selectProduct(0);
                expect(getRemoveProductsButton().disabled).toEqual(false);
            }));

            describe.each`
                accessMode | status         | isRendered | expectedCheckboxes
                ${'view'}  | ${'OPEN'}      | ${false}   | ${0}
                ${'view'}  | ${'FINALIZED'} | ${false}   | ${0}
                ${'edit'}  | ${'OPEN'}      | ${true}    | ${4}
                ${'edit'}  | ${'FINALIZED'} | ${false}   | ${0}
            `(`while in accessMode $accessMode`, ({ accessMode, status, isRendered, expectedCheckboxes }) => {
                it(`should ${
                    isRendered ? '' : 'not '
                }render #${expectedCheckboxes} checkboxes and "Remove products" button while order has a status of ${status}`, fakeAsync(() => {
                    initialize(accessMode, {
                        ...testInventoryOrder,
                        status: { code: status },
                        inventoryOrderProducts: testUnsortedInventoryOrderProducts,
                    });

                    // validate that button and checkboxes are rendered as needed for status and access mode
                    expect(getRowsWithCheckboxes().length).toBe(expectedCheckboxes);
                    if (isRendered) {
                        expect(getRemoveProductsButton()).toBeTruthy();
                    } else {
                        expect(getRemoveProductsButton()).toBeFalsy();
                    }
                }));
            });

            /** Add mode test is split out since they require additional mocking */
            describe('while in add mode', () => {
                it(`should render checkboxes and "Remove products" button`, fakeAsync(() => {
                    // mock generate order products for add mode
                    const generateOrderResponse = new Subject<InventoryOrderProduct[]>();
                    jest.spyOn(inventoryOrderFacade, 'generateOrderProducts').mockReturnValue(generateOrderResponse);
                    jest.spyOn(vendorFacade, 'findByStore').mockReturnValue(of([]));

                    // initialize page and assign store and vendor values
                    initialize('add');
                    component.form.setControlValue('store', { code: 'TEST_STORE' });
                    component.form.setControlValue('vendor', { code: 'TEST_VENDOR' });

                    // trigger generate order and load table
                    component.generateOrder();
                    generateOrderResponse.next(testUnsortedInventoryOrderProducts);
                    tick(300); // tick through form initialization to account for debounce time
                    fixture.detectChanges();
                    tick(100); // clear timers in queue

                    // validate that button and checkboxes are rendered as needed for status and access mode
                    expect(getRowsWithCheckboxes().length).toBe(4);
                    expect(getRemoveProductsButton()).toBeTruthy();
                }));
            });

            describe.each`
                selectedCheckboxes | expectedRemainingRowCount | expectedRemainingCodes
                ${[0]}             | ${0}                      | ${[]}
                ${[1]}             | ${3}                      | ${['02', '00']}
                ${[2]}             | ${3}                      | ${['01', '00']}
                ${[3]}             | ${3}                      | ${['01', '02']}
                ${[1, 2]}          | ${2}                      | ${['00']}
                ${[2, 3]}          | ${2}                      | ${['01']}
                ${[1, 3]}          | ${2}                      | ${['02']}
            `('with checkboxes', ({ selectedCheckboxes, expectedRemainingRowCount, expectedRemainingCodes }) => {
                it(`should have ${expectedRemainingRowCount} rows remaining, including the header, when checkboxes #${selectedCheckboxes} is clicked and "Remove Product(s)" button is clicked `, fakeAsync(() => {
                    initialize('edit');
                    // precheck: expect all three products to be present
                    expect(fixture.nativeElement.querySelector('#productCode-0').textContent).toEqual('01');
                    expect(fixture.nativeElement.querySelector('#productCode-1').textContent).toEqual('02');
                    expect(fixture.nativeElement.querySelector('#productCode-2').textContent).toEqual('00');

                    // select and remove product(s)
                    selectedCheckboxes.forEach((selectedCheckboxIndex: number) => selectProduct(selectedCheckboxIndex));
                    getRemoveProductsButton().click();
                    fixture.detectChanges();
                    tick(100); // clear timers in queue

                    // validate record(s) were removed from table
                    expect(getRowsWithCheckboxes().length).toBe(expectedRemainingRowCount);
                    // since rows are in fixed order (first row is always 0, then 1, etc) and test data could change, iterate through test data by index
                    for (let rowIndex = 0; rowIndex < testUnsortedInventoryOrderProducts.length; rowIndex++) {
                        // if there are expected codes, validate row exists
                        if (rowIndex < expectedRemainingCodes.length) {
                            // expect rows to be present with accompanying product code
                            expect(fixture.nativeElement.querySelector(`#productCode-${rowIndex}`).textContent).toEqual(
                                expectedRemainingCodes[rowIndex]
                            );
                        } else {
                            // expect row to not be present
                            expect(fixture.nativeElement.querySelector(`#productCode-${rowIndex}`)).toBeFalsy();
                        }
                    }
                }));
            });

            it('should mark product form group as dirty when removing a product', fakeAsync(() => {
                // initialize and prevalidate
                initialize('edit');
                expect(component.form.dirty).toEqual(false);

                // select and remove product
                selectProduct(1);
                getRemoveProductsButton().click();
                fixture.detectChanges();
                tick(100); // clear timers in queue

                // validate that form is dirty
                expect(component.form.dirty).toEqual(true);
            }));

            describe('while sorting by headers columns', () => {
                it.each`
                    columnName             | firstRowValue
                    ${'category'}          | ${'category-1'}
                    ${'productCode'}       | ${'01'}
                    ${'productDesc'}       | ${'product-1'}
                    ${'sapNumber'}         | ${'1'}
                    ${'unit'}              | ${'UOM2'}
                    ${'minQuantity'}       | ${'1'}
                    ${'quantityPerPack'}   | ${'1'}
                    ${'averageDailyUsage'} | ${'30.80'}
                    ${'suggestedQuantity'} | ${'1'}
                    ${'quantityOnHand'}    | ${'1'}
                    ${'quantityOnOrder'}   | ${'1'}
                    ${'orderQuantity'}     | ${'1.00'}
                `(
                    `should delete products when sorted by $columnName and keep sort integrity after removed`,
                    fakeAsync(({ columnName, firstRowValue }) => {
                        initialize('edit', {
                            ...testInventoryOrder,
                            inventoryOrderProducts: testUnsortedInventoryOrderProducts,
                        });
                        // find header and click. using nativeElement querySelector due to jest's shallow dom rendering
                        const headerButton = fixture.nativeElement.querySelector(`#${columnName}Header`);
                        headerButton.click();
                        fixture.detectChanges();

                        // click on first option
                        selectProduct(1);
                        fixture.detectChanges();

                        // remove selected product
                        getRemoveProductsButton().click();
                        tick(600);
                        fixture.detectChanges();
                        tick(600); // clear timers in queue

                        // validate that the expected product was removed
                        expect(component.form.getArrayValue('inventoryOrderProducts')).not.toContain(
                            testInventoryOrderProduct0
                        );
                        // validate that sorting is respected after product removal
                        const firstRow = fixture.nativeElement.querySelector(`#${columnName}-0`);
                        const firstRowText = columnName !== 'orderQuantity' ? firstRow.textContent : firstRow.value;
                        expect(firstRowText.trim()).toEqual(firstRowValue);
                    })
                );
            });
        });

        describe('form validation', () => {
            beforeEach(() => {
                jest.spyOn(vendorFacade, 'findByStores').mockReturnValue(of([testInventoryOrder.vendor]));
                jest.spyOn(receiptOfMaterialFacade, 'findOpenReceiptsOfMaterial').mockReturnValue(of([]));
            });

            const generateOrder = () => {
                initialize('add');
                component.form.setControlValue('store', testInventoryOrder.store);
                tick(200);
                component.form.setControlValue('vendor', testInventoryOrder.vendor);
                clickGenerateOrder();
                flush();
            };

            it('should be invalid if all products have been removed from a generated order', fakeAsync(async () => {
                jest.spyOn(component.inventoryOrderFacade, 'generateOrderProducts').mockReturnValueOnce(
                    of([testInventoryOrderProduct1])
                );
                generateOrder();
                // Expect form to be initially valid after just generating products
                expect(component.form.invalid).toBeFalsy();
                await check('#vui-table-toggle mat-checkbox'); // check the master checkbox
                await click('#remove-products-button'); // click remove products btn
                // Expect form to be invalid after removing all products
                expect(component.form.invalid).toBeTruthy();
            }));

            it('should be invalid if there are no suggested products to order and no product has been added', fakeAsync(async () => {
                jest.spyOn(component.inventoryOrderFacade, 'generateOrderProducts').mockReturnValueOnce(
                    of([]) // nothing suggested to order
                );
                generateOrder();
                // Expect form to be initially invalid after generating an order with no products
                expect(component.form.invalid).toBeTruthy();
            }));
        });
    });

    describe('product add input', () => {
        const productAddInputComponent = () => {
            return fixture.debugElement.query(By.css('#product-add-input'))
                .componentInstance as ProductAddInputComponent;
        };
        const addedProducts = [{ id: 100, code: 'P100' }];

        it('should accept isLoading as a parameter for addDisabled', fakeAsync(() => {
            initialize('edit');
            expect(productAddInputComponent().addDisabled).toEqual(component.isLoading);

            component.isLoading = true;
            fixture.detectChanges();

            expect(productAddInputComponent().addDisabled).toEqual(component.isLoading);
        }));

        it('should accept the existing product codes as a parameter for existingProductCodes', fakeAsync(() => {
            initialize('edit');
            expect(productAddInputComponent().existingProductCodes).toContainEqual(
                testInventoryOrderProduct0.product.code
            );
            expect(productAddInputComponent().existingProductCodes).toContainEqual(
                testInventoryOrderProduct1.product.code
            );
            expect(productAddInputComponent().existingProductCodes).toContainEqual(
                testInventoryOrderProduct2.product.code
            );
        }));

        it('should accept a search function as a parameter for searchFn', fakeAsync(() => {
            initialize('edit');
            expect(productAddInputComponent().searchFn).toEqual(component.searchProductsFn);
        }));

        it('should output product information to the addRequestedProducts method', fakeAsync(() => {
            jest.spyOn(component, 'addRequestedProducts');
            jest.spyOn(component, 'generateProducts').mockImplementationOnce(() => {});
            initialize('edit');
            expect(component.isLoading).toEqual(false);

            productAddInputComponent().products.emit(addedProducts);

            expect(component.isLoading).toEqual(true);
            expect(component.addRequestedProducts).toHaveBeenCalledWith(addedProducts);
            expect(component.generateProducts).toHaveBeenCalledWith(
                component.form.getArray('inventoryOrderProducts').getRawValue(),
                addedProducts.map((p) => p.code)
            );
        }));

        it('should not be displayed if not in edit mode', fakeAsync(() => {
            initialize('view');
            expect(fixture.debugElement.query(By.css('#product-add-input'))).toBeNull();
        }));

        it('should not be displayed if not in add mode and the order has been generated', fakeAsync(() => {
            initialize('add');
            expect(component.isOrderGenerated).toEqual(false);
            expect(fixture.debugElement.query(By.css('#product-add-input'))).toBeNull();

            component.isOrderGenerated = true;
            fixture.detectChanges();
            tick(100); // clear timers in queue

            expect(fixture.debugElement.query(By.css('#product-add-input'))).not.toBeNull();
        }));

        it('should mark product form group as dirty when adding a product', fakeAsync(() => {
            jest.spyOn(component, 'addRequestedProducts');
            jest.spyOn(component, 'generateProducts').mockImplementationOnce(() => {});
            initialize('edit');
            expect(component.form.dirty).toEqual(false);
            expect(component.unsavedChanges).toBeFalsy();

            // add a product
            productAddInputComponent().products.emit(addedProducts);

            // validate that form is dirty
            expect(component.form.dirty).toEqual(true);
            expect(component.unsavedChanges).toBeTruthy();
        }));

        it('should not add a duplicate product', fakeAsync(() => {
            const generateOrderResponse = new Subject<InventoryOrderProduct[]>();
            const testInventoryOrderProduct5: InventoryOrderProduct = {
                secondLevelCategory: { id: 0, code: 'CAT0', description: 'category-0', version: 0 },
                product: { id: 5, code: '05', description: 'product-0', version: 0, sapNumber: '0' },
                uom: { id: 0, code: 'UOM1', description: 'Unit', version: 0 },
                minimumOrderQuantity: 0,
                quantity: 0,
                suggestedQuantity: 0,
                quantityPerPack: 0,
                quantityOnHand: 0,
                quantityOnOrder: 0,
                averageDailyUsage: 1.23,
            };

            jest.spyOn(component, 'addRequestedProducts');
            jest.spyOn(inventoryOrderFacade, 'generateOrderProducts').mockReturnValue(generateOrderResponse);
            initialize('edit');

            const addProductsComponent = fixture.debugElement.query(By.css('#product-add-input'));
            addProductsComponent.triggerEventHandler('products', [
                { code: `${testInventoryOrderProduct5.product.code}, ${testInventoryOrderProduct0.product.code}` },
            ]); // add a product
            generateOrderResponse.next([testInventoryOrderProduct0, testInventoryOrderProduct5]);
            fixture.detectChanges();
            flush();
            expect(component.messageFacade.addMessage).toHaveBeenCalledWith({
                severity: 'error',
                message: `Product(s) ${testInventoryOrderProduct0.product.code} already added.`,
                hasTimeout: true,
            });
            expect(component.existingProductCodes).toContainEqual(testInventoryOrderProduct0.product.code);
            expect(component.existingProductCodes).toContainEqual(testInventoryOrderProduct5.product.code);
        }));
    });

    describe('print', () => {
        describe.each`
            accessMode | isOrderGenerated | rendered
            ${'add'}   | ${true}          | ${true}
            ${'add'}   | ${false}         | ${false}
            ${'edit'}  | ${true}          | ${true}
            ${'edit'}  | ${false}         | ${true}
            ${'view'}  | ${true}          | ${true}
            ${'view'}  | ${false}         | ${true}
        `('rendered', ({ accessMode, isOrderGenerated, rendered }) => {
            it(`should ${
                rendered ? '' : 'not '
            }render when accessMode=${accessMode} and isOrderGenerated=${isOrderGenerated}`, fakeAsync(() => {
                component.isOrderGenerated = isOrderGenerated;
                initialize(accessMode);
                const printBtn = fixture.debugElement.query(By.directive(PrintButtonComponent));
                if (rendered) {
                    expect(printBtn).not.toBeNull();
                } else {
                    expect(printBtn).toBeNull();
                }
            }));
        });
    });
});
