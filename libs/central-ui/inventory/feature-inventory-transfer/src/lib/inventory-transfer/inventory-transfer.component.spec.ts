import { HttpClient } from '@angular/common/http';
import { Component, DebugElement, EventEmitter, Input, Output, Type } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormArray, FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, ActivatedRouteSnapshot, convertToParamMap, Router } from '@angular/router';
import {
    GenerateTransferProduct,
    InventoryTransfer,
    InventoryTransferFacade,
    InventoryTransferProduct,
} from '@vioc-angular/central-ui/inventory/data-access-inventory-transfer';
import { ResourceFacade, Resources } from '@vioc-angular/central-ui/organization/data-access-resources';
import {
    FeatureSharedProductAddInputMockModule,
    ProductAddInputComponent,
} from '@vioc-angular/central-ui/product/feature-shared-product-add-input';
import { RouterService } from '@vioc-angular/central-ui/util-router';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { CommonFunctionalityModule, Described, formatMoment } from '@vioc-angular/shared/common-functionality';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { RouterHistoryFacade } from '@vioc-angular/shared/data-access-router-history';
import { UiActionBarModule } from '@vioc-angular/shared/ui-action-bar';
import { UiAuditModule } from '@vioc-angular/shared/ui-audit';
import { UiDialogMockModule } from '@vioc-angular/shared/ui-dialog';
import { MockLoadingOverlayComponent, UiLoadingMockModule } from '@vioc-angular/shared/ui-loading';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { FormFactory, TypedFormGroup, UtilFormMockModule } from '@vioc-angular/shared/util-form';
import {
    expectInput,
    getApplyActionButton,
    getCancelActionButton,
    getSaveActionButton,
} from '@vioc-angular/test/util-test';
import { of, ReplaySubject, Subject } from 'rxjs';
import { InventoryTransferForms } from '../inventory-transfer-module-forms';
import { InventoryTransferComponent } from './inventory-transfer.component';

