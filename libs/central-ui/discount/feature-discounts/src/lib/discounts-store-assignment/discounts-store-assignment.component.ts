import { SelectionModel } from '@angular/cdk/collections';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core';
import { FormControl, FormBuilder } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Discount, DiscountFacade, StoreDiscount } from '@vioc-angular/central-ui/discount/data-access-discount';
import { ResourceFacade } from '@vioc-angular/central-ui/organization/data-access-resources';
import { Store, StoreFacade } from '@vioc-angular/central-ui/organization/data-access-store';
import { RoleFacade } from '@vioc-angular/security/data-access-security';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { QueryRestriction, QuerySearch, QuerySort, QueryPage } from '@vioc-angular/shared/common-api-models';
import { Described, isNullOrUndefined } from '@vioc-angular/shared/common-functionality';
import { FeatureFlagFacade } from '@vioc-angular/shared/data-access-feature-flag';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { SEARCHABLE_TOKEN } from '@vioc-angular/shared/data-access-search';
import { Comparators } from '@vioc-angular/shared/util-column';
import { DataModifyingComponent } from '@vioc-angular/shared/util-data-modifying';
import { FormFactory, TypedFormGroup } from '@vioc-angular/shared/util-form';
import { Observable, ReplaySubject, combineLatest } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, takeUntil, tap } from 'rxjs/operators';

