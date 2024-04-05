import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCheckboxHarness } from '@angular/material/checkbox/testing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatSortHeaderHarness } from '@angular/material/sort/testing';
import { MatTableModule } from '@angular/material/table';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { Discount, StoreDiscount } from '@vioc-angular/central-ui/discount/data-access-discount';
import { Store } from '@vioc-angular/central-ui/organization/data-access-store';
import { RouterService } from '@vioc-angular/central-ui/util-router';
import { AuthenticationFacade } from '@vioc-angular/security/data-access-security';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { FEATURE_CONFIGURATION_TOKEN, FeatureConfiguration } from '@vioc-angular/shared/common-feature-flag';
import { CommonFunctionalityModule, Described } from '@vioc-angular/shared/common-functionality';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { FeatureFeatureFlagModule } from '@vioc-angular/shared/feature-feature-flag';
import { UiButtonModule } from '@vioc-angular/shared/ui-button';
import { UiDialogMockModule } from '@vioc-angular/shared/ui-dialog';
import { MockFilteredInputComponent, UiFilteredInputMockModule } from '@vioc-angular/shared/ui-filtered-input';
import { UiLoadingMockModule } from '@vioc-angular/shared/ui-loading';
import { GATEWAY_TOKEN, ResponseEntity } from '@vioc-angular/shared/util-api';
import { FormFactory, UtilFormModule } from '@vioc-angular/shared/util-form';
import { EMPTY, of, ReplaySubject } from 'rxjs';
import { DiscountModuleForms } from '../discount-module-forms';
import { DiscountsComponent } from '../discounts/discounts.component';
import { DiscountsStoreAssignmentComponent } from './discounts-store-assignment.component';
import moment = require('moment');

