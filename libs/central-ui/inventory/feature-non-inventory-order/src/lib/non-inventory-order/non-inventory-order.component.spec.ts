import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HttpClient } from '@angular/common/http';
import { Component, DebugElement, EventEmitter, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCheckboxHarness } from '@angular/material/checkbox/testing';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, ActivatedRouteSnapshot, Router, convertToParamMap } from '@angular/router';
import { NonInventoryItemFacade } from '@vioc-angular/central-ui/inventory/data-access-non-inventory-item';
import {
    NonInventoryCatalog,
    NonInventoryOrder,
    NonInventoryOrderFacade,
    NonInventoryOrderItem,
} from '@vioc-angular/central-ui/inventory/data-access-non-inventory-order';
import { ResourceFacade, Resources } from '@vioc-angular/central-ui/organization/data-access-resources';
import { RouterService } from '@vioc-angular/central-ui/util-router';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { QuerySearch } from '@vioc-angular/shared/common-api-models';
import { CommonFunctionalityModule, Described, formatMoment } from '@vioc-angular/shared/common-functionality';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { UiActionBarModule } from '@vioc-angular/shared/ui-action-bar';
import { UiAuditModule } from '@vioc-angular/shared/ui-audit';
import { UiButtonModule } from '@vioc-angular/shared/ui-button';
import { UiCurrencyPrefixModule } from '@vioc-angular/shared/ui-currency-prefix';
import { MockDialogComponent, UiDialogMockModule } from '@vioc-angular/shared/ui-dialog';
import { MockFilteredInputComponent, UiFilteredInputMockModule } from '@vioc-angular/shared/ui-filtered-input';
import { UiLoadingMockModule } from '@vioc-angular/shared/ui-loading';
import { UiSelectAndGoMockModule } from '@vioc-angular/shared/ui-select-and-go';
import { GATEWAY_TOKEN, ResponseEntity } from '@vioc-angular/shared/util-api';
import { FormFactory, UtilFormModule } from '@vioc-angular/shared/util-form';
import {
    expectInput,
    getApplyActionButton,
    getCancelActionButton,
    getSaveActionButton,
} from '@vioc-angular/test/util-test';
import { Observable, ReplaySubject, Subject, of } from 'rxjs';
import { NonInventoryOrderForms } from '../non-inventory-order-module-forms';
import { NonInventoryOrderComponent } from './non-inventory-order.component';
import moment = require('moment');

