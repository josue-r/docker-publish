import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { FormArray, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, ActivatedRouteSnapshot, Router, convertToParamMap } from '@angular/router';
import {
    ProductAdjustment,
    ProductAdjustmentDetail,
    ProductAdjustmentFacade,
} from '@vioc-angular/central-ui/inventory/data-access-product-adjustment';
import { ResourceFacade } from '@vioc-angular/central-ui/organization/data-access-resources';
import { StoreProductFacade } from '@vioc-angular/central-ui/product/data-access-store-product';
import {
    FeatureSharedProductAddInputMockModule,
    ProductAddInputComponent,
} from '@vioc-angular/central-ui/product/feature-shared-product-add-input';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { CommonFunctionalityModule, Described, formatMoment } from '@vioc-angular/shared/common-functionality';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { RouterHistoryFacade } from '@vioc-angular/shared/data-access-router-history';
import { UiActionBarModule } from '@vioc-angular/shared/ui-action-bar';
import { UiAuditModule } from '@vioc-angular/shared/ui-audit';
import { PrintButtonComponent, UiButtonModule } from '@vioc-angular/shared/ui-button';
import { UiDialogMockModule } from '@vioc-angular/shared/ui-dialog';
import { MockFilteredInputComponent, UiFilteredInputMockModule } from '@vioc-angular/shared/ui-filtered-input';
import { MockLoadingOverlayComponent, UiLoadingMockModule } from '@vioc-angular/shared/ui-loading';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { FormFactory, TypedFormGroup, UtilFormMockModule } from '@vioc-angular/shared/util-form';
import { expectInput, getCancelActionButton } from '@vioc-angular/test/util-test';
import { ReplaySubject, Subject, of } from 'rxjs';
import { ProductAdjustmentForms } from '../product-adjustment-module-forms';
import { ProductAdjustmentComponent } from './product-adjustment.component';