describe('DiscountsStoreAssignmentComponent', () => {
    let component: DiscountsStoreAssignmentComponent;
    let fixture: ComponentFixture<DiscountsStoreAssignmentComponent>;
    let formBuilder: FormBuilder;
    let formFactory: FormFactory;
    let messageFacade: MessageFacade;
    let loader: HarnessLoader;
    let componentDestroyed: ReplaySubject<any>;

    const company1: Described = {
        id: 40,
        code: 'company_1',
        description: 'Company 1',
    };

    const company2: Described = {
        id: 41,
        code: 'company_2',
        description: 'Company 2',
    };

    const region1: Described = {
        id: 50,
        code: 'region_1',
        description: 'Region 1',
    };

    const region2: Described = {
        id: 51,
        code: 'region_2',
        description: 'Region 2',
    };

    const market1: Described = {
        id: 60,
        code: 'market_1',
        description: 'Market 1',
    };

    const market2: Described = {
        id: 61,
        code: 'market_2',
        description: 'Market 2',
    };

    const store1 = {
        id: 9870,
        active: true,
        storeCloseDate: null,
        address: {
            state: {
                code: 'KY',
                description: 'Kentucky',
                id: 10,
            },
        },
        company: company1,
        code: '111111',
        assigned: true,
        description: 'Store 111111',
        region: region1,
        market: market1,
    };

    const store2 = {
        id: 6543,
        active: true,
        storeCloseDate: null,
        address: {
            state: {
                code: 'KY',
                description: 'Kentucky',
                id: 10,
            },
        },
        company: company2,
        code: '222222',
        assigned: false,
        description: 'Store 222222',
        region: region2,
        market: market2,
    };

    // startDate requires day to be after or equal to current day
    const today = moment().startOf('day');
    const formatDate = (date: moment.Moment) => date.format('MM-DD-YYYY');

    const nationalDiscount: Discount = {
        id: '3',
        company: null,
        startDate: formatDate(today),
        expirationDate: formatDate(today.add(1, 'day')),
        endDate: formatDate(today.add(1, 'day')),
        code: 'testNationalDiscountCode',
        description: 'National Discount',
        type: {
            id: '5',
            code: 'INVOICE',
            description: 'Invoice Type',
            version: 0,
        },
        active: true,
        national: true,
        overrideMinAmount: 4.44,
        overrideMaxAmount: 5.55,
        percentMaxAmount: 6.66,
        storeDiscounts: [],
        version: 0,
        updatedBy: 'v123456',
        updatedOn: '03-12-2024',
        amount: null,
        approach: null,
        maxUses: null,
        discountCategories: [],
        owner: null,
        channel: null,
        uniqueCodeRequired: false,
        discountClassification: null,
        explanationRequired: false,
        overridable: true,
        device: null,
        program: null,
        fleetOnly: false,
        audience: null,
        serviceOffer: null,
        securityRestriction: null,
        extraChargesSupported: false,
    };

    const localDiscount: Discount = {
        id: '4',
        company: company1,
        startDate: formatDate(today),
        expirationDate: formatDate(today.add(1, 'day')),
        endDate: formatDate(today.add(1, 'day')),
        code: 'testLocalDiscountCode',
        description: 'Local Discount',
        type: {
            id: '5',
            code: 'INVOICE',
            description: 'Invoice Type',
            version: 0,
        },
        active: true,
        national: false,
        overrideMinAmount: 1.11,
        overrideMaxAmount: 2.22,
        percentMaxAmount: 3.33,
        storeDiscounts: [],
        version: 0,
        updatedBy: 'v123456',
        updatedOn: '03-22-2024',
        amount: null,
        approach: null,
        discountCategories: [],
        maxUses: null,
        owner: null,
        channel: null,
        uniqueCodeRequired: false,
        discountClassification: null,
        explanationRequired: false,
        overridable: true,
        device: null,
        program: null,
        fleetOnly: false,
        audience: null,
        serviceOffer: null,
        securityRestriction: null,
        extraChargesSupported: false,
    };

    const nationalStoreDiscount_assigned: StoreDiscount = {
        id: {
            storeId: store1.id,
            discountId: nationalDiscount.id,
        },
        store: store1,
        active: true,
    };

    const nationalStoreDiscount_unassigned: StoreDiscount = {
        id: {
            storeId: store2.id,
            discountId: nationalDiscount.id,
        },
        store: store2,
        active: false,
    };

    const expectedDisplayedColumns = ['select', 'storeCode', 'storeDescription', 'storeState', 'assigned'];

    const storeSearchResponse: ResponseEntity<Store> = {
        content: [store1, store2],
        totalElements: 2,
    };

    const storeSearchResponse_localDiscount: ResponseEntity<Store> = {
        content: [store1],
        totalElements: 1,
    };

    const nationalDiscountWithStoreDiscounts = {
        ...nationalDiscount,
        storeDiscounts: [nationalStoreDiscount_assigned, nationalStoreDiscount_unassigned],
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DiscountsComponent, DiscountsStoreAssignmentComponent],
            imports: [
                NoopAnimationsModule,
                HttpClientTestingModule,
                ReactiveFormsModule,
                MatCheckboxModule,
                MatFormFieldModule,
                MatInputModule,
                MatSelectModule,
                MatTableModule,
                MatSortModule,
                UtilFormModule,
                UiLoadingMockModule,
                UiButtonModule,
                UiDialogMockModule,
                UiFilteredInputMockModule,
                CommonFunctionalityModule,
                FeatureFeatureFlagModule,
            ],
            providers: [
                FormFactory,
                { provide: GATEWAY_TOKEN, useValue: '//gateway/' },
                { provide: HttpClient, useValue: {} },
                { provide: Router, useValue: { navigate: jest.fn() } },
                { provide: MessageFacade, useValue: { addMessage: jest.fn() } },
                {
                    provide: AuthenticationFacade,
                    useValue: { getUser: () => EMPTY } as any as AuthenticationFacade,
                },
                { provide: RouterService, useValue: { navigateToSearchPage: jest.fn() } },
                {
                    provide: FEATURE_CONFIGURATION_TOKEN,
                    useValue: of({
                        default: true,
                        features: {
                            discounts: {
                                search: {
                                    clickRow: true,
                                },
                            },
                        },
                    } as FeatureConfiguration),
                },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DiscountsStoreAssignmentComponent);
        component = fixture.componentInstance;
        formFactory = TestBed.inject(FormFactory);
        formBuilder = TestBed.inject(FormBuilder);
        messageFacade = TestBed.inject(MessageFacade);
        loader = TestbedHarnessEnvironment.loader(fixture);
        DiscountModuleForms.registerForms(formFactory, formBuilder);
        componentDestroyed = new ReplaySubject(1);

        component.storeFacade.search = jest.fn();

        // Set up spies
        jest.spyOn(component, 'getStoresByCompanyAndRegionAndMarket');
        jest.spyOn(component.roleFacade, 'getMyRoles').mockReturnValue(of(['DISCOUNT_ROLE']));
        jest.spyOn(component.resourceFacade, 'findCompaniesByRoles').mockReturnValue(
            of({ resources: [company1, company2], allCompanies: false })
        );
        jest.spyOn(component.resourceFacade, 'findRegionsByRoles').mockReturnValue(
            of({ resources: [region1, region2], allCompanies: false })
        );
        jest.spyOn(component.resourceFacade, 'findMarketsByRoles').mockReturnValue(
            of({ resources: [market1, market2], allCompanies: false })
        );
        jest.spyOn(component.resourceFacade, 'findRegionsByRolesAndCompany').mockReturnValue(
            of({ resources: [region1], allCompanies: false })
        );
        jest.spyOn(component.resourceFacade, 'findMarketsByRolesAndCompany').mockReturnValue(
            of({ resources: [market1], allCompanies: false })
        );
        jest.spyOn(component.resourceFacade, 'findMarketsByRolesAndCompanyAndRegion').mockReturnValue(
            of({ resources: [market1], allCompanies: false })
        );
        jest.spyOn(component.storeFacade, 'search').mockReturnValue(of(storeSearchResponse));
        jest.spyOn(component, 'initializeForm');
        jest.spyOn(component, 'initializeTable');
        jest.spyOn(component, 'initializeFilters');
        jest.spyOn(component, 'applySortToTable');
        jest.spyOn(component, 'configureCompanyControl');
        jest.spyOn(component, 'configureRegionControl');
        jest.spyOn(component, 'configureMarketControl');
    });

    afterEach(() => componentDestroyed.next());

    /** Initialize the component with the given access mode and id. */
    const initialize = (accessMode: 'view' | 'edit' | 'add', discount = nationalDiscount, andflush = true) => {
        const mode = AccessMode.of(accessMode);
        component.accessMode = mode;
        component.model = discount;
        component.form = formFactory.group('Discount', discount, componentDestroyed, {
            accessMode: mode,
        });
        component.initiateCompanySearch = null;
        component.initiateMarketSearch = null;
        component.initiateRegionSearch = null;
        fixture.detectChanges();
        if (andflush) {
            flush();
        }
    };

    const getCheckbox = (selector: string) => {
        return loader.getHarness(
            MatCheckboxHarness.with({
                selector,
            })
        );
    };
    const clickCheckbox = async (selector: string) => {
        const checkbox = await getCheckbox(selector);
        await checkbox.toggle();
    };
    const isChecked = (selector: string) => {
        return getCheckbox(selector).then((checkbox) => checkbox.isChecked());
    };

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe.each`
        accessMode
        ${'edit'}
        ${'add'}
    `('with $accessMode accessMode', ({ accessMode }) => {
        describe('ngOnInit', () => {
            it('should initialize the form for National Discounts', fakeAsync(async () => {
                initialize(accessMode);
                // Confirm roles, company, region, and market initialized
                expect(component.roleFacade.getMyRoles).toHaveBeenCalled();
                expect(component.resourceFacade.findCompaniesByRoles).toHaveBeenCalled();
                expect(component.resourceFacade.findRegionsByRoles).toHaveBeenCalled();
                expect(component.resourceFacade.findMarketsByRoles).toHaveBeenCalled();
                expect(component.getStoresByCompanyAndRegionAndMarket).toHaveBeenCalled();
                // Confirm initialized form
                expect(component.initializeForm).toHaveBeenCalledWith(storeSearchResponse.content);
                // Confirm filter options have been populated
                expect(await component.companies$.toPromise()).toEqual([company1, company2]);
                expect(await component.regions$.toPromise()).toEqual([region1, region2]);
                expect(await component.allRegions$.toPromise()).toEqual([region1, region2]);
                expect(await component.markets$.toPromise()).toEqual([market1, market2]);
                expect(await component.allMarkets$.toPromise()).toEqual([market1, market2]);
            }));

            it('should initialize the form for Local Discounts', fakeAsync(async () => {
                jest.spyOn(component.storeFacade, 'search').mockReturnValue(of(storeSearchResponse_localDiscount));
                initialize(accessMode, localDiscount);
                // Confirm roles, company, region, and market initialized
                expect(component.roleFacade.getMyRoles).toHaveBeenCalled();
                expect(component.resourceFacade.findCompaniesByRoles).toHaveBeenCalled();
                expect(component.resourceFacade.findRegionsByRolesAndCompany).toHaveBeenCalled();
                expect(component.resourceFacade.findMarketsByRolesAndCompany).toHaveBeenCalled();
                expect(component.getStoresByCompanyAndRegionAndMarket).toHaveBeenCalled();
                // Confirm initialized form
                expect(component.initializeForm).toHaveBeenCalledWith(storeSearchResponse_localDiscount.content);
                // Confirm filter options have been populated
                expect(await component.companies$.toPromise()).toEqual([company1, company2]);
                expect(await component.regions$.toPromise()).toEqual([region1]);
                expect(await component.allRegions$.toPromise()).toEqual([region1]);
                expect(await component.markets$.toPromise()).toEqual([market1]);
                expect(await component.allMarkets$.toPromise()).toEqual([market1]);
            }));

            it('should initialize the table', fakeAsync(async () => {
                initialize(accessMode);
                expect(component.initializeTable).toHaveBeenCalledWith([store1, store2]);
                expect(component.applySortToTable).toHaveBeenCalled();
                expect(component.storeList).toEqual([store1, store2]);
                expect(component.displayedColumns).toEqual(expectedDisplayedColumns);
            }));

            it('should initialize the filters', fakeAsync(async () => {
                initialize(accessMode);
                expect(component.initializeFilters).toHaveBeenCalled();
                expect(component.configureRegionControl).toHaveBeenCalled();
                expect(component.configureMarketControl).toHaveBeenCalled();
            }));
        });
    });

    describe.each`
        accessMode
        ${'edit'}
        ${'add'}
    `('with $accessMode accessMode', ({ accessMode }) => {
        describe('company filter', () => {
            const getCompanyInput = (): MockFilteredInputComponent => {
                return fixture.debugElement.query(By.css('#company-filter')).componentInstance;
            };

            it('should pass a list of companies', fakeAsync(async () => {
                initialize(accessMode);
                expect(getCompanyInput().options).toEqual(await component.companies$.toPromise());
            }));

            it('should prevent the user from selecting a company when the table is loading', fakeAsync(() => {
                initialize(accessMode);
                const companyInput = getCompanyInput();
                // should be editable when not loading stores
                expect(companyInput.editable).toEqual(true);
                component.isLoadingStores = true;
                fixture.detectChanges();
                // should NOT be editable when loading stores
                expect(companyInput.editable).toEqual(false);
            }));

            it('should maintain company filter on page reload', fakeAsync(() => {
                initialize(accessMode, nationalDiscountWithStoreDiscounts);
                // Simulates page reload
                component.getStoresByCompanyAndRegionAndMarket(company1, null, null);
                flush();
                tick(600); // company, region and market filters have debounce time
                expect(component.companyControl.value).toEqual(company1);
                expect(component.stores.data[0].value).toEqual(store1);
                expect(component.stores.data[1]).toBeFalsy();
            }));

            it('should update company filter', fakeAsync(() => {
                initialize(accessMode, nationalDiscountWithStoreDiscounts);
                // Simulates page reload
                component.companyControl.patchValue(company1);
                flush();
                tick(300); // company, region and market filters have debounce time
                expect(component.companyControl.value).toEqual(company1);
                expect(component.stores.data[0].value).toEqual(store1);
                expect(component.stores.data[1]).toBeFalsy();
                // Change filter value
                component.companyControl.patchValue(company2);
                flush();
                tick(300); // company, region and market filters have debounce time
                expect(component.companyControl.value).toEqual(company2);
                expect(component.stores.data[0].value).toEqual(store2);
                expect(component.stores.data[1]).toBeFalsy();
            }));

            describe('region filter', () => {
                const getRegionInput = (): MockFilteredInputComponent => {
                    return fixture.debugElement.query(By.css('#region-filter')).componentInstance;
                };

                it('should pass a list of regions', fakeAsync(async () => {
                    initialize(accessMode);
                    expect(getRegionInput().options).toEqual(await component.regions$.toPromise());
                }));

                it('should prevent the user from selecting a region when company is not selected', fakeAsync(() => {
                    initialize(accessMode);
                    const regionInput = getRegionInput();
                    expect(regionInput.editable).toEqual(false);
                }));

                it('should prevent the user from selecting a region when the table is loading', fakeAsync(() => {
                    initialize(accessMode);
                    component.companyControl.patchValue(company1);
                    flush();
                    tick(600); // company, region and market filters have debounce time
                    const regionInput = getRegionInput();
                    // should be editable when not loading stores
                    expect(regionInput.editable).toEqual(true);
                    component.isLoadingStores = true;
                    fixture.detectChanges();
                    // should NOT be editable when loading stores
                    expect(regionInput.editable).toEqual(false);
                }));

                it('should maintain company and region filter on page reload', fakeAsync(() => {
                    initialize(accessMode, nationalDiscountWithStoreDiscounts);
                    // Simulates page reload
                    component.companyControl.patchValue(company1);
                    component.getStoresByCompanyAndRegionAndMarket(company1, region1, null);
                    flush();
                    tick(600); // company, region and market filters have debounce time
                    expect(component.companyControl.value).toEqual(company1);
                    expect(component.regionControl.value).toEqual(region1);
                    expect(component.stores.data[0].value).toEqual(store1);
                    expect(component.stores.data[1]).toBeFalsy();
                }));

                it('should update region filter', fakeAsync(() => {
                    initialize(accessMode, nationalDiscountWithStoreDiscounts);
                    // Simulates page reload
                    component.companyControl.patchValue(company1);
                    component.regionControl.patchValue(region1);
                    flush();
                    tick(300); // company, region and market filters have debounce time
                    expect(component.companyControl.value).toEqual(company1);
                    expect(component.regionControl.value).toEqual(region1);
                    expect(component.stores.data[0].value).toEqual(store1);
                    expect(component.stores.data[1]).toBeFalsy();
                    // Change filter value
                    component.companyControl.patchValue(company2);
                    component.regionControl.patchValue(region2);
                    flush();
                    tick(600); // company, region and market filters have debounce time
                    expect(component.companyControl.value).toEqual(company2);
                    expect(component.regionControl.value).toEqual(region2);
                    expect(component.stores.data[0].value).toEqual(store2);
                    expect(component.stores.data[1]).toBeFalsy();
                }));

                describe('market filter', () => {
                    const getMarketInput = (): MockFilteredInputComponent => {
                        return fixture.debugElement.query(By.css('#market-filter')).componentInstance;
                    };

                    it('should pass a list of markets', fakeAsync(async () => {
                        initialize(accessMode);
                        expect(getMarketInput().options).toEqual(await component.markets$.toPromise());
                    }));

                    it('should prevent the user from selecting a market when the table is loading', fakeAsync(() => {
                        initialize(accessMode);
                        const marketInput = getMarketInput();
                        component.companyControl.patchValue(company1);
                        component.regionControl.patchValue(region1);
                        flush();
                        tick(600); // company, region and market filters have debounce time
                        // should be editable when not loading stores
                        expect(marketInput.editable).toEqual(true);
                        component.isLoadingStores = true;
                        fixture.detectChanges();
                        // should NOT be editable when loading stores
                        expect(marketInput.editable).toEqual(false);
                    }));

                    it('should prevent the user from selecting a market when company and region have not been selected', fakeAsync(() => {
                        initialize(accessMode);
                        const marketInput = getMarketInput();
                        // should be editable when not region has not been set
                        expect(marketInput.editable).toEqual(false);
                    }));

                    it('should prevent the user from selecting a market when region have not been selected', fakeAsync(() => {
                        initialize(accessMode);
                        component.companyControl.patchValue(company1);
                        const marketInput = getMarketInput();
                        flush();
                        tick(600); // company, region and market filters have debounce time
                        // should be editable when not region has not been set
                        expect(marketInput.editable).toEqual(false);
                    }));

                    it('should maintain company, region and market filter on page reload', fakeAsync(async () => {
                        initialize(accessMode, nationalDiscountWithStoreDiscounts);
                        // Simulates page reload -- we know initiateCompanySearch, initiateRegionSearch, initiateMarketSearch will be equal to what is passed in getStoresByCompanyAndRegionAndMarket after apply
                        component.initiateCompanySearch = company1;
                        component.initiateRegionSearch = region1;
                        component.initiateMarketSearch = market1;
                        component.getStoresByCompanyAndRegionAndMarket(company1, region1, market1);
                        flush();
                        tick(300); // company, region and market filters have debounce time
                        expect(component.companyControl.value).toEqual(company1);
                        expect(component.regionControl.value).toEqual(region1);
                        expect(component.marketControl.value).toEqual(market1);
                        expect(component.stores.data[0].value).toEqual(store1);
                        expect(component.stores.data[1]).toBeFalsy();
                    }));

                    it('should update market filter', fakeAsync(() => {
                        initialize(accessMode, nationalDiscountWithStoreDiscounts);
                        // Simulates page reload -- we know initiateCompanySearch, initiateRegionSearch, initiateMarketSearch will be equal to what is passed in getStoresByCompanyAndRegionAndMarket after apply
                        component.initiateCompanySearch = company1;
                        component.initiateRegionSearch = region1;
                        component.initiateMarketSearch = market1;
                        component.companyControl.patchValue(company1);
                        component.regionControl.patchValue(region1);
                        component.marketControl.patchValue(market1);
                        flush();
                        tick(300); // company, region and market filters have debounce time
                        expect(component.marketControl.value).toEqual(market1);
                        expect(component.stores.data[0].value).toEqual(store1);
                        expect(component.stores.data[1]).toBeFalsy();
                        // Change filter value
                        component.marketControl.patchValue(market2);
                        flush();
                        tick(300); // region and market filters have debounce time
                        expect(component.marketControl.value).toEqual(market2);
                        expect(component.stores.data[0]).toBeFalsy(); // No stores have region1 and market2
                    }));

                    it('should show an error if market is selected but region is not', fakeAsync(() => {
                        initialize(accessMode);
                        component.companyControl.patchValue(company1);
                        flush();
                        tick(300); // company, region and market filters have debounce time
                        component.marketControl.patchValue(market1);
                        flush();
                        tick(300); // company, region and market filters have debounce time
                        expect(messageFacade.addMessage).toHaveBeenCalledWith({
                            message: `Region must be selected to filter by Market`,
                            severity: 'error',
                        });
                    }));

                    it('should show an error if market is selected but company is not', fakeAsync(() => {
                        initialize(accessMode);
                        component.marketControl.patchValue(market1);
                        flush();
                        tick(300); // region and market filters have debounce time
                        expect(messageFacade.addMessage).toHaveBeenCalledWith({
                            message: `Company and Region must be selected to filter by Market`,
                            severity: 'error',
                        });
                    }));
                });
            });
        });
    });

    describe('store table', () => {
        describe.each`
            accessMode
            ${'edit'}
            ${'view'}
            ${'add'}
        `('with $accessMode accessMode', ({ accessMode }) => {
            it(`should ${
                accessMode === 'edit' ? '' : 'disable '
            }checkboxes with ${accessMode} accessMode`, fakeAsync(() => {
                initialize(accessMode);
                component.stores.data.forEach(async (store) => {
                    const index = component.stores.data.indexOf(store);
                    if (accessMode.isEdit) {
                        const selectAllCheckbox = await getCheckbox(`#select-all-checkbox`);
                        const rowCheckbox = await getCheckbox(`#checkbox-${index}`);
                        expect(await selectAllCheckbox.isDisabled()).toEqual(false);
                        expect(await rowCheckbox.isDisabled()).toEqual(false);
                    }
                    if (accessMode.isView) {
                        expect(getCheckbox(`#checkbox-${index}`)).toBeFalsy();
                        expect(getCheckbox(`#select-all-checkbox`)).toBeFalsy();
                    }
                });
            }));
        });

        describe('row selection', () => {
            describe.each`
                accessMode
                ${'edit'}
                ${'add'}
            `('with $accessMode accessMode', ({ accessMode }) => {
                it(`should allow the user to select all records`, fakeAsync(() => {
                    initialize(accessMode);
                    component.stores.data.forEach(async (store) => {
                        const index = component.stores.data.indexOf(store);
                        if (accessMode.isEdit) {
                            const selectAllCheckbox = await getCheckbox(`#select-all-checkbox`);
                            const rowCheckbox = await getCheckbox(`#checkbox-${index}`);
                            expect(await selectAllCheckbox.isDisabled()).toEqual(false);
                            expect(await rowCheckbox.isDisabled()).toEqual(false);
                        }
                        if (accessMode.isView) {
                            expect(getCheckbox(`#checkbox-${index}`)).toBeFalsy();
                            expect(getCheckbox(`#select-all-checkbox`)).toBeFalsy();
                        }
                    });
                }));
            });

            describe.each`
                accessMode
                ${'edit'}
                ${'add'}
            `('with $accessMode accessMode', ({ accessMode }) => {
                it(`should allow the user to select individual rows`, fakeAsync(() => {
                    initialize(accessMode);
                    component.stores.data.forEach(async (store) => {
                        const index = component.stores.data.indexOf(store);
                        if (accessMode.isEdit) {
                            const selectAllCheckbox = await getCheckbox(`#select-all-checkbox`);
                            const rowCheckbox = await getCheckbox(`#checkbox-${index}`);
                            expect(await selectAllCheckbox.isDisabled()).toEqual(false);
                            expect(await rowCheckbox.isDisabled()).toEqual(false);
                        }
                        if (accessMode.isView) {
                            expect(getCheckbox(`#checkbox-${index}`)).toBeFalsy();
                            expect(getCheckbox(`#select-all-checkbox`)).toBeFalsy();
                        }
                    });
                }));
            });
        });

        describe('sorting', () => {
            it.each`
                column                  | accessMode
                ${'code-header'}        | ${'edit'}
                ${'description-header'} | ${'edit'}
                ${'state-header'}       | ${'edit'}
                ${'assigned-header'}    | ${'edit'}
                ${'code-header'}        | ${'add'}
                ${'description-header'} | ${'add'}
                ${'state-header'}       | ${'add'}
                ${'assigned-header'}    | ${'add'}
            `(
                'should be sortable by the $column column with $accessMode accessMode',
                fakeAsync(async ({ column, accessMode }) => {
                    initialize(accessMode);
                    jest.spyOn(component.stores, 'sortingDataAccessor');
                    expect(component.stores.sort).toBeTruthy();

                    const headerButton = loader.getHarness(
                        MatSortHeaderHarness.with({
                            selector: `#${column}`,
                        })
                    );
                    await (await headerButton).click();
                    expect(await (await headerButton).isActive()).toEqual(true);
                    expect(component.stores.sortingDataAccessor).toHaveBeenCalled();
                })
            );
        });

        describe('assigning stores', () => {
            const getAssignButton = async () =>
                loader.getHarness(MatButtonHarness.with({ selector: '#assign-stores-button' }));

            const assignStores = async (row: { rowNumber: number }[] = [{ rowNumber: 0 }]) => {
                row.forEach(async (r) => {
                    jest.spyOn(component, 'updateStoreAssignment');
                    jest.spyOn(component.discountFacade, 'save').mockReturnValueOnce(
                        of({
                            ...nationalDiscount,
                            storeDiscounts: [
                                nationalStoreDiscount_assigned,
                                { ...nationalStoreDiscount_unassigned, active: true },
                            ],
                        })
                    );
                    await clickCheckbox(`#checkbox-${r.rowNumber}`);
                    await (await getAssignButton()).click();
                });
                flush();
            };

            beforeEach(fakeAsync(() => {
                jest.spyOn(component, 'updateStoreAssignment');
                initialize('edit', nationalDiscountWithStoreDiscounts);
            }));

            describe.each`
                rowNumber
                ${1}
            `('assigning a row', ({ rowNumber }) => {
                it(`should trigger the selected row to be assigned`, fakeAsync(async () => {
                    await assignStores([{ rowNumber }]);
                    // To assign a store discount active is set to true
                    const updateModel = {
                        ...nationalDiscount,
                        storeDiscounts: [
                            nationalStoreDiscount_assigned,
                            { ...nationalStoreDiscount_unassigned, active: true },
                        ],
                    };
                    expect(component.updateStoreAssignment).toHaveBeenCalled();
                    expect(component.discountFacade.save).toHaveBeenCalledWith(updateModel);
                }));
            });

            it('should clear the selected values', fakeAsync(async () => {
                jest.spyOn(component.selection, 'clear');
                const store = component.stores.data[0];
                component.selection.select(store);
                await clickCheckbox('#checkbox-1');
                await assignStores();
                expect(component.selection.clear).toHaveBeenCalled();
            }));

            it('should be disabled if a value is being saved for assigning stores', fakeAsync(async () => {
                jest.spyOn(component, 'updateStoreAssignment');
                const store = component.stores.data[0];
                component.selection.select(store);
                await clickCheckbox('#checkbox-1');
                // button should be displayed
                expect(await (await getAssignButton()).isDisabled()).toEqual(false);
                await assignStores();
                // button should be hidden again once
                expect(fixture.debugElement.query(By.css('#assign-stores-button'))).toBeFalsy();
            }));
        });
    });

    describe('unassigning stores', () => {
        const getUnassignButton = async () =>
            loader.getHarness(MatButtonHarness.with({ selector: '#unassign-stores-button' }));

        const unassignStores = async (row: { rowNumber: number }[] = [{ rowNumber: 0 }]) => {
            row.forEach(async (r) => {
                jest.spyOn(component, 'updateStoreAssignment');
                jest.spyOn(component.discountFacade, 'save').mockReturnValueOnce(
                    of({
                        ...nationalDiscount,
                        storeDiscounts: [
                            { ...nationalStoreDiscount_assigned, active: false },
                            nationalStoreDiscount_unassigned,
                        ],
                    })
                );
                await clickCheckbox(`#checkbox-${r.rowNumber}`);
                await (await getUnassignButton()).click();
            });
            flush();
        };

        beforeEach(fakeAsync(() => {
            jest.spyOn(component, 'updateStoreAssignment');
            initialize('edit', nationalDiscountWithStoreDiscounts);
        }));

        describe.each`
            rowNumber
            ${0}
        `('unassigning a row', ({ rowNumber }) => {
            it(`should trigger the selected row to be unassigned`, fakeAsync(async () => {
                await unassignStores([{ rowNumber }]);
                // To unassign a store discount, active is set to false
                const updateModel = {
                    ...nationalDiscount,
                    storeDiscounts: [
                        { ...nationalStoreDiscount_assigned, active: false },
                        nationalStoreDiscount_unassigned,
                    ],
                };
                expect(component.updateStoreAssignment).toHaveBeenCalled();
                expect(component.discountFacade.save).toHaveBeenCalledWith(updateModel);
            }));
        });

        it('should clear the selected values', fakeAsync(async () => {
            jest.spyOn(component.selection, 'clear');
            const store = component.stores.data[0];
            component.selection.select(store);
            await clickCheckbox('#checkbox-1');
            await unassignStores();
            expect(component.selection.clear).toHaveBeenCalled();
        }));

        it('should be disabled if a value is being saved for unassigning stores', fakeAsync(async () => {
            jest.spyOn(component, 'updateStoreAssignment');
            const store = component.stores.data[0];
            component.selection.select(store);
            await clickCheckbox('#checkbox-1');
            // button should be displayed
            expect(await (await getUnassignButton()).isDisabled()).toEqual(false);
            await unassignStores();
            // button should be hidden again once
            expect(fixture.debugElement.query(By.css('#assign-stores-button'))).toBeFalsy();
        }));
    });
});