describe('InventoryTransferComponent', () => {
    let component: InventoryTransferComponent;
    let fixture: ComponentFixture<InventoryTransferComponent>;
    let formFactory: FormFactory;
    let componentDestroyed: ReplaySubject<any>;
    let resourceFacade: ResourceFacade;
    let inventoryTransferFacade: InventoryTransferFacade;
    let routerService: RouterService;
    let router: Router;

    @Component({
        selector: 'vioc-angular-inventory-transfer-store-selection',
        template: '',
    })
    class MockInventoryTransferStoreSelectionComponent {
        @Input() fromStore: FormControl;
        @Input() toStore: FormControl;
        @Input() fromStores: Described[] = [];
        @Input() toStores: Described[] = [];
        @Input() editable = true;
    }

    @Component({
        selector: 'vioc-angular-inventory-transfer-products',
        template: '',
    })
    class MockInventoryTransferProductsComponent {
        @Input() form: FormArray;
        @Input() status: string;
        @Input() disableSelection: boolean;
        @Output() removeProducts = new EventEmitter<string[]>();
    }

    const testInventoryTransferProduct: InventoryTransferProduct = {
        product: { id: 0, code: '01', description: 'product', version: 0 },
        uom: { id: 0, code: 'uom', description: 'Unit', version: 0 },
        quantity: 2,
        quantityOnHand: 10,
        version: 2,
    };

    const testInventoryTransfer: InventoryTransfer = {
        id: { storeId: 0, transferId: '1000' },
        fromStore: { id: 0, code: 'st00', description: 'store 00', version: 0 },
        toStore: { id: 0, code: 'st01', description: 'store 01', version: 0 },
        status: { id: 0, code: 'OPEN', description: 'Open', version: 0 },
        inventoryTransferProducts: [testInventoryTransferProduct],
        carrier: 'test',
        createdByEmployee: {
            id: 'a998877',
            name: 'Bob Smith',
            firstName: 'Bob',
            lastName: 'Smith',
        },
        createdOn: '2021-01-01',
        updatedBy: '',
        updatedOn: '',
        finalizedByEmployee: { name: '' },
        finalizedOn: '',
        version: 0,
    };

    const testFinalizedInventoryTransfer: InventoryTransfer = {
        ...testInventoryTransfer,
        status: { id: 1, code: 'FINALIZED', description: 'Finalized', version: 0 },
        finalizedByEmployee: {
            id: 'a998877',
            name: 'Bob Smith',
            firstName: 'Bob',
            lastName: 'Smith',
        },
        finalizedOn: '2021-01-03',
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                ReactiveFormsModule,
                UiActionBarModule,
                UiAuditModule,
                UiLoadingMockModule,
                UtilFormMockModule,
                MatFormFieldModule,
                MatInputModule,
                MatIconModule,
                MatTableModule,
                MatCheckboxModule,
                MatButtonModule,
                FeatureSharedProductAddInputMockModule,
                CommonFunctionalityModule,
                UiDialogMockModule,
            ],
            declarations: [
                InventoryTransferComponent,
                MockInventoryTransferStoreSelectionComponent,
                MockInventoryTransferProductsComponent,
            ],
            providers: [
                FormFactory,
                { provide: GATEWAY_TOKEN, useValue: '//gateway/' },
                {
                    provide: ActivatedRoute,
                    useValue: { params: new Subject(), parent: '/inventory/inventory-transfer' },
                },
                { provide: HttpClient, useValue: { get: jest.fn(() => of()) } },
                { provide: Router, useValue: { navigate: jest.fn() } },
                { provide: RouterHistoryFacade, useValue: { revertRouterHistory: jest.fn() } },
                { provide: RouterService, useValue: { navigateToSearchPage: jest.fn(), back: jest.fn() } },
                { provide: MessageFacade, useValue: { addMessage: jest.fn() } },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        InventoryTransferForms.registerForms(TestBed.inject(FormFactory), TestBed.inject(FormBuilder));
        fixture = TestBed.createComponent(InventoryTransferComponent);
        formFactory = TestBed.inject(FormFactory);
        router = TestBed.inject(Router);
        componentDestroyed = new ReplaySubject(1);
        component = fixture.componentInstance;

        resourceFacade = component['resourceFacade'];
        inventoryTransferFacade = component['inventoryTransferFacade'];
        inventoryTransferFacade.finalize = jest.fn();
        inventoryTransferFacade.productLookup = jest.fn();
        inventoryTransferFacade.getToStores = jest.fn();
        inventoryTransferFacade.findByFromStoreAndTransferId = jest.fn();
        routerService = TestBed.inject(RouterService);
        jest.spyOn(resourceFacade, 'findStoresByRoles').mockReturnValue(
            of({
                resources: [
                    { id: 0, code: 'STORE1', description: 'store 1', version: 0 },
                    { id: 1, code: 'STORE2', description: 'store 2', version: 0 },
                ],
                allCompanies: false,
            })
        );
    });

    afterEach(() => componentDestroyed.next());

    const initialize = (
        accessMode: 'view' | 'edit' | 'add',
        model: InventoryTransfer = testInventoryTransfer,
        andFlush = true
    ): void => {
        const route = TestBed.inject(ActivatedRoute);
        route.snapshot = {
            paramMap: convertToParamMap({
                accessMode: accessMode,
                storeCode: model.fromStore?.code,
                transferNumber: model.id?.transferId,
            }),
        } as ActivatedRouteSnapshot;
        const inventoryTransfer = { ...new InventoryTransfer(), ...model };
        jest.spyOn(inventoryTransferFacade, 'findByFromStoreAndTransferId').mockReturnValue(of(inventoryTransfer));
        fixture.detectChanges();
        if (andFlush) {
            flush();
        }
    };

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

    describe('with cancel button clicked', () => {
        it('should navigate to the search page when clicking cancel button', fakeAsync(() => {
            initialize('edit');
            fixture.debugElement.query(By.css('#cancel-action')).nativeElement.click();

            expect(router.navigate).toHaveBeenCalledWith(['search'], {
                relativeTo: TestBed.inject(ActivatedRoute).parent,
            });
        }));
    });

    describe('ngOnInit', () => {
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
            jest.spyOn(inventoryTransferFacade, 'getToStores').mockImplementation();
            initialize('add');
            expect(component.form.getControlValue('fromStore')).toBeFalsy();

            const store = { id: 0, code: '040066', description: 'Test Store', version: 0 };
            storeSubject.next({
                resources: [store],
                allCompanies: false,
            });
            flush();

            expect(component.productAddControl.disabled).toBeTruthy();
            expect(component.form.getControlValue('fromStore')).toEqual(store);
            expect(inventoryTransferFacade.getToStores).toHaveBeenLastCalledWith(store.code);
            expect(component.form.getControl('fromStore').disabled).toBeTruthy();
        }));

        describe('in view mode', () => {
            it('should load a disabled form', fakeAsync(() => {
                initialize('view');
                expect(component.form.enabled).toBeFalsy();
            }));

            describe.each`
                field                | value
                ${'transfer-number'} | ${testInventoryTransfer.id.transferId}
                ${'from-store'}      | ${testInventoryTransfer.fromStore.code}
                ${'to-store'}        | ${testInventoryTransfer.toStore.code}
                ${'status'}          | ${testFinalizedInventoryTransfer.status.description}
                ${'created-date'}    | ${formatMoment(testInventoryTransfer.createdOn)}
                ${'created-by'}      | ${testInventoryTransfer.createdByEmployee.name}
                ${'finalized-on'}    | ${formatMoment(testFinalizedInventoryTransfer.finalizedOn)}
                ${'finalized-by'}    | ${testFinalizedInventoryTransfer.finalizedByEmployee.name}
                ${'carrier'}         | ${testInventoryTransfer.carrier}
            `('disabled fields', ({ field, value }) => {
                it(`should display a disabled input for ${field} as ${value}`, fakeAsync(() => {
                    initialize('view', testFinalizedInventoryTransfer);
                    expectInput(fixture, { id: `${field}-input` })
                        .toHaveValue(value)
                        .toBeEnabled(false);
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
                        ...testFinalizedInventoryTransfer,
                        status: { code: code, description: status },
                    });

                    const finalizedByInput = fixture.debugElement.query(By.css('#finalized-by-input'));
                    const finalizedOnInput = fixture.debugElement.query(By.css('#finalized-on-input'));
                    if (status === 'Finalized') {
                        expect(finalizedByInput.nativeElement.value).toEqual(
                            testFinalizedInventoryTransfer.finalizedByEmployee.name
                        );
                        expect(finalizedOnInput.nativeElement.value).toEqual(
                            formatMoment(testFinalizedInventoryTransfer.finalizedOn)
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
                initialize('edit');
                expect(component.form.enabled).toBeTruthy();
            }));

            describe.each`
                status
                ${'FINALIZED'}
                ${'CANCELLED'}
                ${'CLOSED'}
            `('unmodifiable transfer', ({ status }) => {
                it(`should have a disabled form when the transfer status is ${status}`, fakeAsync(() => {
                    const unmodifiableTransfer = {
                        ...testFinalizedInventoryTransfer,
                        status: { id: 88, code: status, description: 'test status', version: 0 },
                    };
                    initialize('edit', unmodifiableTransfer);

                    expect(component.accessMode).toEqual(AccessMode.VIEW);
                    expect(component.form.enabled).toBe(false);
                }));
            });

            describe.each`
                field                | value                                            | enabled
                ${'transfer-number'} | ${testInventoryTransfer.id.transferId}           | ${false}
                ${'from-store'}      | ${testInventoryTransfer.fromStore.code}          | ${false}
                ${'to-store'}        | ${testInventoryTransfer.toStore.code}            | ${false}
                ${'status'}          | ${testInventoryTransfer.status.description}      | ${false}
                ${'created-date'}    | ${formatMoment(testInventoryTransfer.createdOn)} | ${false}
                ${'created-by'}      | ${testInventoryTransfer.createdByEmployee.name}  | ${false}
                ${'carrier'}         | ${testInventoryTransfer.carrier}                 | ${true}
            `('disabled fields', ({ field, value, enabled }) => {
                it(`should display a ${
                    enabled === false ? 'disabled' : 'enabled'
                } input for ${field} as ${value}`, fakeAsync(() => {
                    initialize('edit');
                    expectInput(fixture, { id: `${field}-input` })
                        .toHaveValue(value)
                        .toBeEnabled(enabled);
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
                initialize('add', new InventoryTransfer());
            }));

            describe('store selection', () => {
                let storeSelection: MockInventoryTransferStoreSelectionComponent;

                beforeEach(fakeAsync(() => {
                    storeSelection = fixture.debugElement.query(
                        By.directive(MockInventoryTransferStoreSelectionComponent)
                    ).componentInstance;
                }));

                it('should set the fromStore', () => {
                    storeSelection.fromStore.setValue({ ...new Described(), code: 'FROMSTORE' });
                    expect(component.form.getControlValue('fromStore')).toEqual(storeSelection.fromStore.value);
                });

                it('should set the toStore', () => {
                    storeSelection.toStore.setValue({ ...new Described(), code: 'TOSTORE' });
                    expect(component.form.getControlValue('toStore')).toEqual(storeSelection.toStore.value);
                });

                it('should accept the fromStore resources', () => {
                    const fromStores = [{ ...new Described(), code: 'FROMSTORE' }];
                    component.fromStores$ = of({ resources: fromStores, allCompanies: true });
                    fixture.detectChanges();
                    expect(storeSelection.fromStores).toEqual(fromStores);
                });

                it('should load the toStore resources after the fromStore is selected', fakeAsync(() => {
                    const fromStoreCode = 'FROMSTORE';
                    const company = { ...new Described(), code: 'VAL' };
                    jest.spyOn(resourceFacade, 'findStoresByRoles');
                    storeSelection.fromStore.setValue({ ...new Described(), code: fromStoreCode, company: company });
                    fixture.detectChanges();
                    // wait 0.5 seconds fore the debounce before checking if the findStoresByRoles method was called
                    tick(500);
                    expect(inventoryTransferFacade.getToStores).toHaveBeenCalledWith(fromStoreCode);
                }));

                it('should be disabled when a products are present', () => {
                    jest.spyOn(inventoryTransferFacade, 'productLookup').mockReturnValue(
                        of([
                            {
                                ...new GenerateTransferProduct(),
                                id: { productId: 1, storeId: 2 },
                                code: 'TEST',
                                uom: { code: 'EACH' },
                            },
                        ])
                    );
                    component.form.getControl('fromStore').patchValue(testInventoryTransfer.fromStore);
                    component.form.getControl('toStore').patchValue(testInventoryTransfer.toStore);
                    component.productAddControl.setValue('TEST');
                    component.addRequestedProducts([{ code: 'TEST' }]);
                    fixture.detectChanges();

                    expect(component.form.getControl('fromStore').disabled).toEqual(true);
                    expect(component.form.getControl('toStore').disabled).toEqual(true);
                });

                it('should enabled when there are no products', () => {
                    component.form.setControl(
                        'inventoryTransferProducts',
                        formFactory.array(
                            'InventoryTransferProduct',
                            [{ ...new InventoryTransferProduct(), product: { code: 'TEST' }, uom: { code: 'EACH' } }],
                            componentDestroyed
                        )
                    );
                    component.onRemoveProducts(['TEST']);
                    fixture.detectChanges();

                    expect(component.form.getControl('fromStore').enabled).toEqual(true);
                    expect(component.form.getControl('toStore').enabled).toEqual(true);
                });
            });
        });
    });

    describe.each`
        form                | expected
        ${null}             | ${undefined}
        ${undefined}        | ${undefined}
        ${{ dirty: false }} | ${false}
        ${{ dirty: true }}  | ${true}
    `('unsavedChanges', ({ form, expected }) => {
        it(`should return ${expected} given form=${JSON.stringify(form)}`, () => {
            component.form = form;
            expect(component.unsavedChanges).toEqual(expected);
        });
    });

    describe('removing products', () => {
        beforeEach(fakeAsync(() => {
            initialize('add');
            component.form.setControlValue('fromStore', testInventoryTransfer.fromStore);
            component.form.setControlValue('toStore', testInventoryTransfer.toStore);
            tick(500);
            fixture.detectChanges();
        }));

        function getProductsComponent(): MockInventoryTransferProductsComponent {
            return fixture.debugElement.query(By.directive(MockInventoryTransferProductsComponent))
                .componentInstance as MockInventoryTransferProductsComponent;
        }

        it('should pass product form array into the products component', () => {
            expect(getProductsComponent().form).toEqual(component.form.getArray('inventoryTransferProducts'));
        });

        it('should pass the status into the products component', () => {
            component.form.setControlValue('status', testInventoryTransfer.status);
            fixture.detectChanges();
            expect(getProductsComponent().status).toEqual(testInventoryTransfer.status.code);
        });

        it('should handle null status in the products component', () => {
            component.form.setControlValue('status', null);
            fixture.detectChanges();
            expect(getProductsComponent().status).toEqual(null);
        });

        const product1: InventoryTransferProduct = {
            product: { id: 1, code: 'TEST', description: 'Test Description' },
            uom: { code: 'EACH', description: 'Each' },
            quantity: null,
            quantityOnHand: 10,
            version: null,
        };
        const product2: InventoryTransferProduct = {
            ...product1,
            product: { code: 'TEST2', description: 'Test Description2' },
        };
        const product3: InventoryTransferProduct = {
            ...product1,
            product: { code: 'TEST3', description: 'Test Description3' },
        };

        it.each`
            toRemove                                                                 | expectedRemaining
            ${[product1.product.code]}                                               | ${[product2.product.code, product3.product.code]}
            ${[product2.product.code]}                                               | ${[product1.product.code, product3.product.code]}
            ${[product3.product.code]}                                               | ${[product1.product.code, product2.product.code]}
            ${[product1.product.code, product2.product.code]}                        | ${[product3.product.code]}
            ${[product2.product.code, product3.product.code]}                        | ${[product1.product.code]}
            ${[product1.product.code, product2.product.code, product3.product.code]} | ${[]}
            ${['BAD_CODE']}                                                          | ${[product1.product.code, product2.product.code, product3.product.code]}
        `(
            'should remove products that have been output for removal, toRemove=$toRemove expectedRemaining=$expectedRemaining',
            ({ toRemove, expectedRemaining }) => {
                component.form.setControl(
                    'inventoryTransferProducts',
                    formFactory.array('InventoryTransferProduct', [product1, product2, product3], componentDestroyed)
                );
                const initialArray = component.form.getArray('inventoryTransferProducts');

                getProductsComponent().removeProducts.emit(toRemove);
                fixture.detectChanges();

                const productsArray = component.form.getArray('inventoryTransferProducts');
                expect(
                    productsArray.controls.map(
                        (transferProduct) =>
                            (transferProduct as TypedFormGroup<InventoryTransferProduct>).getControlValue('product')
                                .code
                    )
                ).toEqual(expectedRemaining);
                expect(getProductsComponent().form).toEqual(productsArray);
                expect(getProductsComponent().form).not.toBe(initialArray);
            }
        );

        it('should dirty the form', () => {
            component.form.setControl(
                'inventoryTransferProducts',
                formFactory.array('InventoryTransferProduct', [product1, product2, product3], componentDestroyed)
            );

            getProductsComponent().removeProducts.emit([product1.product.code]);
            fixture.detectChanges();

            expect(component.form.dirty).toBeTruthy();
        });
    });

    describe('Action Bar', () => {
        describe.each`
            accessMode | transferStatus | cancelDisplayed | applyDisplayed | saveDisplayed | cancelTransferDisplayed | finalizeTransferDisplayed
            ${'view'}  | ${'OPEN'}      | ${true}         | ${false}       | ${false}      | ${false}                | ${false}
            ${'view'}  | ${'FINALIZED'} | ${true}         | ${false}       | ${false}      | ${false}                | ${false}
            ${'edit'}  | ${'OPEN'}      | ${true}         | ${true}        | ${true}       | ${true}                 | ${true}
            ${'edit'}  | ${'FINALIZED'} | ${true}         | ${false}       | ${false}      | ${false}                | ${false}
        `(
            'while in $accessMode mode with status of $transferStatus',
            ({
                accessMode,
                transferStatus,
                cancelDisplayed,
                applyDisplayed,
                saveDisplayed,
                cancelTransferDisplayed,
                finalizeTransferDisplayed,
            }) => {
                const validateIsDisplayed = (element: DebugElement, shouldBeDisplayed: boolean) => {
                    if (shouldBeDisplayed) {
                        expect(element).toBeTruthy();
                    } else {
                        expect(element).toBeFalsy();
                    }
                };

                beforeEach(fakeAsync(() => {
                    if (transferStatus === 'OPEN') {
                        initialize(accessMode, testInventoryTransfer);
                    } else {
                        initialize(accessMode, testFinalizedInventoryTransfer);
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
                it(`should ${cancelTransferDisplayed ? '' : 'not '} display cancel transfer button`, fakeAsync(() => {
                    validateIsDisplayed(
                        fixture.debugElement.query(By.css('#cancel-transfer-action')),
                        cancelTransferDisplayed
                    );
                }));
                it(`should ${
                    finalizeTransferDisplayed ? '' : 'not '
                }display finalize transfer button`, fakeAsync(() => {
                    validateIsDisplayed(
                        fixture.debugElement.query(By.css('#finalize-action')),
                        finalizeTransferDisplayed
                    );
                }));
            }
        );

        describe("apply, save and finalized transfer buttons shouldn't be enabled when no products are associated with transfer", () => {
            beforeEach(fakeAsync(() => {
                initialize('edit', {
                    ...testInventoryTransfer,
                    inventoryTransferProducts: [],
                });
            }));

            it("cancel button shouldn't be disabled when no products are associated with transfer", fakeAsync(() => {
                expect(getCancelActionButton(fixture).nativeElement.disabled).toBe(false);
            }));

            it('apply button should be disabled when no products are associated with transfer', fakeAsync(() => {
                expect(getApplyActionButton(fixture).nativeElement.disabled).toBe(true);
            }));

            it('save button should be disabled when no products are associated with transfer', fakeAsync(() => {
                expect(getSaveActionButton(fixture).nativeElement.disabled).toBe(true);
            }));

            it('finalize transfer button should be disabled when no products are associated with transfer', fakeAsync(() => {
                expect(fixture.debugElement.query(By.css('#finalize-action')).nativeElement.disabled).toBe(true);
            }));
        });

        describe.each`
            formState    | cancelEnabled | applyEnabled | saveEnabled | cancelTransferDisplayed | finalizeTransferDisplayed
            ${'valid'}   | ${true}       | ${true}      | ${true}     | ${true}                 | ${true}
            ${'invalid'} | ${true}       | ${false}     | ${false}    | ${true}                 | ${false}
        `(
            'with a $formState form',
            ({
                formState,
                cancelEnabled,
                applyEnabled,
                saveEnabled,
                cancelTransferDisplayed,
                finalizeTransferDisplayed,
            }) => {
                beforeEach(fakeAsync(() => {
                    initialize('edit');
                    if (formState !== 'valid') {
                        component.form.setErrors({ invalid: true });
                    }
                    fixture.detectChanges();
                }));

                it(`cancel button should be ${cancelEnabled ? 'en' : 'dis'}abled`, fakeAsync(() => {
                    expect(getCancelActionButton(fixture).nativeElement.disabled).toBe(!cancelEnabled);
                }));
                it(`apply button should be ${applyEnabled ? 'en' : 'dis'}abled`, fakeAsync(() => {
                    expect(getApplyActionButton(fixture).nativeElement.disabled).toBe(!applyEnabled);
                }));
                it(`save button should be ${saveEnabled ? 'en' : 'dis'}abled`, fakeAsync(() => {
                    expect(getSaveActionButton(fixture).nativeElement.disabled).toBe(!saveEnabled);
                }));
                it(`cancel transfer button should be ${cancelTransferDisplayed ? 'en' : 'dis'}abled`, fakeAsync(() => {
                    expect(fixture.debugElement.query(By.css('#cancel-transfer-action')).nativeElement.disabled).toBe(
                        !cancelTransferDisplayed
                    );
                }));
                it(`finalize button should be ${finalizeTransferDisplayed ? 'en' : 'dis'}abled`, fakeAsync(() => {
                    expect(fixture.debugElement.query(By.css('#finalize-action')).nativeElement.disabled).toBe(
                        !finalizeTransferDisplayed
                    );
                }));
            }
        );

        describe('finalize button', () => {
            beforeEach(fakeAsync(() => {
                jest.spyOn(component.finalizeDialog, 'open');
                jest.spyOn(component.finalizeDialog, 'close');
                jest.spyOn(component, 'finalize');
                jest.spyOn(component.messageFacade, 'addMessage');
                jest.spyOn(component.finalizeFacade, 'save');
                jest.spyOn(inventoryTransferFacade, 'finalize').mockReturnValue(of({}));
                initialize('edit');
            }));

            it('should prompt user finalize confirmation', () => {
                //open dialog
                fixture.debugElement.query(By.css('#finalize-action')).nativeElement.click();
                fixture.detectChanges();

                //validate that dialog was opened
                expect(component.finalizeDialog.open).toHaveBeenCalled();
            });

            it('should close prompt after clicking GO BACK button', () => {
                fixture.debugElement.query(By.css('#finalize-action')).nativeElement.click();
                fixture.detectChanges();

                //validate GO BACK button had appeared
                expect(component.finalizeDialog.open).toHaveBeenCalled();
                const cancelButton = fixture.debugElement.query(By.css('#finalize-cancel-button'));
                expect(cancelButton).toBeTruthy();

                // click on GO BACK button
                cancelButton.nativeElement.click();
                fixture.detectChanges();

                //validate that dialog was closed
                expect(component.finalizeDialog.close).toHaveBeenCalled();
            });

            it('should call the inventoryTransferFacade to finalize the transfer after clicking FINALIZE TRANSFER button', fakeAsync(() => {
                fixture.debugElement.query(By.css('#finalize-action')).nativeElement.click();
                fixture.detectChanges();

                //validate FINALIZE TRANSFER button had appeared
                expect(component.finalizeDialog.open).toHaveBeenCalled();
                const continueButton = fixture.debugElement.query(By.css('#finalize-continue-button'));
                expect(continueButton).toBeTruthy();

                // click on FINALIZE TRANSFER button
                continueButton.nativeElement.click();
                tick(600); // tick to account for debounce time and timeout to re-enable button
                fixture.detectChanges();

                // validate transfer facade is called
                expect(component.finalize).toHaveBeenCalled();
                expect(component.finalizeFacade.save).toHaveBeenCalledWith(
                    component.form,
                    testInventoryTransfer,
                    component['route']
                );
                expect(inventoryTransferFacade.finalize).toHaveBeenCalledWith(testInventoryTransfer);
                expect(component.messageFacade.addMessage).toHaveBeenCalledWith({
                    message: `Inventory Transfer ${testInventoryTransfer.id.transferId} finalized successfully`,
                    severity: 'info',
                });
            }));

            it('should call finalize only once, even when multiple clicks', fakeAsync(() => {
                // open finalize dialog
                fixture.debugElement.query(By.css('#finalize-action')).nativeElement.click();
                fixture.detectChanges();

                // multiple clicks on FINALIZE TRANSFER button
                const finalizeContinueButton = fixture.debugElement.query(
                    By.css('#finalize-continue-button')
                ).nativeElement;
                finalizeContinueButton.click();
                finalizeContinueButton.click();
                finalizeContinueButton.click();
                tick(600); // tick to account for debounce time and timeout to re-enable button
                fixture.detectChanges();

                // validate it was called only once
                expect(inventoryTransferFacade.finalize).toHaveBeenCalledTimes(1);
                expect(component.finalize).toHaveBeenCalledTimes(1);
                expect(component.finalizeFacade.save).toHaveBeenCalledTimes(1);
            }));

            it('should navigate the user back to the search page', fakeAsync(() => {
                fixture.debugElement.query(By.css('#finalize-action')).nativeElement.click();
                fixture.detectChanges();
                fixture.debugElement.query(By.css('#finalize-continue-button')).nativeElement.click();
                tick(600); // tick to account for debounce time and timeout to re-enable button
                fixture.detectChanges();
                expect(TestBed.inject(RouterService).navigateToSearchPage).toHaveBeenCalled();
            }));
        });

        describe('Cancel Transfer Button', () => {
            let cancelTransferButton: DebugElement;
            let continueButton: DebugElement;
            let cancelButton: DebugElement;
            let messageFacade: MessageFacade;

            beforeEach(fakeAsync(() => {
                messageFacade = TestBed.inject(MessageFacade as Type<MessageFacade>);
                jest.spyOn(component.cancelDialog, 'open');
                jest.spyOn(component.cancelDialog, 'close');
                jest.spyOn(component, 'openCancelTransferDialog');
                jest.spyOn(component, 'closeCancelTransferDialog');
                jest.spyOn(component, 'cancelInventoryTransfer');
                jest.spyOn(component, 'isCancelTransferButtonShown').mockReturnValue(true);
                jest.spyOn(inventoryTransferFacade, 'cancelInventoryTransfer').mockReturnValue(
                    of(testInventoryTransfer)
                );
                initialize('edit');
                cancelTransferButton = fixture.debugElement.query(By.css('#cancel-transfer-action'));
                continueButton = fixture.debugElement.query(By.css('#continue-button'));
                cancelButton = fixture.debugElement.query(By.css('#cancel-button'));
            }));

            function clickCancelTransferButton() {
                expect(cancelTransferButton).toBeTruthy();
                cancelTransferButton.nativeElement.click();
                expect(component.cancelDialog.open).toHaveBeenCalled();
                expect(fixture.debugElement.query(By.css('#cancel-transfer-dialog'))).toBeTruthy();
            }

            function clickContinueButton() {
                expect(continueButton).toBeTruthy();
                continueButton.nativeElement.click();
                tick(600);
                expect(component.form).toBeNull();
                expect(component.cancelInventoryTransfer).toHaveBeenCalled();
                expect(messageFacade.addMessage).toHaveBeenCalledWith({
                    message: `Transfer number ${testInventoryTransfer.id.transferId} has been cancelled.`,
                    severity: 'success',
                });
                expect(routerService.back).toHaveBeenCalled();
                expect(component.isLoading).toBeFalsy();
                expect(component.cancelDialog.close).toHaveBeenCalled();
            }

            describe.each`
                cancelTransfer
                ${true}
                ${false}
            `('Cancel Transfer Dialog', ({ cancelTransfer }) => {
                it(`should ${cancelTransfer ? '' : 'not '}cancel the order`, fakeAsync(() => {
                    clickCancelTransferButton();
                    if (cancelTransfer) {
                        clickContinueButton();
                    } else {
                        expect(cancelButton).toBeTruthy();
                        cancelButton.nativeElement.click();
                        expect(component.closeCancelTransferDialog).toHaveBeenCalled();
                        expect(component.isLoading).toBeFalsy();
                        expect(component.cancelDialog.close).toHaveBeenCalled();
                    }
                }));
            });

            it('should call cancelTransfer only once, even when multiple clicks', fakeAsync(() => {
                // open cancel transfer dialog
                clickCancelTransferButton();

                // multiple clicks on CANCEL TRANSFER button
                continueButton.nativeElement.click();
                continueButton.nativeElement.click();
                continueButton.nativeElement.click();
                tick(600);
                fixture.detectChanges();

                // validate it was called only once
                expect(component.cancelInventoryTransfer).toHaveBeenCalledTimes(1);
            }));

            it('should not show unsaved changes prompt if the form is dirty and cancelling a transfer', fakeAsync(() => {
                component.form.markAsDirty();
                expect(component.unsavedChanges).toBeTruthy();

                clickCancelTransferButton();
                clickContinueButton();
                expect(component.unsavedChanges).toBeFalsy();
            }));

            it('should throw an error if the transfer was not deleted', fakeAsync(() => {
                const transferSubject = new Subject<InventoryTransfer>();
                jest.spyOn(inventoryTransferFacade, 'cancelInventoryTransfer').mockReturnValue(transferSubject);
                clickCancelTransferButton();
                expect(continueButton).toBeTruthy();
                continueButton.nativeElement.click();
                tick(600);
                expect(component.isLoading).toBeTruthy();
                expect(component.cancelDialog.close).toHaveBeenCalled();
                expect(component.cancelInventoryTransfer).toHaveBeenCalled();
                expect(() => {
                    transferSubject.error('Error');
                    flush();
                }).toThrow();
                fixture.detectChanges();
                expect(component.isLoading).toBeFalsy();
            }));
        });
    });

    describe('when saving', () => {
        function clickSave() {
            getSaveActionButton(fixture).nativeElement.click();
            fixture.detectChanges();
        }
        function clickApply() {
            getApplyActionButton(fixture).nativeElement.click();
            fixture.detectChanges();
        }

        describe('in edit mode', () => {
            beforeEach(fakeAsync(() => {
                initialize('edit');
                jest.spyOn(inventoryTransferFacade, 'save').mockReturnValue(of({}));
                jest.spyOn(component.messageFacade, 'addMessage');
            }));

            describe('save button', () => {
                it('should call the inventoryTransferFacade to save and navigate back to the previous page', fakeAsync(() => {
                    jest.spyOn(component.saveFacade, 'save');
                    clickSave();
                    tick(600); // tick to account for debounce time and timeout to re-enable button

                    expect(component.saveFacade.save).toHaveBeenCalledWith(
                        component.form,
                        testInventoryTransfer,
                        component['route']
                    );
                    expect(inventoryTransferFacade.save).toHaveBeenCalledWith(testInventoryTransfer);
                    expect(component.messageFacade.addMessage).toHaveBeenCalledWith({
                        message: `Inventory Transfer ${testInventoryTransfer.id.transferId} saved successfully`,
                        severity: 'info',
                    });
                    expect(routerService.navigateToSearchPage).toHaveBeenCalled();
                }));

                it('should call save only once, even when multiple clicks', fakeAsync(() => {
                    jest.spyOn(component.saveFacade, 'save');

                    // click on save button multiple times
                    clickSave();
                    clickSave();
                    clickSave();
                    tick(600); // tick to account for debounce time and timeout to re-enable button

                    expect(inventoryTransferFacade.save).toHaveBeenCalledTimes(1);
                }));
            });

            describe('apply button', () => {
                it('should call the inventoryTransferFacade to save and reload the component', fakeAsync(() => {
                    jest.spyOn(component.saveFacade, 'apply');
                    jest.spyOn(component, 'ngOnInit').mockImplementation(() => {});
                    const currentForm = component.form;
                    clickApply();
                    tick(600); // tick to account for debounce time and timeout to re-enable button

                    expect(component.saveFacade.apply).toHaveBeenCalledWith(
                        currentForm,
                        testInventoryTransfer,
                        expect.anything()
                    );
                    expect(inventoryTransferFacade.save).toHaveBeenCalledWith(testInventoryTransfer);
                    expect(component.messageFacade.addMessage).toHaveBeenCalledWith({
                        message: `Inventory Transfer ${testInventoryTransfer.id.transferId} saved successfully`,
                        severity: 'info',
                    });
                    expect(component.ngOnInit).toHaveBeenCalled();
                    expect(component.form).toBeFalsy();
                }));

                it('should call apply only once, even when multiple clicks', fakeAsync(() => {
                    jest.spyOn(component.saveFacade, 'apply');

                    // click on apply button multiple times
                    clickApply();
                    clickApply();
                    clickApply();
                    tick(600); // tick to account for debounce time and timeout to re-enable button

                    expect(component.saveFacade.apply).toHaveBeenCalledTimes(1);
                }));
            });
        });

        describe('in add mode', () => {
            beforeEach(fakeAsync(() => {
                initialize('add');
                component.form.patchControlValue('fromStore', { code: 'FROM_STORE' }, { emitEvent: false });
                component.form.patchControlValue('toStore', { code: 'TO_STORE' }, { emitEvent: false });
                component.form.patchControlValue('inventoryTransferProducts', [testInventoryTransferProduct]);
                fixture.detectChanges();
            }));

            describe('save button', () => {
                it('should call the inventoryTransferFacade to save and navigate back to the previous page', () => {
                    const testAddInventoryTransfer = {
                        ...new InventoryTransfer(),
                        fromStore: { code: 'FROM_STORE' },
                        toStore: { code: 'TO_STORE' },
                        inventoryTransferProducts: [testInventoryTransferProduct],
                    };
                    jest.spyOn(inventoryTransferFacade, 'save').mockReturnValue(of({}));

                    // calling save directly because there's not a way to initialize a valid form in add mode
                    component.save();
                    fixture.detectChanges();

                    expect(inventoryTransferFacade.save).toHaveBeenCalledWith(
                        Object.assign({ ...testAddInventoryTransfer }, component.form.value)
                    );
                    expect(routerService.navigateToSearchPage).toHaveBeenCalled();
                });

                it('should call save only once, even when multiple clicks', fakeAsync(() => {
                    jest.spyOn(component.saveFacade, 'save');

                    //to force the conditions so the save button renders
                    Object.defineProperty(component.form, 'invalid', {
                        get: () => {
                            return false;
                        },
                    });
                    expect(getSaveActionButton(fixture).nativeElement).toBeTruthy();

                    // click on apply button multiple times
                    clickSave();
                    clickSave();
                    clickSave();
                    tick(600); // tick to account for debounce time and timeout to re-enable button
                    fixture.detectChanges();

                    expect(component.saveFacade.save).toHaveBeenCalledTimes(1);
                }));
            });

            describe('apply button', () => {
                it('should revert the router history after clicking apply', () => {
                    jest.spyOn(component.saveFacade, 'apply').mockReturnValue(of({}));
                    jest.spyOn(component.routerHistoryFacade, 'revertRouterHistory');

                    // calling apply directly because there's not a way to initialize a valid form in add mode
                    component.apply();
                    fixture.detectChanges();
                    expect(component.routerHistoryFacade.revertRouterHistory).toHaveBeenCalledWith(1);
                });

                it('should call apply only once, even when multiple clicks', fakeAsync(() => {
                    jest.spyOn(component.saveFacade, 'apply');

                    // to force the conditions so the apply button renders
                    Object.defineProperty(component.form, 'invalid', {
                        get: () => {
                            return false;
                        },
                    });
                    expect(getApplyActionButton(fixture).nativeElement).toBeTruthy();

                    // click on apply button multiple times
                    clickApply();
                    clickApply();
                    clickApply();
                    tick(600); // tick to account for debounce time and timeout to re-enable button
                    fixture.detectChanges();

                    expect(component.saveFacade.apply).toHaveBeenCalledTimes(1);
                }));
            });

            it('should not display unsaved changes dialog when saving', fakeAsync(() => {
                jest.spyOn(inventoryTransferFacade, 'save').mockReturnValue(of({}));
                clickSave();

                expect(component.unsavedChanges).toBeFalsy();
            }));

            it('should finalize a transfer', () => {
                const testAddInventoryTransfer = {
                    ...new InventoryTransfer(),
                    fromStore: { code: 'FROM_STORE' },
                    toStore: { code: 'TO_STORE' },
                    inventoryTransferProducts: [testInventoryTransferProduct],
                };
                jest.spyOn(inventoryTransferFacade, 'finalize').mockReturnValue(of({}));

                // calling finalize directly because there's not a way to initialize a valid form in add mode
                component.finalize();
                fixture.detectChanges();

                expect(inventoryTransferFacade.finalize).toHaveBeenCalledWith(
                    Object.assign({ ...testAddInventoryTransfer }, component.form.value)
                );
                expect(component.form.pristine).toBeTruthy();
                expect(component.unsavedChanges).toBeFalsy();
            });

            it('should show the finalize transfer button', () => {
                expect(fixture.debugElement.query(By.css('#finalize-action'))).toBeTruthy();
                expect(fixture.debugElement.query(By.css('#finalize-action')).nativeElement.enabled).toBeFalsy();
            });
        });
    });

    describe('product add input', () => {
        const productAddInputComponent = () => {
            return fixture.debugElement.query(By.css('#product-add-input'))
                .componentInstance as ProductAddInputComponent;
        };
        const transferProduct0: InventoryTransferProduct = {
            product: { id: 0, code: '00', description: 'product0', version: 0 },
            uom: { id: 0, code: 'uom', description: 'Unit', version: 0 },
            quantity: 1,
            quantityOnHand: 10,
        };
        const transferProduct1: InventoryTransferProduct = {
            product: { id: 1, code: '01', description: 'product1', version: 0 },
            uom: transferProduct0.uom,
            quantity: 2,
            quantityOnHand: 2,
        };
        const generateTransferProduct0: GenerateTransferProduct = {
            id: { productId: transferProduct0.product.id, storeId: 2 },
            code: transferProduct0.product.code,
            uom: { code: 'EACH' },
            quantityOnHand: 10,
        };
        const generateTransferProduct1: GenerateTransferProduct = {
            id: { productId: transferProduct1.product.id, storeId: 2 },
            code: transferProduct1.product.code,
            uom: { code: 'EACH' },
            quantityOnHand: 2,
        };
        const addedProducts = [
            { id: generateTransferProduct0.id.productId, code: generateTransferProduct0.code },
            { id: generateTransferProduct1.id.productId, code: generateTransferProduct1.code },
        ];

        beforeEach(fakeAsync(() => {
            initialize('add');
            component.form.setControlValue('fromStore', testInventoryTransfer.fromStore);
            component.form.setControlValue('toStore', testInventoryTransfer.toStore);
            tick(500);
            fixture.detectChanges();
        }));

        it('should accept isLoading as a parameter for addDisabled', fakeAsync(() => {
            expect(component.storesSelected).toBeTruthy();
            expect(component.isLoading).toBeFalsy();
            expect(productAddInputComponent().addDisabled).toBeFalsy();

            component.isLoading = true;
            fixture.detectChanges();

            expect(productAddInputComponent().addDisabled).toEqual(component.isLoading);
        }));

        it('should accept the existing product codes as a parameter for existingProductCodes', () => {
            jest.spyOn(component, 'addRequestedProducts');
            jest.spyOn(inventoryTransferFacade, 'productLookup').mockReturnValue(
                of([generateTransferProduct0, generateTransferProduct1])
            );

            productAddInputComponent().products.emit(addedProducts);
            fixture.detectChanges();

            expect(productAddInputComponent().existingProductCodes).toContainEqual(transferProduct0.product.code);
            expect(productAddInputComponent().existingProductCodes).toContainEqual(transferProduct1.product.code);
        });

        it('should accept a search function as a parameter for searchFn', fakeAsync(() => {
            expect(productAddInputComponent().searchFn).toEqual(component.searchProductsFn);
        }));

        it('should be disabled in add mode if stores are not selected', () => {
            component.form.patchValue(new InventoryTransfer());
            fixture.detectChanges();
            expect(productAddInputComponent().addDisabled).toBeTruthy();
        });

        it('should output product information to the addRequestedProducts method', fakeAsync(() => {
            jest.spyOn(component, 'addRequestedProducts');
            jest.spyOn(inventoryTransferFacade, 'productLookup').mockReturnValue(
                of([generateTransferProduct0, generateTransferProduct1])
            );
            expect(component.form.getArray('inventoryTransferProducts').length).toEqual(0);

            component.addRequestedProducts(addedProducts);
            fixture.detectChanges();

            expect(component.addRequestedProducts).toHaveBeenCalledWith(addedProducts);
            expect(component.form.getArray('inventoryTransferProducts').length).toEqual(2);
            expect(productAddInputComponent().existingProductCodes).toContainEqual(transferProduct0.product.code);
            expect(productAddInputComponent().existingProductCodes).toContainEqual(transferProduct1.product.code);
        }));

        it('should add products that have not already been added', fakeAsync(() => {
            jest.spyOn(component, 'addRequestedProducts');
            jest.spyOn(inventoryTransferFacade, 'productLookup')
                .mockReturnValueOnce(of([generateTransferProduct0]))
                .mockReturnValueOnce(of([generateTransferProduct1]));

            component.addRequestedProducts([{ code: generateTransferProduct0.code }]);
            fixture.detectChanges();

            expect(component.addRequestedProducts).toHaveBeenCalledWith([{ code: generateTransferProduct0.code }]);
            expect(component.form.getArray('inventoryTransferProducts').length).toEqual(1);
            expect(productAddInputComponent().existingProductCodes).toContainEqual(transferProduct0.product.code);

            // Since transferProduct0.product.code already exists, only transferProduct1.product.code should be added.
            component.addRequestedProducts(addedProducts);
            fixture.detectChanges();

            expect(component.addRequestedProducts).toHaveBeenCalledWith(addedProducts);
            expect(component.form.getArray('inventoryTransferProducts').length).toEqual(2);
            expect(productAddInputComponent().existingProductCodes).toContainEqual(transferProduct0.product.code);
            expect(productAddInputComponent().existingProductCodes).toContainEqual(transferProduct1.product.code);
        }));

        it('should mark product form group as dirty when adding a product', fakeAsync(() => {
            jest.spyOn(component, 'addRequestedProducts');
            jest.spyOn(inventoryTransferFacade, 'productLookup').mockReturnValue(of([generateTransferProduct0]));
            expect(component.form.dirty).toEqual(false);
            expect(component.unsavedChanges).toBeFalsy();
            productAddInputComponent().products.emit(addedProducts);
            // validate that form is dirty
            expect(component.form.dirty).toEqual(true);
            expect(component.unsavedChanges).toBeTruthy();
        }));

        it('should disable finalize button when there is no product', () => {
            jest.spyOn(component, 'addRequestedProducts');
            jest.spyOn(inventoryTransferFacade, 'productLookup').mockReturnValue(of([generateTransferProduct0]));
            component.onRemoveProducts([generateTransferProduct0.code]);
            fixture.detectChanges();
            expect(fixture.debugElement.query(By.css('#finalize-action')).nativeElement.disabled).toBe(true);
        });

        it('should disable apply button when there is no product', () => {
            jest.spyOn(component, 'addRequestedProducts');
            jest.spyOn(inventoryTransferFacade, 'productLookup').mockReturnValue(of([generateTransferProduct0]));
            component.onRemoveProducts([generateTransferProduct0.code]);
            fixture.detectChanges();

            expect(getApplyActionButton(fixture).nativeElement.disabled).toBe(true);
        });

        it('should disable save button when there is no product', () => {
            jest.spyOn(component, 'addRequestedProducts');
            jest.spyOn(inventoryTransferFacade, 'productLookup').mockReturnValue(of([generateTransferProduct0]));
            component.onRemoveProducts([generateTransferProduct0.code]);
            fixture.detectChanges();
            expect(getSaveActionButton(fixture).nativeElement.disabled).toBe(true);
        });
    });
});