describe('ProductAdjustmentComponent', () => {
    let component: ProductAdjustmentComponent;
    let fixture: ComponentFixture<ProductAdjustmentComponent>;
    let formFactory: FormFactory;
    let componentDestroyed: ReplaySubject<any>;
    let resourceFacade: ResourceFacade;
    let productAdjustmentFacade: ProductAdjustmentFacade;
    let router: Router;
    let loader: HarnessLoader;
    let storeProductFacade: StoreProductFacade;

    @Component({
        selector: 'vioc-angular-product-adjustment-products',
        template: '',
    })
    class MockProductAdjustmentProductsComponent {
        @Input() form: FormArray;
        @Input() status: string;
        @Input() reasonType: Described[];
        @Input() accessMode: AccessMode;
        @Input() disableSelection: boolean;
        @Output() removeProducts = new EventEmitter<string[]>();
    }

    const testProductAdjustmentDetail: ProductAdjustmentDetail = {
        id: { lineNumber: 1, adjustmentNumber: 1 },
        sign: '+',
        lineNumber: 1,
        quantity: 2,
        wholesalePrice: 1,
        unitOfMeasure: { id: 0, code: 'uom', description: 'Unit', version: 0 },
        product: { id: 0, code: '01', description: 'product', version: 0 },
        adjustmentReason: { id: 1, code: 'reason', description: 'Reason' },
    };

    const testProductAdjustment: ProductAdjustment = {
        id: 1,
        createdDate: '2021-01-01',
        comments: 'test',
        status: { id: 1, code: 'FINALIZED', description: 'Finalized', version: 0 },
        store: { id: 0, code: 'st00', description: 'store 00', version: 0 },
        adjustmentProducts: [testProductAdjustmentDetail],
        createdByEmployee: {
            id: 'a998877',
            firstName: 'Bob',
            lastName: 'Smith',
            name: 'Bob Smith',
        },
        updatedBy: '',
        updatedOn: '',
    };

    const testAddProductAdjustment: ProductAdjustment = {
        comments: 'test',
        store: { id: 0, code: 'st00', description: 'store 00', version: 0 },
        adjustmentProducts: [testProductAdjustmentDetail],
        createdByEmployee: null,
        createdDate: null,
        id: null,
        status: null,
        type: null,
        updatedBy: null,
        updatedByEmployee: null,
        updatedOn: null,
    };

    const resource = {
        resources: [
            { id: 0, code: 'STORE1', description: 'store 1', version: 0 },
            { id: 1, code: 'STORE2', description: 'store 2', version: 0 },
        ],
        allCompanies: false,
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                ReactiveFormsModule,
                UiActionBarModule,
                UiAuditModule,
                UiFilteredInputMockModule,
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
                UiButtonModule,
            ],
            declarations: [ProductAdjustmentComponent, MockProductAdjustmentProductsComponent],
            providers: [
                FormFactory,
                { provide: GATEWAY_TOKEN, useValue: '//gateway/' },
                {
                    provide: ActivatedRoute,
                    useValue: { params: new Subject(), parent: '/inventory/product-adjustment' },
                },
                { provide: HttpClient, useValue: { get: jest.fn(() => of()), post: jest.fn(() => of()) } },
                { provide: Router, useValue: { navigate: jest.fn() } },
                { provide: RouterHistoryFacade, useValue: { revertRouterHistory: jest.fn() } },
                { provide: MessageFacade, useValue: { addMessage: jest.fn() } },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        ProductAdjustmentForms.registerForms(TestBed.inject(FormFactory), TestBed.inject(FormBuilder));
        fixture = TestBed.createComponent(ProductAdjustmentComponent);
        loader = TestbedHarnessEnvironment.loader(fixture);

        formFactory = TestBed.inject(FormFactory);
        router = TestBed.inject(Router);
        componentDestroyed = new ReplaySubject(1);
        component = fixture.componentInstance;
        storeProductFacade = component.storeProductFacade;

        resourceFacade = component['resourceFacade'];
        productAdjustmentFacade = component['productAdjustmentFacade'];
        productAdjustmentFacade.finalize = jest.fn();
        jest.spyOn(resourceFacade, 'findStoresByRoles').mockReturnValue(of(resource));
        storeProductFacade.findByStoreAndProducts = jest.fn(() => of([]));
    });

    afterEach(() => componentDestroyed.next());

    const initialize = (
        accessMode: 'view' | 'edit' | 'add',
        model: ProductAdjustment = testProductAdjustment,
        andFlush = true
    ): void => {
        const route = TestBed.inject(ActivatedRoute);
        route.snapshot = {
            paramMap: convertToParamMap({
                accessMode: accessMode,
                adjustmentId: model?.id,
            }),
        } as ActivatedRouteSnapshot;
        fixture.detectChanges();
        if (andFlush) {
            flush();
        }
    };

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display overlay if it is loading', fakeAsync(() => {
        initialize('add');
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
            initialize('add');
            fixture.debugElement.query(By.css('#cancel-action')).nativeElement.click();

            expect(router.navigate).toHaveBeenCalledWith(['search'], {
                relativeTo: TestBed.inject(ActivatedRoute).parent,
            });
        }));
    });

    describe('ngOnInit', () => {
        describe('in edit mode', () => {
            it('should change the accessMode to view', fakeAsync(() => {
                initialize('edit');
                expect(component.accessMode).toBe(AccessMode.VIEW);
            }));
        });

        describe('in view mode', () => {
            it('should load a disabled form', fakeAsync(() => {
                jest.spyOn(productAdjustmentFacade, 'findByAdjustmentId').mockReturnValue(of(testProductAdjustment));

                initialize('view');
                expect(component.form.enabled).toBeFalsy();
            }));
        });
        describe.each`
            field             | value
            ${'adjustmentid'} | ${testProductAdjustment.id.toString()}
            ${'store'}        | ${testProductAdjustment.store.code}
            ${'status'}       | ${testProductAdjustment.status.description}
            ${'created-date'} | ${formatMoment(testProductAdjustment.createdDate)}
            ${'created-by'}   | ${testProductAdjustment.createdByEmployee.name}
            ${'comments'}     | ${testProductAdjustment.comments}
        `('disabled fields', ({ field, value }) => {
            it(`should display a disabled input for ${field} as ${value}`, fakeAsync(() => {
                jest.spyOn(productAdjustmentFacade, 'findByAdjustmentId').mockReturnValue(of(testProductAdjustment));
                initialize('view', testProductAdjustment);
                fixture.detectChanges();
                expectInput(fixture, { id: `${field}-input` })
                    .toHaveValue(value)
                    .toBeEnabled(false);
            }));
        });

        it('should throw an error when an unhandled access mode is specified', () => {
            // Assuming add-like is unsupported
            TestBed.inject(ActivatedRoute).snapshot = {
                paramMap: convertToParamMap({ accessMode: 'add-like' }),
            } as ActivatedRouteSnapshot;
            expect(() => fixture.detectChanges()).toThrowError('Unhandled Access Mode: add-like');
        });

        it('should automatically select the store for add if only one is available', fakeAsync(() => {
            const store = { id: 0, code: '040066', description: 'Test Store', version: 0 };

            jest.spyOn(resourceFacade, 'findStoresByRoles').mockReturnValue(
                of({
                    resources: [store],
                    allCompanies: false,
                })
            );
            initialize('add');

            expect(component.form.getControlValue('store')).toEqual(store);
        }));

        describe('store selection', () => {
            let storeInput;

            describe('store access', () => {
                beforeEach(fakeAsync(() => {
                    initialize('add');
                    storeInput = fixture.debugElement.query(By.css('#store-input'))
                        .componentInstance as MockFilteredInputComponent;
                }));

                it('should display a store selection field', () => {
                    expect(storeInput).toBeTruthy();
                });

                it('should pass values to the store selection field', () => {
                    expect(storeInput.placeHolder).toEqual('Store');
                    expect(storeInput.editable).toEqual(true);
                    expect(storeInput.options).toEqual(resource.resources);
                    expect(storeInput.valueControl.value).toBeNull();
                });

                it('should update the store form value', () => {
                    const storeValue = resource.resources[0];
                    storeInput.valueControl.setValue(storeValue);
                    expect(component.form.getControlValue('store')).toEqual(storeValue);
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
                component.form.setControlValue('store', testProductAdjustment.store);
                flush();
                fixture.detectChanges();
            }));

            function getProductsComponent(): MockProductAdjustmentProductsComponent {
                return fixture.debugElement.query(By.directive(MockProductAdjustmentProductsComponent))
                    .componentInstance as MockProductAdjustmentProductsComponent;
            }

            it('should pass product form array into the products component', () => {
                expect(getProductsComponent().form).toEqual(component.form.getArray('adjustmentProducts'));
            });

            it('should pass the status into the products component', () => {
                component.form.setControlValue('status', testProductAdjustment.status);
                fixture.detectChanges();
                expect(getProductsComponent().status).toEqual(testProductAdjustment.status.code);
            });

            it('should handle null status in the products component', () => {
                component.form.setControlValue('status', null);
                fixture.detectChanges();
                expect(getProductsComponent().status).toEqual(null);
            });

            const product1: ProductAdjustmentDetail = {
                product: { id: 1, code: 'TEST', description: 'Test Description' },
                unitOfMeasure: { code: 'EACH', description: 'Each' },
                quantity: null,
            };
            const product2: ProductAdjustmentDetail = {
                ...product1,
                product: { code: 'TEST2', description: 'Test Description2' },
            };
            const product3: ProductAdjustmentDetail = {
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
                        'adjustmentProducts',
                        formFactory.array('ProductAdjustmentDetail', [product1, product2, product3], componentDestroyed)
                    );
                    const initialArray = component.form.getArray('adjustmentProducts');

                    getProductsComponent().removeProducts.emit(toRemove);
                    fixture.detectChanges();

                    const productsArray = component.form.getArray('adjustmentProducts');
                    expect(
                        productsArray.controls.map(
                            (adjustmentProduct) =>
                                (adjustmentProduct as TypedFormGroup<ProductAdjustmentDetail>).getControlValue(
                                    'product'
                                ).code
                        )
                    ).toEqual(expectedRemaining);
                    expect(getProductsComponent().form).toEqual(productsArray);
                    expect(getProductsComponent().form).not.toBe(initialArray);
                }
            );

            it('should dirty the form', () => {
                component.form.setControl(
                    'adjustmentProducts',
                    formFactory.array('ProductAdjustmentDetail', [product1, product2, product3], componentDestroyed)
                );

                getProductsComponent().removeProducts.emit([product1.product.code]);
                fixture.detectChanges();

                expect(component.form.dirty).toBeTruthy();
            });
        });

        describe('Action Bar', () => {
            describe("finalized adjustment button shouldn't be enabled when no products are associated with adjustment", () => {
                beforeEach(fakeAsync(() => {
                    initialize('add', {
                        ...testProductAdjustment,
                        adjustmentProducts: [],
                    });
                }));
                it('should finalize adjustment button should be disabled when no products are associated with adjustment', fakeAsync(() => {
                    expect(fixture.debugElement.query(By.css('#finalize-action')).nativeElement.disabled).toBe(true);
                }));
            });

            describe.each`
                formState    | cancelEnabled | finalizeAdjustmentDisplayed
                ${'valid'}   | ${true}       | ${true}
                ${'invalid'} | ${true}       | ${false}
            `('with a $formState form', ({ formState, cancelEnabled, finalizeAdjustmentDisplayed }) => {
                beforeEach(fakeAsync(() => {
                    initialize('add');
                    component.form.patchValue(testProductAdjustment);
                    component.form.setControl(
                        'adjustmentProducts',
                        formFactory.array(
                            'ProductAdjustmentDetail',
                            [testProductAdjustmentDetail],
                            componentDestroyed,
                            { accessMode: AccessMode.ADD }
                        )
                    );
                    if (formState !== 'valid') {
                        component.form.setErrors({ invalid: true });
                    }
                    fixture.detectChanges();
                }));

                it(`should cancel button should be ${cancelEnabled ? 'en' : 'dis'}abled`, fakeAsync(() => {
                    expect(getCancelActionButton(fixture).nativeElement.disabled).toBe(!cancelEnabled);
                }));
                it(`should finalize button should be ${
                    finalizeAdjustmentDisplayed ? 'en' : 'dis'
                }abled`, fakeAsync(() => {
                    expect(fixture.debugElement.query(By.css('#finalize-action')).nativeElement.disabled).toBe(
                        !finalizeAdjustmentDisplayed
                    );
                }));
            });

            describe('finalize button', () => {
                beforeEach(fakeAsync(() => {
                    jest.spyOn(component.finalizeDialog, 'open');
                    jest.spyOn(component.finalizeDialog, 'close');
                    jest.spyOn(component, 'finalize');
                    jest.spyOn(component.messageFacade, 'addMessage');
                    jest.spyOn(component.finalizeFacade, 'save');
                    jest.spyOn(productAdjustmentFacade, 'finalize').mockReturnValue(of({}));
                    initialize('add');

                    // Init form for page to allow finalize
                    component.form.patchValue(testAddProductAdjustment);
                    component.form.setControl(
                        'adjustmentProducts',
                        formFactory.array(
                            'ProductAdjustmentDetail',
                            [testProductAdjustmentDetail],
                            componentDestroyed,
                            { accessMode: AccessMode.ADD }
                        )
                    );
                }));

                it('should prompt user finalize confirmation', fakeAsync(async () => {
                    //open dialog
                    const finalize = await loader.getHarness(MatButtonHarness.with({ selector: '#finalize-action' }));
                    await finalize.click();

                    //validate that dialog was opened
                    expect(component.finalizeDialog.open).toHaveBeenCalled();
                }));

                it('should close prompt after clicking GO BACK button', fakeAsync(async () => {
                    const finalize = await loader.getHarness(MatButtonHarness.with({ selector: '#finalize-action' }));
                    await finalize.click();

                    //validate GO BACK button had appeared
                    expect(component.finalizeDialog.open).toHaveBeenCalled();
                    const cancelButton = await loader.getHarness(
                        MatButtonHarness.with({ selector: '#finalize-cancel-button' })
                    );
                    expect(cancelButton).toBeTruthy();

                    // click on GO BACK button
                    await cancelButton.click();
                    fixture.detectChanges();

                    //validate that dialog was closed
                    expect(component.finalizeDialog.close).toHaveBeenCalled();
                }));

                it('should call the productAdjustmentFacade to finalize the adjustment after clicking FINALIZE ADJUSTMENT button', fakeAsync(async () => {
                    const finalize = await loader.getHarness(MatButtonHarness.with({ selector: '#finalize-action' }));
                    await finalize.click();
                    fixture.detectChanges();

                    //validate FINALIZE ADJUSTMENT button had appeared
                    expect(component.finalizeDialog.open).toHaveBeenCalled();
                    const continueButton = await loader.getHarness(
                        MatButtonHarness.with({ selector: '#finalize-continue-button' })
                    );
                    expect(continueButton).toBeTruthy();

                    // click on FINALIZE ADJUSTMENT button
                    await continueButton.click();
                    tick(600); // tick to account for debounce time and button timeout to re-enable
                    flush();
                    fixture.detectChanges();

                    // validate adjustment facade is called
                    expect(component.finalize).toHaveBeenCalled();
                    expect(component.finalizeFacade.save).toHaveBeenCalled();
                    expect(productAdjustmentFacade.finalize).toHaveBeenCalledWith(testAddProductAdjustment);
                }));

                it('should call finalize only once when clicked multiple times', fakeAsync(async () => {
                    component.form.patchValue(testAddProductAdjustment);
                    component.form.setControl(
                        'adjustmentProducts',
                        formFactory.array(
                            'ProductAdjustmentDetail',
                            [testProductAdjustmentDetail],
                            componentDestroyed,
                            { accessMode: AccessMode.ADD }
                        )
                    );

                    const finalize = await loader.getHarness(MatButtonHarness.with({ selector: '#finalize-action' }));
                    await finalize.click();
                    fixture.detectChanges();

                    //validate FINALIZE ADJUSTMENT button had appeared
                    expect(component.finalizeDialog.open).toHaveBeenCalled();
                    const continueButton = await loader.getHarness(
                        MatButtonHarness.with({ selector: '#finalize-continue-button' })
                    );
                    expect(continueButton).toBeTruthy();

                    // multiple click on FINALIZE ADJUSTMENT button
                    continueButton.click();
                    continueButton.click();
                    continueButton.click();
                    tick(600); // tick to account for debounce time and button timeout to re-enable
                    fixture.detectChanges();

                    // validate adjustment facade is called
                    expect(component.finalize).toHaveBeenCalled();
                    // only one product should be finalized even if finalize is clicked multiple times
                    expect(component.finalizeFacade.save).toHaveBeenCalledTimes(1);
                    expect(productAdjustmentFacade.finalize).toHaveBeenCalledWith(testAddProductAdjustment);
                }));

                it('should navigate the user back to the search page', fakeAsync(async () => {
                    const finalize = await loader.getHarness(MatButtonHarness.with({ selector: '#finalize-action' }));
                    await finalize.click();
                    fixture.detectChanges();
                    const continueButton = await loader.getHarness(
                        MatButtonHarness.with({ selector: '#finalize-continue-button' })
                    );
                    await continueButton.click();
                    tick(600); // tick to account for debounce time and button timeout to re-enable
                    fixture.detectChanges();
                    expect(TestBed.inject(Router).navigate).toHaveBeenCalledWith(['search'], {
                        relativeTo: TestBed.inject(ActivatedRoute).parent,
                    });
                }));
            });

            describe('when saving', () => {
                describe('in add mode', () => {
                    beforeEach(fakeAsync(() => {
                        initialize('add');
                        component.form.patchControlValue('store', { code: 'FROM_STORE' }, { emitEvent: false });
                        component.form.patchControlValue('adjustmentProducts', [testProductAdjustmentDetail]);
                        fixture.detectChanges();
                    }));

                    it('should finalize a adjustment', () => {
                        jest.spyOn(productAdjustmentFacade, 'finalize').mockReturnValue(of({}));

                        // calling finalize directly because there's not a way to initialize a valid form in add mode
                        component.finalize();
                        fixture.detectChanges();

                        expect(productAdjustmentFacade.finalize).toHaveBeenCalledWith(
                            Object.assign({ ...testAddProductAdjustment }, component.form.value)
                        );
                        expect(component.form.pristine).toBeTruthy();
                        expect(component.unsavedChanges).toBeFalsy();
                    });

                    it('should show the finalize adjustment button', () => {
                        expect(fixture.debugElement.query(By.css('#finalize-action'))).toBeTruthy();
                        expect(
                            fixture.debugElement.query(By.css('#finalize-action')).nativeElement.enabled
                        ).toBeFalsy();
                    });
                });
            });

            describe('product add input', () => {
                const productAddInputComponent = () => {
                    return fixture.debugElement.query(By.css('#product-add-input'))
                        .componentInstance as ProductAddInputComponent;
                };
                const adjustmentProduct0: ProductAdjustmentDetail = {
                    product: { id: 0, code: '00', description: 'product0', version: 0 },
                    unitOfMeasure: { id: 1, code: 'UOM1', description: 'Test UOM' },
                    quantity: 1,
                };
                const adjustmentProduct1: ProductAdjustmentDetail = {
                    product: { id: 1, code: '01', description: 'product1', version: 0 },
                    unitOfMeasure: { id: 1, code: 'UOM1', description: 'Test UOM' },
                    quantity: 2,
                };
                const addedProducts = [
                    { code: adjustmentProduct0.product.code },
                    { code: adjustmentProduct1.product.code },
                ];
                const inventoryDetails = [
                    {
                        id: { storeId: 1, productId: 0 },
                        maxStockLimit: 50,
                        uom: { id: 1, code: 'UOM1', description: 'Test UOM' },
                        code: '00',
                        version: 1,
                        vendor: {
                            id: 1,
                            code: 12,
                            description: 'Test Desc',
                            valvolineDistributor: true,
                        },
                        description: 'product0',
                        sapNumber: '1234',
                        secondLevelCategory: { id: 5, code: 'CAT1', description: 'Test Category' },
                        active: true,
                    },
                    {
                        id: { storeId: 1, productId: 1 },
                        maxStockLimit: 50,
                        uom: { id: 1, code: 'UOM1', description: 'Test UOM' },
                        code: '01',
                        version: 2,
                        vendor: {
                            id: 1,
                            code: 12,
                            description: 'Test Desc',
                            valvolineDistributor: true,
                        },
                        description: 'product1',
                        sapNumber: '1235',
                        secondLevelCategory: { id: 6, code: 'CAT2', description: 'Test Category 2' },
                        active: true,
                    },
                ];

                const inventoryDetail = [
                    {
                        id: { storeId: 1, productId: 0 },
                        maxStockLimit: 50,
                        uom: { id: 1, code: 'UOM1', description: 'Test UOM' },
                        code: '00',
                        version: 1,
                        vendor: {
                            id: 1,
                            code: 12,
                            description: 'Test Desc',
                            valvolineDistributor: true,
                        },
                        description: 'product0',
                        sapNumber: '1234',
                        secondLevelCategory: { id: 5, code: 'CAT1', description: 'Test Category' },
                        active: true,
                    },
                ];

                beforeEach(fakeAsync(() => {
                    initialize('add');
                    jest.spyOn(component, 'addRequestedProducts');
                    component.form.setControlValue('store', testProductAdjustment.store);
                    flush();
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

                it('should accept the existing product codes as a parameter for existingProductCodes', fakeAsync(() => {
                    const inventoryDetail$ = new Subject<any[]>();

                    jest.spyOn(component.storeProductFacade, 'findByStoreAndProducts').mockReturnValue(
                        inventoryDetail$
                    );

                    const addProductsComponent = fixture.debugElement.query(By.css('#product-add-input'));

                    // add products
                    addProductsComponent.triggerEventHandler('products', addedProducts);
                    // verify state before storeProductFacade call
                    expect(component.isLoading).toBeTruthy();
                    // complete the storeProductFacade call
                    inventoryDetail$.next(inventoryDetails);
                    flush();
                    tick(500);
                    // verify state after storeProductFacade call
                    expect(component.isLoading).toBeFalsy();
                    fixture.detectChanges();

                    expect(productAddInputComponent().existingProductCodes).toContainEqual(
                        adjustmentProduct0.product.code
                    );
                    expect(productAddInputComponent().existingProductCodes).toContainEqual(
                        adjustmentProduct1.product.code
                    );
                }));

                it('should accept a search function as a parameter for searchFn', fakeAsync(() => {
                    expect(productAddInputComponent().searchFn).toEqual(component.searchProductsFn);
                }));

                it('should be disabled in add mode if stores are not selected', () => {
                    component.form.patchValue(new ProductAdjustment());
                    fixture.detectChanges();
                    expect(productAddInputComponent().addDisabled).toBeTruthy();
                });

                it('should output product information to the addRequestedProducts method', fakeAsync(() => {
                    const inventoryDetail$ = new Subject<any[]>();

                    expect(component.form.getArray('adjustmentProducts').length).toEqual(0);

                    jest.spyOn(component.storeProductFacade, 'findByStoreAndProducts').mockReturnValue(
                        inventoryDetail$
                    );

                    const addProductsComponent = fixture.debugElement.query(By.css('#product-add-input'));

                    // add products
                    addProductsComponent.triggerEventHandler('products', addedProducts);
                    // verify state before storeProductFacade call
                    expect(component.isLoading).toBeTruthy();
                    // complete the storeProductFacade call
                    inventoryDetail$.next(inventoryDetails);
                    fixture.detectChanges();

                    expect(component.form.getArray('adjustmentProducts').length).toEqual(2);
                    expect(productAddInputComponent().existingProductCodes).toContainEqual(
                        adjustmentProduct0.product.code
                    );
                    expect(productAddInputComponent().existingProductCodes).toContainEqual(
                        adjustmentProduct1.product.code
                    );
                }));

                it('should add products that have not already been added', fakeAsync(() => {
                    jest.spyOn(component.storeProductFacade, 'findByStoreAndProducts').mockReturnValueOnce(
                        of(inventoryDetail)
                    );

                    const addProductsComponent = fixture.debugElement.query(By.css('#product-add-input'));
                    // add product
                    addProductsComponent.triggerEventHandler('products', [{ code: adjustmentProduct0.product.code }]);
                    fixture.detectChanges();
                    // verify state before storeProductFacade call

                    expect(productAddInputComponent().existingProductCodes).toContainEqual(
                        adjustmentProduct0.product.code
                    );

                    // Since adjustmentProduct0.product.code already exists, only adjustmentProduct1.product.code should be added.
                    // add product
                    jest.spyOn(component.storeProductFacade, 'findByStoreAndProducts').mockReturnValueOnce(
                        of(inventoryDetails)
                    );
                    addProductsComponent.triggerEventHandler('products', addedProducts);
                    fixture.detectChanges();
                    // verify state before storeProductFacade call

                    // complete the storeProductFacade call

                    expect(productAddInputComponent().existingProductCodes).toContainEqual(
                        adjustmentProduct0.product.code
                    );
                    expect(productAddInputComponent().existingProductCodes).toContainEqual(
                        adjustmentProduct1.product.code
                    );
                }));

                it('should mark product form group as dirty when adding a product', fakeAsync(() => {
                    jest.spyOn(component.storeProductFacade, 'findByStoreAndProducts').mockReturnValue(
                        of(inventoryDetails)
                    );

                    expect(component.form.dirty).toEqual(false);
                    expect(component.unsavedChanges).toBeFalsy();
                    const addProductsComponent = fixture.debugElement.query(By.css('#product-add-input'));
                    // add products
                    addProductsComponent.triggerEventHandler('products', addedProducts);
                    flush();
                    fixture.detectChanges();
                    // validate that form is dirty
                    expect(component.form.dirty).toEqual(true);
                    expect(component.unsavedChanges).toBeTruthy();
                }));

                it('should display an error if the product requested can not be added', fakeAsync(() => {
                    jest.spyOn(component.storeProductFacade, 'findByStoreAndProducts').mockReturnValue(of([]));

                    const addProductsComponent = fixture.debugElement.query(By.css('#product-add-input'));
                    // add product
                    addProductsComponent.triggerEventHandler('products', [{ code: 'INVALID' }]);

                    flush();
                    fixture.detectChanges();

                    // expect an error message for the product it couldn't add
                    expect(component.messageFacade.addMessage).toHaveBeenCalledWith({
                        severity: 'error',
                        message: 'Unable to add requested product(s): INVALID.',
                        hasTimeout: true,
                    });
                    // validate that form is dirty
                    expect(component.form.dirty).toEqual(true);
                    expect(component.unsavedChanges).toBeTruthy();
                }));

                it('should display an error if the product requested is duplicated', fakeAsync(() => {
                    const inventoryDetail$ = new Subject<any[]>();

                    jest.spyOn(component.storeProductFacade, 'findByStoreAndProducts').mockReturnValue(
                        inventoryDetail$
                    );

                    const addProductsComponent = fixture.debugElement.query(By.css('#product-add-input'));
                    addProductsComponent.triggerEventHandler('products', [{ code: adjustmentProduct0.product.code }]);
                    inventoryDetail$.next(inventoryDetail);

                    fixture.detectChanges();

                    expect(productAddInputComponent().existingProductCodes).toContainEqual(
                        adjustmentProduct0.product.code
                    );

                    addProductsComponent.triggerEventHandler('products', [
                        {
                            code: `${adjustmentProduct0.product.code}, ${adjustmentProduct1.product.code}`,
                        },
                    ]);
                    inventoryDetail$.next(inventoryDetails);

                    fixture.detectChanges();

                    expect(component.messageFacade.addMessage).toHaveBeenCalledWith({
                        severity: 'error',
                        message: `Product(s) ${adjustmentProduct0.product.code} already added.`,
                        hasTimeout: true,
                    });
                    expect(productAddInputComponent().existingProductCodes).toContainEqual(
                        adjustmentProduct0.product.code
                    );
                    expect(productAddInputComponent().existingProductCodes).toContainEqual(
                        adjustmentProduct1.product.code
                    );
                    expect(productAddInputComponent().existingProductCodes).toHaveLength(2);
                }));

                it('should display an error if product is not active', fakeAsync(() => {
                    const inactiveInventoryDetail = { ...inventoryDetails[0], active: false };
                    const activeInventoryDetail = { ...inventoryDetails[0], active: true };
                    const inactiveInventoryDetail2 = { ...inventoryDetails[1], active: false };

                    jest.spyOn(component, 'mapGenerateToProductAdjustmentDetail');
                    jest.spyOn(component.storeProductFacade, 'findByStoreAndProducts')
                        .mockReturnValue(of([inactiveInventoryDetail, activeInventoryDetail]))
                        .mockReturnValue(of([inactiveInventoryDetail2, activeInventoryDetail]));

                    const addProductsComponent = fixture.debugElement.query(By.css('#product-add-input'));
                    addProductsComponent.triggerEventHandler('products', [{ code: adjustmentProduct0.product.code }]);

                    fixture.detectChanges();

                    // expect an error message for the ones it couldn't add
                    expect(component.messageFacade.addMessage).toHaveBeenCalledWith({
                        severity: 'error',
                        message: 'Only active product is allowed.',
                        hasTimeout: true,
                    });
                    expect(component.mapGenerateToProductAdjustmentDetail).toHaveBeenCalledWith([
                        activeInventoryDetail,
                    ]);
                }));

                it('should display an error if the one product requested is duplicated and another is invalid', fakeAsync(() => {
                    jest.spyOn(component.storeProductFacade, 'findByStoreAndProducts')
                        .mockReturnValueOnce(of(inventoryDetail))
                        .mockReturnValueOnce(of(inventoryDetails));

                    const addProductsComponent = fixture.debugElement.query(By.css('#product-add-input'));
                    addProductsComponent.triggerEventHandler('products', [{ code: adjustmentProduct0.product.code }]);

                    fixture.detectChanges();

                    expect(productAddInputComponent().existingProductCodes).toContainEqual(
                        adjustmentProduct0.product.code
                    );

                    addProductsComponent.triggerEventHandler('products', [
                        {
                            code: `${adjustmentProduct0.product.code}, ${adjustmentProduct1.product.code}, INVALID`,
                        },
                    ]);

                    fixture.detectChanges();

                    expect(component.messageFacade.addMessage).toHaveBeenCalledWith({
                        severity: 'error',
                        message: `Product(s) ${adjustmentProduct0.product.code} already added.`,
                        hasTimeout: true,
                    });
                    expect(component.messageFacade.addMessage).toHaveBeenCalledWith({
                        severity: 'error',
                        message: 'Unable to add requested product(s): INVALID.',
                        hasTimeout: true,
                    });
                    expect(productAddInputComponent().existingProductCodes).toContainEqual(
                        adjustmentProduct0.product.code
                    );
                    expect(productAddInputComponent().existingProductCodes).toContainEqual(
                        adjustmentProduct1.product.code
                    );
                    expect(productAddInputComponent().existingProductCodes).toHaveLength(2);
                }));
            });
        });
    });

    describe('print', () => {
        describe.each`
            accessMode | rendered
            ${'add'}   | ${false}
            ${'edit'}  | ${true}
            ${'view'}  | ${true}
        `('rendered', ({ accessMode, rendered }) => {
            it(`should ${rendered ? '' : 'not '}render when accessMode=${accessMode}`, fakeAsync(() => {
                jest.spyOn(productAdjustmentFacade, 'findByAdjustmentId').mockReturnValue(of(testProductAdjustment));
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
