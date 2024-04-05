import { SelectionModel } from '@angular/cdk/collections';
import {
    Component,
    OnInit,
    OnDestroy,
    Input,
    ViewChild,
    ChangeDetectorRef,
    ChangeDetectionStrategy,
} from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Offer, OfferFacade, StoreDiscount } from '@vioc-angular/central-ui/discount/data-access-offers';
import { ResourceFacade } from '@vioc-angular/central-ui/organization/data-access-resources';
import { Store, StoreFacade } from '@vioc-angular/central-ui/organization/data-access-store';
import { RoleFacade } from '@vioc-angular/security/data-access-security';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { QueryPage, QueryRestriction, QuerySearch, QuerySort } from '@vioc-angular/shared/common-api-models';
import { Described, isNullOrUndefined } from '@vioc-angular/shared/common-functionality';
import { FeatureFlagFacade } from '@vioc-angular/shared/data-access-feature-flag';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { SEARCHABLE_TOKEN } from '@vioc-angular/shared/data-access-search';
import { Comparators } from '@vioc-angular/shared/util-column';
import { DataModifyingComponent } from '@vioc-angular/shared/util-data-modifying';
import { FormFactory, TypedFormGroup } from '@vioc-angular/shared/util-form';
import { combineLatest, Observable, ReplaySubject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged, map, tap } from 'rxjs/operators';

