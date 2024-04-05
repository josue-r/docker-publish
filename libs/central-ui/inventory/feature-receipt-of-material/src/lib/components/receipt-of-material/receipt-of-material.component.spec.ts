import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { By, HAMMER_LOADER } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, ActivatedRouteSnapshot, convertToParamMap, Router } from '@angular/router';
import {
    ReceiptOfMaterial,
    ReceiptOfMaterialFacade,
    ReceiptOfMaterialProduct,
} from '@vioc-angular/central-ui/inventory/data-access-receipt-of-material';
import { StoreProductFacade } from '@vioc-angular/central-ui/product/data-access-store-product';
import {
    FeatureSharedProductAddInputMockModule,
    ProductAddInputComponent,
} from '@vioc-angular/central-ui/product/feature-shared-product-add-input';
import { RouterService } from '@vioc-angular/central-ui/util-router';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { CommonFunctionalityModule, Described, formatMoment } from '@vioc-angular/shared/common-functionality';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { UiActionBarModule } from '@vioc-angular/shared/ui-action-bar';
import { UiAuditModule } from '@vioc-angular/shared/ui-audit';
import { PrintButtonComponent, UiButtonModule } from '@vioc-angular/shared/ui-button';
import { MockDialogComponent, UiDialogMockModule } from '@vioc-angular/shared/ui-dialog';
import { MockFilteredInputComponent, UiFilteredInputMockModule } from '@vioc-angular/shared/ui-filtered-input';
import { UiInfoButtonModule } from '@vioc-angular/shared/ui-info-button';
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
import { of, Subject, throwError } from 'rxjs';
import { ReceiptOfMaterialModuleForm } from '../receipt-of-material-module-form';
import { ReceiptOfMaterialComponent } from './receipt-of-material.component';

