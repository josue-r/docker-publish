import { HttpClient } from '@angular/common/http';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatSortHeaderHarness } from '@angular/material/sort/testing';
import { MatTableModule } from '@angular/material/table';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { StoreDiscount, Offer } from '@vioc-angular/central-ui/discount/data-access-offers';
import { Store } from '@vioc-angular/central-ui/organization/data-access-store';
import { RouterService } from '@vioc-angular/central-ui/util-router';
import { AuthenticationFacade } from '@vioc-angular/security/data-access-security';
import { CommonFunctionalityModule, Described } from '@vioc-angular/shared/common-functionality';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { UiButtonModule } from '@vioc-angular/shared/ui-button';
import { UiDialogMockModule } from '@vioc-angular/shared/ui-dialog';
import { MockFilteredInputComponent, UiFilteredInputMockModule } from '@vioc-angular/shared/ui-filtered-input';
import { UiLoadingMockModule } from '@vioc-angular/shared/ui-loading';
import { GATEWAY_TOKEN, ResponseEntity } from '@vioc-angular/shared/util-api';
import { FormFactory, UtilFormModule } from '@vioc-angular/shared/util-form';
import { ReplaySubject, of, EMPTY } from 'rxjs';
import { OfferModuleForms } from '../offer-module-forms';
import { OffersComponent } from '../offers/offers.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FeatureFeatureFlagModule } from '@vioc-angular/shared/feature-feature-flag';
import { OfferStoresComponent } from './offer-stores.component';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatCheckboxHarness } from '@angular/material/checkbox/testing';
import { FeatureConfiguration, FEATURE_CONFIGURATION_TOKEN } from '@vioc-angular/shared/common-feature-flag';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { By } from '@angular/platform-browser';
import { MatButtonHarness } from '@angular/material/button/testing';
import { Discount } from '@vioc-angular/central-ui/discount/data-access-discount';

