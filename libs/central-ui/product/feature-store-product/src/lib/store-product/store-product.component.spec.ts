import { HttpClient } from '@angular/common/http';
import { Component, Input, Type } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush, tick, waitForAsync } from '@angular/core/testing';
import { AbstractControl, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatMomentDateModule, MomentDateModule } from '@angular/material-moment-adapter';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { By, HAMMER_LOADER } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, ActivatedRouteSnapshot, Router, convertToParamMap } from '@angular/router';
import { CommonCodeFacade } from '@vioc-angular/central-ui/config/data-access-common-code';
import { VendorFacade } from '@vioc-angular/central-ui/inventory/data-access-vendor';
import {
    StoreProduct,
    StoreProductFacade,
    StoreProductMassAdd,
} from '@vioc-angular/central-ui/product/data-access-store-product';
import { RouterService } from '@vioc-angular/central-ui/util-router';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { CommonFunctionalityModule, Described } from '@vioc-angular/shared/common-functionality';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { UiActionBarModule } from '@vioc-angular/shared/ui-action-bar';
import { UiAuditModule } from '@vioc-angular/shared/ui-audit';
import { UiCurrencyPrefixModule } from '@vioc-angular/shared/ui-currency-prefix';
import { UiInfoButtonModule } from '@vioc-angular/shared/ui-info-button';
import { MockLoadingOverlayComponent, UiLoadingMockModule } from '@vioc-angular/shared/ui-loading';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { FormFactory, TypedFormGroup, UtilFormModule } from '@vioc-angular/shared/util-form';
import {
    expectInput,
    getAddLikeActionButton,
    getApplyActionButton,
    getSaveActionButton,
} from '@vioc-angular/test/util-test';
import { ReplaySubject, Subject, of } from 'rxjs';
import { StoreProductModuleForms } from '../store-product-module-forms';
import { StoreProductComponent } from './store-product.component';

@Component({
    selector: 'vioc-angular-filtered-input',
    template: ``,
})
class MockFilteredInputComponent {
    @Input() options: Described[];
    @Input() valueControl: AbstractControl;
    @Input() editable: boolean;
    @Input() placeHolder: string;
}

