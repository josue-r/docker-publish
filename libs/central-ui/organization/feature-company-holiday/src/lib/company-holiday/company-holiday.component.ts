import { SelectionModel } from '@angular/cdk/collections';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { ParameterFacade } from '@vioc-angular/central-ui/config/data-access-parameter';
import { ReceiptOfMaterialFacade } from '@vioc-angular/central-ui/inventory/data-access-receipt-of-material';
import { VendorFacade } from '@vioc-angular/central-ui/inventory/data-access-vendor';
import {
    CompanyHoliday,
    CompanyHolidayFacade,
    StoreHoliday,
} from '@vioc-angular/central-ui/organization/data-access-company-holiday';
import {
    ResourceFacade,
    ResourceFilterCriteria,
    Resources,
    Store,
} from '@vioc-angular/central-ui/organization/data-access-resources';
import { StoreProductFacade } from '@vioc-angular/central-ui/product/data-access-store-product';
import { SaveFacade } from '@vioc-angular/central-ui/util-component';
import { RouterService } from '@vioc-angular/central-ui/util-router';
import { RoleFacade } from '@vioc-angular/security/data-access-security';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { Described, isNullOrUndefined } from '@vioc-angular/shared/common-functionality';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { DataModifyingComponent } from '@vioc-angular/shared/util-data-modifying';
import { FormFactory, TypedFormGroup } from '@vioc-angular/shared/util-form';
import { combineLatest, Observable, ReplaySubject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, shareReplay, switchMap, takeUntil, tap } from 'rxjs/operators';

@Component({
    selector: 'company-holiday',
    templateUrl: './company-holiday.component.html',
    styleUrls: ['./company-holiday.component.scss'],
    providers: [
        CompanyHolidayFacade,
        ReceiptOfMaterialFacade,
        ResourceFacade,
        VendorFacade,
        StoreProductFacade,
        ParameterFacade,
    ],
})
export class CompanyHolidayComponent extends DataModifyingComponent implements OnInit, OnDestroy {
    private readonly _destroyed = new ReplaySubject(1);

    /**
     * Mode that determines the editable state of the page.
     */
    accessMode: AccessMode;

    /** Model that holds values of the company holiday */
    model: CompanyHoliday;

    /** Form that handles validating and updating company holiday fields */
    form: TypedFormGroup<CompanyHoliday>;

    /** Comparison function to specify which `Described` option is displayed. */
    describedEquals = Described.idEquals;

    saveFacade: SaveFacade<CompanyHoliday>;

    /** Status that determines if the page is loading. Used to disable page elements when loading. */
    isLoading = false;

    company: Described;

    /** List of regions that can be selected to filter the stores listed in the table. */
    regions$: Observable<Described[]>;

    /** List of markets that can be selected to filter the stores listed in the table. */
    markets$: Observable<Described[]>;

    /** Control that maintains the selected value of the region filter. */
    regionControl = new FormControl(null);

    /** SelectionModel for the currently selected data in the table. */
    selection = new SelectionModel<TypedFormGroup<StoreHoliday>>(true, []);

    /** Control that maintains the selected value of the market filter. */
    marketControl = new FormControl(null);

    /**DataSource for StoreHolidays data of CompanyHoliday*/
    storeHolidayDataSource = new MatTableDataSource<TypedFormGroup<StoreHoliday>>([]);

    /**Logged in user roles*/
    userRoles$: Observable<string[]>;

    /**codeAndDescriptionMapper for code-desc display*/
    codeAndDescriptionDisplayFn = Described.codeAndDescriptionMapper;

    @ViewChild(MatSort, { static: false }) set sort(sort: MatSort) {
        this.storeHolidayDataSource.sort = sort;
    }

    @ViewChild(MatTable, { static: false }) table: MatTable<StoreHoliday>;

    displayedColumns = ['select', 'store.code', 'store.description', 'closed'];