describe('NonInventoryOrderComponent', () => {
    let component: NonInventoryOrderComponent;
    let fixture: ComponentFixture<NonInventoryOrderComponent>;
    let nonInventoryOrderFacade: NonInventoryOrderFacade;
    let nonInventoryItemFacade: NonInventoryItemFacade;
    let resourceFacade: ResourceFacade;
    let componentDestroyed: ReplaySubject<any>;
    let formFactory: FormFactory;
    let router: Router;
    let loader: HarnessLoader;
    let routerService: RouterService;
    const routeParams = new Subject();

    @Component({
        selector: 'vioc-angular-non-inventory-item-add-input',
        template: '',
    })
    class MockNonInventoryItemAddInputComponent {
        @Input() addDisabled: boolean;
        @Input() existingItemNumbers = [];
        @Input() searchFn: (querySearch: QuerySearch) => Observable<ResponseEntity<NonInventoryCatalog>>;
        @Output() items = new EventEmitter<{ id?: number; number: string }[]>();
    }

    // default test data
    const testNonInventoryOrderItem2: NonInventoryOrderItem = {
        nonInventoryCatalog: { id: 2, number: '02', description: 'product-2', minimumQuantity: 1, maximumQuantity: 2 },
        uom: { id: 2, code: 'UOM2', description: 'Unit', version: 0 },
        quantity: 1,
    };
    const testNonInventoryOrderItem1: NonInventoryOrderItem = {
        nonInventoryCatalog: { id: 1, number: '01', description: 'product-1', minimumQuantity: 1, maximumQuantity: 2 },
        uom: { id: 1, code: 'UOM2', description: 'Unit', version: 0 },
        quantity: 1,
    };
    const testNonInventoryOrderItem0: NonInventoryOrderItem = {
        nonInventoryCatalog: { id: 0, number: '00', description: 'product-0', minimumQuantity: 1, maximumQuantity: 2 },
        uom: { id: 0, code: 'UOM1', description: 'Unit', version: 0 },
        quantity: 1,
    };

    const testNonInventoryOrderCatalog2: NonInventoryCatalog = {
        id: 2,
        number: '02',
        description: 'product-2',
        uom: { id: 3, code: '003', description: 'uom' },
    };
    const testNonInventoryOrderCatalog1: NonInventoryCatalog = {
        id: 1,
        number: '01',
        description: 'product-1',
        uom: { id: 2, code: '002', description: 'uom0' },
    };
    const testNonInventoryOrderCatalog0: NonInventoryCatalog = {
        id: 0,
        number: '00',
        description: 'product-0',
        uom: { id: 1, code: '001', description: 'uom0' },
    };
    const testUnsortedInventoryOrderItems: NonInventoryOrderItem[] = [
        testNonInventoryOrderItem1,
        testNonInventoryOrderItem2,
        testNonInventoryOrderItem0,
    ];
    const testNonInventoryOrder: NonInventoryOrder = {
        id: { orderNumber: 0, storeId: 0 },
        version: 0,
        store: { id: 0, code: 'st00', description: 'store', version: 0 },
        status: { id: 0, code: 'OPEN', description: 'Open', version: 0 },
        nonInventoryOrderItems: testUnsortedInventoryOrderItems,
        createdByEmployee: { name: 'test' },
        updatedByEmployee: { name: 'test' },
        comments: 'test comment',
        updatedBy: '',
        updatedOn: '2021-01-01',
        orderNumber: 1,
        orderDate: '2021-01-01',
        createdBy: '',
        exported: true,
    };
    const company: Described = {
        id: 2,
        code: '001',
    };
    // Json from an actual response
    const newProduct = {
        uom: { description: 'EA', code: 'EACH', version: 2, id: 2479 },
        quantityOnHand: 2.0,
        averageDailyUsage: 0.0,
        nonInventoryCatalog: { code: 'VA203', description: 'VAL VA203 AIR FILTER', sapNumber: '754794', id: 12670 },
        minimumOrderQuantity: 1,
        quantity: 0,
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [NonInventoryOrderComponent, MockNonInventoryItemAddInputComponent],
            imports: [
                ReactiveFormsModule,
                MatButtonModule,
                MatCheckboxModule,
                MatFormFieldModule,
                MatIconModule,
                MatInputModule,
                MatOptionModule,
                MatPaginatorModule,
                MatSelectModule,
                MatSortModule,
                MatTableModule,
                MatTooltipModule,
                MatDatepickerModule,
                MatMomentDateModule,
                NoopAnimationsModule,
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
                    useValue: { params: routeParams, parent: '/inventory/non-inventory-order' },
                },
                { provide: GATEWAY_TOKEN, useValue: '//gateway/' },
                { provide: HttpClient, useValue: { get: jest.fn(() => of()) } },
                { provide: MessageFacade, useValue: { addMessage: jest.fn() } },
                { provide: Router, useValue: { navigate: jest.fn() } },
                { provide: RouterService, useValue: { navigateToSearchPage: jest.fn(), back: jest.fn() } },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        NonInventoryOrderForms.registerForms(TestBed.inject(FormFactory), TestBed.inject(FormBuilder));
        fixture = TestBed.createComponent(NonInventoryOrderComponent);
        formFactory = TestBed.inject(FormFactory);
        loader = TestbedHarnessEnvironment.loader(fixture);
        component = fixture.componentInstance;
        component.company = company;
        // API Facade
        nonInventoryItemFacade = component.nonInventoryItemFacade;
        nonInventoryOrderFacade = component.nonInventoryOrderFacade;
        resourceFacade = component['resourceFacade'];
        router = TestBed.inject(Router);
        routerService = TestBed.inject(RouterService);
    });

    /** Initialize the the component with the given access mode, store code and order number */
    const initialize = (
        accessMode: 'add' | 'view' | 'edit',
        model: NonInventoryOrder = testNonInventoryOrder,
        andFlush = true,
        queryParams = {}
    ) => {
        const route = TestBed.inject(ActivatedRoute);
        route.snapshot = {
            paramMap: convertToParamMap({
                accessMode: accessMode,
                storeCode: model.store?.code,
                orderNumber: model.id?.orderNumber,
            }),
            queryParamMap: convertToParamMap(queryParams),
        } as ActivatedRouteSnapshot;
        const nonInventoryOrder = { ...new NonInventoryOrder(), ...model };
        jest.spyOn(nonInventoryOrderFacade, 'findNonInventoryOrder').mockReturnValue(of(nonInventoryOrder));
        fixture.detectChanges();
        if (andFlush) {
            flush();
        }
    };

    const expectNavigateToSearchPage = () =>
        expect(router.navigate).toHaveBeenCalledWith(['search'], {
            relativeTo: TestBed.inject(ActivatedRoute).parent,
        });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        beforeEach(() => (componentDestroyed = new ReplaySubject(1)));
        afterEach(() => componentDestroyed.next());
        it('should throw an error when an unhandled access mode is specified', () => {
            // Assuming add-like is unsupported
            TestBed.inject(ActivatedRoute).snapshot = {
                paramMap: convertToParamMap({ accessMode: 'add-like' }),
            } as ActivatedRouteSnapshot;
            expect(() => fixture.detectChanges()).toThrowError('Unhandled Access Mode: add-like');
        });
        it('should automatically select the store for add if only one is available', fakeAsync(() => {
            const storeSubject = new Subject<Resources>();
            jest.spyOn(resourceFacade, 'findStoresByRoles').mockReturnValue(storeSubject);
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
        }));

        describe('in view mode', () => {
            it('should load a disabled form', fakeAsync(() => {
                initialize('view');
                expect(component.form.enabled).toBeFalsy();
            }));

            describe.each`
                field             | value
                ${'order-number'} | ${testNonInventoryOrder.orderNumber.toString()}
                ${'order-date'}   | ${formatMoment(testNonInventoryOrder.orderDate)}
                ${'created-by'}   | ${testNonInventoryOrder.createdByEmployee.name}
                ${'finalized-by'} | ${testNonInventoryOrder.updatedByEmployee.name}
                ${'finalized-on'} | ${formatMoment(testNonInventoryOrder.updatedOn)}
            `('disabled fields', ({ field, value }) => {
                it(`should display a disabled input for ${field} as ${value}`, fakeAsync(() => {
                    initialize('view', {
                        ...testNonInventoryOrder,
                        status: { code: 'FINALIZED', description: 'test' },
                    });
                    expectInput(fixture, { id: `${field}-input` })
                        .toHaveValue(value)
                        .toBeEnabled(false);
                }));
            });

            describe.each`
                id               | controlName | options                          | editable | placeHolder | displayFn
                ${'store-input'} | ${'store'}  | ${[testNonInventoryOrder.store]} | ${false} | ${'Store'}  | ${Described.codeAndDescriptionMapper}
            `('dropdowns', ({ id, controlName, options, editable, placeHolder, displayFn }) => {
                it(`should have the expected configuration for ${controlName}`, fakeAsync(() => {
                    initialize('view');
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

            describe.each`
                code           | status
                ${'OPEN'}      | ${'Open'}
                ${'FINALIZED'} | ${'Finalized'}
            `('displaying finalized information', ({ code, status }) => {
                it(`should${
                    status === 'Finalized' ? ' ' : ' not '
                }display finalized information if status is ${code}`, fakeAsync(() => {
                    initialize('view', {
                        ...testNonInventoryOrder,
                        status: { code: code, description: status },
                    });

                    const finalizedByInput = fixture.debugElement.query(By.css('#finalized-by-input'));
                    const finalizedOnInput = fixture.debugElement.query(By.css('#finalized-on-input'));
                    if (status === 'Finalized') {
                        expect(finalizedByInput.nativeElement.value).toEqual(
                            testNonInventoryOrder.updatedByEmployee.name
                        );
                        expect(finalizedOnInput.nativeElement.value).toEqual(
                            formatMoment(testNonInventoryOrder.orderDate)
                        );
                    } else {
                        expect(finalizedByInput).toBeFalsy();
                        expect(finalizedOnInput).toBeFalsy();
                    }
                }));
            });
        });

        describe('in edit mode', () => {
            it('should load a enabled form', fakeAsync(() => {
                initialize('edit', {
                    ...testNonInventoryOrder,
                    status: { code: 'OPEN', description: 'test' },
                });
                expect(component.form.enabled).toBeTruthy();
            }));

            describe.each`
                status
                ${'FINALIZED'}
            `('unmodifiable transfer', ({ status }) => {
                it(`should have a disabled form when the transfer status is ${status}`, fakeAsync(() => {
                    const unmodifiableNonInventoryOrder = {
                        ...testNonInventoryOrder,
                        status: { id: 88, code: status, description: 'test status', version: 0 },
                    };
                    initialize('edit', unmodifiableNonInventoryOrder);

                    expect(component.accessMode).toEqual(AccessMode.VIEW);
                    expect(component.form.enabled).toBe(false);
                }));
            });

            describe.each`
                field             | value
                ${'order-number'} | ${testNonInventoryOrder.orderNumber.toString()}
                ${'order-date'}   | ${formatMoment(testNonInventoryOrder.orderDate)}
                ${'created-by'}   | ${testNonInventoryOrder.createdByEmployee.name}
                ${'finalized-by'} | ${testNonInventoryOrder.updatedByEmployee.name}
                ${'finalized-on'} | ${formatMoment(testNonInventoryOrder.updatedOn)}
            `('disabled fields', ({ field, value }) => {
                it(`should display a disabled input for ${field} as ${value}`, fakeAsync(() => {
                    initialize('edit', {
                        ...testNonInventoryOrder,
                        status: { code: 'FINALIZED', description: 'test' },
                    });
                    expectInput(fixture, { id: `${field}-input` })
                        .toHaveValue(value)
                        .toBeEnabled(false);
                }));
            });
        });

        describe('in add mode', () => {
            beforeEach(fakeAsync(() => {
                jest.spyOn(resourceFacade, 'findStoresByRoles').mockReturnValue(
                    of({
                        resources: [
                            { id: 0, code: 'STORE1', description: 'store 1', version: 0 },
                            { id: 1, code: 'STORE2', description: 'store 2', version: 0 },
                        ],
                        allCompanies: false,
                    })
                );
                initialize('add', new NonInventoryOrder());
            }));

            describe('store selection', () => {
                it('should be disabled when a products are present', () => {
                    jest.spyOn(nonInventoryItemFacade, 'getItemDetails').mockReturnValue(
                        of([
                            {
                                id: 1,
                                number: 'TEST',
                                uom: { code: 'EACH' },
                            },
                        ])
                    );

                    component.form.getControl('store').patchValue(testNonInventoryOrder.store);
                    component.company = { id: 1, code: 'testCompany1', description: 'testDesc1' };
                    component.generateItems([], ['test1']);
                    fixture.detectChanges();
                    expect(component.isGeneratingOrder).toEqual(true);
                });

                it('should enabled when there are no products', () => {
                    component.form.setControl(
                        'nonInventoryOrderItems',
                        formFactory.array(
                            'NonInventoryOrderItem',
                            [
                                {
                                    ...new NonInventoryOrderItem(),
                                    nonInventoryCatalog: { code: 'TEST' },
                                    uom: { code: 'EACH' },
                                },
                            ],
                            componentDestroyed
                        )
                    );
                    component.removeItems();
                    fixture.detectChanges();
                    expect(component.isGeneratingOrder).toEqual(true);
                });

                it('should maintain selected status even when more products are added ', fakeAsync(async () => {
                    const newItems: NonInventoryOrderItem[] = [
                        {
                            ...new NonInventoryOrderItem(),
                            nonInventoryCatalog: { id: 1 },
                            uom: { code: 'EACH' },
                        },
                    ];
                    component.form.setControl(
                        'nonInventoryOrderItems',
                        formFactory.array(
                            'NonInventoryOrderItem',
                            [
                                {
                                    ...new NonInventoryOrderItem(),
                                    nonInventoryCatalog: { id: 2 },
                                    uom: { code: 'EACH' },
                                },
                            ],
                            componentDestroyed
                        )
                    );
                    // select and remove first product
                    (await loader.getHarness(MatCheckboxHarness.with({ selector: '#master-checkbox' }))).check();
                    flush();
                    fixture.detectChanges();
                    expect(component.selection.isEmpty()).toEqual(false);
                    component['addItemsToForm'](component.form.getControlValue('nonInventoryOrderItems'), newItems);
                    expect(component.form.getControlValue('nonInventoryOrderItems').length).toEqual(2);
                    expect(component.selection.selected.length).toEqual(1);
                    expect(component.selection.selected[0].value).toEqual(
                        component.form.getControlValue('nonInventoryOrderItems')[0]
                    );
                }));
            });
        });
    });

    describe('when saving', () => {
        const getSaveBtn = async () => loader.getHarness(MatButtonHarness.with({ selector: '#save-action' }));

        const getApplyBtn = async () => loader.getHarness(MatButtonHarness.with({ selector: '#apply-action' }));

        describe('in edit mode', () => {
            beforeEach(fakeAsync(() => {
                initialize('edit');
                jest.spyOn(nonInventoryOrderFacade, 'save').mockReturnValue(of({}));
                jest.spyOn(component.messageFacade, 'addMessage');
            }));

            describe('save button', () => {
                it('should call the inventoryTransferFacade to save and navigate back to the previous page', fakeAsync(async () => {
                    jest.spyOn(component.saveFacade, 'save');
                    (await getSaveBtn()).click();
                    tick(600); // tick to account for debounce time and button timeout to re-enable
                    flush();

                    expect(component.saveFacade.save).toHaveBeenCalledWith(
                        component.form,
                        testNonInventoryOrder,
                        component['route']
                    );
                    expect(nonInventoryOrderFacade.save).toHaveBeenCalledWith(testNonInventoryOrder);
                    expect(component.messageFacade.addMessage).toHaveBeenCalledWith({
                        message: `Non Inventory Order ${testNonInventoryOrder.id.orderNumber} saved successfully`,
                        severity: 'info',
                    });
                    expect(routerService.navigateToSearchPage).toHaveBeenCalled();
                }));

                it('should call the inventoryTransferFacade only once when clicked multiple times', fakeAsync(() => {
                    jest.spyOn(component.saveFacade, 'save');
                    const saveButton = getSaveActionButton(fixture);
                    saveButton.nativeElement.click();
                    saveButton.nativeElement.click();
                    saveButton.nativeElement.click();
                    tick(600); // tick to account for debounce time and button timeout to re-enable
                    fixture.detectChanges();

                    expect(component.saveFacade.save).toHaveBeenCalledWith(
                        component.form,
                        testNonInventoryOrder,
                        component['route']
                    );
                    expect(component.messageFacade.addMessage).toHaveBeenCalledTimes(1);
                    expect(nonInventoryOrderFacade.save).toHaveBeenCalledWith(testNonInventoryOrder);
                    expect(component.messageFacade.addMessage).toHaveBeenCalledWith({
                        message: `Non Inventory Order ${testNonInventoryOrder.id.orderNumber} saved successfully`,
                        severity: 'info',
                    });
                    expect(routerService.navigateToSearchPage).toHaveBeenCalled();
                }));
            });

            describe('apply button', () => {
                it('should call the inventoryTransferFacade to save and reload the component', fakeAsync(async () => {
                    jest.spyOn(component.saveFacade, 'apply');
                    jest.spyOn(component, 'ngOnInit').mockImplementation(() => {});
                    const currentForm = component.form;
                    (await getApplyBtn()).click();
                    tick(600); // tick to account for debounce time and button timeout to re-enable
                    flush();

                    expect(component.saveFacade.apply).toHaveBeenCalledWith(
                        currentForm,
                        testNonInventoryOrder,
                        expect.anything()
                    );
                    expect(nonInventoryOrderFacade.save).toHaveBeenCalledWith(testNonInventoryOrder);
                    expect(component.messageFacade.addMessage).toHaveBeenCalledWith({
                        message: `Non Inventory Order ${testNonInventoryOrder.id.orderNumber} saved successfully`,
                        severity: 'info',
                    });
                    expect(component.ngOnInit).toHaveBeenCalled();
                    expect(component.form).toBeFalsy();
                }));

                it('should call apply only once when clicked multiple times', fakeAsync(() => {
                    jest.spyOn(component.saveFacade, 'apply');
                    jest.spyOn(component, 'ngOnInit').mockImplementation(() => {});
                    const currentForm = component.form;
                    const applyButton = getApplyActionButton(fixture);
                    applyButton.nativeElement.click();
                    applyButton.nativeElement.click();
                    applyButton.nativeElement.click();
                    tick(600); //tick to account for debounce time and button timeout to re-enable
                    fixture.detectChanges();

                    expect(component.saveFacade.apply).toHaveBeenCalledTimes(1);
                    expect(component.saveFacade.apply).toHaveBeenCalledWith(
                        currentForm,
                        testNonInventoryOrder,
                        expect.anything()
                    );
                    expect(nonInventoryOrderFacade.save).toHaveBeenCalledWith(testNonInventoryOrder);
                    expect(component.messageFacade.addMessage).toHaveBeenCalledWith({
                        message: `Non Inventory Order ${testNonInventoryOrder.id.orderNumber} saved successfully`,
                        severity: 'info',
                    });
                    expect(component.ngOnInit).toHaveBeenCalled();
                    expect(component.form).toBeFalsy();
                }));
            });
        });

        describe('in add mode', () => {
            beforeEach(fakeAsync(() => {
                jest.spyOn(component, 'save');
                jest.spyOn(component.messageFacade, 'addMessage');
                jest.spyOn(component, 'save');
                jest.spyOn(component.saveFacade, 'save');
                jest.spyOn(nonInventoryOrderFacade, 'save').mockReturnValue(of({}));
                initialize('add');
                component.form.setControlValue('store', { code: 'TEST_STORE' }, { emitEvent: false });
                fixture.detectChanges();
            }));

            it('should not display unsaved changes dialog when saving', async () => {
                jest.spyOn(component.nonInventoryOrderFacade, 'save').mockReturnValue(of({}));
                (await getSaveBtn()).click();
                expect(component.unsavedChanges).toBeFalsy();
            });

            it('should not display unsaved changes dialog when saving', async () => {
                jest.spyOn(component.nonInventoryOrderFacade, 'save').mockReturnValue(of({}));
                (await getSaveBtn()).click();
                jest.spyOn(nonInventoryOrderFacade, 'save');
                expect(component.unsavedChanges).toBeFalsy();
            });
            it('should finalize an order', fakeAsync(() => {
                const testFinalizeFromAdd: NonInventoryOrder = {
                    ...new NonInventoryOrder(),
                    store: { code: 'TEST_STORE' },
                    nonInventoryOrderItems: [newProduct],
                };
                jest.spyOn(component.nonInventoryOrderFacade, 'finalize').mockReturnValue(of({}));

                fixture.debugElement.query(By.css('#finalize-order-action')).nativeElement.click();
                fixture.detectChanges();

                fixture.debugElement.query(By.css('#finalize-continue-button')).nativeElement.click();
                tick(600); // tick to account for debounce time and button timeout to re-enable
                fixture.detectChanges();

                expect(nonInventoryOrderFacade.finalize).toHaveBeenCalledWith(
                    Object.assign({ ...testFinalizeFromAdd }, component.form.value)
                );
                expect(component.form.pristine).toBeTruthy();
                expect(component.unsavedChanges).toBeFalsy();
            }));

            it('should call finalize only once when clicked multiple times', fakeAsync(() => {
                const testFinalizeFromAdd: NonInventoryOrder = {
                    ...new NonInventoryOrder(),
                    store: { code: 'TEST_STORE' },
                    nonInventoryOrderItems: [newProduct],
                };
                const finalizeButton = fixture.debugElement.query(By.css('#finalize-continue-button'));
                jest.spyOn(component.nonInventoryOrderFacade, 'finalize').mockReturnValue(of({}));

                fixture.debugElement.query(By.css('#finalize-order-action')).nativeElement.click();
                fixture.detectChanges();

                finalizeButton.nativeElement.click();
                finalizeButton.nativeElement.click();
                finalizeButton.nativeElement.click();
                tick(600); // tick to account for debounce time and button timeout to re-enable
                fixture.detectChanges();

                expect(nonInventoryOrderFacade.finalize).toHaveBeenCalledTimes(1);
                expect(nonInventoryOrderFacade.finalize).toHaveBeenCalledWith(
                    Object.assign({ ...testFinalizeFromAdd }, component.form.value)
                );
                expect(component.form.pristine).toBeTruthy();
                expect(component.unsavedChanges).toBeFalsy();
            }));

            it('should show the finalize order button', () => {
                expect(fixture.debugElement.query(By.css('#finalize-order-action'))).toBeTruthy();
            });
        });
    });

    describe('with action bar', () => {
        it('should navigate to the search page when clicking cancel button', fakeAsync(() => {
            initialize('add');

            getCancelActionButton(fixture).nativeElement.click();

            expectNavigateToSearchPage();
        }));

        describe.each`
            accessMode | status         | cancelDisplayed | applyDisplayed | saveDisplayed | finalizeOrderDisplayed
            ${'view'}  | ${'OPEN'}      | ${true}         | ${false}       | ${false}      | ${false}
            ${'view'}  | ${'FINALIZED'} | ${true}         | ${false}       | ${false}      | ${false}
            ${'edit'}  | ${'OPEN'}      | ${true}         | ${true}        | ${true}       | ${true}
            ${'edit'}  | ${'FINALIZED'} | ${true}         | ${false}       | ${false}      | ${false}
        `(
            'while in $accessMode mode with status of $status',
            ({ accessMode, status, cancelDisplayed, applyDisplayed, saveDisplayed, finalizeOrderDisplayed }) => {
                const validateIsDisplayed = (element: DebugElement, shouldBeDisplayed: boolean) => {
                    if (shouldBeDisplayed) {
                        expect(element).toBeTruthy();
                    } else {
                        expect(element).toBeFalsy();
                    }
                };

                beforeEach(fakeAsync(() => {
                    if (status === 'OPEN') {
                        initialize(accessMode, testNonInventoryOrder);
                    } else {
                        initialize(accessMode, {
                            ...testNonInventoryOrder,
                            status: { code: 'FINALIZED', description: 'test' },
                        });
                    }
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
                it(`should ${finalizeOrderDisplayed ? '' : 'not '}display finalize transfer button`, fakeAsync(() => {
                    validateIsDisplayed(
                        fixture.debugElement.query(By.css('#finalize-order-action')),
                        finalizeOrderDisplayed
                    );
                }));
            }
        );

        describe("apply, save and finalized order buttons shouldn't be enabled when no products are associated with order", () => {
            beforeEach(fakeAsync(() => {
                initialize('add', {
                    ...testNonInventoryOrder,
                    nonInventoryOrderItems: [],
                });
            }));

            it("cancel button shouldn't be disabled when no products are associated with order", fakeAsync(() => {
                expect(getCancelActionButton(fixture).nativeElement.disabled).toBe(false);
            }));

            it('save button should be disabled when no products are associated with order', fakeAsync(() => {
                expect(getSaveActionButton(fixture).nativeElement.disabled).toBe(true);
            }));

            it('finalize order button should be disabled when no products are associated with order', fakeAsync(() => {
                expect(fixture.debugElement.query(By.css('#finalize-order-action')).nativeElement.disabled).toBe(true);
            }));
        });

        describe('with finalize button', () => {
            beforeEach(fakeAsync(() => {
                jest.spyOn(component.finalizeDialog, 'open');
                jest.spyOn(component, 'openFinalizeOrderDialog');
                jest.spyOn(component, 'closeFinalizeDialog');
                jest.spyOn(component.finalizeDialog, 'close');
                jest.spyOn(component, 'finalize');
                jest.spyOn(component.saveFacade, 'save');
                jest.spyOn(component.messageFacade, 'addMessage');
                jest.spyOn(component.finalizeFacade, 'save');
                jest.spyOn(nonInventoryOrderFacade, 'finalize').mockReturnValue(of({}));
                initialize('add');
            }));

            it('should prompt user to confirm finalization', () => {
                // validate that dialog was opened
                component.openFinalizeOrderDialog();
                expect(component.finalizeDialog.open).toHaveBeenCalled();
            });

            it('should close prompt after cancelling finalization', () => {
                // open dialog
                component.openFinalizeOrderDialog();

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

            it('should call the NonInventoryOrderFacade to finalize the order after confirming', fakeAsync(() => {
                // open dialog
                component.openFinalizeOrderDialog();
                // continue past dialog
                const testFinalizeFromAdd: NonInventoryOrder = {
                    ...new NonInventoryOrder(),
                    store: { code: 'TEST_STORE' },
                    nonInventoryOrderItems: [newProduct],
                };
                jest.spyOn(component.nonInventoryOrderFacade, 'finalize').mockReturnValue(of({}));

                fixture.debugElement.query(By.css('#finalize-order-action')).nativeElement.click();
                fixture.detectChanges();

                fixture.debugElement.query(By.css('#finalize-continue-button')).nativeElement.click();
                tick(600); // tick to account for debounce time and button timeout to re-enable

                fixture.detectChanges();

                expect(nonInventoryOrderFacade.finalize).toHaveBeenCalledWith(
                    Object.assign({ ...testFinalizeFromAdd }, component.form.value)
                );
                expect(component.form.pristine).toBeTruthy();
                expect(component.unsavedChanges).toBeFalsy();
            }));

            it('should navigate the user back to the search page', fakeAsync(() => {
                // open dialog
                fixture.debugElement.query(By.css('#finalize-order-action')).nativeElement.click();
                fixture.detectChanges();
                // continue past dialog
                fixture.debugElement.query(By.css('#finalize-continue-button')).nativeElement.click();
                tick(600); // tick to account for debounce time and button timeout to re-enable
                fixture.detectChanges();
                expect(routerService.navigateToSearchPage).toHaveBeenCalledWith(TestBed.inject(ActivatedRoute));
            }));
        });
    });

    describe.each`
        accessMode | expectedContent
        ${'add'}   | ${'Are you sure you want to finalize the non-inventory order?'}
    `('finalize dialog content in $accessMode mode', ({ accessMode, expectedContent }) => {
        it('should prompt the user for confirmation when finalizing', fakeAsync(() => {
            initialize(accessMode);
            // open finalize dialog
            fixture.debugElement.query(By.css('#finalize-nio-dialog')).injector.get(MockDialogComponent).open();
            // find it's content div's inner html
            const dialogContent: string = fixture.nativeElement.querySelector('#finalize-order-confirmation').innerHTML;
            // trim extra spaces and verify
            expect(dialogContent.trim()).toEqual(expectedContent);
        }));
    });

    describe('item add input', () => {
        const addedItems = [
            { id: testNonInventoryOrderCatalog0.id, number: testNonInventoryOrderCatalog0.number },
            { id: testNonInventoryOrderCatalog1.id, number: testNonInventoryOrderCatalog1.number },
            { id: testNonInventoryOrderCatalog2.id, number: testNonInventoryOrderCatalog2.number },
        ];
        function itemAddInputComponent(): MockNonInventoryItemAddInputComponent {
            return fixture.debugElement.query(By.directive(MockNonInventoryItemAddInputComponent))
                .componentInstance as MockNonInventoryItemAddInputComponent;
        }
        const addItems = () => {
            jest.spyOn(component, 'addRequestedItems');
            jest.spyOn(nonInventoryItemFacade, 'getItemDetails').mockReturnValue(
                of([testNonInventoryOrderCatalog0, testNonInventoryOrderCatalog1, testNonInventoryOrderCatalog2])
            );
            itemAddInputComponent().items.emit(addedItems);
            fixture.detectChanges();
        };

        const getRemoveItemsBtn = async () =>
            loader.getHarness(MatButtonHarness.with({ selector: '#remove-items-button' }));

        it('should accept isLoading as a parameter for addDisabled', fakeAsync(() => {
            initialize('add');
            expect(itemAddInputComponent().addDisabled).toEqual(!component.storesSelected);

            component.isLoading = true;
            fixture.detectChanges();

            expect(itemAddInputComponent().addDisabled).toEqual(component.isLoading);
        }));

        it('should accept the existing item numbers as a parameter for existingItemNumbers', fakeAsync(() => {
            initialize('add');
            addItems();
            fixture.detectChanges();
            tick(100); // clear timers in queue
            expect(itemAddInputComponent().existingItemNumbers).toContainEqual(testNonInventoryOrderCatalog0.number);
            expect(itemAddInputComponent().existingItemNumbers).toContainEqual(testNonInventoryOrderCatalog1.number);
            expect(itemAddInputComponent().existingItemNumbers).toContainEqual(testNonInventoryOrderCatalog2.number);
        }));

        it('should accept a search function as a parameter for searchFn', fakeAsync(() => {
            initialize('add');
            expect(itemAddInputComponent().searchFn).toEqual(component.searchItemsFn);
        }));

        describe.each([
            ['itemCodeHeader'],
            ['itemDescHeader'],
            ['minQuantityHeader'],
            ['maxQuantityHeader'],
            ['quantityPerPackHeader'],
            ['uomHeader'],
            ['orderQuantityHeader'],
        ])('with headers', (header) => {
            it(`should call custom sorting accessor when clicking on ${header}`, fakeAsync(() => {
                initialize('add');
                addItems();
                jest.spyOn(component.items, 'sortingDataAccessor');
                expect(component.items.sort).toBeTruthy();
                // find header and click. using nativeElement querySelector due to jest's shallow dom rendering
                const headerButton = fixture.nativeElement.querySelector(`#${header}`);
                headerButton.click();
                fixture.detectChanges();
                tick(100); // clear timers in queue
                expect(component.items.sortingDataAccessor).toHaveBeenCalled();
            }));
        });

        it('should allow products to be removed', fakeAsync(async () => {
            initialize('add');
            addItems();
            // verify state with products added
            expect(component.nonInventoryOrderItems.length).toEqual(3);
            expect(component.selection.selected.length).toEqual(0);
            expect(await (await getRemoveItemsBtn()).isDisabled()).toBeTruthy();
            // select and remove first product
            (await loader.getHarness(MatCheckboxHarness.with({ selector: '#checkbox-0' }))).check();
            flush();
            expect(component.selection.selected.length).toEqual(1);
            const removeProductsBtn = await getRemoveItemsBtn();
            expect(await removeProductsBtn.isDisabled()).toBeFalsy();
            removeProductsBtn.click();
            flush();
            // verify state after product removed
            expect(await (await getRemoveItemsBtn()).isDisabled()).toBeTruthy();
            expect(component.selection.selected.length).toEqual(0);
            expect(component.nonInventoryOrderItems.length).toEqual(2);
        }));

        it('should allow all items to be removed', fakeAsync(async () => {
            initialize('add');
            addItems();
            // select and remove all products
            (await loader.getHarness(MatCheckboxHarness.with({ selector: '#master-checkbox' }))).check();
            flush();
            expect(component.selection.selected.length).toEqual(3);
            (await getRemoveItemsBtn()).click();
            flush();
            // verify state after all products removed
            expect(component.selection.selected.length).toEqual(0);
            expect(component.nonInventoryOrderItems.length).toEqual(0);
            expect(component.form.valid).toBeFalsy();
        }));

        it('should output product information to the addRequestedItems method', fakeAsync(() => {
            jest.spyOn(component, 'addRequestedItems');
            jest.spyOn(component, 'generateItems').mockImplementation();
            initialize('add');
            expect(component.isLoading).toEqual(false);

            itemAddInputComponent().items.emit(addedItems);

            expect(component.isLoading).toEqual(true);
            expect(component.addRequestedItems).toHaveBeenCalledWith(addedItems);
            expect(component.generateItems).toHaveBeenCalledWith(
                component.form.getArray('nonInventoryOrderItems').getRawValue(),
                addedItems.map((p) => p.number)
            );
        }));

        it('should mark item form group as dirty when adding a item', fakeAsync(() => {
            initialize('add');
            jest.spyOn(component, 'addRequestedItems');
            jest.spyOn(component, 'generateItems');
            jest.spyOn(nonInventoryItemFacade, 'getItemDetails').mockReturnValue(
                of([testNonInventoryOrderCatalog0, testNonInventoryOrderCatalog1, testNonInventoryOrderCatalog2])
            );
            expect(component.form.dirty).toEqual(false);
            // add a product
            itemAddInputComponent().items.emit(addedItems);
            fixture.detectChanges();
            tick(100); // clear timers in queue
            // validate that form is dirty
            expect(component.form.dirty).toEqual(true);
            expect(component.unsavedChanges).toBeTruthy();
        }));

        it('should display an error if the item requested can not be added', fakeAsync(() => {
            initialize('add');
            jest.spyOn(component.nonInventoryItemFacade, 'getItemDetails').mockReturnValue(of([]));

            itemAddInputComponent().items.emit([{ number: 'INVALID' }]);
            fixture.detectChanges();

            // expect an error message for the 1 it couldn't add
            expect(component.messageFacade.addMessage).toHaveBeenCalledWith({
                severity: 'error',
                message: 'Unable to add requested item(s): INVALID.',
                hasTimeout: true,
            });
            // validate that form is dirty
            expect(component.form.dirty).toEqual(true);
            expect(component.unsavedChanges).toBeTruthy();
        }));

        it('should display an error if the product requested is duplicated', fakeAsync(() => {
            initialize('add');

            const nonInventoryCatalog$ = new Subject<any[]>();
            jest.spyOn(component, 'addRequestedItems');
            jest.spyOn(component.nonInventoryItemFacade, 'getItemDetails').mockReturnValue(nonInventoryCatalog$);

            itemAddInputComponent().items.emit([
                {
                    number: testNonInventoryOrderCatalog0.number,
                },
            ]);
            nonInventoryCatalog$.next([testNonInventoryOrderCatalog0]);

            fixture.detectChanges();
            tick(100); // clear timers in queue

            expect(itemAddInputComponent().existingItemNumbers).toContainEqual(testNonInventoryOrderCatalog0.number);

            itemAddInputComponent().items.emit([
                {
                    number: `${testNonInventoryOrderCatalog0.number}, ${testNonInventoryOrderCatalog1.number}`,
                },
            ]);
            nonInventoryCatalog$.next([testNonInventoryOrderCatalog0, testNonInventoryOrderCatalog1]);

            fixture.detectChanges();
            tick(100); //clear timers in queue

            expect(component.messageFacade.addMessage).toHaveBeenCalledWith({
                severity: 'error',
                message: `Item(s) ${testNonInventoryOrderCatalog0.number} already added.`,
                hasTimeout: true,
            });
        }));

        it('should display an error if the one item requested is duplicated and another is invalid', fakeAsync(() => {
            initialize('add');

            const nonInventoryCatalog$ = new Subject<any[]>();
            jest.spyOn(component, 'addRequestedItems');
            jest.spyOn(component.nonInventoryItemFacade, 'getItemDetails').mockReturnValue(nonInventoryCatalog$);

            itemAddInputComponent().items.emit([
                {
                    number: testNonInventoryOrderCatalog0.number,
                },
            ]);
            nonInventoryCatalog$.next([testNonInventoryOrderCatalog0]);

            fixture.detectChanges();
            tick(100); // clear timers in queue

            expect(itemAddInputComponent().existingItemNumbers).toContainEqual(testNonInventoryOrderCatalog0.number);

            itemAddInputComponent().items.emit([
                {
                    number: `${testNonInventoryOrderCatalog0.number}, ${testNonInventoryOrderCatalog1.number}, INVALID`,
                },
            ]);
            nonInventoryCatalog$.next([testNonInventoryOrderCatalog0, testNonInventoryOrderCatalog1]);

            fixture.detectChanges();
            tick(100); // clear timers in queue

            expect(component.messageFacade.addMessage).toHaveBeenCalledWith({
                severity: 'error',
                message: `Item(s) ${testNonInventoryOrderCatalog0.number} already added.`,
                hasTimeout: true,
            });

            expect(component.messageFacade.addMessage).toHaveBeenCalledWith({
                severity: 'error',
                message: 'Unable to add requested item(s): INVALID.',
                hasTimeout: true,
            });
        }));
    });
});