describe('StoreProductComponent', () => {
    let component: StoreProductComponent;
    let fixture: ComponentFixture<StoreProductComponent>;
    let storeProductFacade: StoreProductFacade;
    let commonCodeFacade: CommonCodeFacade;
    let vendorFacade: VendorFacade;
    const vendorDirectShip: Described = { id: 3, code: 'VDS', description: 'Valvoline Direct Ship', version: 0 };
    const uomEach: Described = { id: 1, code: 'EA', description: 'Each', version: 0 };
    const frequencyMonth: Described = { id: 2, code: 'MONTH', description: 'Monthly', version: 0 };
    const countFrequency: Described = { id: 5, code: 'CF', description: 'Weekly', version: 0 };
    const storeFoo: Described = { id: 4, code: 'FOO', description: 'Store Foo', version: 0 };
    const productBar: Described = { id: 5, code: 'BAR', description: 'Product Bar', version: 0 };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [StoreProductComponent, MockFilteredInputComponent],
            imports: [
                UiAuditModule,
                UiCurrencyPrefixModule,
                UiInfoButtonModule,
                MatNativeDateModule,
                MatDatepickerModule,
                MatTooltipModule,
                NoopAnimationsModule,
                UiLoadingMockModule,
                ReactiveFormsModule,
                MatCheckboxModule,
                MatFormFieldModule,
                MatSelectModule,
                MatInputModule,
                MatButtonModule,
                MomentDateModule,
                MatMomentDateModule,
                UtilFormModule,
                CommonFunctionalityModule,
                UiActionBarModule,
            ],
            providers: [
                FormFactory,
                { provide: ActivatedRoute, useValue: { params: new Subject() } },
                { provide: RouterService, useValue: { navigateToSearchPage: jest.fn(), back: jest.fn() } },
                { provide: Router, useValue: { navigate: jest.fn() } },
                { provide: HttpClient, useValue: {} },
                { provide: MessageFacade, useValue: { addMessage: jest.fn() } },
                { provide: GATEWAY_TOKEN, useValue: '//gateway' },
                { provide: HAMMER_LOADER, useValue: () => new Promise(() => {}) },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(StoreProductComponent);
        component = fixture.componentInstance;
        StoreProductModuleForms.registerForms(TestBed.inject(FormFactory), TestBed.inject(FormBuilder));

        storeProductFacade = component['storeProductFacade'];
        commonCodeFacade = component['commonCodeFacade'];
        vendorFacade = component['vendorFacade'];
        jest.spyOn(vendorFacade, 'findByStores').mockImplementation(() => of([vendorDirectShip]));
        jest.spyOn(vendorFacade, 'findByStore').mockImplementation(() => of([vendorDirectShip]));
        jest.spyOn(commonCodeFacade, 'findByType').mockImplementation(() => of([frequencyMonth]));
        jest.spyOn(storeProductFacade, 'findAssignableStores').mockReturnValue(of([storeFoo]));
    });

    const initialize = (
        accessMode: 'view' | 'edit' | 'add-like',
        storeNum: string,
        productCode: string,
        model: StoreProduct,
        andflush = true
    ) => {
        const route = TestBed.inject(ActivatedRoute);
        route.snapshot = {
            paramMap: convertToParamMap({
                accessMode: AccessMode.of(accessMode).urlSegement,
                storeNum,
                productCode,
            }),
        } as ActivatedRouteSnapshot;
        const storeProduct = {
            ...new StoreProduct(),
            store: storeFoo,
            product: productBar,
            ...model,
        };
        jest.spyOn(storeProductFacade, 'findByStoreAndProduct').mockReturnValue(of(storeProduct));
        fixture.detectChanges();
        if (andflush) {
            tick(100); // clear timers in queue
            flush();
        }
    };

    const getStoreInput = () =>
        fixture.debugElement
            .query(By.directive(MockFilteredInputComponent))
            .injector.get<MockFilteredInputComponent>(MockFilteredInputComponent as Type<MockFilteredInputComponent>);

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display loading overlay if isLoading', fakeAsync(() => {
        initialize('edit', 'FOO', 'BAR', {});
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
            initialize('edit', 'FOO', 'BAR', {});
            fixture.debugElement.query(By.css('#cancel-action')).nativeElement.click();

            expect(router.navigate).toHaveBeenCalledWith(['search'], {
                relativeTo: TestBed.inject(ActivatedRoute).parent,
            });
        }));
    });

    describe('ngOnInit', () => {
        const storeProduct = {
            ...new StoreProduct(),
            store: { code: 'FOO' },
            vendor: vendorDirectShip,
            product: {
                code: 'BAR',
                productCategory: {},
            },
            active: false,
            extraChargeTaxable: null,
            includeInCount: true,
            minMaxOverridable: false,
            taxable: true,
            overridable: false,
            reportOrder: '1',
            countFrequency: countFrequency,
            wholesalePrice: 20,
            retailPrice: 30,
            quantityPerPack: 1,
            minOrderQuantity: 1,
        };

        describe.each`
            accessMode | formEnabled
            ${'edit'}  | ${true}
            ${'view'}  | ${false}
        `('with accessMode=$accessMode', ({ accessMode, formEnabled }) => {
            it(`should have initialized a ${formEnabled} form`, fakeAsync(() => {
                initialize(accessMode, 'FOO', 'BAR', storeProduct);

                expect(vendorFacade.findByStore).toHaveBeenCalledTimes(accessMode === 'view' ? 0 : 1);
                expect(commonCodeFacade.findByType).toHaveBeenCalledTimes(accessMode === 'view' ? 0 : 1);
                expect(storeProductFacade.findByStoreAndProduct).toHaveBeenCalledWith('FOO', 'BAR');

                // 'the form should be initialized with the loaded value'
                expect(component.form).toBeDefined();
                expect(component.form.getRawValue()).toEqual(storeProduct);
                // 'the form should be enaabled'
                expect(component.form.enabled).toBe(formEnabled);
                expect(component.form.invalid).toEqual(false);
            }));

            it('should not display the default vendor and report order checkboxes', fakeAsync(() => {
                initialize(accessMode, 'FOO', 'BAR', storeProduct);

                expect(fixture.debugElement.query(By.css('#default-vendor-checkbox'))).toBeNull();
                expect(fixture.debugElement.query(By.css('#default-report-order-checkbox'))).toBeNull();
            }));

            it('should provide current values to dropdowns', fakeAsync(async () => {
                // dropdowns require the existing value to be an option in order to display properly
                initialize(accessMode, 'FOO', 'BAR', storeProduct);
                // grab each dropdown observable
                const stores = await component.availableStores.toPromise();
                const vendors = await component.vendorList.toPromise();

                expect(stores).toContain(storeProduct.store);
                expect(vendors).toContain(storeProduct.vendor);
            }));
        });

        it('should load a sorted list of vendors', fakeAsync(() => {
            // Define mocked vendors
            const vendor1: Described = { id: 1, code: 'MV', description: 'Mock vendor 1', version: 0 };
            const vendor2: Described = { id: 2, code: 'MV', description: 'Mock vendor 2', version: 0 };
            const vendor3: Described = { id: 3, code: 'MV', description: 'Mock vendor 3', version: 0 };
            // Mock vendor facade call
            jest.spyOn(vendorFacade, 'findByStore').mockImplementation(() => of([vendor2, vendor3, vendor1]));

            // Initialize to sort
            initialize('edit', 'FOO', 'BAR', storeProduct);
            // Verify that vendor list has been sorted
            expect(vendorFacade.findByStore).toHaveBeenCalled();
            component.vendorList.subscribe((vendors) => expect(vendors).toEqual([vendor1, vendor2, vendor3]));
        }));

        describe('mass add', () => {
            let testDestroyed: ReplaySubject<any>;
            let testMassAddForm: TypedFormGroup<StoreProductMassAdd>;

            beforeEach(() => {
                testDestroyed = new ReplaySubject();
                const formFactory = TestBed.inject(FormFactory);
                testMassAddForm = formFactory.group(
                    'StoreProductMassAdd',
                    {
                        stores: undefined,
                        products: undefined,
                        useDefaultVendor: undefined,
                        useDefaultReportOrder: undefined,
                        storeProduct: new StoreProduct(),
                    },
                    testDestroyed
                );
                testMassAddForm.getControl('stores').setValue([]);
                component.massAddForm = testMassAddForm;
            });

            afterEach(() => {
                testDestroyed.next();
                testDestroyed.complete();
            });

            it('should initialize properly', fakeAsync(() => {
                component.massAddForm.getControl('stores').setValue([
                    { id: 1, code: 'store1' },
                    { id: 2, code: 'store2' },
                ]);
                component.massAddForm.getControl('products').setValue([
                    { id: 3, code: 'prod3' },
                    { id: 4, code: 'prod4' },
                ]);
                fixture.detectChanges();
                tick(100); // clear timers in queue
                expect(component.form).toBe(testMassAddForm.getControl('storeProduct'));
                expect(component.accessMode).toEqual(AccessMode.ADD);
                expect(commonCodeFacade.findByType).toHaveBeenCalledWith('COUNTFREQ', true);
                expect(vendorFacade.findByStores).toHaveBeenCalledWith(['store1', 'store2']);
            }));

            it('should display the default vendor and report order checkboxes', () => {
                fixture.detectChanges();
                expect(fixture.debugElement.query(By.css('#default-vendor-checkbox'))).not.toBeNull();
                expect(fixture.debugElement.query(By.css('#default-report-order-checkbox'))).not.toBeNull();
            });

            it('should not display any action buttons', () => {
                fixture.detectChanges();
                expect(fixture.debugElement.query(By.css('vioc-angular-action-bar'))).toBeNull();
            });
        });

        describe('add-like', () => {
            const storeCode = 'STORE';
            const productCode = 'PRODUCT';

            it('should initialize properly', fakeAsync(() => {
                initialize('add-like', storeCode, productCode, storeProduct);
                expect(component.accessMode.isAddLike).toBeTruthy();
                expect(storeProductFacade.findByStoreAndProduct).toHaveBeenCalledWith(storeCode, productCode);
                // The form should be initialized with the loaded storeProduct (except active and store values)
                expect(component.form.getRawValue()).toEqual({ ...storeProduct, active: true, store: undefined });
                expect(commonCodeFacade.findByType).toHaveBeenCalledWith('COUNTFREQ', true);
                expect(vendorFacade.findByStore).not.toHaveBeenCalled();
            }));

            it('should update available vendors on store change', fakeAsync(() => {
                initialize('add-like', storeCode, productCode, storeProduct);
                const newStoreCode = 'STORE99';
                component.form.patchControlValue('store', { id: 99, code: newStoreCode });
                flush();
                expect(vendorFacade.findByStore).toHaveBeenCalledWith(newStoreCode);
            }));

            it('should allow store editing and hide UOM, averageDailyUsage, and quantityOnHand', fakeAsync(() => {
                initialize('add-like', storeCode, productCode, storeProduct);
                expect(getStoreInput().editable).toBeTruthy();
                expectInput(fixture, { id: 'uom' }).not.toBePresent();
                expectInput(fixture, 'averageDailyUsage').not.toBePresent();
                expectInput(fixture, 'quantityOnHand').not.toBePresent();
            }));
        });
    });

    describe('product information', () => {
        beforeEach(waitForAsync(() => {
            const storeProduct: StoreProduct = {
                store: { code: '040066' },
                product: {
                    code: 'G840K6',
                    description: 'SERPENTINE BELT G840K6',
                    productCategory: { code: 'SERP BELT' },
                },
                active: false,
                companyProduct: { uom: uomEach },
                averageDailyUsage: 10,
                quantityOnHand: 20,
            };
            initialize('edit', 'FOO', 'BAR', storeProduct, false /* flushing via async() */);
        }));
        it.each`
            control                         | value                       | enabled
            ${{ id: 'product' }}            | ${'G840K6'}                 | ${false}
            ${{ id: 'productCategory' }}    | ${'SERP BELT'}              | ${false}
            ${'active'}                     | ${false}                    | ${true}
            ${{ id: 'invoiceDescription' }} | ${'SERPENTINE BELT G840K6'} | ${false}
            ${{ id: 'uom' }}                | ${'Each'}                   | ${false}
            ${'averageDailyUsage'}          | ${'10'}                     | ${false}
            ${'quantityOnHand'}             | ${'20'}                     | ${false}
        `('formControl=$control should have value=$value, enabled=$enabled', ({ control, value, enabled }) => {
            expectInput(fixture, control).toHaveValue(value).toBeEnabled(enabled);
        });

        it('should have store as non-editable', () => {
            expect(getStoreInput().editable).toBeFalsy();
        });
    });
    describe('pricing information', () => {
        it('should be displayed', fakeAsync(() => {
            const storeProduct: StoreProduct = {
                retailPrice: 5,
                // explicitly create wholesale price with 4 decimal places to show input will limit to 3
                wholesalePrice: 1.0011,
                taxable: true,
            };
            initialize('edit', 'FOO', 'BAR', storeProduct);

            expectInput(fixture, 'retailPrice').toHaveValue('5.00').toBeEnabled();
            // Show that wholesale price number converted to decimal with 3 places and not 4
            expectInput(fixture, 'wholesalePrice').not.toHaveValue('1.0011').toBeEnabled();
            expectInput(fixture, 'wholesalePrice').toHaveValue('1.001').toBeEnabled();
            expectInput(fixture, 'taxable').toHaveValue(true).toBeEnabled();
        }));
    });
    describe('price override information', () => {
        it('should be displayed if override checked', fakeAsync(() => {
            const storeProduct: StoreProduct = {
                overridable: true,
                minOverridePrice: 5,
                maxOverridePrice: 10,
                minMaxOverridable: true,
            };

            initialize('edit', 'FOO', 'BAR', storeProduct);

            expectInput(fixture, 'overridable').toHaveValue(true).toBeEnabled();
            expectInput(fixture, 'minOverridePrice').toHaveValue('5.00').toBeEnabled();
            expectInput(fixture, 'maxOverridePrice').toHaveValue('10.00').toBeEnabled();
            expectInput(fixture, 'minMaxOverridable').toHaveValue(true).toBeEnabled();
        }));

        it('should not be enabled if override not checked', fakeAsync(() => {
            const storeProduct: StoreProduct = {
                overridable: false,
                minOverridePrice: 5,
                maxOverridePrice: 10,
                minMaxOverridable: true,
            };

            initialize('edit', 'FOO', 'BAR', storeProduct);

            expectInput(fixture, 'overridable').toHaveValue(false).toBeEnabled();
            expectInput(fixture, 'minOverridePrice').not.toBeEnabled();
            expectInput(fixture, 'maxOverridePrice').not.toBeEnabled();
            expectInput(fixture, 'minMaxOverridable').not.toBeEnabled();
        }));
    });

    describe.each`
        amount    | description | taxable  | allPresent
        ${'5.55'} | ${'Desc'}   | ${true}  | ${true}
        ${null}   | ${'Desc'}   | ${null}  | ${true}
        ${null}   | ${null}     | ${false} | ${false /* We don't a checkbox to trigger show/hide because it can't be cleared */}
        ${null}   | ${null}     | ${true}  | ${false /* We don't a checkbox to trigger show/hide because it can't be cleared */}
        ${null}   | ${null}     | ${null}  | ${false}
    `('extra charge information', ({ amount, description, taxable, allPresent }) => {
        it(`should ${allPresent ? '' : 'not '}be displayed 
            if extraChargeAmount=${amount}, extraChargeDescription:${description} and extraChargeTaxable=${taxable}`, fakeAsync(() => {
            initialize('edit', 'store', 'prod', {
                extraChargeAmount: amount,
                extraChargeDescription: description,
                extraChargeTaxable: taxable,
            });

            expectInput(fixture, 'extraChargeAmount')
                .toHaveValue(amount || '')
                .toBeEnabled();
            if (allPresent) {
                expectInput(fixture, 'extraChargeDescription')
                    .toHaveValue(description || '')
                    .toBeEnabled();
                expectInput(fixture, 'extraChargeTaxable')
                    .toHaveValue(taxable || false) // if its present, it's either going to be true or false - not null
                    .toBeEnabled();
            } else {
                expectInput(fixture, 'extraChargeDescription').not.toBePresent();
                expectInput(fixture, 'extraChargeTaxable').not.toBePresent();
            }
        }));
    });

    describe('ordering information', () => {
        it('should display', fakeAsync(() => {
            initialize('edit', 'FOO', 'BAR', {
                vendor: vendorDirectShip,
                quantityPerPack: 5,
                minOrderQuantity: 10,
                minStockLimit: 3,
                maxStockLimit: 30,
                safetyFactorOverride: 15,
            });

            expectInput(fixture, 'vendor').toHaveValue('Valvoline Direct Ship').toBeEnabled();
            expectInput(fixture, 'quantityPerPack').toHaveValue('5').toBeEnabled();
            expectInput(fixture, 'minOrderQuantity').toHaveValue('10').toBeEnabled();
            expectInput(fixture, 'minStockLimit').toHaveValue('3').toBeEnabled();
            expectInput(fixture, 'maxStockLimit').toHaveValue('30').toBeEnabled();
            expectInput(fixture, 'safetyFactorOverride').toHaveValue('15').toBeEnabled();
        }));
        it('should show warning if safety factor override less than 1', fakeAsync(() => {
            initialize('edit', 'FOO', 'BAR', {
                safetyFactorOverride: 0.25,
            });

            expectInput(fixture, 'safetyFactorOverride')
                .toHaveValue('0.25')
                .toHaveWarning(
                    'This should usually be a value greater than 1. If you are wanting 25%, enter 25 instead of 0.25'
                )
                .toBeEnabled();
        }));
    });

    describe('inventory information', () => {
        it('should display', fakeAsync(() => {
            initialize('edit', 'store', 'prod', {
                includeInCount: true,
                countFrequency: frequencyMonth,
                reportOrder: '6K0840',
            });

            expectInput(fixture, 'includeInCount').toHaveValue(true).toBeEnabled();
            expectInput(fixture, 'countFrequency').toHaveValue('Monthly').toBeEnabled();
            expectInput(fixture, 'reportOrder').toHaveValue('6K0840').toBeEnabled();
        }));
    });

    describe.each`
        date            | amount    | expectedDateDisplay | allPresent
        ${'2120-03-25'} | ${'7.00'} | ${'3/25/2120'}      | ${true}
        ${'2120-03-25'} | ${null}   | ${'3/25/2120'}      | ${true}
        ${null}         | ${'7.00'} | ${''}               | ${true}
        ${null}         | ${null}   | ${''}               | ${false}
    `('scheduled retail price change', ({ date, amount, expectedDateDisplay, allPresent }) => {
        it(`should ${allPresent ? '' : 'not '}be displayed 
            if schedulePriceDate=${date} and schedulePriceChange=${amount}`, fakeAsync(() => {
            initialize('edit', 'store', 'prod', {
                schedulePriceDate: date,
                schedulePriceChange: amount,
            });

            expectInput(fixture, 'schedulePriceDate').toHaveValue(expectedDateDisplay).toBeEnabled();
            if (allPresent) {
                expectInput(fixture, 'schedulePriceChange')
                    .toHaveValue(amount || '')
                    .toBeEnabled();
            } else {
                expectInput(fixture, 'schedulePriceChange').not.toBePresent();
            }
        }));
    });

    describe.each`
        date            | amount      | expectedDateDisplay | allPresent
        ${'2120-03-25'} | ${'7.0000'} | ${'3/25/2120'}      | ${true}
        ${'2120-03-25'} | ${null}     | ${'3/25/2120'}      | ${true}
        ${null}         | ${'7.0000'} | ${''}               | ${true}
        ${null}         | ${null}     | ${''}               | ${false}
    `('scheduled wholesale price change', ({ date, amount, expectedDateDisplay, allPresent }) => {
        it(`should ${allPresent ? '' : 'not '}be displayed 
            if wholesalePriceChangeDate=${date} and wholesalePriceChange=${amount}`, fakeAsync(() => {
            initialize('edit', 'store', 'prod', {
                wholesalePriceChangeDate: date,
                wholesalePriceChange: amount,
            });

            expectInput(fixture, 'wholesalePriceChangeDate').toHaveValue(expectedDateDisplay).toBeEnabled();
            if (allPresent) {
                expectInput(fixture, 'wholesalePriceChange')
                    .toHaveValue(amount || '')
                    .toBeEnabled();
            } else {
                expectInput(fixture, 'wholesalePriceChange').not.toBePresent();
            }
        }));
    });

    describe.each`
        start           | end             | startDisplay   | endDisplay     | amount     | allPresent
        ${'2020-01-25'} | ${'2020-03-25'} | ${'1/25/2020'} | ${'3/25/2020'} | ${'40.00'} | ${true}
        ${'2020-01-25'} | ${null}         | ${'1/25/2020'} | ${''}          | ${null}    | ${true}
        ${null}         | ${'2020-03-25'} | ${''}          | ${'3/25/2020'} | ${null}    | ${true}
        ${null}         | ${null}         | ${''}          | ${''}          | ${'40.00'} | ${true}
        ${null}         | ${null}         | ${''}          | ${''}          | ${null}    | ${false}
    `('scheduled promotion', ({ start, end, startDisplay, endDisplay, amount, allPresent }) => {
        it(`should ${allPresent ? '' : 'not '}be displayed 
            if promotionPriceStartDate=${start}, promotionPriceEndDate=${end} and promotionPrice=${amount}`, fakeAsync(() => {
            initialize('edit', 'store', 'prod', {
                promotionPriceStartDate: start,
                promotionPriceEndDate: end,
                promotionPrice: amount,
            });

            expectInput(fixture, 'promotionPriceStartDate').toHaveValue(startDisplay).toBeEnabled();
            if (allPresent) {
                expectInput(fixture, 'promotionPriceEndDate').toHaveValue(endDisplay).toBeEnabled();
                expectInput(fixture, 'promotionPrice')
                    .toHaveValue(amount || '')
                    .toBeEnabled();
            } else {
                expectInput(fixture, 'promotionPriceEndDate').not.toBePresent();
                expectInput(fixture, 'promotionPrice').not.toBePresent();
            }
        }));
    });

    describe('action buttons', () => {
        const valid: StoreProduct = {
            id: { storeId: 123, productId: 1111 },
            store: {},
            product: {},
            averageDailyUsage: 1,
            quantityOnHand: 0,
            countFrequency: {},
            reportOrder: '0',
            vendor: vendorDirectShip,
            wholesalePrice: 15,
            retailPrice: 15,
            taxable: true,
            overridable: false,
            quantityPerPack: 1,
            minOrderQuantity: 1,
            includeInCount: false,
            active: true,
        };

        const verifyAddProduct = (saveOrApply: 'save' | 'apply') => {
            jest.spyOn(storeProductFacade, 'add').mockReturnValue(of(1));
            const messageSpy = jest.spyOn(component['messageFacade'], 'addMessage').mockImplementation();
            initialize('add-like', 'FOO', 'BAR', { ...valid, store: storeFoo, product: productBar });
            const newStore = { id: 99, code: 'S99', description: 'Store 99', version: 0 };
            component.form.patchControlValue('store', newStore);
            component.form.updateValueAndValidity();

            component[saveOrApply]();
            flush();

            expect(storeProductFacade.add).toHaveBeenCalled();
            expect(messageSpy).toHaveBeenCalledWith({
                severity: 'success',
                message: `Successfully added ${productBar.code} to store ${newStore.code}.`,
            });
        };

        describe('save button', () => {
            it('should save once on multiple clicks', fakeAsync(() => {
                initialize('edit', 'FOO', 'BAR', valid);

                // verify form is valid by checking the list of invalid form control names is empty
                expect(
                    Object.entries(component.form.controls)
                        .filter((c) => !c[1].disabled && !c[1].valid)
                        .map((c) => c[0])
                ).toHaveLength(0);
                jest.spyOn(component.saveFacade, 'save');
                jest.spyOn(component.storeProductFacade, 'update').mockReturnValue(of({}));

                const saveButton = getSaveActionButton(fixture);
                expect(saveButton).toBeTruthy();

                saveButton.nativeElement.click();
                saveButton.nativeElement.click();
                saveButton.nativeElement.click();
                fixture.detectChanges();
                tick(600);
                expect(component.saveFacade.save).toHaveBeenCalledTimes(1);
            }));

            // TODO: This is going to be a common pattern (it's in company-product.component.spec.ts too)
            it('should save on click', fakeAsync(() => {
                initialize('edit', 'FOO', 'BAR', valid);

                // verify form is valid by checking the list of invalid form control names is empty
                expect(
                    Object.entries(component.form.controls)
                        .filter((c) => !c[1].disabled && !c[1].valid)
                        .map((c) => c[0])
                ).toHaveLength(0);
                jest.spyOn(component.saveFacade, 'save');
                jest.spyOn(component.storeProductFacade, 'update').mockReturnValue(of({}));

                expect(getSaveActionButton(fixture)).toBeTruthy();

                getSaveActionButton(fixture).nativeElement.click();
                fixture.detectChanges();
                tick(600);
                expect(component.saveFacade.save).toHaveBeenCalled();
                expect(component['routerService'].navigateToSearchPage).toHaveBeenCalled();
            }));

            it('should show loading overlay when processing', fakeAsync(() => {
                const saveSubject = new Subject();
                storeProductFacade.update = jest.fn(() => saveSubject);
                initialize('edit', 'FOO', 'BAR', valid);
                getSaveActionButton(fixture).nativeElement.click();
                tick(600);

                expect(component.isLoading).toBeTruthy();

                saveSubject.next(null);
                expect(component.isLoading).toBeFalsy();
            }));

            it('should cancel loading overlay if an error occurs', fakeAsync(() => {
                const saveSubject = new Subject();
                storeProductFacade.update = jest.fn(() => saveSubject);
                initialize('edit', 'FOO', 'BAR', valid);
                getSaveActionButton(fixture).nativeElement.click();
                tick(600);

                expect(component.isLoading).toBeTruthy();

                expect(() => {
                    saveSubject.error('An error occurred');
                    flush();
                }).toThrow();

                expect(component.isLoading).toBeFalsy();
            }));

            describe('when adding', () => {
                it('should add the product, display a success message, and back to previous page', fakeAsync(() => {
                    verifyAddProduct('save');
                    // verify redirect
                    expect(component['routerService'].back).toHaveBeenCalled();
                }));
            });
        });

        describe('apply button', () => {
            it('apply button should save once on multiple click ', fakeAsync(() => {
                initialize('edit', 'FOO', 'BAR', valid, false);
                // verify form is valid by checking the list of invalid form control names is empty
                expect(
                    Object.entries(component.form.controls)
                        .filter((c) => !c[1].disabled && !c[1].valid)
                        .map((c) => c[0])
                ).toHaveLength(0);
                jest.spyOn(component.saveFacade, 'apply').mockReturnValue(of({}));

                const applyButton = getApplyActionButton(fixture);
                expect(applyButton).toBeTruthy();

                applyButton.nativeElement.click();
                applyButton.nativeElement.click();
                applyButton.nativeElement.click();
                fixture.detectChanges();
                tick(600);

                expect(component.saveFacade.apply).toHaveBeenCalledTimes(1);
            }));

            it('apply button should save on click ', fakeAsync(() => {
                initialize('edit', 'FOO', 'BAR', valid, false);
                // verify form is valid by checking the list of invalid form control names is empty
                expect(
                    Object.entries(component.form.controls)
                        .filter((c) => !c[1].disabled && !c[1].valid)
                        .map((c) => c[0])
                ).toHaveLength(0);
                jest.spyOn(component.saveFacade, 'apply').mockReturnValue(of({}));

                expect(getApplyActionButton(fixture)).toBeTruthy();
                getApplyActionButton(fixture).nativeElement.click();

                tick(600);

                expect(component.saveFacade.apply).toHaveBeenCalled();
            }));

            it('should show loading overlay when processing', fakeAsync(() => {
                const applySubject = new Subject();
                storeProductFacade.update = jest.fn(() => applySubject);
                initialize('edit', 'FOO', 'BAR', valid);
                getApplyActionButton(fixture).nativeElement.click();
                tick(600);

                expect(component.isLoading).toBeTruthy();

                applySubject.next(null);

                expect(component.isLoading).toBeFalsy();
            }));

            it('should cancel loading overlay if an error occurs', fakeAsync(() => {
                const applySubject = new Subject();
                storeProductFacade.update = jest.fn(() => applySubject);
                initialize('edit', 'FOO', 'BAR', valid);
                getApplyActionButton(fixture).nativeElement.click();
                tick(600);

                expect(component.isLoading).toBeTruthy();

                expect(() => {
                    applySubject.error('An error occurred');
                    flush();
                }).toThrow();

                expect(component.isLoading).toBeFalsy();
            }));

            describe('when adding', () => {
                it('should add the product, display a success message, and redirect to the edit page of the newly added product', fakeAsync(() => {
                    verifyAddProduct('apply');
                    // verify redirect
                    expect(component['router'].navigate).toHaveBeenCalled();
                }));
            });
        });

        describe('add like button', () => {
            describe.each`
                accessMode    | hasAddRole | shouldDisplay
                ${'edit'}     | ${true}    | ${true}
                ${'edit'}     | ${false}   | ${false}
                ${'view'}     | ${true}    | ${true}
                ${'view'}     | ${false}   | ${false}
                ${'add-like'} | ${true}    | ${false}
                ${'add-like'} | ${false}   | ${false}
            `('with accessMode=$accessMode and hasAddRole=$hasAddRole', ({ accessMode, hasAddRole, shouldDisplay }) => {
                it(`should ${shouldDisplay ? '' : 'not'} display`, fakeAsync(() => {
                    jest.spyOn(component['roleFacade'], 'hasAnyRole').mockReturnValue(of(hasAddRole));
                    initialize(accessMode, 'FOO', 'BAR', {});
                    if (shouldDisplay) {
                        expect(getAddLikeActionButton(fixture)).not.toBeNull();
                    } else {
                        expect(getAddLikeActionButton(fixture)).toBeNull();
                    }
                }));
            });

            it('should navigate to the add page with the current store number and product code', fakeAsync(() => {
                const router = TestBed.inject(Router);
                jest.spyOn(component['roleFacade'], 'hasAnyRole').mockReturnValue(of(true));
                initialize('edit', 'FOO', 'BAR', {});
                getAddLikeActionButton(fixture).triggerEventHandler('click', {});
                expect(router.navigate).toHaveBeenCalledWith(['/maintenance/store-product/add-like', 'FOO', 'BAR']);
            }));
        });
    });

    it('should mark as unsaved changes if form is dirty', fakeAsync(() => {
        initialize('edit', 'FOO', 'BAR', {});
        expect(component.unsavedChanges).toBeFalsy();
        component.form.markAsDirty();

        expect(component.unsavedChanges).toBeTruthy();
    }));
});