    constructor(
        private readonly route: ActivatedRoute,
        private readonly formFactory: FormFactory,
        private readonly routerService: RouterService,
        readonly companyHolidayFacade: CompanyHolidayFacade,
        readonly messageFacade: MessageFacade,
        private roleFacade: RoleFacade,
        readonly resourceFacade: ResourceFacade,
        private readonly changeDetector: ChangeDetectorRef
    ) {
        super();
        this.saveFacade = new SaveFacade(
            this.routerService,
            messageFacade,
            (model) => this.companyHolidayFacade.save(model),
            (ch) => `Company Holiday ${ch.id ? ch.name + ' ' : ''}saved successfully`,
            (isLoading: boolean) => (this.isLoading = isLoading)
        );
        // This will trigger a reload of the component when the parameters change i.e. switching from add to edit etc
        this.route.params.pipe(takeUntil(this._destroyed)).subscribe(() => {
            // Checking if accessMode is set to see if the component is already initialized, otherwise when
            // the component is first created ngOnInit will run twice
            if (this.accessMode) {
                this.ngOnInit();
            }
        });
    }

    ngOnInit(): void {
        // Parse the parameters from the URL
        const params = this.getRouteParams(this.route);
        this.accessMode = params.accessMode;
        const companyCode = params.companyCode;
        const holidayDate = params.holidayDate;
        this.userRoles$ = this.roleFacade.getMyRoles().pipe(shareReplay());

        if (this.accessMode.isView || this.accessMode.isEdit) {
            // Load data into the form
            this.companyHolidayFacade
                .findByCompanyAndDate(companyCode, holidayDate)
                .subscribe((companyHoliday: CompanyHoliday) => {
                    this.model = companyHoliday;
                    this.initializeForm(this.model);
                    this.initializeTable();
                    this.company = this.model.company;
                });

            this.regions$ = this.userRoles$.pipe(
                switchMap((roles) =>
                    this.resourceFacade
                        .findRegionsByRolesAndCompany(roles, companyCode)
                        .pipe(map((resources) => resources.resources))
                )
            );
            this.configureRegionControl();
            this.configureMarketControl();
        } else {
            throw Error('Unhandled Access Mode: ' + this.accessMode?.urlSegement);
        }
    }

    private configureRegionControl() {
        const regionChanges = this.regionControl.valueChanges.pipe(
            distinctUntilChanged(),
            debounceTime(300),
            takeUntil(this._destroyed)
        );
        combineLatest([this.userRoles$, regionChanges]).subscribe(
            ([roles, region]) => {
                this.isLoading = true;
                this.selection.clear();
                if (region) {
                    this.markets$ = this.resourceFacade
                        .findMarketsByRolesAndCompanyAndRegion(roles, this.model.company.code, region.code)
                        .pipe(
                            map((resources) => resources.resources),
                            tap(() => (this.isLoading = false))
                        );
                }
                this.marketControl.patchValue(null, { emitEvent: false });
                this.refreshStoreDataOnControlChange(roles, region, null);
            },
            () => (this.isLoading = false)
        );
    }

    private configureMarketControl() {
        const marketChanges = this.marketControl.valueChanges.pipe(
            distinctUntilChanged(),
            debounceTime(300),
            takeUntil(this._destroyed)
        );
        combineLatest([this.userRoles$, marketChanges]).subscribe(([roles, market]) => {
            this.isLoading = true;
            this.selection.clear();
            this.refreshStoreDataOnControlChange(roles, this.regionControl.value, market);
        });
    }

    refreshStoreDataOnControlChange(roles: string[], region: any, market: any) {
        let resourceFilterCriteria = null;

        if (market) {
            resourceFilterCriteria = ResourceFilterCriteria.byMarket(this.company.code, region.code, market.code);
        } else if (region) {
            resourceFilterCriteria = ResourceFilterCriteria.byRegion(this.company.code, region.code);
        }

        if (resourceFilterCriteria) {
            this.resourceFacade.findStoresByRoles(roles, 'ACTIVE', false, [resourceFilterCriteria]).subscribe(
                (response) => this.refreshStoreData(response),
                () => (this.isLoading = false)
            );
        } else {
            this.storeHolidayDataSource = new MatTableDataSource<TypedFormGroup<StoreHoliday>>(
                this.storeHolidays.controls as TypedFormGroup<StoreHoliday>[]
            );
            this.isLoading = false;
        }
    }

    private refreshStoreData(response: Resources) {
        const storeCodes: string[] = response.resources.map((store: Store) => store.code);
        const updatedStoreHoliday = this.form
            .getArray('storeHolidays')
            .controls.filter((c) => storeCodes.includes(c.value.store.code)) as TypedFormGroup<StoreHoliday>[];
        this.storeHolidayDataSource = new MatTableDataSource<TypedFormGroup<StoreHoliday>>(updatedStoreHoliday);
        this.form.getArray('storeHolidays').patchValue(updatedStoreHoliday);
        this.isLoading = false;
    }