@Component({
    selector: 'vioc-angular-offer-stores',
    templateUrl: './offer-stores.component.html',
    styleUrls: ['./offer-stores.component.scss'],
    providers: [
        OfferFacade,
        StoreFacade,
        RoleFacade,
        ResourceFacade,
        FeatureFlagFacade,
        { provide: SEARCHABLE_TOKEN, useValue: StoreFacade },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfferStoresComponent extends DataModifyingComponent implements OnInit, OnDestroy {
    private readonly _destroyed = new ReplaySubject(1);

    /** Form containing the value changes for the DiscountOffer. */
    @Input() form: TypedFormGroup<Offer>;

    /** Mode in which the page is being accessed in. */
    @Input() accessMode: AccessMode;

    /** Form containing the values for the DiscountOffer. */
    @Input() model: Offer;

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

    @ViewChild(MatSort, { static: false }) set sort(sort: MatSort) {
        this.stores.sort = sort;
    }

    /** List of regions that can be selected to filter the stores listed in the table. */
    regions$: Observable<Described[]>;

    /** List of markets that can be selected to filter the stores listed in the table. This changes when a region is selected */
    markets$: Observable<Described[]>;

    /** List of all markets that can be selected to filter the stores listed in the table. */
    allMarkets$: Observable<Described[]>;

    /** Control that maintains the selected value of the region filter. */
    regionControl = new FormControl();

    /** Control that maintains the selected value of the market filter. */
    marketControl = new FormControl();

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

    userRoles$: string[];

    constructor(
        public readonly offerFacade: OfferFacade,
        public readonly storeFacade: StoreFacade,
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
        // Load roles, regions, and markets
        this.roleFacade.getMyRoles().subscribe((response) => {
            this.userRoles$ = response;
        });
        this.regions$ = this.resourceFacade
            .findRegionsByRolesAndCompany(this.userRoles$, this.form.getControlValue('company').code)
            .pipe(map((resources) => resources.resources));
        this.markets$ = this.resourceFacade
            .findMarketsByRolesAndCompany(this.userRoles$, this.form.getControlValue('company').code)
            .pipe(
                map((resources) => resources.resources),
                tap(() => (this.isLoading = false))
            );
        // Maintain a list of all markets to use when resetting the filter
        this.allMarkets$ = this.markets$;
        // Initialize store table, region filter, and market filter
        this.getStoresByRegionAndMarket(this.initiateRegionSearch, this.initiateMarketSearch);
    }

    ngOnDestroy(): void {
        this._destroyed.next();
    }

    /** @see DataModifyingComponent */
    get unsavedChanges(): boolean {
        return this.form?.dirty;
    }

    createQueryRestriction(region: string, market: string): QueryRestriction[] {
        const queryRestrictions: QueryRestriction[] = [
            {
                fieldPath: 'company.code',
                dataType: 'string',
                operator: '=',
                values: [this.form.getControlValue('company').code],
            },
            {
                fieldPath: 'active',
                dataType: 'boolean',
                operator: Comparators.true.value,
                values: [],
            },
        ];
        return queryRestrictions;
    }

    getStoresByRegionAndMarket(region: Described, market: Described): void {
        this.isLoadingStores = true;
        const queryRestrictions = this.createQueryRestriction(this.regionControl.value, this.marketControl.value);
        const querySearch: QuerySearch = {
            queryRestrictions: queryRestrictions,
            sort: new QuerySort({ apiSortPath: 'code' } as any, 'asc'),
            // Should allow for all stores to load on a single page
            page: new QueryPage(0, 700),
        };
        this.storeFacade.search(querySearch).subscribe((stores) => {
            this.initializeForm(stores.content);
            // Maintain filter user provided after applying changes
            this.initializeFilters(region, market);
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

    initializeFilters(region: Described, market: Described): void {
        this.isLoadingStores = true;
        this.configureRegionControl();
        this.configureMarketControl();
        // Maintain filter user provided after applying changes
        if (!isNullOrUndefined(region)) {
            this.regionControl.setValue(region);
            this.changeDetector.detectChanges();
            if (!isNullOrUndefined(market)) {
                this.marketControl.setValue(market);
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
        const currentRegion = this.regionControl.value;
        const currentMarket = this.marketControl.value;

        // Find selected stores to add/remove from storeDiscounts so they are assigned/unassigned in api
        let selectedStores = this.selection.selected.map((store) => this.mapToStoreDiscount(store.getRawValue()));
        let selectedStoreIds = selectedStores.map((storeDiscount) => storeDiscount.store.id);
        let updatedModel: Offer;

        // Create updated model based on if stores are beingAssigned or not
        if (beingAssigned) {
            // The updated model should include existing storeDiscounts and those that are selected to be assigned
            updatedModel = {
                ...this.form.getRawValue(),
                storeDiscounts: this.form.getArrayValue('storeDiscounts').concat(selectedStores),
            };
        } else {
            // The updated model should include existing storeDiscounts except for those being unassigned
            let updatedStoreDiscounts = this.form
                .getArrayValue('storeDiscounts')
                .filter((sd) => !selectedStoreIds.includes(sd.store.id));
            updatedModel = { ...this.form.getRawValue(), storeDiscounts: updatedStoreDiscounts };
        }

        this.offerFacade.save(updatedModel).subscribe((updatedValue: Offer) => {
            // Update form and filter values
            this.updateDiscountOfferForm(updatedValue, currentRegion, currentMarket);
            this.getStoresByRegionAndMarket(currentRegion, currentMarket);
            this.isLoading = false;
            this.selection.clear();
            this.changeDetector.detectChanges();
        });
    }

    updateDiscountOfferForm(discountOffer: Offer, currentRegion: Described, currentMarket: Described): void {
        // Patch form values for Audited fields
        this.form.patchControlValue('version', discountOffer.version);
        this.form.patchControlValue('updatedOn', discountOffer.updatedOn);
        this.form.patchControlValue('updatedBy', discountOffer.updatedBy);

        // You have to remove the control and set the value for it to update, doing a patchArrayValue did not maintain updated StoreDiscount values
        this.form.removeControl('storeDiscounts');
        this.form.setControl(
            'storeDiscounts',
            this.formFactory.array('StoreDiscount', discountOffer.storeDiscounts, this._destroyed)
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

    /** Checks if the store is assigned to the discount or not */
    isAssigned(store): boolean {
        const isAssigned: boolean = this.form
            .getControlValue('storeDiscounts')
            .map((sd) => sd.store.id)
            .includes(store.getControlValue('id'));
        store.setControlValue('assigned', isAssigned);
        return isAssigned;
    }

    codeAndDescriptionDisplayFn = Described.codeAndDescriptionMapper;

    configureRegionControl() {
        const regionChanges = this.regionControl.valueChanges.pipe(
            distinctUntilChanged(),
            debounceTime(300),
            takeUntil(this._destroyed)
        );
        combineLatest([regionChanges]).subscribe(([region]) => {
            this.isLoadingStores = true;
            this.changeDetector.detectChanges();
            if (!isNullOrUndefined(region)) {
                // Markets are a list of Described so we have to make an api call to filter by region
                this.markets$ = this.resourceFacade
                    .findMarketsByRolesAndCompanyAndRegion(
                        this.userRoles$,
                        this.form.getControlValue('company').code,
                        region.code
                    )
                    .pipe(
                        map((resources) => resources.resources),
                        tap(() => (this.isLoading = false))
                    );
                // Reset market value when a new region is chosen, except if it is after apply is clicked
                if (!isNullOrUndefined(this.initiateRegionSearch) && region !== this.initiateRegionSearch) {
                    this.marketControl.patchValue(null, { emitEvent: false });
                }
                let storesByRegion = this.storeList.filter((store) => store.region.code === region.code);
                this.initializeTable(storesByRegion);
            } else {
                // If no region is specified, for example someone filters on Colorado and then clears the filter, then show all
                this.markets$ = this.allMarkets$;
                this.marketControl.patchValue(null, { emitEvent: false });
                this.initializeTable(this.storeList);
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
            if (!isNullOrUndefined(this.regionControl.value)) {
                if (!isNullOrUndefined(market)) {
                    // If region and market are provided, find stores by region and market
                    let storesByRegionAndMarket = this.storeList.filter(
                        (store) =>
                            store.region.code === this.regionControl.value.code && store.market.code === market.code
                    );
                    this.initializeTable(storesByRegionAndMarket);
                } else {
                    // If no market is provided, find stores by region
                    this.marketControl.patchValue(null, { emitEvent: false });
                    let storesByRegion = this.storeList.filter(
                        (store) => store.region.code === this.regionControl.value.code
                    );
                    this.initializeTable(storesByRegion);
                }
            } else {
                // For mvp you can filter by region or region and market, not market only
                this.messageFacade.addMessage({
                    message: 'Region must be selected to filter by Market',
                    severity: 'error',
                });
                this.isLoadingStores = false;
                this.changeDetector.detectChanges();
            }
        });
    }
}