@Component({
    selector: 'vioc-angular-discounts-store-assignment',
    templateUrl: './discounts-store-assignment.component.html',
    styleUrls: ['./discounts-store-assignment.component.scss'],
    providers: [
        DiscountFacade,
        StoreFacade,
        RoleFacade,
        ResourceFacade,
        FeatureFlagFacade,
        { provide: SEARCHABLE_TOKEN, useValue: StoreFacade },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiscountsStoreAssignmentComponent extends DataModifyingComponent implements OnInit, OnDestroy {
    private readonly _destroyed = new ReplaySubject(1);

    /** Form containing the value changes for the Discount. */
    @Input() form: TypedFormGroup<Discount>;

    /** Mode in which the page is being accessed in. */
    @Input() accessMode: AccessMode;

    /** Form containing the values for the Discount. */
    @Input() model: Discount;

    /**
     * Used to trigger a search for stores on component initialization. If a region value is provided,
     * then a search is triggered for that region. If no value is provided, then no search is triggered.
     */
    @Input() initiateRegionSearch: Described;

    /**
     * Used to trigger a search for stores on component initialization. If a market value is provided,
     * then a search is triggered for that market. If no value is provided, then no search is triggered.
     */
    @Input() initiateMarketSearch: Described;

    /**
     * Used to trigger a search for stores on component initialization. If a company value is provided,
     * then a search is triggered for that company. If no value is provided, then no search is triggered.
     */
    @Input() initiateCompanySearch: Described;

    /** Controls if the company filter is shown or not */
    @Input() hideCompanyFilter: boolean;

    /** Sort for the Store Table */
    @ViewChild(MatSort, { static: false }) set sort(sort: MatSort) {
        this.stores.sort = sort;
    }

    /** List of regions that can be selected to filter the stores listed in the table. */
    regions$: Observable<Described[]>;

    /** List of markets that can be selected to filter the stores listed in the table. This changes when a region is selected */
    markets$: Observable<Described[]>;

    /** List of companies that can be selected to filter the stores listed in the table. */
    companies$: Observable<Described[]>;

    /** List of all markets that can be selected to filter the stores listed in the table. */
    allMarkets$: Observable<Described[]>;

    /** List of all regions that can be selected to filter the stores listed in the table. */
    allRegions$: Observable<Described[]>;

    /** Control that maintains the selected value of the region filter. */
    regionControl = new FormControl();

    /** Control that maintains the selected value of the market filter. */
    marketControl = new FormControl();

    /** Control that maintains the selected value of the company filter. */
    companyControl = new FormControl();

    /** Table source that will be used to display the store values. */
    stores = new MatTableDataSource<TypedFormGroup<Store>>([]);

    /** List of all stores */
    storeList: Store[];

    /** Used to maintain the selected values in the table. */
    selection = new SelectionModel<TypedFormGroup<Store>>(true, []);

    /** Determines whether or not to display the loading overlay over the store table. */
    isLoadingStores = false;

    /** List of displayable columns in the store table. */
    displayedColumns: string[];

    describedEquals = Described.idEquals;

    isLoading = false;

    /** List of all roles the user has assigned to them */
    userRoles$: string[];

    constructor(
        public readonly storeFacade: StoreFacade,
        public readonly discountFacade: DiscountFacade,
        public readonly messageFacade: MessageFacade,
        public readonly roleFacade: RoleFacade,
        public readonly resourceFacade: ResourceFacade,
        public readonly featureFlagFacade: FeatureFlagFacade,
        private readonly changeDetector: ChangeDetectorRef,
        private readonly formFactory: FormFactory,
        private readonly formBuilder: FormBuilder
    ) {
        super();
    }

    ngOnInit(): void {
        // Load roles, companies, regions, and markets
        this.roleFacade.getMyRoles().subscribe((response) => {
            this.userRoles$ = response;
        });
        this.loadDropdowns();
        // Initialize store table, company filter, region filter, and market filter
        this.getStoresByCompanyAndRegionAndMarket(
            this.initiateCompanySearch,
            this.initiateRegionSearch,
            this.initiateMarketSearch
        );
    }

    loadDropdowns(): void {
        // Load company dropdown to be able to use that as a filter for National Discounts
        this.companies$ = this.resourceFacade
            .findCompaniesByRoles(this.userRoles$)
            .pipe(map((resourceCollection) => resourceCollection.resources));
        // This is used for all Local Discount store assignments since company is provided
        if (!isNullOrUndefined(this.form.getControlValue('company'))) {
            this.regions$ = this.resourceFacade
                .findRegionsByRolesAndCompany(this.userRoles$, this.form.getControlValue('company').code)
                .pipe(map((resourceCollection) => resourceCollection.resources));
            this.markets$ = this.resourceFacade
                .findMarketsByRolesAndCompany(this.userRoles$, this.form.getControlValue('company').code)
                .pipe(
                    map((resourceCollection) => resourceCollection.resources),
                    tap(() => (this.isLoading = false))
                );
        } else {
            // This is used for National Discount Store Assignments since no Company will be initially defined
            this.regions$ = this.resourceFacade
                .findRegionsByRoles(this.userRoles$)
                .pipe(map((resourceCollection) => resourceCollection.resources));
            this.markets$ = this.resourceFacade.findMarketsByRoles(this.userRoles$).pipe(
                map((resourceCollection) => resourceCollection.resources),
                tap(() => (this.isLoading = false))
            );
        }
        // Maintain a list of all regions to use when resetting the filter
        this.allRegions$ = this.regions$;
        // Maintain a list of all markets to use when resetting the filter
        this.allMarkets$ = this.markets$;
    }

    ngOnDestroy(): void {
        this._destroyed.next();
    }

    /** @see DataModifyingComponent */
    get unsavedChanges(): boolean {
        return this.form?.dirty;
    }

    /** Query restriction for search to load all stores user has access to */
    createQueryRestriction(): QueryRestriction[] {
        // Only want active stores
        const queryRestrictions: QueryRestriction[] = [
            {
                fieldPath: 'active',
                dataType: 'boolean',
                operator: Comparators.true.value,
                values: [],
            },
        ];
        // If Local Discount add company restriction since company is provided
        if (!isNullOrUndefined(this.form.getControlValue('company'))) {
            const companyRestriction: QueryRestriction = {
                fieldPath: 'company.code',
                dataType: 'string',
                operator: '=',
                values: [this.form.getControlValue('company').code],
            };
            queryRestrictions.push(companyRestriction);
        }
        return queryRestrictions;
    }

    /** Call to store search to load store information in the table */
    getStoresByCompanyAndRegionAndMarket(company: Described, region: Described, market: Described): void {
        this.isLoadingStores = true;
        const queryRestrictions = this.createQueryRestriction();
        const querySearch: QuerySearch = {
            queryRestrictions: queryRestrictions,
            sort: new QuerySort({ apiSortPath: 'code' } as any, 'asc'),
            // Should allow for all stores to load on a single page
            page: new QueryPage(0, 700),
        };
        this.storeFacade.search(querySearch).subscribe((stores) => {
            this.initializeForm(stores.content);
            // Maintain filter user provided after applying changes
            this.initializeFilters(company, region, market);
            this.changeDetector.detectChanges();
        });
    }

    initializeForm(stores: Store[]): void {
        // We only want active stores with closeDate = null, closeDate is not part of store search
        this.storeList = stores.filter((store) => isNullOrUndefined(store.storeCloseDate));
        this.initializeTable(this.storeList);
    }

    /** Initializes the table source and the ability to sort by the column headers of the table. */
    initializeTable(stores: Store[]): void {
        // De-select stores when filter is changed and table is initialized
        this.selection.clear();
        this.displayedColumns = ['select', 'storeCode', 'storeDescription', 'storeState', 'assigned'];
        const storeForm = this.formFactory.array('Store', stores, this._destroyed);
        this.stores = new MatTableDataSource(storeForm.controls as TypedFormGroup<Store>[]);
        this.applySortToTable();
        this.isLoadingStores = false;
        this.changeDetector.detectChanges();
    }

    initializeFilters(company: Described, region: Described, market: Described): void {
        this.isLoadingStores = true;
        if (this.hideCompanyFilter) {
            this.companyControl.setValue(this.form.getControlValue('company'));
        } else {
            this.configureCompanyControl();
        }
        this.configureRegionControl();
        this.configureMarketControl();
        // Maintain filter user provided after applying changes
        if (!isNullOrUndefined(company)) {
            this.companyControl.setValue(company);
            this.changeDetector.detectChanges();
            if (!isNullOrUndefined(region)) {
                this.regionControl.setValue(region);
                this.changeDetector.detectChanges();
                if (!isNullOrUndefined(market)) {
                    this.marketControl.setValue(market);
                }
            }
        }
        this.isLoadingStores = false;
        this.changeDetector.detectChanges();
    }

    /** Configures how the table should sort on the column headers. */
    applySortToTable(): void {
        this.stores.sortingDataAccessor = (item: TypedFormGroup<any>, property) => {
            switch (property) {
                case 'storeCode':
                    return item.getControlValue('code');
                case 'storeDescription':
                    return item.getControlValue('description');
                case 'storeState':
                    return item.getControlValue('address').state;
                case 'assigned':
                    return item.getControlValue('assigned');
                default:
                    return item.get(property).value;
            }
        };
    }

    /** Calls update to assign/unassign the given stores */
    updateStoreAssignment(beingAssigned: boolean): void {
        this.isLoading = true;
        this.isLoadingStores = true;
        // Maintain current filter after assignment/unassignment of stores
        const currentCompany = this.companyControl.value;
        const currentRegion = this.regionControl.value;
        const currentMarket = this.marketControl.value;

        // Find selected stores to add/remove from storeDiscounts so they are assigned/unassigned in api
        let selectedStores = this.selection.selected.map((store) => this.mapToStoreDiscount(store.getRawValue()));
        let selectedStoreIds = selectedStores.map((storeDiscount) => storeDiscount.store.id);
        let updatedModel: Discount;

        // The list of store discount we need to unassign
        let storeDiscountsToUpdate = this.form
            .getArrayValue('storeDiscounts')
            .filter((sd) => selectedStoreIds.includes(sd.store.id));
        // Create updated model based on if stores are beingAssigned or not
        if (beingAssigned) {
            // The updated model should set active to true (assign)
            storeDiscountsToUpdate.forEach((store) => {
                store.active = true;
            });
        } else {
            // The updated model should set active to false (unassign)
            storeDiscountsToUpdate.forEach((store) => {
                store.active = false;
            });
        }
        updatedModel = {
            ...this.form.getRawValue(),
            storeDiscounts: this.form.getArrayValue('storeDiscounts'),
        };

        this.discountFacade.save(updatedModel).subscribe((updatedValue: Discount) => {
            // Update form and filter values
            this.updateForm(updatedValue);
            this.getStoresByCompanyAndRegionAndMarket(currentCompany, currentRegion, currentMarket);
            this.isLoading = false;
            this.selection.clear();
            this.changeDetector.detectChanges();
        });
    }

    updateForm(discount: Discount): void {
        // Patch form values for Audited fields
        this.form.patchControlValue('version', discount.version);
        this.form.patchControlValue('updatedOn', discount.updatedOn);
        this.form.patchControlValue('updatedBy', discount.updatedBy);

        // You have to remove the control and set the value for it to update, doing a patchArrayValue did not maintain updated StoreDiscount values
        this.form.removeControl('storeDiscounts');
        this.form.setControl(
            'storeDiscounts',
            this.formFactory.array('StoreDiscount', discount.storeDiscounts, this._destroyed)
        );
    }

    /** Convert a store to a StoreDiscount */
    mapToStoreDiscount(store: any): StoreDiscount {
        return {
            ...new StoreDiscount(),
            store: {
                id: store.id,
            },
        };
    }

    /** Checks if all of the values of the table have been selected. */
    isAllSelected(): boolean {
        return this.selection.selected.length === this.stores.data.filter((c) => !c.disabled).length;
    }

    /** Helper method for determining if a value in the selection is selected. */
    valueSelected(): boolean {
        return this.selection && this.selection.hasValue();
    }

    /** Toggles the selection of all the values in the table. */
    masterToggle(): void {
        this.isAllSelected()
            ? this.selection.clear()
            : this.stores.data
                  // select only the enabled stores
                  .filter((c) => !c.disabled)
                  .forEach((control) => this.selection.select(control));
    }

    /** Checks to see if the master toggle should be selectable. */
    isAllSelectable(): boolean {
        return this.stores.data.some((c) => !c.disabled);
    }

    /** Checks if the store is assigned to the discount offer or not */
    isAssigned(store): boolean {
        let isAssigned: boolean;
        const listOfActiveStores: StoreDiscount[] = this.form
            .getControlValue('storeDiscounts')
            .filter((sd) => sd.active)
            .map((sd) => sd.store.id);
        isAssigned = listOfActiveStores.includes(store.value.id) ? true : false;
        store.setControlValue('assigned', isAssigned);
        return isAssigned;
    }

    codeAndDescriptionDisplayFn = Described.codeAndDescriptionMapper;

    configureCompanyControl() {
        const companyChanges = this.companyControl.valueChanges.pipe(
            distinctUntilChanged(),
            debounceTime(300),
            takeUntil(this._destroyed)
        );
        combineLatest([companyChanges]).subscribe(([company]) => {
            this.isLoadingStores = true;
            this.changeDetector.detectChanges();
            if (!isNullOrUndefined(company)) {
                // Regions are a list of Described so we have to make an api call to filter by company
                this.regions$ = this.resourceFacade.findRegionsByRolesAndCompany(this.userRoles$, company.code).pipe(
                    map((resourceCollection) => resourceCollection.resources),
                    tap(() => (this.isLoading = false))
                );
                // Clear and disable market when company changes except after apply
                if (company !== this.initiateCompanySearch) {
                    // Clear market control and disable when company changes since region will be reset
                    this.marketControl.patchValue(null, { emitEvent: false });
                    this.marketControl.disable();
                }
                // Reset region and market value when a new company is chosen, except if it is after apply is clicked
                if (!isNullOrUndefined(this.initiateCompanySearch) && company !== this.initiateCompanySearch) {
                    this.regionControl.patchValue(null, { emitEvent: false });
                    this.marketControl.patchValue(null, { emitEvent: false });
                }
                let storesByCompany = this.storeList.filter((store) => store.company.code === company.code);
                this.initializeTable(storesByCompany);
            } else {
                // If no company is specified, for example someone filters on VAL and then clears the filter, then show all
                this.regions$ = this.allRegions$;
                this.markets$ = this.allMarkets$;
                this.regionControl.patchValue(null, { emitEvent: false });
                this.marketControl.patchValue(null, { emitEvent: false });
                this.initializeTable(this.storeList);
            }
        });
    }

    configureRegionControl() {
        const regionChanges = this.regionControl.valueChanges.pipe(
            distinctUntilChanged(),
            debounceTime(300),
            takeUntil(this._destroyed)
        );
        combineLatest([regionChanges]).subscribe(([region]) => {
            this.isLoadingStores = true;
            this.changeDetector.detectChanges();
            if (!isNullOrUndefined(this.companyControl.value)) {
                if (!isNullOrUndefined(region)) {
                    // Re-enable market control
                    this.marketControl.enable();
                    // Markets are a list of Described so we have to make an api call to filter by region
                    this.markets$ = this.resourceFacade
                        .findMarketsByRolesAndCompanyAndRegion(
                            this.userRoles$,
                            this.companyControl.value.code,
                            region.code
                        )
                        .pipe(
                            map((resourceCollection) => resourceCollection.resources),
                            tap(() => (this.isLoading = false))
                        );
                    // Reset market value when a new region is chosen, except if it is after apply is clicked
                    if (!isNullOrUndefined(this.initiateRegionSearch) && region !== this.initiateRegionSearch) {
                        this.marketControl.patchValue(null, { emitEvent: false });
                    }
                    let storesByCompanyAndRegion = this.storeList.filter(
                        (store) =>
                            store.company.code === this.companyControl.value.code && store.region.code === region.code
                    );
                    this.initializeTable(storesByCompanyAndRegion);
                } else {
                    // If no region is specified, for example someone filters on Colorado and then clears the filter, then show all
                    this.markets$ = this.allMarkets$;
                    this.marketControl.patchValue(null, { emitEvent: false });
                    this.initializeTable(this.storeList);
                }
            } else {
                // For mvp you can filter by company, company and region, or company, region and market, not region only
                this.messageFacade.addMessage({
                    message: 'Company must be selected to filter by Region',
                    severity: 'error',
                });
                this.isLoadingStores = false;
                this.changeDetector.detectChanges();
            }
        });
    }

    configureMarketControl() {
        const marketChanges = this.marketControl.valueChanges.pipe(
            distinctUntilChanged(),
            debounceTime(300),
            takeUntil(this._destroyed)
        );
        combineLatest([marketChanges]).subscribe(([market]) => {
            this.isLoadingStores = true;
            this.changeDetector.detectChanges();
            if (!isNullOrUndefined(this.companyControl.value)) {
                if (!isNullOrUndefined(this.regionControl.value)) {
                    if (!isNullOrUndefined(market)) {
                        // If company, region and market are provided, find stores by company, region and market
                        let storesByCompanyAndRegionAndMarket = this.storeList.filter(
                            (store) =>
                                store.company.code === this.companyControl.value.code &&
                                store.region.code === this.regionControl.value.code &&
                                store.market.code === market.code
                        );
                        this.initializeTable(storesByCompanyAndRegionAndMarket);
                    } else {
                        // If no market is provided, find stores by company and region
                        this.marketControl.patchValue(null, { emitEvent: false });
                        let storesByCompanyAndRegion = this.storeList.filter(
                            (store) =>
                                store.company.code === this.companyControl.value.code &&
                                store.region.code === this.regionControl.value.code
                        );
                        this.initializeTable(storesByCompanyAndRegion);
                    }
                } else if (!isNullOrUndefined(market)) {
                    // If market is provided when region and company are not show an error
                    // For mvp you can filter by company, company and region, or company, region and market, not market only
                    this.messageFacade.addMessage({
                        message: 'Region must be selected to filter by Market',
                        severity: 'error',
                    });
                    this.isLoadingStores = false;
                    this.changeDetector.detectChanges();
                } else {
                    // No error should be thrown this is when company sets market to null and region becomes enabled
                    this.isLoadingStores = false;
                    this.changeDetector.detectChanges();
                }
            } else if (!isNullOrUndefined(market)) {
                // If market is provided when region and company are not show an error
                // For mvp you can filter by company, company and region, or company, region and market, not market only
                this.messageFacade.addMessage({
                    message: 'Company and Region must be selected to filter by Market',
                    severity: 'error',
                });
            } else {
                this.isLoadingStores = false;
                this.changeDetector.detectChanges();
            }
        });
    }
}