    /** Initialize/Refresh table data source with given products and sorting */
    initializeTable() {
        if (this.regionControl.value) {
            //refreshing data for table after apply
            this.userRoles$.subscribe((roles) =>
                this.refreshStoreDataOnControlChange(roles, this.regionControl.value, this.marketControl.value)
            );
        } else {
            //initializing data for table
            this.storeHolidayDataSource = new MatTableDataSource<TypedFormGroup<StoreHoliday>>(
                this.storeHolidays.controls as TypedFormGroup<StoreHoliday>[]
            );
        }
        // for columns with nested properties
        this.storeHolidayDataSource.sortingDataAccessor = (item, property) => {
            switch (property) {
                case 'store.code':
                    return item.getControlValue('store').code;
                case 'store.description':
                    return item.getControlValue('store').description;
                default:
                    return item.get(property).value;
            }
        };
    }

    private getRouteParams(route: ActivatedRoute): {
        accessMode: AccessMode;
        companyCode: string;
        holidayDate: string;
    } {
        const params = route.snapshot.paramMap;
        const accessMode = AccessMode.of(params.get('accessMode'));
        const companyCode = params.get('companyCode');
        const holidayDate = params.get('holidayDate');
        return { accessMode, companyCode, holidayDate };
    }

    /** Initialize form with current values. */
    initializeForm(model: CompanyHoliday): void {
        // Build the form
        if (isNullOrUndefined(this.form)) {
            this.form = this.formFactory.group('CompanyHoliday', model, this._destroyed);
        }
        // Configure based on access
        if (this.accessMode.isView) {
            this.form.disable();
        } else if (this.accessMode.isEdit) {
            // Displays errors for components that are loaded with invalid data
            this.form.markAllAsTouched();
        }
    }

    /** Helper method for determining if a value in the selection is selected. */
    valueSelected(): boolean {
        return this.selection && this.selection.hasValue();
    }

    /** Determines if all of the available rows of the table are selected. */
    isAllSelected(dataSource: MatTableDataSource<TypedFormGroup<StoreHoliday>>): boolean {
        const numSelected = this.selection && this.selection.selected.length;
        const numRows = dataSource.data.length;
        return numSelected === numRows;
    }

    /** If no rows are selected selects all available rows, if all rows are selected then clears the selection. */
    masterToggle(dataSource: MatTableDataSource<TypedFormGroup<StoreHoliday>>): void {
        this.isAllSelected(dataSource)
            ? this.selection.clear()
            : dataSource.data.forEach((row) => this.selection.select(row));
    }

    /** Save changes and reload the entity from the API. */
    apply(): void {
        this.selection.clear();
        // used to maintain current state after the page has been reloaded
        const reload = () => {
            this.form = undefined;
            this.ngOnInit();
        };
        this.saveFacade.apply(this.form, this.model, reload).subscribe();
    }

    /** Save and navigate back to previous page. */
    save(): void {
        this.saveFacade.save(this.form, this.model, this.route).subscribe();
    }

    setSelectedToClosed(isClosed: boolean) {
        this.selection.selected.forEach((c) => c.patchControlValue('closed', isClosed));
        this.storeHolidays.markAsDirty();
        this.changeDetector.detectChanges();
        this.selection.clear();
    }

    /** @see DataModifyingComponent */
    get unsavedChanges(): boolean {
        return this.form?.dirty;
    }

    get companyCodeAndDescription(): string {
        return Described.codeAndDescriptionMapper(this.company);
    }

    get holidayCodeAndDescription(): string {
        return Described.codeAndDescriptionMapper(this.model.holiday);
    }

    get storeHolidays(): FormArray {
        return this.form.getArray('storeHolidays');
    }

    get holidayDate(): string {
        const holidayDate = this.form.getControlValue('holidayDate');
        return holidayDate ? `${holidayDate}` : '';
    }

    get storeClosed(): string {
        const closed = this.form.getControlValue('storeClosed');
        return closed === true ? 'YES' : 'NO';
    }

    get renderSelection(): boolean {
        return this.accessMode.isEdit;
    }

    ngOnDestroy(): void {
        this._destroyed.next();
    }
}