describe('OfferStoresComponent', () => {
    let component: OfferStoresComponent;
    let fixture: ComponentFixture<OfferStoresComponent>;
    let formBuilder: FormBuilder;
    let formFactory: FormFactory;
    let messageFacade: MessageFacade;
    let loader: HarnessLoader;
    let componentDestroyed: ReplaySubject<any>;

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

    const testStore1 = {
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
        code: '111111',
        assigned: true,
        description: 'Store 111111',
        region: region1,
        market: market1,
    };

    const testStore2 = {
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
        code: '222222',
        assigned: false,
        description: 'Store 222222',
        region: region2,
        market: market2,
    };

    const testDiscount: Discount = {
        id: '3',
        company: {
            id: '4',
            code: 'testCompanyCode',
            description: 'Company',
            version: 0,
        },
        startDate: '10-12-2022',
        endDate: '10-12-2023',
        code: 'testDiscountCode',
        description: 'Discount',
        type: {
            id: '5',
            code: 'testDiscountOfferType',
            description: 'Discount Offer Content Type',
            version: 0,
        },
        active: true,
        national: false,
        version: 0,
    };

    const testStoreDiscount1: StoreDiscount = {
        id: {
            storeId: testStore1.id,
            discountId: testDiscount.id,
        },
        store: testStore1,
        assigned: true,
    };

    const testStoreDiscount2: StoreDiscount = {
        id: {
            storeId: testStore2.id,
            discountId: testDiscount.id,
        },
        store: testStore2,
        assigned: false,
    };

    // Formatted the same as mapToStoreDiscount function
    const storeDiscount2_toBeUpdated: StoreDiscount = {
        id: null,
        assigned: null,
        store: {
            id: testStoreDiscount2.store.id,
        },
    };

    const testOffer: Offer = {
        id: '1',
        discountOffer: {
            id: '2',
            name: 'Offer Name',
        },
        company: {
            id: '11',
            code: 'VAL',
            description: 'Test Company VAL',
            version: 0,
        },
        discount: testDiscount,
        store: null,
        active: true,
        version: 0,
        daysToExpire: 1,
        expirationDate: null,
        name: 'Discount Offer',
        amount: 5,
        amountFormat: {
            id: '6',
            code: 'dollar_off',
            description: 'Dollar Off',
            version: 0,
        },
        storeDiscounts: [testStoreDiscount1],
        offerContent: {
            id: 7,
            name: 'Offer Content Name',
        },
        updatedBy: 'v123456',
        updatedOn: '10-12-2022',
    };

    const expectedDisplayedColumns = ['select', 'storeCode', 'storeDescription', 'storeState', 'assigned'];

    const storeSearchResponse: ResponseEntity<Store> = {
        content: [testStore1, testStore2],
        totalElements: 2,
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [OffersComponent, OfferStoresComponent],
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
                            offers: {
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
        fixture = TestBed.createComponent(OfferStoresComponent);
        component = fixture.componentInstance;
        formFactory = TestBed.inject(FormFactory);
        formBuilder = TestBed.inject(FormBuilder);
        messageFacade = TestBed.inject(MessageFacade);
        loader = TestbedHarnessEnvironment.loader(fixture);
        OfferModuleForms.registerForms(formFactory, formBuilder);
        componentDestroyed = new ReplaySubject(1);

        component.storeFacade.search = jest.fn();

        // Set up spys
        jest.spyOn(component, 'getStoresByRegionAndMarket');
        jest.spyOn(component.roleFacade, 'getMyRoles').mockReturnValue(of(['OFFER_ROLE']));
        jest.spyOn(component.resourceFacade, 'findRegionsByRolesAndCompany').mockReturnValue(
            of({ resources: [region1, region2], allCompanies: false })
        );
        jest.spyOn(component.resourceFacade, 'findMarketsByRolesAndCompany').mockReturnValue(
            of({ resources: [market1, market2], allCompanies: false })
        );
        jest.spyOn(component.resourceFacade, 'findMarketsByRolesAndCompanyAndRegion').mockReturnValue(
            of({ resources: [market1], allCompanies: false })
        );
        jest.spyOn(component.storeFacade, 'search').mockReturnValue(of(storeSearchResponse));
        jest.spyOn(component, 'initializeForm');
        jest.spyOn(component, 'initializeTable');
        jest.spyOn(component, 'initializeFilters');
        jest.spyOn(component, 'applySortToTable');
        jest.spyOn(component, 'configureRegionControl');
        jest.spyOn(component, 'configureMarketControl');
    });

    afterEach(() => componentDestroyed.next());

    /** Initialize the the component with the given access mode and id. */
    const initialize = (accessMode: 'view' | 'edit', offer = testOffer, andflush = true) => {
        const mode = AccessMode.of(accessMode);
        component.accessMode = mode;
        component.model = offer;
        component.form = formFactory.group('Offer', offer, componentDestroyed, {
            accessMode: mode,
        });
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

    describe('ngOnInit', () => {
        it('should initialize the form', fakeAsync(async () => {
            initialize('edit');
            // Confirm roles, region, and market initialized
            expect(component.roleFacade.getMyRoles).toHaveBeenCalled();
            expect(component.resourceFacade.findRegionsByRolesAndCompany).toHaveBeenCalled();
            expect(component.resourceFacade.findMarketsByRolesAndCompany).toHaveBeenCalled();
            expect(component.getStoresByRegionAndMarket).toHaveBeenCalled();
            // Confirm initialized form
            expect(component.initializeForm).toHaveBeenCalledWith(storeSearchResponse.content);
            // Confirm filter options have been populated
            expect(await component.regions$.toPromise()).toEqual([region1, region2]);
            expect(await component.markets$.toPromise()).toEqual([market1, market2]);
            expect(await component.allMarkets$.toPromise()).toEqual([market1, market2]);
        }));

        it('should initialize the table', fakeAsync(async () => {
            initialize('edit');
            expect(component.initializeTable).toHaveBeenCalledWith([testStore1, testStore2]);
            expect(component.applySortToTable).toHaveBeenCalled();
            expect(component.storeList).toEqual([testStore1, testStore2]);
            expect(component.displayedColumns).toEqual(expectedDisplayedColumns);
        }));

        it('should initialize the filters', fakeAsync(async () => {
            initialize('edit');
            expect(component.initializeFilters).toHaveBeenCalled();
            expect(component.configureRegionControl).toHaveBeenCalled();
            expect(component.configureMarketControl).toHaveBeenCalled();
        }));
    });

    describe('region filter', () => {
        const getRegionInput = (): MockFilteredInputComponent => {
            return fixture.debugElement.query(By.css('#region-filter')).componentInstance;
        };

        it('should pass a list of regions', fakeAsync(async () => {
            initialize('edit');
            expect(getRegionInput().options).toEqual(await component.regions$.toPromise());
        }));

        it('should prevent the user from selecting a region when the table is loading', fakeAsync(() => {
            initialize('edit');
            const regionInput = getRegionInput();
            // should be editable when not loading stores
            expect(regionInput.editable).toEqual(true);
            component.isLoadingStores = true;
            fixture.detectChanges();
            // should NOT be editable when loading stores
            expect(regionInput.editable).toEqual(false);
        }));

        it('should maintain region filter on page reload', fakeAsync(() => {
            initialize('edit');
            // Simulates page reload
            component.getStoresByRegionAndMarket(region1, null);
            flush();
            tick(300); // region and market filters have debounce time of 300
            expect(component.regionControl.value).toEqual(region1);
            expect(component.stores.data[0].value).toEqual(testStore1);
            expect(component.stores.data[1]).toBeFalsy();
        }));

        it('should update region filter', fakeAsync(() => {
            initialize('edit');
            // Simulates page reload
            component.regionControl.patchValue(region1);
            flush();
            tick(300); // region and market filters have debounce time of 300
            expect(component.regionControl.value).toEqual(region1);
            expect(component.stores.data[0].value).toEqual(testStore1);
            expect(component.stores.data[1]).toBeFalsy();
            // Change filter value
            component.regionControl.patchValue(region2);
            flush();
            tick(300); // region and market filters have debounce time of 300
            expect(component.regionControl.value).toEqual(region2);
            expect(component.stores.data[0].value).toEqual(testStore2);
            expect(component.stores.data[1]).toBeFalsy();
        }));

        describe('market filter', () => {
            const getMarketInput = (): MockFilteredInputComponent => {
                return fixture.debugElement.query(By.css('#market-filter')).componentInstance;
            };

            it('should pass a list of markets', fakeAsync(async () => {
                initialize('edit');
                expect(getMarketInput().options).toEqual(await component.markets$.toPromise());
            }));

            it('should prevent the user from selecting a market when the table is loading', fakeAsync(() => {
                initialize('edit');
                const marketInput = getMarketInput();
                component.regionControl.patchValue(region1);
                flush();
                tick(300); // region and market filters have debounce time of 300
                // should be editable when not loading stores
                expect(marketInput.editable).toEqual(true);
                component.isLoadingStores = true;
                fixture.detectChanges();
                // should NOT be editable when loading stores
                expect(marketInput.editable).toEqual(false);
            }));

            it('should prevent the user from selecting a market when region has not been selected', fakeAsync(() => {
                initialize('edit');
                const marketInput = getMarketInput();
                // should be editable when not region has not been set
                expect(marketInput.editable).toEqual(false);
            }));

            it('should maintain region and market filter on page reload', fakeAsync(async () => {
                initialize('edit');
                // Simulates page reload
                component.getStoresByRegionAndMarket(region1, market1);
                flush();
                tick(300); // region and market filters have debounce time of 300
                expect(component.regionControl.value).toEqual(region1);
                expect(component.marketControl.value).toEqual(market1);
                expect(component.stores.data[0].value).toEqual(testStore1);
                expect(component.stores.data[1]).toBeFalsy();
            }));

            it('should update market filter', fakeAsync(() => {
                initialize('edit');
                // Simulates page reload
                component.regionControl.patchValue(region1);
                component.marketControl.patchValue(market1);
                flush();
                tick(300); // region and market filters have debounce time of 300
                expect(component.marketControl.value).toEqual(market1);
                expect(component.stores.data[0].value).toEqual(testStore1);
                expect(component.stores.data[1]).toBeFalsy();
                // Change filter value
                component.marketControl.patchValue(market2);
                flush();
                tick(300); // region and market filters have debounce time of 300
                expect(component.marketControl.value).toEqual(market2);
                expect(component.stores.data[0]).toBeFalsy(); // No stores have region1 and market2
            }));

            it('should show an error if market is selected but region is not', fakeAsync(() => {
                initialize('edit');
                component.marketControl.patchValue(market1);
                flush();
                tick(300); // region and market filters have debounce time of 300
                expect(messageFacade.addMessage).toHaveBeenCalledWith({
                    message: `Region must be selected to filter by Market`,
                    severity: 'error',
                });
            }));
        });
    });

    describe('store table', () => {
        describe.each`
            accessMode
            ${'edit'}
            ${'view'}
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
            it('should allow the user to select all records', fakeAsync(async () => {
                initialize('edit');
                await clickCheckbox('#select-all-checkbox');
                component.stores.data.forEach(async (store) => {
                    const index = component.stores.data.indexOf(store);
                    expect(await isChecked(`#checkbox-${index}`)).toEqual(true);
                    expect(component.selection.isSelected(store)).toEqual(true);
                });
            }));

            it('should allow the user to select individual rows', fakeAsync(async () => {
                initialize('edit');
                await clickCheckbox('#checkbox-0');
                expect(await isChecked('#checkbox-0')).toEqual(true);
                expect(component.selection.isSelected(component.stores.data[0])).toEqual(true);
                // nothing else should be selected
                expect(await isChecked('#checkbox-1')).toEqual(false);
                expect(component.selection.isSelected(component.stores.data[1])).toEqual(false);
            }));
        });

        describe('sorting', () => {
            it.each`
                column
                ${'code-header'}
                ${'description-header'}
                ${'state-header'}
                ${'assigned-header'}
            `(
                'should be sortable by the $column column',
                fakeAsync(async ({ column }) => {
                    initialize('edit');
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
                    jest.spyOn(component.offerFacade, 'save').mockReturnValueOnce(
                        of({ ...testOffer, storeDiscounts: [testStoreDiscount1, testStoreDiscount2] })
                    );
                    await clickCheckbox(`#checkbox-${r.rowNumber}`);
                    await (await getAssignButton()).click();
                });
                flush();
            };

            beforeEach(fakeAsync(() => {
                jest.spyOn(component, 'updateStoreAssignment');
                initialize('edit');
            }));

            describe.each`
                rowNumber
                ${1}
            `('assigning a row', ({ rowNumber }) => {
                it(`should trigger the selected row to be assigned`, fakeAsync(async () => {
                    await assignStores([{ rowNumber }]);
                    const updateModel = {
                        ...testOffer,
                        storeDiscounts: [testStoreDiscount1, storeDiscount2_toBeUpdated],
                    };
                    // );
                    expect(component.updateStoreAssignment).toHaveBeenCalled();
                    expect(component.offerFacade.save).toHaveBeenCalledWith(updateModel);
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
                jest.spyOn(component.offerFacade, 'save').mockReturnValueOnce(of({ ...testOffer, storeDiscounts: [] }));
                await clickCheckbox(`#checkbox-${r.rowNumber}`);
                await (await getUnassignButton()).click();
            });
            flush();
        };

        beforeEach(fakeAsync(() => {
            jest.spyOn(component, 'updateStoreAssignment');
            initialize('edit');
        }));

        describe.each`
            rowNumber
            ${0}
        `('unassigning a row', ({ rowNumber }) => {
            it(`should trigger the selected row to be unassigned`, fakeAsync(async () => {
                await unassignStores([{ rowNumber }]);
                const updateModel = {
                    ...testOffer,
                    storeDiscounts: [],
                };
                // );
                expect(component.updateStoreAssignment).toHaveBeenCalled();
                expect(component.offerFacade.save).toHaveBeenCalledWith(updateModel);
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