describe('ReceiptOfMaterialComponent', () => {
    let component: ReceiptOfMaterialComponent;
    let fixture: ComponentFixture<ReceiptOfMaterialComponent>;
    let loader: HarnessLoader;
    let receiptOfMaterialFacade: ReceiptOfMaterialFacade;
    let storeProductFacade: StoreProductFacade;
    let routerService: RouterService;
    const routeParams = new Subject();
    const parentRoute: ActivatedRoute = new ActivatedRoute();

    const testReceiptOfMaterialProducts: ReceiptOfMaterialProduct[] = [
        {
            lineNumber: 1,
            quantityOrdered: 2,
            quantityReceived: 2,
            wholesalePrice: 5,
            uom: {
                id: 1,
                code: 'TEST',
                description: 'Test UOM',
                version: 1,
            },
            product: {
                id: 2,
                code: 'TEST',
                description: 'Test Product',
                version: 1,
            },
            sapNumber: '1234',
            secondLevelCategory: {
                id: 1,
                code: 'TEST',
                description: 'Test Category',
                version: 1,
            },
        },
        {
            lineNumber: 2,
            quantityOrdered: 1,
            quantityReceived: 1,
            wholesalePrice: 15,
            uom: {
                id: 2,
                code: 'FAKE',
                description: 'Fake UOM',
                version: 1,
            },
            product: {
                id: 2,
                code: 'FAKE',
                description: 'Fake Product',
                version: 1,
            },
            sapNumber: '1234',
            secondLevelCategory: {
                id: 2,
                code: 'FAKE',
                description: 'Fake Category',
                version: 1,
            },
        },
    ];

    const testReceiptOfMaterial: ReceiptOfMaterial = {
        id: { number: 'R00000', storeId: 1 },
        number: 'R00000',
        store: {
            code: 'S4444',
            description: 'Test Store',
            version: 1,
        },
        vendor: {
            id: 2,
            code: 'TEST',
            description: 'Test Vendor',
            version: 1,
        },
        receiptDate: null,
        status: {
            id: 3,
            code: 'TEST',
            description: 'Test Status',
            version: 1,
        },
        receiptType: {
            id: 4,
            code: 'TEST',
            description: 'Test RM Type',
            version: 1,
        },
        finalizedOn: null,
        finalizedByEmployee: {
            firstName: 'John',
            lastName: 'Doe',
            id: '1234',
        },
        createdByEmployee: {
            firstName: 'John',
            lastName: 'Doe',
            id: '1234',
        },
        originalNumber: 'R11111',
        source: null,
        sourceStore: {
            code: 'S5555',
            description: 'Test Source Store',
            version: 1,
        },
        poNumber: '5678',
        invoiceNumber: '123456789',
        deliveryTicket: 'DT0001',
        comments: 'Test comment',
        shipTo: '123456',
        receiptProducts: testReceiptOfMaterialProducts,
        version: 0,
    };

    const findById = (id: string) => fixture.debugElement.query(By.css(`#${id}`));
    const getSelectAndGo = () =>
        fixture.debugElement.query(By.css('.store-and-vendor-select')).injector.get(MockSelectAndGoComponent);

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ReceiptOfMaterialComponent],
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
                    useValue: { params: routeParams, parent: '/inventory/receipt-of-material' },
                },
                { provide: Router, useValue: { navigate: jest.fn() } },
                { provide: RouterService, useValue: { navigateToSearchPage: jest.fn(), back: jest.fn() } },
                { provide: MessageFacade, useValue: { addMessage: jest.fn() } },
                { provide: GATEWAY_TOKEN, useValue: '//gateway/' },
                { provide: HttpClient, useValue: {} },
                { provide: ActivatedRoute, useValue: { params: new Subject(), parent: parentRoute } },
                { provide: HAMMER_LOADER, useValue: () => new Promise(() => {}) },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ReceiptOfMaterialComponent);
        loader = TestbedHarnessEnvironment.loader(fixture);
        component = fixture.componentInstance;
        routerService = TestBed.inject(RouterService);
        ReceiptOfMaterialModuleForm.registerForms(TestBed.inject(FormFactory), TestBed.inject(FormBuilder));
        receiptOfMaterialFacade = component.receiptOfMaterialFacade;
        storeProductFacade = component.storeProductFacade;
        component.commonCodeFacade.findByType = jest.fn(() => of([]));
        component.resourceFacade.findStoresByRoles = jest.fn(() => of({ resources: [], allCompanies: false }));
        component.vendorFacade.findByStore = jest.fn(() => of([]));
        component.parameterFacade.findStoreParameterValue = jest.fn(() => of(null));
        receiptOfMaterialFacade.findReceiptProducts = jest.fn();
        receiptOfMaterialFacade.findAssociatedReceiptsOfMaterial = jest.fn();
        receiptOfMaterialFacade.save = jest.fn(() => of(null));

        storeProductFacade.getInventoryDetails = jest.fn(() => of([]));
    });

    /** Initialize the the component with the given access mode, type and code. */
    const initialize = (
        accessMode: 'view' | 'edit' | 'add',
        model: ReceiptOfMaterial = testReceiptOfMaterial,
        andflush = true,
        viewWholeSalePrice = true
    ) => {
        const route = TestBed.inject(ActivatedRoute);
        route.snapshot = {
            paramMap: convertToParamMap({
                accessMode: accessMode,
                storeNum: model?.store.code,
                rmNumber: model?.number,
            }),
        } as ActivatedRouteSnapshot;

        jest.spyOn(component['roleFacade'], 'hasAnyRole').mockReturnValue(of(viewWholeSalePrice));

        const receiptOfMaterial = { ...new ReceiptOfMaterial(), ...model };
        jest.spyOn(receiptOfMaterialFacade, 'findReceiptProducts').mockReturnValue(of(receiptOfMaterial));
        jest.spyOn(receiptOfMaterialFacade, 'findAssociatedReceiptsOfMaterial').mockReturnValueOnce(
            of([testReceiptOfMaterial])
        );

        fixture.detectChanges();
        if (andflush) {
            flush();
        }
    };

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display loading overlay if isLoading', fakeAsync(() => {
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
        let router: Router;
        beforeEach(() => {
            router = TestBed.inject(Router);
        });
        it('should navigate to the search page when clicking cancel button', fakeAsync(() => {
            initialize('edit');
            fixture.debugElement.query(By.css('#cancel-action')).nativeElement.click();

            expect(router.navigate).toHaveBeenCalledWith(['search'], {
                relativeTo: TestBed.inject(ActivatedRoute).parent,
            });
        }));
    });

    describe('ngOnInit', () => {
        describe('view mode', () => {
            it('should load receipt of material data', fakeAsync(() => {
                initialize('view', { ...testReceiptOfMaterial }, true);
                expect(receiptOfMaterialFacade.findReceiptProducts).toHaveBeenCalled();
                expect(component.form.enabled).toBeFalsy();
            }));

            describe.each`
                control                  | value                         | enabled
                ${'number'}              | ${'R00000'}                   | ${false}
                ${{ id: 'receiptDate' }} | ${formatMoment('2020-09-24')} | ${false}
                ${'status'}              | ${'Finalized'}                | ${false}
                ${{ id: 'finalizedOn' }} | ${formatMoment('2020-09-25')} | ${false}
                ${{ id: 'finalizedBy' }} | ${'John Doe'}                 | ${false}
                ${{ id: 'createdBy' }}   | ${'John Doe'}                 | ${false}
                ${'originalNumber'}      | ${'R11111'}                   | ${false}
                ${'poNumber'}            | ${'5678'}                     | ${false}
                ${'invoiceNumber'}       | ${'123456789'}                | ${false}
                ${'deliveryTicket'}      | ${'DT0001'}                   | ${false}
                ${'shipTo'}              | ${'123456'}                   | ${false}
                ${'comments'}            | ${'Test comment'}             | ${false}
            `('values', ({ control, value, enabled }) => {
                it(`should display input for ${control} as ${value} and ${
                    enabled ? '' : 'not'
                } be enabled`, fakeAsync(() => {
                    initialize(
                        'view',
                        {
                            ...testReceiptOfMaterial,
                            receiptDate: '2020-09-24',
                            finalizedOn: '2020-09-25',
                            status: { id: 0, code: 'FINALIZED', description: 'Finalized', version: 0 },
                        },
                        true
                    );
                    expectInput(fixture, control).toHaveValue(value).toBeEnabled(enabled);
                }));
            });

            describe.each`
                id                      | controlName      | options                                | editable | placeHolder       | displayFn
                ${'store-input'}        | ${'store'}       | ${[testReceiptOfMaterial.store]}       | ${false} | ${'Store'}        | ${Described.codeAndDescriptionMapper}
                ${'vendor-input'}       | ${'vendor'}      | ${[testReceiptOfMaterial.vendor]}      | ${false} | ${'Vendor'}       | ${Described.descriptionMapper}
                ${'receipt-type-input'} | ${'receiptType'} | ${[testReceiptOfMaterial.receiptType]} | ${false} | ${'Receipt Type'} | ${Described.descriptionMapper}
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

            it('should configure all of the displayed columns', fakeAsync(() => {
                initialize(
                    'view',
                    {
                        ...testReceiptOfMaterial,
                        receiptType: {
                            id: 1,
                            code: 'REG',
                            description: 'Regular',
                        },
                    },
                    true
                );
                // All columns should be displayed
                component.getDisplayedColumns();
                expect(component.displayedColumns).toEqual([
                    'select',
                    'secondLevelCategory.description',
                    'product.code',
                    'product.description',
                    'sapNumber',
                    'uom.code',
                    'quantityOrdered',
                    'quantityReceived',
                    'wholesalePrice',
                ]);
            }));

            it('should configure all of the displayed columns except quantityOrdered', fakeAsync(() => {
                initialize('view', { ...testReceiptOfMaterial }, true);
                // All columns should be displayed
                component.getDisplayedColumns();
                expect(component.displayedColumns).toEqual([
                    'select',
                    'secondLevelCategory.description',
                    'product.code',
                    'product.description',
                    'sapNumber',
                    'uom.code',
                    'quantityReceived',
                    'wholesalePrice',
                ]);
            }));
            describe.each`
                hasRole  | shouldDisplay
                ${true}  | ${true}
                ${false} | ${false}
            `('with hasRole=$hasRole', ({ hasRole, shouldDisplay }) => {
                it(`should ${shouldDisplay ? 'display' : 'hide'} wholesale price`, fakeAsync(() => {
                    initialize(
                        'view',
                        {
                            ...testReceiptOfMaterial,
                            receiptType: {
                                id: 1,
                                code: 'REG',
                                description: 'Regular',
                            },
                        },
                        true,
                        hasRole
                    );
                    if (shouldDisplay) {
                        component.getDisplayedColumns();
                        expect(component.displayedColumns).toEqual([
                            'select',
                            'secondLevelCategory.description',
                            'product.code',
                            'product.description',
                            'sapNumber',
                            'uom.code',
                            'quantityOrdered',
                            'quantityReceived',
                            'wholesalePrice',
                        ]);
                    } else {
                        component.getDisplayedColumns();
                        expect(component.displayedColumns).toEqual([
                            'select',
                            'secondLevelCategory.description',
                            'product.code',
                            'product.description',
                            'sapNumber',
                            'uom.code',
                            'quantityOrdered',
                            'quantityReceived',
                        ]);
                    }
                }));
            });

            describe('with Receipt Products', () => {
                describe.each([
                    ['categoryHeader'],
                    ['productCodeHeader'],
                    ['productDescriptionHeader'],
                    ['sapNumberHeader'],
                    ['uomHeader'],
                    ['quantityOrderedHeader'],
                    ['quantityReceivedHeader'],
                    ['wholesalePriceHeader'],
                ])('with headers', (header) => {
                    it(`should call custom sorting accessor when clicking on ${header}`, fakeAsync(() => {
                        initialize('view', {
                            ...testReceiptOfMaterial,
                            receiptType: {
                                id: 1,
                                code: 'REG',
                                description: 'Regular',
                            },
                        });
                        jest.spyOn(component.rmProducts, 'sortingDataAccessor');
                        expect(component.rmProducts.sort).toBeTruthy();

                        // find header and click. using nativeElement querySelector due to jest's shallow dom rendering
                        const headerButton = fixture.nativeElement.querySelector(`#${header}`);
                        headerButton.click();
                        fixture.detectChanges();

                        expect(component.rmProducts.sortingDataAccessor).toHaveBeenCalled();
                    }));
                });
            });

            describe('Associated RMs', () => {
                const getHeader = () => fixture.debugElement.query(By.css('#associatedRMs'));

                it('should load the "Associated RMs" section if there is an associated RM', fakeAsync(() => {
                    const testAssociatedRM = {
                        store: {
                            code: '1234',
                        },
                        number: 'RM444',
                    } as ReceiptOfMaterial;
                    jest.spyOn(receiptOfMaterialFacade, 'findAssociatedReceiptsOfMaterial').mockReturnValueOnce(
                        of([testAssociatedRM, testReceiptOfMaterial])
                    );
                    initialize('view');

                    expect(receiptOfMaterialFacade.findAssociatedReceiptsOfMaterial).toHaveBeenCalledWith(
                        testReceiptOfMaterial.store.code,
                        testReceiptOfMaterial.receiptType.code,
                        testReceiptOfMaterial.source,
                        testReceiptOfMaterial.sourceStore.code
                    );

                    expect(getHeader()).not.toBeNull();
                    const receiptButton = fixture.debugElement.query(
                        By.css(`#receipt-button-${testAssociatedRM.number}`)
                    );

                    const router = TestBed.inject(Router);
                    jest.spyOn(router, 'navigate');

                    receiptButton.triggerEventHandler('click', {});
                    expect(router.navigate).toHaveBeenLastCalledWith(
                        ['view', testAssociatedRM.store.code, testAssociatedRM.number],
                        { relativeTo: parentRoute }
                    );
                }));

                it('should not show currently viewed rm in associated rm list', fakeAsync(() => {
                    const testAssociatedRM = {
                        store: {
                            code: '1234',
                        },
                        number: 'RM444',
                    } as ReceiptOfMaterial;
                    jest.spyOn(receiptOfMaterialFacade, 'findAssociatedReceiptsOfMaterial').mockReturnValueOnce(
                        of([testAssociatedRM, testReceiptOfMaterial])
                    );
                    initialize('view');

                    const receiptButton = fixture.debugElement.query(
                        By.css(`#receipt-button-${testReceiptOfMaterial.number}`)
                    );
                    expect(receiptButton).toBeFalsy();
                }));

                it('should not load the "Associated RMs" section if there is not an associated RM', fakeAsync(() => {
                    jest.spyOn(receiptOfMaterialFacade, 'findAssociatedReceiptsOfMaterial').mockReturnValueOnce(of([]));
                    initialize('view');
                    expect(getHeader()).toBeNull();
                }));

                it('should not load the "Associated RMs" section if only the viewed RM is returned', fakeAsync(() => {
                    initialize('view');
                    expect(getHeader()).toBeNull();
                }));
            });
        });

        describe('edit mode', () => {
            it('should load receipt of material data', fakeAsync(() => {
                initialize('edit', { ...testReceiptOfMaterial }, true);
                expect(receiptOfMaterialFacade.findReceiptProducts).toHaveBeenCalled();
                expect(component.form.enabled).toBeTruthy();
            }));

            it('should disable screen if receipt of material is finalized', fakeAsync(() => {
                initialize('edit', { ...testReceiptOfMaterial, status: { code: 'FINALIZED' } }, true);
                expect(receiptOfMaterialFacade.findReceiptProducts).toHaveBeenCalled();
                expect(component.form.enabled).toBeFalsy();
            }));

            it('should be unmodifiable when RM status is finalized', fakeAsync(() => {
                const testFinalizedRM: ReceiptOfMaterial = {
                    ...testReceiptOfMaterial,
                    status: { id: 0, code: 'FINALIZED', description: 'Finalized', version: 0 },
                };

                initialize('edit', testFinalizedRM);

                expect(component.accessMode).toEqual(AccessMode.VIEW);
                expect(component.form.enabled).toBe(false);
            }));

            describe.each`
                control                  | value                         | enabled
                ${'number'}              | ${'R00000'}                   | ${false}
                ${{ id: 'receiptDate' }} | ${formatMoment('2020-09-24')} | ${false}
                ${'status'}              | ${'Test Status'}              | ${false}
                ${{ id: 'createdBy' }}   | ${'John Doe'}                 | ${false}
                ${'originalNumber'}      | ${'R11111'}                   | ${false}
                ${'poNumber'}            | ${'5678'}                     | ${true}
                ${'invoiceNumber'}       | ${'123456789'}                | ${true}
                ${'deliveryTicket'}      | ${'DT0001'}                   | ${true}
                ${'shipTo'}              | ${'123456'}                   | ${false}
                ${'comments'}            | ${'Test comment'}             | ${true}
            `('values', ({ control, value, enabled }) => {
                it(`should display input for ${control} as ${value} and ${
                    enabled ? '' : 'not'
                } be enabled`, fakeAsync(() => {
                    initialize(
                        'edit',
                        {
                            ...testReceiptOfMaterial,
                            receiptDate: '2020-09-24',
                            finalizedOn: '2020-09-25',
                        },
                        true
                    );
                    expectInput(fixture, control).toHaveValue(value).toBeEnabled(enabled);
                }));
            });
        });

        describe('add mode', () => {
            const fieldsViewableAfterGenerated = ['poNumber', 'invoiceNumber', 'deliveryTicket', 'comments'];

            const fieldsNeverViewableInAdd = [
                'number',
                'status',
                { id: 'receiptDate' },
                { id: 'finalizedOn' },
                { id: 'finalizedBy' },
                { id: 'createdBy' },
                'shipTo',
                'originalNumber',
            ];

            it('should initially only render a select and go component with a store and vendor dropdown', fakeAsync(() => {
                initialize('add');
                // Expecting only Store & Vendor dropdowns to be rendered
                fieldsViewableAfterGenerated.forEach((control) => expectInput(fixture, control).not.toBePresent());
                fieldsNeverViewableInAdd.forEach((control) => expectInput(fixture, control).not.toBePresent());
                // Verify Store & Vendor dropdowns
                const storeDropdown = findById('store-input').injector.get(MockFilteredInputComponent);
                const vendorDropdown = findById('vendor-input').injector.get(MockFilteredInputComponent);
                // Initially, store is selectable and vendor is not
                expect(storeDropdown.editable).toBeTruthy();
                expect(vendorDropdown.editable).toBeFalsy();
                expect(component.vendorFacade.findByStore).not.toHaveBeenCalled();
                // Vendor should be selectable after selecting a store
                storeDropdown.valueControl.setValue(testReceiptOfMaterial.store);
                tick(200); // store value change logic has a 200 debounce time
                fixture.detectChanges();
                expect(vendorDropdown.editable).toBeTruthy();
            }));

            it('should disable store and vendor and mark the receipt as generated on go', fakeAsync(() => {
                initialize('add');
                component.form.setControlValue('store', testReceiptOfMaterial.store);
                tick(200); // store value change logic has a 200 debounce time
                component.form.setControlValue('vendor', testReceiptOfMaterial.vendor);
                fixture.detectChanges();
                getSelectAndGo().go.emit();
                fixture.detectChanges();
                // Verify disabled and receipt generated values
                expect(component.form.getControl('store').disabled).toBeTruthy();
                tick(200); // store value change logic has a 200 debounce time
                expect(component.form.getControl('vendor').disabled).toBeTruthy();
                expect(component.receiptGenerated).toBeTruthy();
                // Verify that the form values didn't actually change (since disabling the store triggers a valueChanges for store)
                expect(component.form.getControlValue('store')).toEqual(testReceiptOfMaterial.store);
                expect(component.form.getControlValue('vendor')).toEqual(testReceiptOfMaterial.vendor);
                // Verify that the initially hidden fields now display
                fieldsViewableAfterGenerated.forEach((control) => expectInput(fixture, control).toBePresent());
                fieldsNeverViewableInAdd.forEach((control) => expectInput(fixture, control).not.toBePresent());
                expect(findById('receiptProductsTable')).not.toBeNull();
            }));

            it('should filter out regular and transfer from the available receipt types', fakeAsync(async () => {
                const regular = { id: 1, code: 'REG', description: 'Regular' };
                const transfer = { id: 2, code: 'TRB', description: 'Transfer' };
                const keepFill = { id: 3, code: 'KF', description: 'Keep Fill' };
                const emergency = { id: 4, code: 'EM', description: 'Emergency' };
                jest.spyOn(component.commonCodeFacade, 'findByType').mockReturnValue(
                    of([regular, transfer, keepFill, emergency])
                );
                initialize('add');
                expect(await component.receiptType$.toPromise()).toEqual([keepFill, emergency]);
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

        describe.each`
            accessMode | id                      | controlName      | options                                | editable | placeHolder       | displayFn
            ${'view'}  | ${'store-input'}        | ${'store'}       | ${[testReceiptOfMaterial.store]}       | ${false} | ${'Store'}        | ${Described.codeAndDescriptionMapper}
            ${'view'}  | ${'vendor-input'}       | ${'vendor'}      | ${[testReceiptOfMaterial.vendor]}      | ${false} | ${'Vendor'}       | ${Described.descriptionMapper}
            ${'view'}  | ${'receipt-type-input'} | ${'receiptType'} | ${[testReceiptOfMaterial.receiptType]} | ${false} | ${'Receipt Type'} | ${Described.descriptionMapper}
            ${'edit'}  | ${'store-input'}        | ${'store'}       | ${[testReceiptOfMaterial.store]}       | ${false} | ${'Store'}        | ${Described.codeAndDescriptionMapper}
            ${'edit'}  | ${'vendor-input'}       | ${'vendor'}      | ${[testReceiptOfMaterial.vendor]}      | ${false} | ${'Vendor'}       | ${Described.descriptionMapper}
            ${'edit'}  | ${'receipt-type-input'} | ${'receiptType'} | ${[testReceiptOfMaterial.receiptType]} | ${false} | ${'Receipt Type'} | ${Described.descriptionMapper}
        `('dropdowns', ({ accessMode, id, controlName, options, editable, placeHolder, displayFn }) => {
            it(`should have the expected configuration for ${controlName}`, fakeAsync(() => {
                initialize(accessMode);
                const dropdown = findById(id).injector.get(MockFilteredInputComponent);
                expect(dropdown.valueControl).toEqual(component.form.getControl(controlName));
                expect(dropdown.options).toEqual(options);
                expect(dropdown.editable).toBe(editable);
                expect(dropdown.placeHolder).toEqual(placeHolder);
                expect(dropdown.displayFn).toEqual(displayFn);
                expect(dropdown.nullable).toEqual(false);
                expect(dropdown.compareWith).toEqual(component.describedEquals);
            }));
        });

        describe('go button', () => {
            describe.each`
                accessMode | rendered
                ${'view'}  | ${false}
                ${'edit'}  | ${false}
                ${'add'}   | ${true}
            `('rendering', ({ accessMode, rendered }) => {
                it(`should ${rendered ? '' : 'not '}be displayed in ${accessMode} mode`, fakeAsync(() => {
                    initialize(accessMode);
                    const selectAndGo = getSelectAndGo();
                    expect(selectAndGo.goButtonDisplayed).toEqual(rendered);
                }));
            });

            describe.each`
                store                          | vendor                          | disabled
                ${null}                        | ${null}                         | ${true}
                ${testReceiptOfMaterial.store} | ${null}                         | ${true}
                ${testReceiptOfMaterial.store} | ${testReceiptOfMaterial.vendor} | ${false}
            `('disabling', ({ store, vendor, disabled }) => {
                it(`should ${disabled ? '' : 'not '}be disabled with store=${JSON.stringify(
                    store
                )} and vendor=${JSON.stringify(vendor)}`, fakeAsync(() => {
                    initialize('add');
                    component.form.setControlValue('store', store);
                    tick(200); // store value change logic has a 200 debounce time
                    component.form.setControlValue('vendor', vendor);
                    fixture.detectChanges();
                    const selectAndGo = getSelectAndGo();
                    expect(selectAndGo.goButtonDisabled).toEqual(disabled);
                }));
            });
        });

        describe('unsavedChanges', () => {
            it('should track if the form has been modified', fakeAsync(() => {
                initialize('edit');
                expect(component.unsavedChanges).toBeFalsy();
                component.form.markAsDirty();
                expect(component.unsavedChanges).toBeTruthy();
            }));
        });

        it('should filter out related product codes when gathering inventoryDetails', fakeAsync(() => {
            const inventoryDetails = [
                { code: 'TEST' }, // matches testReceiptOfMaterial.receiptProducts[0]
                { code: 'FAKE' }, // matches testReceiptOfMaterial.receiptProducts[1]
                { code: 'PROD' }, // acts as the additional relatedProductCode that was returned but should be filtered out
            ];
            initialize('edit', testReceiptOfMaterial);
            const spy = jest
                .spyOn(component.storeProductFacade, 'getInventoryDetails')
                .mockReturnValue(of([inventoryDetails]));

            const returnedReceiptOfMaterial = component.updateProductDetails(testReceiptOfMaterial);
            const expectedProductCodes = testReceiptOfMaterial.receiptProducts.map(
                (receiptProduct) => receiptProduct.product.code
            );

            expect(spy).toHaveBeenCalledWith(
                testReceiptOfMaterial.store.code,
                testReceiptOfMaterial.vendor.code,
                expectedProductCodes
            );
            returnedReceiptOfMaterial.subscribe((rm) => {
                // inventoryDetail[0] and inventoryDetail[1] match the product codes that were in the testReceiptOfMaterial receiptProducts
                expect(rm.receiptProducts[0].product.code).toEqual(inventoryDetails[0].code);
                expect(rm.receiptProducts[1].product.code).toEqual(inventoryDetails[1].code);
                // inventoryDetiail[2] acts as a relatedProductCode that was returned from the inventoryDetails but should be filtered out
                expect(rm.receiptProducts[2]).toBeFalsy();
            });
        }));
    });

    describe('shouldPromptForSplit', () => {
        const testProduct: ReceiptOfMaterialProduct = {
            lineNumber: 1,
            quantityOrdered: 2,
            quantityReceived: 2,
            wholesalePrice: 5,
            uom: {
                id: 1,
                code: 'TEST',
                description: 'Test UOM',
                version: 1,
            },
            product: {
                id: 2,
                code: 'TEST',
                description: 'Test Product',
                version: 1,
            },
            sapNumber: '1234',
            secondLevelCategory: {
                id: 1,
                code: 'TEST',
                description: 'Test Category',
                version: 1,
            },
        };

        describe.each`
            receiptType | products                                                                              | expected
            ${'REG'}    | ${[{ ...testProduct, quantityReceived: 0 }, testProduct]}                             | ${true}
            ${'REG'}    | ${[{ ...testProduct, quantityReceived: 0 }, { ...testProduct, quantityReceived: 0 }]} | ${false}
            ${'REG'}    | ${[{ ...testProduct, quantityReceived: 1 }, { ...testProduct, quantityReceived: 1 }]} | ${true}
            ${'REG'}    | ${[{ ...testProduct, quantityReceived: 1 }, testProduct]}                             | ${true}
            ${'TRB'}    | ${[{ ...testProduct, quantityReceived: 0 }, testProduct]}                             | ${false}
            ${'TRB'}    | ${[{ ...testProduct, quantityReceived: 0 }, testProduct]}                             | ${false}
            ${'TRB'}    | ${[{ ...testProduct, quantityReceived: 1 }, { ...testProduct, quantityReceived: 1 }]} | ${false}
            ${'TRB'}    | ${[{ ...testProduct, quantityReceived: 1 }, testProduct]}                             | ${false}
        `('check', ({ receiptType, products, expected }) => {
            it(`should be ${expected} when receiptType=${receiptType} and product's ${products.map((p) =>
                mappingFn(p)
            )}`, fakeAsync(() => {
                initialize(
                    'edit',
                    {
                        ...testReceiptOfMaterial,
                        receiptProducts: products,
                        receiptType: { code: receiptType },
                    },
                    true
                );

                expect(component.shouldPromptForSplit).toBe(expected);
            }));
        });
    });
    function mappingFn(product: ReceiptOfMaterialProduct): string {
        return `quantityOrdered=${product.quantityOrdered} quantityReceived=${product.quantityReceived} `;
    }

    describe('with action bar', () => {
        // delegate getActionButtons since functions cannot be passed as arguments
        const getCancelButton = () => getCancelActionButton(fixture);
        const getApplyButton = () => getApplyActionButton(fixture);
        const getSaveButton = () => getSaveActionButton(fixture);
        const getFinalizeReceiptButton = () => fixture.debugElement.query(By.css('#finalize-action'));
        const getCancelReceiptButton = () => fixture.debugElement.query(By.css('#cancel-receipt-action'));

        const testCancelReceipt: ReceiptOfMaterial = {
            ...testReceiptOfMaterial,
            status: { code: 'OPEN' },
            receiptType: { code: 'FIN' },
        };

        describe.each`
            accessMode | receiptStatus  | receiptType | cancelDisplayed | applyDisplayed | saveDisplayed | cancelReceiptDisplayed | finalizedDisplayed
            ${'view'}  | ${'OPEN'}      | ${'REG'}    | ${true}         | ${false}       | ${false}      | ${false}               | ${false}
            ${'view'}  | ${'OPEN'}      | ${'TRB'}    | ${true}         | ${false}       | ${false}      | ${false}               | ${false}
            ${'view'}  | ${'OPEN'}      | ${'EM'}     | ${true}         | ${false}       | ${false}      | ${false}               | ${false}
            ${'view'}  | ${'FINALIZED'} | ${'REG'}    | ${true}         | ${false}       | ${false}      | ${false}               | ${false}
            ${'view'}  | ${'FINALIZED'} | ${'TRB'}    | ${true}         | ${false}       | ${false}      | ${false}               | ${false}
            ${'view'}  | ${'FINALIZED'} | ${'EM'}     | ${true}         | ${false}       | ${false}      | ${false}               | ${false}
            ${'edit'}  | ${'OPEN'}      | ${'REG'}    | ${true}         | ${true}        | ${true}       | ${false}               | ${true}
            ${'edit'}  | ${'OPEN'}      | ${'TRB'}    | ${true}         | ${true}        | ${true}       | ${false}               | ${true}
            ${'edit'}  | ${'OPEN'}      | ${'EM'}     | ${true}         | ${true}        | ${true}       | ${true}                | ${true}
            ${'edit'}  | ${'FINALIZED'} | ${'REG'}    | ${true}         | ${false}       | ${false}      | ${false}               | ${false}
            ${'edit'}  | ${'FINALIZED'} | ${'TRB'}    | ${true}         | ${false}       | ${false}      | ${false}               | ${false}
            ${'edit'}  | ${'FINALIZED'} | ${'EM'}     | ${true}         | ${false}       | ${false}      | ${false}               | ${false}
        `(
            'while in $accessMode mode with status of $receiptStatus and a receipt type of $receiptType',
            ({
                accessMode,
                receiptStatus,
                receiptType,
                cancelDisplayed,
                applyDisplayed,
                saveDisplayed,
                cancelReceiptDisplayed,
                finalizedDisplayed,
            }) => {
                const validateIsDisplayed = (getButtonElement: Function, isDisplayed: boolean) => {
                    initialize(accessMode, {
                        ...testCancelReceipt,
                        status: { code: receiptStatus },
                        receiptType: { code: receiptType },
                    });
                    initialize(accessMode, { ...testReceiptOfMaterial, status: { code: receiptStatus } });
                    const element = getButtonElement();
                    fixture.detectChanges();
                    if (isDisplayed) {
                        expect(element).toBeTruthy();
                    } else {
                        expect(element).toBeFalsy();
                    }
                };

                it(`should ${cancelDisplayed ? '' : 'not '}display cancel button`, fakeAsync(() => {
                    validateIsDisplayed(getCancelButton, cancelDisplayed);
                }));
                it(`should ${applyDisplayed ? '' : 'not '}display apply button`, fakeAsync(() => {
                    validateIsDisplayed(getApplyButton, applyDisplayed);
                }));
                it(`should ${saveDisplayed ? '' : 'not '}display save button`, fakeAsync(() => {
                    validateIsDisplayed(getSaveButton, saveDisplayed);
                }));
                it(`should ${finalizedDisplayed ? '' : 'not '}display finalize button`, fakeAsync(() => {
                    validateIsDisplayed(getFinalizeReceiptButton, finalizedDisplayed);
                }));
                it(`should ${cancelReceiptDisplayed ? '' : 'not '}display cancel receipt button`, fakeAsync(() => {
                    validateIsDisplayed(getCancelReceiptButton, cancelReceiptDisplayed);
                }));
            }
        );

        describe.each`
            formState    | cancelEnabled | applyEnabled | saveEnabled | cancelReceiptDisplayed | finalizeEnabled
            ${'valid'}   | ${true}       | ${true}      | ${true}     | ${true}                | ${true}
            ${'invalid'} | ${true}       | ${false}     | ${false}    | ${true}                | ${false}
        `(
            'with a $formState form',
            ({ formState, cancelEnabled, applyEnabled, saveEnabled, cancelReceiptDisplayed, finalizeEnabled }) => {
                beforeEach(fakeAsync(() => {
                    initialize('edit', {
                        ...testCancelReceipt,
                        receiptType: { code: 'EM' },
                    });
                    if (formState !== 'valid') {
                        component.form.setErrors({ invalid: true });
                    }
                    fixture.detectChanges();
                }));

                it(`cancel button should ${cancelEnabled ? '' : 'not '}be enabled`, fakeAsync(() => {
                    expect(getCancelButton().nativeElement.disabled).toBe(!cancelEnabled);
                }));
                it(`apply button should ${applyEnabled ? '' : 'not '}be enabled`, fakeAsync(() => {
                    expect(getApplyButton().nativeElement.disabled).toBe(!applyEnabled);
                }));
                it(`save button should ${saveEnabled ? '' : 'not '}be enabled`, fakeAsync(() => {
                    expect(getSaveButton().nativeElement.disabled).toBe(!saveEnabled);
                }));
                it(`finalize button should ${finalizeEnabled ? '' : 'not '}be enabled`, fakeAsync(() => {
                    expect(getFinalizeReceiptButton().nativeElement.disabled).toBe(!finalizeEnabled);
                }));
                it(`cancel receipt button should ${cancelReceiptDisplayed ? 'en' : 'dis'}abled`, fakeAsync(() => {
                    expect(fixture.debugElement.query(By.css('#cancel-receipt-action')).nativeElement.disabled).toBe(
                        !cancelReceiptDisplayed
                    );
                }));
            }
        );

        describe('with apply button', () => {
            it('should reload page after save when editing', fakeAsync(() => {
                jest.spyOn(component.receiptOfMaterialFacade, 'save').mockReturnValue(of(null));
                initialize('edit');
                jest.spyOn(component, 'ngOnInit').mockImplementation(() => {});

                // click on apply button and validate that record is saved and page is reloaded
                getApplyButton().nativeElement.click();
                tick(600); // tick to account for debounce time and timeout to re-enable button
                fixture.detectChanges();
                // verify message
                expect(component.messageFacade.addMessage).toHaveBeenCalledWith({
                    severity: 'info',
                    message: 'Receipt of Material R00000 saved successfully',
                });
                expect(component.ngOnInit).toHaveBeenCalled();
                expect(component.form).toBeFalsy();
            }));

            it('should call save only once, even when multiple clicks', fakeAsync(() => {
                jest.spyOn(component.receiptOfMaterialFacade, 'save').mockReturnValue(of(null));
                initialize('edit');
                jest.spyOn(component, 'ngOnInit').mockImplementation(() => {});

                // click on apply button multiple times
                getApplyButton().nativeElement.click();
                getApplyButton().nativeElement.click();
                getApplyButton().nativeElement.click();
                tick(600); // tick to account for debounce time and timeout to re-enable button
                fixture.detectChanges();

                expect(receiptOfMaterialFacade.save).toHaveBeenCalledTimes(1);
            }));

            it('should navigate to the newly created receipt when adding', fakeAsync(() => {
                const number = 'K123';
                jest.spyOn(component.receiptOfMaterialFacade, 'save').mockReturnValue(of({ number, storeId: 1 }));
                initialize('add', null);
                // fill out form values
                component.form.setControlValue('store', { id: 1, code: 'VAL1', description: 'Test store' });
                tick(200);
                component.form.setControlValue('vendor', { id: 1, code: 'VEND1', description: 'Test vendor' });
                component.form.setControlValue('receiptType', { id: 1, code: 'KF', description: 'Test type' });
                const product = { quantityReceived: 2, product: { id: 1, code: 'PROD1' } };
                component.form.setControl('receiptProducts', new FormArray([new FormControl(product)]));
                component.form.updateValueAndValidity();
                fixture.detectChanges();
                // apply
                getApplyButton().nativeElement.click();
                tick(600); // tick to account for debounce time and timeout to re-enable button
                fixture.detectChanges();
                // verify message
                expect(component.messageFacade.addMessage).toHaveBeenCalledWith({
                    severity: 'info',
                    message: 'Receipt of Material saved successfully',
                });
                // verify navigation
                const router = TestBed.inject(Router); // navigate is already mocked
                // using expect.anything to match route parent
                expect(router.navigate).toHaveBeenCalledWith(['edit', 'VAL1', number], expect.anything());
            }));
        });

        describe('with save button', () => {
            beforeEach(fakeAsync(() => {
                // initialize page
                initialize('edit');
                jest.spyOn(component.receiptOfMaterialFacade, 'save').mockReturnValue(of({}));
            }));

            it('should call save only once, even when multiple clicks', fakeAsync(() => {
                // click on save button multiple times
                getSaveButton().nativeElement.click();
                getSaveButton().nativeElement.click();
                getSaveButton().nativeElement.click();

                tick(600); // tick to account for debounce time and timeout to re-enable button
                fixture.detectChanges();
                expect(receiptOfMaterialFacade.save).toHaveBeenCalledTimes(1);
            }));

            it('should navigateToSearchPage() have been called after save', fakeAsync(() => {
                jest.spyOn(routerService, 'navigateToSearchPage');

                // click on save button and validate that record is saved and user is navigated back
                getSaveButton().nativeElement.click();
                tick(600); // tick to account for debounce time and timeout to re-enable button
                fixture.detectChanges();
                expect(receiptOfMaterialFacade.save).toHaveBeenCalled();
                expect(routerService.navigateToSearchPage).toHaveBeenCalled();
            }));

            it('should display message', fakeAsync(() => {
                jest.spyOn(component.messageFacade, 'addMessage');
                jest.spyOn(routerService, 'navigateToSearchPage');
                // click on cancel button
                getSaveButton().nativeElement.click();
                tick(600); // tick to account for debounce time and timeout to re-enable button
                fixture.detectChanges();

                // validate that messge is created
                expect(component.messageFacade.addMessage).toHaveBeenCalledWith({
                    message: `Receipt of Material ${testReceiptOfMaterial.number} saved successfully`,
                    severity: 'info',
                });
            }));
        });

        describe('with Cancel Receipt Button', () => {
            let cancelReceiptButton: DebugElement;
            let continueButton: DebugElement;
            let cancelButton: DebugElement;
            let messageFacade: MessageFacade;

            beforeEach(fakeAsync(() => {
                messageFacade = TestBed.inject(MessageFacade as Type<MessageFacade>);
                jest.spyOn(component.cancelDialog, 'open');
                jest.spyOn(component.cancelDialog, 'close');
                jest.spyOn(component, 'openCancelReceiptDialog');
                jest.spyOn(component, 'closeCancelReceiptDialog');
                jest.spyOn(component, 'cancelReceiptOfMaterial');
                jest.spyOn(component, 'isCancelReceiptButtonShown').mockReturnValue(true);
                jest.spyOn(receiptOfMaterialFacade, 'cancelReceiptOfMaterial').mockReturnValue(of(testCancelReceipt));
                initialize('edit', testCancelReceipt);
                cancelReceiptButton = fixture.debugElement.query(By.css('#cancel-receipt-action'));
                continueButton = fixture.debugElement.query(By.css('#cancel-continue-button'));
                cancelButton = fixture.debugElement.query(By.css('#cancel-cancel-button'));
            }));

            function clickCancelReceiptButton() {
                expect(cancelReceiptButton).toBeTruthy();
                cancelReceiptButton.nativeElement.click();
                expect(component.cancelDialog.open).toHaveBeenCalled();
                expect(fixture.debugElement.query(By.css('#cancel-receipt-dialog'))).toBeTruthy();
            }

            function clickContinueButton() {
                expect(continueButton).toBeTruthy();
                continueButton.nativeElement.click();
                tick(600); // tick to account for debounce time and timeout to re-enable button
                expect(component.form).toBeNull();
                expect(component.cancelReceiptOfMaterial).toHaveBeenCalled();
                expect(messageFacade.addMessage).toHaveBeenCalledWith({
                    message: `Receipt number ${testCancelReceipt.number} has been canceled.`,
                    severity: 'success',
                });
                expect(routerService.back).toHaveBeenCalled();
                expect(component.isLoading).toBeFalsy();
                expect(component.cancelDialog.close).toHaveBeenCalled();
            }

            describe('with Cancel Receipt Dialog', () => {
                beforeEach(fakeAsync(() => {
                    clickCancelReceiptButton();
                }));

                it(`should cancel the receipt`, fakeAsync(() => {
                    clickContinueButton();
                }));

                it('should call cancel only once, even when multiple clicks', fakeAsync(() => {
                    // click on continue button multiple times
                    continueButton.nativeElement.click();
                    continueButton.nativeElement.click();
                    continueButton.nativeElement.click();
                    tick(600); // tick to account for debounce time and timeout to re-enable button
                    fixture.detectChanges();

                    expect(component.cancelReceiptOfMaterial).toHaveBeenCalledTimes(1);
                }));

                it(`should not cancel the receipt`, fakeAsync(() => {
                    expect(cancelButton).toBeTruthy();
                    cancelButton.nativeElement.click();
                    expect(component.closeCancelReceiptDialog).toHaveBeenCalled();
                    expect(component.isLoading).toBeFalsy();
                    expect(component.cancelDialog.close).toHaveBeenCalled();
                }));
            });

            it('should not show unsaved changes prompt if the form is dirty and cancelling a receipt', fakeAsync(() => {
                component.form.markAsDirty();
                expect(component.unsavedChanges).toBeTruthy();

                clickCancelReceiptButton();
                clickContinueButton();
                expect(component.unsavedChanges).toBeFalsy();
            }));
        });

        describe('with finalize receipt button', () => {
            const getContinueDialogButton = () => fixture.debugElement.query(By.css('#finalize-continue-button'));
            const getCancelDialogButton = () => fixture.debugElement.query(By.css('#finalize-cancel-button'));
            const getSplitDialogCancelButton = () => fixture.debugElement.query(By.css('#split-dialog-cancel-button'));
            const getSplitDialogFinalizeButton = () =>
                fixture.debugElement.query(By.css('#split-dialog-finalize-button'));
            const getSplitDialogSplitButton = () => fixture.debugElement.query(By.css('#split-dialog-split-button'));

            beforeEach(fakeAsync(() => {
                jest.spyOn(component.receiptOfMaterialFacade, 'finalize').mockReturnValue(of({}));
                jest.spyOn(component.finalizeDialog, 'open');
                jest.spyOn(component.finalizeDialog, 'close');
                jest.spyOn(component.splitDialog, 'open');
                jest.spyOn(component.splitDialog, 'close');
                jest.spyOn(component, 'finalize');
            }));

            describe('when all the products on the order are completely received', () => {
                beforeEach(fakeAsync(() => {
                    initialize('edit');
                }));

                it('should prompt user to confirm finalization', fakeAsync(() => {
                    // click on finalize button
                    getFinalizeReceiptButton().nativeElement.click();
                    fixture.detectChanges();

                    // validate that dialog was opened
                    expect(component.finalizeDialog.open).toHaveBeenCalled();
                }));

                it('should close prompt after cancelling finalization', fakeAsync(() => {
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

                it('should call the receiptOfMaterialFacade to finalize after confirming', fakeAsync(() => {
                    jest.spyOn(component, 'finalize');
                    jest.spyOn(component.finalizeFacade, 'save');

                    // click on finalize button
                    getFinalizeReceiptButton().nativeElement.click();
                    fixture.detectChanges();
                    getContinueDialogButton().nativeElement.click();
                    tick(600); // tick to account for debounce time and timeout to re-enable button
                    fixture.detectChanges();

                    // validate that receipt was finalized
                    expect(component.finalize).toHaveBeenCalled();
                    // using expect.anything() to match an anonymous function/lambda
                    expect(component.finalizeFacade.save).toHaveBeenCalledWith(
                        component.form,
                        testReceiptOfMaterial,
                        expect.anything()
                    );
                    expect(receiptOfMaterialFacade.finalize).toHaveBeenCalledWith(
                        Object.assign({ ...testReceiptOfMaterial }, component.form.value),
                        component.split
                    );
                }));

                it('should display message', fakeAsync(() => {
                    jest.spyOn(component.messageFacade, 'addMessage');

                    // click on cancel button
                    getFinalizeReceiptButton().nativeElement.click();
                    tick(600); // tick to account for debounce time and timeout to re-enable button
                    fixture.detectChanges();
                    getContinueDialogButton().nativeElement.click();
                    tick(600); // tick to account for debounce time and timeout to re-enable button
                    fixture.detectChanges();

                    // validate that message is created
                    expect(component.messageFacade.addMessage).toHaveBeenCalledWith({
                        message: `Receipt of Material ${testReceiptOfMaterial.number} finalized successfully`,
                        severity: 'info',
                    });
                }));
            });

            describe('when there are products that have not been completely received', () => {
                it('should prompt user the split dialog to confirm split or finalization', fakeAsync(() => {
                    // when quantity received is less than quantity ordered
                    initialize('edit', {
                        ...testReceiptOfMaterial,
                        receiptType: { ...testReceiptOfMaterial.receiptType, code: 'REG' },
                        receiptProducts: [
                            { ...testReceiptOfMaterialProducts[0], quantityReceived: 1 },
                            { ...testReceiptOfMaterialProducts[1], quantityReceived: 0 },
                        ],
                    });

                    // click on finalize button
                    getFinalizeReceiptButton().nativeElement.click();
                    fixture.detectChanges();

                    // validate that dialog was opened
                    expect(component.shouldPromptForSplit).toBe(true);
                    expect(component.splitDialog.open).toHaveBeenCalled();
                }));

                it('should close split prompt after cancelling split or finalization', fakeAsync(() => {
                    jest.spyOn(component, 'splitAndFinalize');

                    initialize('edit', {
                        ...testReceiptOfMaterial,
                        receiptType: { ...testReceiptOfMaterial.receiptType, code: 'REG' },
                        receiptProducts: [
                            { ...testReceiptOfMaterialProducts[0], quantityReceived: 1 },
                            { ...testReceiptOfMaterialProducts[1], quantityReceived: 0 },
                        ],
                    });
                    // click on finalize button
                    getFinalizeReceiptButton().nativeElement.click();
                    fixture.detectChanges();
                    expect(component.splitDialog.close).not.toHaveBeenCalled();

                    // validate finalize was cancelled
                    getSplitDialogCancelButton().nativeElement.click();
                    fixture.detectChanges();
                    expect(component.splitDialog.close).toHaveBeenCalled();
                    expect(component.finalize).not.toHaveBeenCalled();
                    expect(component.splitAndFinalize).not.toHaveBeenCalled();
                }));

                it('should call the receiptOfMaterialFacade to finalize after confirming Finalize', fakeAsync(() => {
                    jest.spyOn(component, 'finalize');
                    jest.spyOn(component.finalizeFacade, 'save');

                    const updatedTestReceiptData = {
                        ...testReceiptOfMaterial,
                        receiptType: { ...testReceiptOfMaterial.receiptType, code: 'REG' },
                        receiptProducts: [
                            { ...testReceiptOfMaterialProducts[0], quantityReceived: 1 },
                            { ...testReceiptOfMaterialProducts[1], quantityReceived: 0 },
                        ],
                    };

                    initialize('edit', updatedTestReceiptData);

                    // click on finalize button
                    getFinalizeReceiptButton().nativeElement.click();
                    fixture.detectChanges();
                    getSplitDialogFinalizeButton().nativeElement.click();
                    tick(600); // tick to account for debounce time and timeout to re-enable button
                    fixture.detectChanges();

                    // validate that receipt was finalized
                    expect(component.finalize).toHaveBeenCalled();
                    // using expect.anything() to match an anonymous function/lambda and added a test to assert navigation to search
                    expect(component.finalizeFacade.save).toHaveBeenCalledWith(
                        component.form,
                        updatedTestReceiptData,
                        expect.anything()
                    );
                    expect(receiptOfMaterialFacade.finalize).toHaveBeenCalledWith(
                        Object.assign({ ...updatedTestReceiptData }, component.form.value),
                        false
                    );
                }));

                it('should call the receiptOfMaterialFacade to finalize after confirming Split', fakeAsync(() => {
                    jest.spyOn(component, 'finalize');
                    jest.spyOn(component, 'splitAndFinalize');
                    jest.spyOn(component, 'navigateToRm');
                    jest.spyOn(component.finalizeFacade, 'save');

                    const updatedTestReceiptData = {
                        ...testReceiptOfMaterial,
                        receiptType: { ...testReceiptOfMaterial.receiptType, code: 'REG' },
                        receiptProducts: [
                            { ...testReceiptOfMaterialProducts[0], quantityReceived: 1 },
                            { ...testReceiptOfMaterialProducts[1], quantityReceived: 0 },
                        ],
                    };

                    initialize('edit', updatedTestReceiptData);

                    // click on finalize button
                    getFinalizeReceiptButton().nativeElement.click();
                    fixture.detectChanges();
                    expect(getSplitDialogSplitButton()).not.toBe(undefined);
                    getSplitDialogSplitButton().nativeElement.click();
                    tick(600); // tick to account for debounce time and timeout to re-enable button
                    fixture.detectChanges();

                    // validate that receipt was finalized
                    expect(component.finalize).not.toHaveBeenCalled();
                    expect(component.splitAndFinalize).toHaveBeenCalled();
                    expect(component.splitDialog.close).toHaveBeenCalled();
                    expect(component.finalizeFacade.save).toHaveBeenCalledWith(
                        component.form,
                        updatedTestReceiptData,
                        component['route']
                    );
                    expect(receiptOfMaterialFacade.finalize).toHaveBeenCalledWith(
                        Object.assign({ ...updatedTestReceiptData }, component.form.value),
                        true
                    );
                    expect(component.navigateToRm).toHaveBeenCalled();
                }));

                it('should call split only once, even when multiple clicks', fakeAsync(() => {
                    jest.spyOn(component, 'finalize');
                    jest.spyOn(component, 'splitAndFinalize');
                    jest.spyOn(component.finalizeFacade, 'save');

                    const updatedTestReceiptData = {
                        ...testReceiptOfMaterial,
                        receiptType: { ...testReceiptOfMaterial.receiptType, code: 'REG' },
                        receiptProducts: [
                            { ...testReceiptOfMaterialProducts[0], quantityReceived: 1 },
                            { ...testReceiptOfMaterialProducts[1], quantityReceived: 0 },
                        ],
                    };
                    initialize('edit', updatedTestReceiptData);

                    // click on finalize button
                    getFinalizeReceiptButton().nativeElement.click();
                    fixture.detectChanges();

                    //click split multiple times on split dialog
                    getSplitDialogSplitButton().nativeElement.click();
                    getSplitDialogSplitButton().nativeElement.click();
                    getSplitDialogSplitButton().nativeElement.click();
                    tick(600); // tick to account for debounce time and timeout to re-enable button
                    fixture.detectChanges();

                    // validate that was called once
                    expect(component.finalize).not.toHaveBeenCalled();
                    expect(component.splitAndFinalize).toHaveBeenCalledTimes(1);
                }));

                it('should call finalize only once, even when multiple clicks', fakeAsync(() => {
                    jest.spyOn(component, 'finalize');
                    jest.spyOn(component.finalizeFacade, 'save');

                    const updatedTestReceiptData = {
                        ...testReceiptOfMaterial,
                        receiptType: { ...testReceiptOfMaterial.receiptType, code: 'REG' },
                        receiptProducts: [
                            { ...testReceiptOfMaterialProducts[0], quantityReceived: 1 },
                            { ...testReceiptOfMaterialProducts[1], quantityReceived: 0 },
                        ],
                    };
                    initialize('edit', updatedTestReceiptData);

                    // click on finalize button
                    getFinalizeReceiptButton().nativeElement.click();
                    fixture.detectChanges();
                    //click finalize multiple times on split dialog
                    getSplitDialogFinalizeButton().nativeElement.click();
                    getSplitDialogFinalizeButton().nativeElement.click();
                    getSplitDialogFinalizeButton().nativeElement.click();
                    tick(600); // tick to account for debounce time and timeout to re-enable button
                    fixture.detectChanges();

                    // validate that was called once
                    expect(component.finalize).toHaveBeenCalledTimes(1);
                }));

                it('should display message', fakeAsync(() => {
                    jest.spyOn(component.messageFacade, 'addMessage');

                    initialize('edit', {
                        ...testReceiptOfMaterial,
                        receiptType: { ...testReceiptOfMaterial.receiptType, code: 'REG' },
                        receiptProducts: [
                            { ...testReceiptOfMaterialProducts[0], quantityReceived: 1 },
                            { ...testReceiptOfMaterialProducts[1], quantityReceived: 0 },
                        ],
                    });
                    // click on cancel button
                    getFinalizeReceiptButton().nativeElement.click();
                    fixture.detectChanges();
                    getSplitDialogSplitButton().nativeElement.click();
                    tick(600); // tick to account for debounce time and timeout to re-enable button
                    fixture.detectChanges();

                    // validate that message is created
                    expect(component.messageFacade.addMessage).toHaveBeenCalledWith({
                        message: `Receipt of Material ${testReceiptOfMaterial.number} finalized successfully`,
                        severity: 'info',
                    });
                }));

                it('should navigateToSearchPage have been called', fakeAsync(() => {
                    initialize('edit', {
                        ...testReceiptOfMaterial,
                        receiptType: { ...testReceiptOfMaterial.receiptType, code: 'REG' },
                        receiptProducts: [
                            { ...testReceiptOfMaterialProducts[0], quantityReceived: 1 },
                            { ...testReceiptOfMaterialProducts[1], quantityReceived: 0 },
                        ],
                    });

                    // open dialog
                    getFinalizeReceiptButton().nativeElement.click();
                    fixture.detectChanges();
                    // continue past dialog
                    getSplitDialogFinalizeButton().nativeElement.click();
                    tick(600); // tick to account for debounce time and timeout to re-enable button
                    fixture.detectChanges();
                    expect(routerService.navigateToSearchPage).toHaveBeenCalledWith(TestBed.inject(ActivatedRoute));
                }));
            });
        });

        describe.each`
            action        | apiFunction   | getButton
            ${'apply'}    | ${'save'}     | ${getApplyButton}
            ${'save'}     | ${'save'}     | ${getSaveButton}
            ${'finalize'} | ${'finalize'} | ${getFinalizeReceiptButton}
        `(`with the loading overlay when $action-ing`, ({ action, apiFunction, getButton }) => {
            let apiSubject: Subject<any>;

            beforeEach(fakeAsync(() => {
                // initialize page
                initialize('edit', testCancelReceipt);
                apiSubject = new Subject();
                // update "action" string to reference the correct api function
                jest.spyOn(component.receiptOfMaterialFacade, apiFunction).mockReturnValue(apiSubject);
                jest.spyOn(component.receiptOfMaterialFacade, 'findAssociatedReceiptsOfMaterial').mockReturnValueOnce(
                    of([testReceiptOfMaterial])
                );
                // click on button
                getButton().nativeElement.click();
                tick(600); // tick to account for debounce time and timeout to re-enable button
                fixture.detectChanges();
                // skip dialog if finalizing or canceling
                if (apiFunction !== 'save') {
                    fixture.debugElement.query(By.css(`#${action}-continue-button`)).nativeElement.click();
                    tick(600); // tick to account for debounce time and timeout to re-enable button
                    fixture.detectChanges();
                }
            }));

            it(`should display loading overlay while ${action}-ing`, fakeAsync(() => {
                const loadingOverlay: MockLoadingOverlayComponent = fixture.debugElement.query(
                    By.directive(MockLoadingOverlayComponent)
                ).componentInstance;
                expect(loadingOverlay.loading).toBeTruthy();

                apiSubject.next();
                flush();
                fixture.detectChanges();
                tick(100);
                expect(loadingOverlay.loading).toBeFalsy();
            }));

            it(`should stop loading if an error occurs while ${action}-ing`, fakeAsync(() => {
                const loadingOverlay: MockLoadingOverlayComponent = fixture.debugElement.query(
                    By.directive(MockLoadingOverlayComponent)
                ).componentInstance;
                expect(loadingOverlay.loading).toBeTruthy();

                expect(() => {
                    apiSubject.error('An error occurred');
                    flush();
                }).toThrow();
                fixture.detectChanges();
                expect(loadingOverlay.loading).toBeFalsy();
            }));
        });
    });

    describe('print', () => {
        it('should render a print button', fakeAsync(() => {
            initialize('edit');
            const printBtn = fixture.debugElement.query(By.directive(PrintButtonComponent));
            expect(printBtn).not.toBeNull();
        }));
    });

    describe.each`
        type         | expected
        ${'REG'}     | ${false}
        ${'TRB'}     | ${false}
        ${'KF'}      | ${true}
        ${undefined} | ${true}
    `('isManual', ({ type, expected }) => {
        it(`should be ${expected} for ${type} receipt types`, () => {
            const receiptType = type ? { id: 1, code: type, description: `Test ${type}` } : undefined;
            component.model = { ...new ReceiptOfMaterial(), receiptType };
            expect(component.isManual).toEqual(expected);
        });
    });

    describe.each`
        accessMode | status         | expected
        ${'view'}  | ${'FINALIZED'} | ${false}
        ${'view'}  | ${'OPEN'}      | ${true}
        ${'edit'}  | ${'FINALIZED'} | ${false}
        ${'edit'}  | ${'OPEN'}      | ${true}
        ${'add'}   | ${undefined}   | ${true}
    `('isOpen (accessMode=$accessMode)', ({ accessMode, status, expected }) => {
        it(`should be ${expected} for ${status} receipt status`, () => {
            const receiptStatus = status ? { id: 1, code: status, description: `Test ${status}` } : undefined;
            initialize(accessMode, { ...testReceiptOfMaterial, status: receiptStatus }, false);
            expect(component.isOpen).toEqual(expected);
        });
    });

    describe('managing products', () => {
        const inventoryDetails = [
            {
                id: { storeId: 1, productId: 3 },
                wholesalePrice: 3.33,
                maxStockLimit: 50,
                uom: { id: 1, code: 'UOM1', description: 'Test UOM' },
                code: 'PROD1',
                description: 'Test Product',
                sapNumber: '1234',
                secondLevelCategory: { id: 5, code: 'CAT1', description: 'Test Category' },
            },
            {
                id: { storeId: 1, productId: 4 },
                wholesalePrice: 4.44,
                maxStockLimit: 50,
                uom: { id: 1, code: 'UOM1', description: 'Test UOM' },
                code: 'PROD2',
                description: 'Test Product 2',
                sapNumber: '1235',
                secondLevelCategory: { id: 6, code: 'CAT2', description: 'Test Category 2' },
            },
        ];

        const generateReceipt = () => {
            // initialize test as if they have already clicked the 'go' button
            const store = { id: 1, code: 'S1', description: 'Store 1' };
            const vendor = { id: 1, code: 'V1', description: 'Vendor 1' };
            initialize('add', null, false);
            component.form.setControlValue('store', store);
            component.form.setControlValue('vendor', vendor);
            component.generateReceipt();
            fixture.detectChanges();
        };

        describe.each`
            accessMode | type         | status         | productsEditable
            ${'view'}  | ${'REG'}     | ${'OPEN'}      | ${false}
            ${'view'}  | ${'REG'}     | ${'FINALIZED'} | ${false}
            ${'view'}  | ${'TRB'}     | ${'OPEN'}      | ${false}
            ${'view'}  | ${'TRB'}     | ${'FINALIZED'} | ${false}
            ${'view'}  | ${'KF'}      | ${'OPEN'}      | ${false}
            ${'view'}  | ${'KF'}      | ${'FINALIZED'} | ${false}
            ${'edit'}  | ${'REG'}     | ${'OPEN'}      | ${false}
            ${'edit'}  | ${'REG'}     | ${'FINALIZED'} | ${false}
            ${'edit'}  | ${'TRB'}     | ${'OPEN'}      | ${false}
            ${'edit'}  | ${'TRB'}     | ${'FINALIZED'} | ${false}
            ${'edit'}  | ${'KF'}      | ${'OPEN'}      | ${true}
            ${'edit'}  | ${'KF'}      | ${'FINALIZED'} | ${false}
            ${'add'}   | ${undefined} | ${undefined}   | ${false}
        `(
            'with accessMode=$accessMode, type=$type, status=$status',
            ({ accessMode, type, status, productsEditable }) => {
                it(`should ${productsEditable ? '' : 'not '}allow editing of products`, fakeAsync(() => {
                    const receiptType = type ? { id: 1, code: type, description: `Test ${type}` } : null;
                    const receiptStatus = status ? { id: 2, code: status, description: `Test ${status}` } : null;
                    initialize(accessMode, {
                        ...testReceiptOfMaterial,
                        receiptType,
                        status: receiptStatus,
                    });

                    expect(component.productsEditable).toEqual(productsEditable);

                    if (!productsEditable) {
                        expect(fixture.debugElement.query(By.css('#remove-products-button'))).toBeNull();
                        expect(fixture.debugElement.query(By.css('#product-add-input'))).toBeNull();
                        // Using nativeElement.querySelector to query for nested components
                        expect(fixture.nativeElement.querySelector('#master-checkbox')).toBeNull();
                        expect(fixture.nativeElement.querySelector('#checkbox-0')).toBeNull();
                    } else {
                        expect(fixture.debugElement.query(By.css('#remove-products-button'))).not.toBeNull();
                        // Using nativeElement.querySelector to query for nested components
                        expect(fixture.nativeElement.querySelector('#master-checkbox')).not.toBeNull();
                        expect(fixture.nativeElement.querySelector('#checkbox-0')).not.toBeNull();
                        expect(fixture.debugElement.query(By.css('#product-add-input'))).not.toBeNull();
                    }
                }));
            }
        );

        describe('in add mode with receipt generated', () => {
            const getRemoveProductsBtn = async () =>
                await loader.getHarness(MatButtonHarness.with({ selector: '#remove-products-button' }));

            const addProducts = () => {
                jest.spyOn(component.storeProductFacade, 'getInventoryDetails').mockReturnValue(of(inventoryDetails));
                component.addProducts([{ code: inventoryDetails[0].code }, { code: inventoryDetails[1].code }]);
                flush();
                fixture.detectChanges();
            };

            beforeEach(() => generateReceipt());

            it('should configure the search product function', fakeAsync(() => {
                const productAddInput = fixture.debugElement.query(By.css('#product-add-input'))
                    .componentInstance as ProductAddInputComponent;
                expect(productAddInput.searchFn).toEqual(component.searchProductsFn);
            }));

            it('should allow products to be added', fakeAsync(() => {
                const inventoryDetail$ = new Subject<any[]>();
                jest.spyOn(component.storeProductFacade, 'getInventoryDetails').mockReturnValue(inventoryDetail$);
                const addProductsComponent = fixture.debugElement.query(By.css('#product-add-input'));
                expect(addProductsComponent).not.toBeNull();
                // add products
                addProductsComponent.triggerEventHandler('products', [
                    { code: inventoryDetails[0].code },
                    { code: inventoryDetails[1].code },
                ]);
                // verify state before storeProductFacade call
                expect(component.isLoading).toBeTruthy();
                expect(component.unsavedChanges).toBeFalsy();
                expect(component.receiptProductsForm.length).toEqual(0);
                // complete the storeProductFacade call
                inventoryDetail$.next(inventoryDetails);
                flush();
                // verify state after storeProductFacade call
                expect(component.isLoading).toBeFalsy();
                expect(component.unsavedChanges).toBeTruthy();
                expect(component.receiptProductsForm.length).toEqual(2);
                expect(component.receiptProductsForm.at(0).value.product.code).toEqual(inventoryDetails[0].code);
                expect(component.receiptProductsForm.at(1).value.product.code).toEqual(inventoryDetails[1].code);
            }));

            it('should retain current check marks when new products are added', fakeAsync(async () => {
                // initialize form with existing product
                component.form.setControl(
                    'receiptProducts',
                    new FormArray([new FormControl(testReceiptOfMaterialProducts[0])])
                );
                (await loader.getHarness(MatCheckboxHarness.with({ selector: '#master-checkbox' }))).check();
                flush();
                // assert only one item in form and in selection model
                expect(component.selection.selected.length).toEqual(1);
                expect(component.form.getControlValue('receiptProducts').length).toEqual(1);
                // add new product
                component['addProductsToForm']([testReceiptOfMaterialProducts[1]]);
                expect(component.form.getControlValue('receiptProducts').length).toEqual(2);
                expect(component.selection.selected.length).toEqual(1);
                expect(component.selection.selected[0].value).toEqual(
                    component.form.getControlValue('receiptProducts')[0]
                );
            }));

            it('should display an error if not all products requested can be added', fakeAsync(() => {
                jest.spyOn(component.storeProductFacade, 'getInventoryDetails').mockReturnValue(of(inventoryDetails));
                const addProductsComponent = fixture.debugElement.query(By.css('#product-add-input'));
                addProductsComponent.triggerEventHandler('products', [
                    { code: inventoryDetails[0].code },
                    { code: inventoryDetails[1].code },
                    { code: 'PROD3' },
                ]);
                flush();
                // expect an error message for the 1 it couldn't add
                expect(component.messageFacade.addMessage).toHaveBeenCalledWith({
                    severity: 'error',
                    message: 'Unable to add requested product(s): PROD3.',
                    hasTimeout: true,
                });
                // but still add the 2 it could find
                expect(component.receiptProductsForm.at(0).value.product.code).toEqual(inventoryDetails[0].code);
                expect(component.receiptProductsForm.at(1).value.product.code).toEqual(inventoryDetails[1].code);
                expect(component.receiptProductsForm.at(3)).toBeUndefined();
            }));

            it('should filter out products that were not requested', fakeAsync(() => {
                jest.spyOn(component.storeProductFacade, 'getInventoryDetails').mockReturnValue(of(inventoryDetails));
                const addProductsComponent = fixture.debugElement.query(By.css('#product-add-input'));
                addProductsComponent.triggerEventHandler('products', [{ code: inventoryDetails[1].code }]);
                flush();
                // expect only the requested product
                expect(component.receiptProductsForm.at(0).value.product.code).toEqual(inventoryDetails[1].code);
                expect(component.receiptProductsForm.at(1)).toBeUndefined();
            }));

            it('should allow products to be removed', fakeAsync(async () => {
                addProducts();
                // verify state with products added
                expect(component.receiptProductsForm.length).toEqual(2);
                expect(component.selection.selected.length).toEqual(0);
                expect(await (await getRemoveProductsBtn()).isDisabled()).toBeTruthy();
                // select and remove first product
                (await loader.getHarness(MatCheckboxHarness.with({ selector: '#checkbox-0' }))).check();
                flush();
                expect(component.selection.selected.length).toEqual(1);
                const removeProductsBtn = await getRemoveProductsBtn();
                expect(await removeProductsBtn.isDisabled()).toBeFalsy();
                removeProductsBtn.click();
                flush();
                // verify state after product removed
                expect(await (await getRemoveProductsBtn()).isDisabled()).toBeTruthy();
                expect(component.selection.selected.length).toEqual(0);
                expect(component.receiptProductsForm.length).toEqual(1);
                expect(component.receiptProductsForm.at(0).value.product.code).toEqual(inventoryDetails[1].code);
            }));

            it('should allow all products to be removed', fakeAsync(async () => {
                addProducts();
                // select and remove all products
                (await loader.getHarness(MatCheckboxHarness.with({ selector: '#master-checkbox' }))).check();
                flush();
                expect(component.selection.selected.length).toEqual(2);
                (await getRemoveProductsBtn()).click();
                flush();
                // verify state after all products removed
                expect(component.selection.selected.length).toEqual(0);
                expect(component.receiptProductsForm.length).toEqual(0);
                expect(component.form.valid).toBeFalsy();
            }));

            it('should remove loading indicator on error', fakeAsync(() => {
                const error = '500: something went wrong';
                jest.spyOn(component.storeProductFacade, 'getInventoryDetails').mockImplementationOnce(() =>
                    throwError(error)
                );
                expect(() => {
                    component.addProducts([{ code: inventoryDetails[0].code }, { code: inventoryDetails[1].code }]);
                    flush();
                }).toThrowError(error);
                expect(component.isLoading).toBeFalsy();
            }));

            it('should display a message when finalizing', fakeAsync(() => {
                addProducts();
                component.receiptProductsForm.controls.forEach((c) => {
                    c.get('quantityReceived').setValue(2);
                    c.updateValueAndValidity();
                });
                jest.spyOn(component.receiptOfMaterialFacade, 'finalize').mockReturnValueOnce(
                    of({ number: 'K123123', storeId: 123 })
                );
                component.finalize();
                const router = TestBed.inject(Router);
                tick(100);
                expect(routerService.navigateToSearchPage).toHaveBeenCalledWith(TestBed.inject(ActivatedRoute));
                // We don't have a number available when adding, so verifying null does not display
                expect(component.messageFacade.addMessage).toHaveBeenCalledWith({
                    message: 'Receipt of Material finalized successfully',
                    severity: 'info',
                });
            }));
        });

        describe.each`
            accessMode | expectedContent
            ${'edit'}  | ${'Are you sure you want to finalize receipt R00000?'}
            ${'add'}   | ${'Are you sure you want to finalize the receipt?'}
        `('finalize dialog content in $accessMode mode', ({ accessMode, expectedContent }) => {
            it('should prompt the user for confirmation when finalizing', fakeAsync(() => {
                initialize(accessMode);
                // open finalize dialog
                fixture.debugElement.query(By.css('#finalize-receipt-dialog')).injector.get(MockDialogComponent).open();
                // find it's content div's inner html
                const dialogContent: string = fixture.nativeElement.querySelector('#finalize-confirmation').innerHTML;
                // trim extra spaces and verify
                expect(dialogContent.trim()).toEqual(expectedContent);
            }));
        });

        describe('showQtyReceivedWarning', () => {
            /**
             * Initialize the component to a state where products can be edited, then update
             * a product to the specified qtyReceived and conditionally expect a warning.
             */
            const verifyWarning = (mode, type, status, qtyReceived, details, warningExpected) => () => {
                const receiptType = type ? { id: 3, code: type, description: `Test ${type}` } : null;
                const receiptStatus = status ? { id: 4, code: status, description: `Test ${status}` } : null;
                const receiptProduct = {
                    ...testReceiptOfMaterialProducts[0],
                    product: { code: 'TEST' },
                    quantityReceived: 9,
                };
                const detail = { ...inventoryDetails[0], code: receiptProduct.product.code, ...details };
                jest.spyOn(component.storeProductFacade, 'getInventoryDetails').mockReturnValue(of([detail]));
                // Initialize in add or view/edit
                if (AccessMode.ADD.urlSegement === mode) {
                    generateReceipt();
                    tick(200); // store value change requires a tick
                    // add the products
                    component.addProducts([{ code: receiptProduct.product.code }]);
                    flush();
                    fixture.detectChanges();
                    component.model.receiptType = receiptType;
                } else {
                    initialize(mode, {
                        ...testReceiptOfMaterial,
                        receiptProducts: [receiptProduct],
                        receiptType,
                        status: receiptStatus,
                    });
                }
                // Updating the quantity received to trigger the warning
                component.receiptProductsForm.at(0).get('quantityReceived').setValue(qtyReceived);
                fixture.detectChanges();
                // Verify warning is displayed
                const warning = fixture.nativeElement.querySelector('#qtyReceivedWarning');
                if (warningExpected) {
                    expect(warning).not.toBeNull();
                } else {
                    expect(warning).toBeNull();
                }
            };

            const mockWarningParameters = (aduDays: number, qohPercentage: number) =>
                jest.spyOn(component.parameterFacade, 'findStoreParameterValue').mockImplementation((paramName) => {
                    if (paramName === 'RM_WARN_QTY_ABOVE_ADU') {
                        return of(aduDays);
                    } else if (paramName === 'RM_WARN_PERCENT_ABOVE_QOH') {
                        return of(qohPercentage);
                    }
                    return of(null);
                });

            describe.each`
                mode      | type         | status         | maxStockLimit | qtyReceived | warningExpected
                ${'view'} | ${'REG'}     | ${'FINALIZED'} | ${88}         | ${90}       | ${false}
                ${'view'} | ${'REG'}     | ${'OPEN'}      | ${88}         | ${90}       | ${false}
                ${'view'} | ${'REG'}     | ${'OPEN'}      | ${88}         | ${40}       | ${false}
                ${'view'} | ${'KF'}      | ${'FINALIZED'} | ${88}         | ${90}       | ${false}
                ${'view'} | ${'KF'}      | ${'OPEN'}      | ${88}         | ${90}       | ${false}
                ${'view'} | ${'KF'}      | ${'OPEN'}      | ${88}         | ${40}       | ${false}
                ${'edit'} | ${'REG'}     | ${'FINALIZED'} | ${88}         | ${90}       | ${false}
                ${'edit'} | ${'REG'}     | ${'OPEN'}      | ${88}         | ${90}       | ${true}
                ${'edit'} | ${'REG'}     | ${'OPEN'}      | ${88}         | ${40}       | ${false}
                ${'edit'} | ${'KF'}      | ${'FINALIZED'} | ${88}         | ${90}       | ${false}
                ${'edit'} | ${'KF'}      | ${'OPEN'}      | ${88}         | ${90}       | ${true}
                ${'edit'} | ${'KF'}      | ${'OPEN'}      | ${88}         | ${40}       | ${false}
                ${'add'}  | ${'KF'}      | ${undefined}   | ${88}         | ${90}       | ${true}
                ${'add'}  | ${'KF'}      | ${undefined}   | ${88}         | ${40}       | ${false}
                ${'add'}  | ${undefined} | ${undefined}   | ${88}         | ${90}       | ${true}
                ${'add'}  | ${undefined} | ${undefined}   | ${88}         | ${40}       | ${false}
            `(
                'over maxStockLimit (mode=$mode, type=$type, status=$status)',
                ({ mode, type, status, maxStockLimit, qtyReceived, warningExpected }) => {
                    it(`should ${
                        warningExpected ? '' : 'not '
                    }display a warning if qtyReceived=${qtyReceived} and maxStockLimit=${maxStockLimit}`, fakeAsync(() => {
                        verifyWarning(mode, type, status, qtyReceived, { maxStockLimit }, warningExpected);
                    }));
                }
            );

            describe.each`
                mode      | type         | status         | adu  | aduDays      | qtyReceived | warningExpected
                ${'view'} | ${'REG'}     | ${'FINALIZED'} | ${2} | ${10}        | ${21}       | ${false}
                ${'view'} | ${'REG'}     | ${'OPEN'}      | ${2} | ${10}        | ${21}       | ${false}
                ${'view'} | ${'REG'}     | ${'OPEN'}      | ${2} | ${10}        | ${8}        | ${false}
                ${'view'} | ${'REG'}     | ${'OPEN'}      | ${2} | ${undefined} | ${21}       | ${false}
                ${'view'} | ${'KF'}      | ${'FINALIZED'} | ${2} | ${10}        | ${21}       | ${false}
                ${'view'} | ${'KF'}      | ${'OPEN'}      | ${2} | ${10}        | ${21}       | ${false}
                ${'view'} | ${'KF'}      | ${'OPEN'}      | ${2} | ${10}        | ${8}        | ${false}
                ${'view'} | ${'KF'}      | ${'OPEN'}      | ${2} | ${undefined} | ${21}       | ${false}
                ${'edit'} | ${'REG'}     | ${'FINALIZED'} | ${2} | ${10}        | ${21}       | ${false}
                ${'edit'} | ${'REG'}     | ${'OPEN'}      | ${2} | ${10}        | ${21}       | ${false}
                ${'edit'} | ${'REG'}     | ${'OPEN'}      | ${2} | ${10}        | ${8}        | ${false}
                ${'edit'} | ${'REG'}     | ${'OPEN'}      | ${2} | ${undefined} | ${21}       | ${false}
                ${'edit'} | ${'KF'}      | ${'FINALIZED'} | ${2} | ${10}        | ${21}       | ${false}
                ${'edit'} | ${'KF'}      | ${'OPEN'}      | ${2} | ${10}        | ${21}       | ${true}
                ${'edit'} | ${'KF'}      | ${'OPEN'}      | ${2} | ${10}        | ${8}        | ${false}
                ${'edit'} | ${'KF'}      | ${'OPEN'}      | ${2} | ${undefined} | ${21}       | ${false}
                ${'add'}  | ${'KF'}      | ${undefined}   | ${2} | ${10}        | ${21}       | ${true}
                ${'add'}  | ${'KF'}      | ${undefined}   | ${2} | ${10}        | ${8}        | ${false}
                ${'add'}  | ${'KF'}      | ${undefined}   | ${2} | ${undefined} | ${21}       | ${false}
                ${'add'}  | ${undefined} | ${undefined}   | ${2} | ${10}        | ${21}       | ${true}
                ${'add'}  | ${undefined} | ${undefined}   | ${2} | ${10}        | ${8}        | ${false}
            `(
                'over expected usage (mode=$mode, type=$type, status=$status)',
                ({ mode, type, status, adu, aduDays, qtyReceived, warningExpected }) => {
                    it(`should ${
                        warningExpected ? '' : 'not '
                    }display a warning if qtyReceived=${qtyReceived} and adu=${adu} and aduDays=${aduDays}`, fakeAsync(() => {
                        mockWarningParameters(aduDays, null);
                        verifyWarning(mode, type, status, qtyReceived, { averageDailyUsage: adu }, warningExpected);
                    }));
                }
            );

            describe.each`
                mode      | type         | status         | qoh   | qohPercentage | qtyReceived | warningExpected
                ${'view'} | ${'REG'}     | ${'FINALIZED'} | ${10} | ${100}        | ${21}       | ${false}
                ${'view'} | ${'REG'}     | ${'OPEN'}      | ${10} | ${100}        | ${21}       | ${false}
                ${'view'} | ${'REG'}     | ${'OPEN'}      | ${10} | ${100}        | ${8}        | ${false}
                ${'view'} | ${'REG'}     | ${'OPEN'}      | ${10} | ${undefined}  | ${21}       | ${false}
                ${'view'} | ${'KF'}      | ${'FINALIZED'} | ${10} | ${100}        | ${21}       | ${false}
                ${'view'} | ${'KF'}      | ${'OPEN'}      | ${10} | ${100}        | ${21}       | ${false}
                ${'view'} | ${'KF'}      | ${'OPEN'}      | ${10} | ${100}        | ${8}        | ${false}
                ${'view'} | ${'KF'}      | ${'OPEN'}      | ${10} | ${undefined}  | ${21}       | ${false}
                ${'edit'} | ${'REG'}     | ${'FINALIZED'} | ${10} | ${100}        | ${21}       | ${false}
                ${'edit'} | ${'REG'}     | ${'OPEN'}      | ${10} | ${100}        | ${21}       | ${false}
                ${'edit'} | ${'REG'}     | ${'OPEN'}      | ${10} | ${100}        | ${8}        | ${false}
                ${'edit'} | ${'REG'}     | ${'OPEN'}      | ${10} | ${undefined}  | ${21}       | ${false}
                ${'edit'} | ${'KF'}      | ${'FINALIZED'} | ${10} | ${100}        | ${21}       | ${false}
                ${'edit'} | ${'KF'}      | ${'OPEN'}      | ${10} | ${100}        | ${21}       | ${true}
                ${'edit'} | ${'KF'}      | ${'OPEN'}      | ${10} | ${100}        | ${8}        | ${false}
                ${'edit'} | ${'KF'}      | ${'OPEN'}      | ${10} | ${undefined}  | ${21}       | ${false}
                ${'add'}  | ${'KF'}      | ${undefined}   | ${10} | ${100}        | ${21}       | ${true}
                ${'add'}  | ${'KF'}      | ${undefined}   | ${10} | ${100}        | ${8}        | ${false}
                ${'add'}  | ${'KF'}      | ${undefined}   | ${10} | ${undefined}  | ${21}       | ${false}
                ${'add'}  | ${undefined} | ${undefined}   | ${10} | ${100}        | ${21}       | ${true}
                ${'add'}  | ${undefined} | ${undefined}   | ${10} | ${100}        | ${8}        | ${false}
            `(
                'over Qty on Hand percentage (mode=$mode, type=$type, status=$status)',
                ({ mode, type, status, qoh, qohPercentage, qtyReceived, warningExpected }) => {
                    it(`should ${
                        warningExpected ? '' : 'not '
                    }display a warning if qtyReceived=${qtyReceived} and qoh=${qoh} and qohPercentage=${qohPercentage}`, fakeAsync(() => {
                        mockWarningParameters(null, qohPercentage);
                        verifyWarning(mode, type, status, qtyReceived, { quantityOnHand: qoh }, warningExpected);
                    }));
                }
            );
        });
    });
});
