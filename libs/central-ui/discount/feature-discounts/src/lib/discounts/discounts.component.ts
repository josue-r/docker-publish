import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, Validators } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonCodeFacade } from '@vioc-angular/central-ui/config/data-access-common-code';
import { Discount, DiscountFacade, StoreDiscount } from '@vioc-angular/central-ui/discount/data-access-discount';
import { ResourceFacade } from '@vioc-angular/central-ui/organization/data-access-resources';
import { ProductCategory, ProductCategoryFacade } from '@vioc-angular/central-ui/product/data-access-product-category';
import { ServiceCategory, ServiceCategoryFacade } from '@vioc-angular/central-ui/service/data-access-service-category';
import { SaveFacade } from '@vioc-angular/central-ui/util-component';
import { RouterService } from '@vioc-angular/central-ui/util-router';
import { RoleFacade } from '@vioc-angular/security/data-access-security';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { QuerySearch, SearchLine } from '@vioc-angular/shared/common-api-models';
import { Described, TypedFormGroupSelectionModel, isNullOrUndefined } from '@vioc-angular/shared/common-functionality';
import { FeatureFlagFacade } from '@vioc-angular/shared/data-access-feature-flag';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { SEARCHABLE_TOKEN } from '@vioc-angular/shared/data-access-search';
import { ResponseEntity } from '@vioc-angular/shared/util-api';
import { Column, Comparators } from '@vioc-angular/shared/util-column';
import { DataModifyingComponent } from '@vioc-angular/shared/util-data-modifying';
import { CentralValidators, FormFactory, TypedFormGroup } from '@vioc-angular/shared/util-form';
import { DiscountCategory } from 'libs/central-ui/discount/data-access-discount/src/lib/model/discount-category.model';
import { BehaviorSubject, EMPTY, Observable, ReplaySubject, of, throwError } from 'rxjs';
import { catchError, map, takeUntil, tap } from 'rxjs/operators';
import { DiscountsStoreAssignmentComponent } from '../discounts-store-assignment/discounts-store-assignment.component';

@Component({
    selector: 'vioc-angular-discounts',
    templateUrl: './discounts.component.html',
    styleUrls: ['./discounts.component.scss'],
    providers: [
        DiscountFacade,
        CommonCodeFacade,
        RoleFacade,
        ResourceFacade,
        FeatureFlagFacade,
        ProductCategoryFacade,
        ServiceCategoryFacade,
        CommonCodeFacade,
        { provide: SEARCHABLE_TOKEN, useValue: DiscountFacade },
    ],
})
export class DiscountsComponent extends DataModifyingComponent implements OnInit, OnDestroy {
    @ViewChild(MatSort, { static: false }) sort: MatSort;

    @ViewChild(MatTable, { static: false }) table: MatTable<Discount>;

    private readonly _destroyed = new ReplaySubject(1);

    @ViewChild('stores', { static: false }) stores: DiscountsStoreAssignmentComponent;

    /** Form containing the value changes for the Discount. */
    form: TypedFormGroup<Discount>;

    /** default form to reset default value on type change . */
    defaultForm: TypedFormGroup<Discount>;

    /** Mode in which the page is being accessed in. */
    accessMode: AccessMode;

    /** Form containing the values for the Discount. */
    model: Discount;

    /** List used to populate the `Approach` dropdown. */
    approach$: Observable<Described[]> = EMPTY;

    /** List used to populate the `Owner` dropdown. */
    owner$: Observable<Described[]> = EMPTY;

    /** List used to populate the `Channel` dropdown. */
    channel$: Observable<Described[]> = EMPTY;

    /** List used to populate the `Discount Classification` dropdown. */
    discountClassification$: Observable<Described[]> = EMPTY;

    /** List used to populate the `Device` dropdown. */
    device$: Observable<Described[]> = EMPTY;

    /** List used to populate the `Program` dropdown. */
    program$: Observable<Described[]> = EMPTY;

    /** List used to populate the `Audience` dropdown. */
    audience$: Observable<Described[]> = EMPTY;

    /** List used to populate the `Service Offer` dropdown. */
    serviceOffer$: Observable<Described[]> = EMPTY;

    /** List used to populate the `Security Restriction` dropdown. */
    securityRestriction$: Observable<Described[]> = EMPTY;

    /** List used to populate the `Company` dropdown. */
    companies$: Observable<Described[]> = EMPTY;

    readonly category$ = new BehaviorSubject(new MatTableDataSource<TypedFormGroup<DiscountCategory>>());

    applyTo$: Observable<Described[]>;

    /** Maintains company filter value */
    initiateCompanySearch: Described;

    /** Maintains region filter value */
    initiateRegionSearch: Described;

    /** Maintains market filter value */
    initiateMarketSearch: Described;

    /** Comparison function to specify which `Described` option is displayed. */
    describedEquals = Described.idEquals;

    /** List of all roles the user has assigned to them */
    userRoles$: string[];

    /** Local Discount Add Role */
    LOCAL_DISCOUNT_ADD = 'ROLE_LOCAL_DISCOUNT_ADD';

    /** National Discount Add Role */
    NATIONAL_DISCOUNT_ADD = 'ROLE_NATIONAL_DISCOUNT_ADD';

    saveFacade: SaveFacade<Discount>;

    isLoading = false;

    constructor(
        private readonly routerService: RouterService,
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        private readonly formFactory: FormFactory,
        public readonly resourceFacade: ResourceFacade,
        public readonly messageFacade: MessageFacade,
        public readonly discountFacade: DiscountFacade,
        public readonly commonCodeFacade: CommonCodeFacade,
        private readonly changeDetector: ChangeDetectorRef,
        readonly productCategoryFacade: ProductCategoryFacade,
        readonly serviceCategoryFacade: ServiceCategoryFacade,
        public readonly roleFacade: RoleFacade
    ) {
        super();
        this.saveFacade = new SaveFacade(
            this.routerService,
            messageFacade,
            (model) => this.discountFacade.save(model),
            (discount) => `Discount ${discount.code} saved successfully`,
            (isLoading: boolean) => (this.isLoading = isLoading),
            (form: TypedFormGroup<Discount>, model: Discount): Discount => {
                return Object.assign({ ...model }, form.value);
            }
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
        const params = this.getRouteParams();
        this.accessMode = params.accessMode;
        const discountCode = params.discountCode;
        const companyCode = params.companyCode;
        this.roleFacade.getMyRoles().subscribe((response) => {
            this.userRoles$ = response;
        });
        if (this.accessMode.isView || this.accessMode.isEdit) {
            // Load data into the form
            if (isNullOrUndefined(companyCode)) {
                // national discount lookup
                this.discountFacade.findByCodeAndCompanyV2(discountCode, null).subscribe((discount: Discount) => {
                    this.model = discount;
                    this.initializeForm(this.model);
                    this.category$.next(this.initializeTable());
                });
            } else {
                // local discount lookup
                this.discountFacade
                    .findByCodeAndCompanyV2(discountCode, companyCode)
                    .subscribe((discount: Discount) => {
                        this.model = discount;
                        this.initializeForm(this.model);
                        this.category$.next(this.initializeTable());
                    });
            }
        } else if (this.accessMode.isAdd) {
            this.model = new Discount();
            this.initializeForm(this.model);
        } else {
            throw Error('Unhandled Access Mode: ' + this.accessMode?.urlSegement);
        }
    }

    changeApplyTo(event: MatSelectChange): void {
        const v = event.value;
        if (this.accessMode.isEdit && this.defaultForm?.getControlValue('type')?.code == v?.code) {
            if (v?.code !== this.discountLineItem) {
                this.form.getControl('approach').setValue(this.defaultForm.getControlValue('approach'));
                this.form.getControl('amount').setValue(this.defaultForm.getControlValue('amount'));
            }
            this.form.setControl(
                'discountCategories',
                this.formFactory.array(
                    'DiscountCategory',
                    // Appending newly added categories to the existing categories
                    this.defaultForm.getArray('discountCategories').getRawValue(),
                    this._destroyed,
                    { accessMode: this.accessMode }
                )
            );
            this.category$.next(this.initializeTable());
            this.applyValidators(v);
        } else {
            if (v?.code !== this.discountLineItem) {
                this.form.getControl('approach').reset();
                this.form.getControl('amount').reset();
                this.applyValidators(v);
            }
            const discountArray = this.form.getArray('discountCategories');
            discountArray.clear();
            this.form.markAsDirty();
        }
        // Required so validators show when applies to type changes
        this.form.markAllAsTouched();
    }

    applyValidators(value: any) {
        let typeControl = this.form.getControl('type');
        let amountControl = this.form.getControl('amount');
        let approachControl = this.form.getControl('approach');
        if (value?.code === this.discountLineItem) {
            approachControl.removeValidators(Validators.required);
            amountControl.removeValidators([Validators.required, CentralValidators.decimal({ decimalPlaces: 2 })]);
            approachControl.updateValueAndValidity();
            amountControl.updateValueAndValidity();
            this.form.getControl('discountCategories').removeValidators(Validators.required);
            this.form.addFormControlValidators('discountCategories', Validators.required);
            this.form.getArray('discountCategories').controls.forEach((c: any) => {
                const { amount, approach } = c.controls;
                amount.setValidators([Validators.required, CentralValidators.decimal({ decimalPlaces: 2 })]);
                amount.updateValueAndValidity();
                approach.setValidators(Validators.required);
                approach.updateValueAndValidity();
            });
            this.form.updateValueAndValidity();
        } else {
            if (typeControl?.value?.code === this.discountExcludeLineItem) {
                this.form.addFormControlValidators('discountCategories', Validators.required);
                this.form.updateValueAndValidity();
            } else {
                const categoriesControl = this.form.getControl('discountCategories');
                categoriesControl.removeValidators(Validators.required);
                categoriesControl.updateValueAndValidity();
            }
            this.form.getArray('discountCategories')?.controls?.forEach((c: any) => {
                const { amount, approach } = c.controls;
                amount.removeValidators([Validators.required, CentralValidators.decimal({ decimalPlaces: 2 })]);
                approach.removeValidators(Validators.required);
                approach.updateValueAndValidity();
                amount.updateValueAndValidity();
            });
            approachControl.setValidators(Validators.required);
            amountControl.setValidators([Validators.required, CentralValidators.decimal({ decimalPlaces: 2 })]);
            approachControl.updateValueAndValidity();
            amountControl.updateValueAndValidity();
            this.form.updateValueAndValidity();
        }
    }

    /** Function that supplies a query to the `ProductCategoryAddInputComponent` to searching for products to add to the Discount. */
    readonly searchProductsFn = (querySearch: QuerySearch): Observable<ResponseEntity<ProductCategory>> => {
        const activeRestriction = new SearchLine(
            Column.of({ apiFieldPath: 'active', name: 'Active', type: 'boolean' }),
            Comparators.true
        ).toQueryRestriction();
        const query = {
            ...querySearch,
            queryRestrictions: [activeRestriction].concat(querySearch.queryRestrictions),
        };
        return this.productCategoryFacade.search(query);
    };

    /** Function that supplies a query to the `ServiceCategoryAddInputComponent` to searching for services to add to the Discount. */
    readonly searchServicesFn = (querySearch: QuerySearch): Observable<ResponseEntity<ServiceCategory>> => {
        const activeRestriction = new SearchLine(
            Column.of({ apiFieldPath: 'active', name: 'Active', type: 'boolean' }),
            Comparators.true
        ).toQueryRestriction();
        const query = {
            ...querySearch,
            queryRestrictions: [activeRestriction].concat(querySearch.queryRestrictions),
        };
        return this.serviceCategoryFacade.search(query);
    };

    splitDelimitedProducts(categories: { id: number; code: string }[]): string[] {
        if (categories.length === 1 && isNullOrUndefined(categories[0].id)) {
            // user has entered product values via the product-category-add-input-component input box, which
            // can be comma delimited to enter multiple category codes
            const categoryCode = categories[0].code;
            return categoryCode.split(',').map((pc) => pc.trim());
        } else {
            return categories.map((p) => p.code);
        }
    }

    addRequestedCategories(categories: { id: number; code: string }[], type: string): void {
        this.isLoading = true;

        if (type == 'PRODUCT') {
            this.generateProductCategories(
                this.form.getArray('discountCategories').getRawValue(),
                this.splitDelimitedProducts(categories)
            );
        } else {
            this.generateServiceCategories(
                this.form.getArray('discountCategories').getRawValue(),
                this.splitDelimitedProducts(categories)
            );
        }
        this.discountCategories.markAsDirty();
    }

    /** Initialize table data source with given categories and sorting */
    initializeTable(): MatTableDataSource<TypedFormGroup<Discount>> {
        const currentSort = this.category$.value?.sort;

        const table = new MatTableDataSource<TypedFormGroup<DiscountCategory>>(
            this.discountCategories.controls as TypedFormGroup<DiscountCategory>[]
        );

        // for columns with nested properties
        table.sortingDataAccessor = (item, property) => {
            switch (property) {
                case 'discountTarget':
                    return item.getControlValue('discountTarget');
                case 'category.code':
                    return item.getControlValue('category').code;
                default:
                    return item.get(property).value;
            }
        };

        // update data source sorting to use persistent matSort
        if (currentSort) {
            this.sort = currentSort;
        }
        this.sortChange(table);
        return table;
    }

    /** Initialize form with current values. */
    private initializeForm(discount: Discount): void {
        // Build the form
        if (isNullOrUndefined(this.form)) {
            this.form = this.formFactory.group('Discount', discount, this._destroyed, {
                accessMode: this.accessMode,
                changeDetector: this.changeDetector,
            });
            this.defaultForm = this.formFactory.group('Discount', discount, this._destroyed, {
                accessMode: this.accessMode,
                changeDetector: this.changeDetector,
            });
        }
        // Configure based on access
        if (this.accessMode.isView) {
            this.approach$ = of([discount.approach].filter((e) => e));
            this.owner$ = of([discount.owner].filter((e) => e));
            this.discountClassification$ = of([discount.discountClassification].filter((e) => e));
            this.device$ = of([discount.device].filter((e) => e));
            this.channel$ = of([discount.channel].filter((e) => e));
            this.program$ = of([discount.program].filter((e) => e));
            this.audience$ = of([discount.audience].filter((e) => e));
            this.serviceOffer$ = of([discount.serviceOffer].filter((e) => e));
            this.securityRestriction$ = of([discount.securityRestriction].filter((e) => e));
            this.applyTo$ = of([discount.type].filter((e) => e));
            this.configureViewValues(discount);
            this.form.disable();
        } else if (this.accessMode.isEdit) {
            if (this.hasNationalDiscountEdit(discount) || this.hasLocalDiscountEdit(discount)) {
                this.loadDropdowns();
                this.form.markAllAsTouched(); // Displays errors for components that are loaded with invalid data
            } else {
                // The search page registers customEditRoles and we need to send in both roles to be able to edit since
                // we don't know if the user will select a local or national discount, we have to check their access and make sure
                // only 'ROLE_LOCAL_DISCOUNT_UPDATE' can edit local discounts and only 'ROLE_NATIONAL_DISCOUNT_UPDATE' can edit national
                // discounts. If the wrong role is provided for the type of discount, treat this as a view page
                this.accessMode = AccessMode.VIEW;
                this.configureViewValues(discount);
                this.form.disable();
            }
            this.loadDropdowns();
            this.form.markAllAsTouched(); // Displays errors for components that are loaded with invalid data
        } else if (this.accessMode.isAdd) {
            // Load companies based on roles
            this.companies$ = this.resourceFacade.findCompaniesByRoles(this.userRoles$).pipe(
                map((response) => response.resources),
                tap((resources) => {
                    if (resources.length === 1) {
                        this.form.setControlValue('company', resources[0]);
                    }
                })
            );
            this.loadDropdowns();
            // Validation is here since roles are required to set this validation
            if (
                !this.userRoles$.includes(this.NATIONAL_DISCOUNT_ADD) &&
                this.userRoles$.includes(this.LOCAL_DISCOUNT_ADD)
            ) {
                // If only local discount add access, company is required
                this.form.addFormControlValidators('company', Validators.required);
            }
            this.form.updateValueAndValidity();
            this.form.markAllAsTouched();
            this.changeDetector.detectChanges(); // Needed to check validity of page on load
        }
    }

    /**
     * Method that generates products for the order.
     *
     * If the existing products are provided, then the list of new products will be added to the existing products.
     * If new product codes are provided, then only products for those codes will be generated and added to the existing products.
     */
    generateProductCategories(existingCategories: DiscountCategory[] = [], newCategoryCodes: string[] = []): void {
        this.isLoading = true;
        this.productCategoryFacade
            .generateCategories(newCategoryCodes)
            .pipe(
                map((newCategories: ProductCategory[]) =>
                    newCategoryCodes.length > 0 && newCategoryCodes.length < newCategories.length
                        ? newCategories
                              // Filter to only requested products (the orderDetails endpoint can potentially return a related product)
                              .filter((product) => newCategoryCodes.includes(product.code))
                              .map((np) => this.mapGeneratedCategoryToNewCategory(np, null))
                        : newCategories.map((np) => this.mapGeneratedCategoryToNewCategory(np, null))
                ),
                map((newProducts) => {
                    const nonDuplicateProducts = newProducts.filter(
                        (pc) => !this.existingProductCategoryCodes.includes(pc.category.code)
                    );
                    if (this.existingProductCategoryCodes.length !== 0) {
                        // make newProductCategory Code only have codes of products that weren't already add
                        const duplicatedProductCodes = newProducts
                            .filter((pc) => this.existingProductCategoryCodes.includes(pc.category.code))
                            .map((pc) => pc.category.code);
                        if (duplicatedProductCodes.length > 0) {
                            this.messageFacade.addMessage({
                                severity: 'error',
                                message: `Product category code(s) ${duplicatedProductCodes.join(', ')} already added.`,
                                hasTimeout: true,
                            });
                        }
                    }

                    this.addCategoriesToForm(existingCategories, nonDuplicateProducts);
                    return this.initializeTable();
                }),
                tap(() => {
                    this.isLoading = false;
                }),
                catchError((e) => {
                    // No longer generating order but rethrow any error
                    this.isLoading = false;
                    return throwError(e);
                })
            )
            .subscribe((dataSource) => this.category$.next(dataSource));
    }

    generateServiceCategories(existingCategories: DiscountCategory[] = [], newCategoryCodes: string[] = []): void {
        this.serviceCategoryFacade
            .generateCategories(newCategoryCodes)
            .pipe(
                map((newCategories: ServiceCategory[]) =>
                    newCategoryCodes.length > 0 && newCategoryCodes.length < newCategories.length
                        ? newCategories
                              // Filter to only requested services (the orderDetails endpoint can potentially return a related product)
                              .filter((service) => newCategoryCodes.includes(service.code))
                              .map((np) => this.mapGeneratedCategoryToNewCategory(null, np))
                        : newCategories.map((np) => this.mapGeneratedCategoryToNewCategory(null, np))
                ),
                map((newCategories) => {
                    const nonDuplicateCategories = newCategories.filter(
                        (pc) => !this.existingServiceCategoryCodes.includes(pc.category.code)
                    );
                    if (this.existingServiceCategoryCodes.length !== 0) {
                        // make newServiceCode only have codes of products that weren't already add
                        const duplicatedServiceCodes = newCategories
                            .filter((pc) => this.existingServiceCategoryCodes.includes(pc.category.code))
                            .map((pc) => pc.category.code);
                        if (duplicatedServiceCodes.length > 0) {
                            this.messageFacade.addMessage({
                                severity: 'error',
                                message: `Service category code(s) ${duplicatedServiceCodes.join(', ')} already added.`,
                                hasTimeout: true,
                            });
                        }
                    }

                    this.addCategoriesToForm(existingCategories, nonDuplicateCategories);
                    return this.initializeTable();
                }),
                tap(() => {
                    this.isLoading = false;
                }),
                catchError((e) => {
                    // No longer generating Category but rethrow any error
                    this.isLoading = false;
                    return throwError(e);
                })
            )
            .subscribe((dataSource) => this.category$.next(dataSource));
    }

    private addCategoriesToForm(existingProducts: DiscountCategory[], newProducts: DiscountCategory[]): void {
        // create form array for discountCategories using generated categories
        this.form.setControl(
            'discountCategories',
            this.formFactory.array(
                'DiscountCategory',
                // Appending newly added categories to the existing categories
                existingProducts.concat(newProducts),
                this._destroyed,
                { accessMode: this.accessMode }
            )
        );

        this.applyValidators(this.form.getControlValue('type'));
        // Run validation in case the new control is empty
        this.form.getControl('discountCategories').updateValueAndValidity();
        this.discountCategories.markAsDirty();
        this.form.markAllAsTouched();
    }

    /** Remove categories based on selectionModel */
    private removeCategories(event: {
        selection: TypedFormGroupSelectionModel<DiscountCategory>;
        table: MatTable<Discount>;
    }): void {
        // iterate over selected categories to determine which are to be deleted
        event.selection.selected.forEach((productFormGroup) => {
            // find index of currently selected category in model
            const index = this.discountCategories.controls.findIndex(
                (discountCategory) =>
                    discountCategory.value.category.code === productFormGroup.value.category.code &&
                    discountCategory.value.target === productFormGroup.value.target
            );
            // remove selected currently category from model at index
            this.discountCategories.removeAt(index);
        });
        // rebuild table from updated model clear selections
        this.category$.next(this.initializeTable());
        this.discountCategories.markAsDirty();
        event.table.renderRows();
        event.selection.clear();
    }

    /** Convert a newly generated product category response to a Discount Category */
    mapGeneratedCategoryToNewCategory(
        productCategory: ProductCategory,
        serviceCategory: ServiceCategory
    ): DiscountCategory {
        // Overlaying each product response on a blank DiscountCategory to make sure all fields are initialized (including ones not included in the response)
        return {
            ...new DiscountCategory(),
            discountTarget: productCategory ? 'PRODUCT' : 'SERVICE',
            category: productCategory ? productCategory : serviceCategory,
        };
    }

    clearSelected(): void {
        // When company changes before save in add mode, clear the selected stores for assignment
        this.stores.selection.clear();
        this.changeDetector.detectChanges();
    }

    private loadDropdowns(): void {
        this.approach$ = this.commonCodeFacade.findByType('DISCOUNT_APPROACH', true);
        this.owner$ = this.commonCodeFacade.findByType('OWNER', true);
        this.discountClassification$ = this.commonCodeFacade.findByType('DISCCAT', true);
        this.device$ = this.commonCodeFacade.findByType('DEVICE', true);
        this.channel$ = this.commonCodeFacade.findByType('CHANNEL', true);
        this.program$ = this.commonCodeFacade.findByType('PROGRAM', true);
        this.audience$ = this.commonCodeFacade.findByType('AUDIENCE', true);
        this.serviceOffer$ = this.commonCodeFacade.findByType('DISCOUNT_SERVICE_OFFER', true);
        this.securityRestriction$ = this.commonCodeFacade.findByType('DISCOUNT_RESTRICTION', true);
        this.applyTo$ = this.commonCodeFacade.findByType('IAPPLIESTO', true);
    }

    private getRouteParams(): { accessMode: AccessMode; discountCode: string; companyCode: string } {
        const params = this.route.snapshot.paramMap;
        const accessMode = AccessMode.of(params.get('accessMode'));
        const discountCode = params.get('discountCode');
        const companyCode = params.get('companyCode');
        return { accessMode, discountCode, companyCode };
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

    // This is only for Add mode
    storeAssignment(): StoreDiscount[] {
        // Find selected stores to add/remove from storeDiscounts so they are assigned/unassigned in api
        let selectedStores = this.stores.selection.selected.map((store) =>
            this.mapToStoreDiscount(store.getRawValue())
        );
        // Assigning Stores makes them active
        selectedStores.forEach((storeDiscount) => {
            storeDiscount.active = true;
            // storeDiscount.id = {storeId: storeDiscount.id, discountId: this.form.getC
        });
        return selectedStores;
    }

    /** Save changes and reload the entity from the API. */
    apply(): void {
        // Used to maintain filter values after applying changes
        this.initiateCompanySearch = this.stores.companyControl.value;
        this.initiateRegionSearch = this.stores.regionControl.value;
        this.initiateMarketSearch = this.stores.marketControl.value;
        this.unassignStoreDiscountsIfInactive();
        if (this.accessMode.isAdd) {
            this.setDiscountType();
            this.setDiscountCode();
            const storeDiscounts: StoreDiscount[] = this.storeAssignment();
            // You have to remove the control and set the value for it to update, doing a patchArrayValue did not maintain updated StoreDiscount values
            this.form.removeControl('storeDiscounts');
            this.form.setControl(
                'storeDiscounts',
                this.formFactory.array('StoreDiscount', storeDiscounts, this._destroyed)
            );
        }
        const reload = () => {};
        this.saveFacade.apply(this.form, this.model, reload).subscribe(
            (createdDiscount: Discount) => {
                if (this.accessMode.isAdd) {
                    if (this.national) {
                        // Navigate to national discount edit
                        this.router.navigate([`/maintenance/discount/edit/${this.discountCode}`], {
                            relativeTo: this.route.parent,
                        });
                    } else {
                        // Navigate to local discount edit
                        this.router.navigate([`/maintenance/discount/edit/${this.companyCode}/${this.discountCode}`], {
                            relativeTo: this.route.parent,
                        });
                    }
                } else if (this.accessMode.isEdit) {
                    this.form = undefined;
                    this.ngOnInit();
                }
            },
            (error) => {
                this.messageFacade.addMessage({
                    severity: 'error',
                    message: `Discount with code ${this.discountCode} already exists.`,
                });
            }
        );
    }

    private configureViewValues(discount: Discount): void {
        this.approach$ = of([discount.approach].filter((e) => e));
        this.owner$ = of([discount.owner].filter((e) => e));
        this.discountClassification$ = of([discount.discountClassification].filter((e) => e));
        this.device$ = of([discount.device].filter((e) => e));
        this.channel$ = of([discount.channel].filter((e) => e));
        this.program$ = of([discount.program].filter((e) => e));
        this.audience$ = of([discount.audience].filter((e) => e));
        this.serviceOffer$ = of([discount.serviceOffer].filter((e) => e));
        this.securityRestriction$ = of([discount.securityRestriction].filter((e) => e));
    }

    hasNationalDiscountEdit(discount: Discount): boolean {
        return this.userRoles$.includes('ROLE_NATIONAL_DISCOUNT_UPDATE') && discount.national;
    }

    hasLocalDiscountEdit(discount: Discount): boolean {
        return this.userRoles$.includes('ROLE_LOCAL_DISCOUNT_UPDATE') && !discount.national;
    }
    /** Save and navigate back to previous page. */
    save(): void {
        this.unassignStoreDiscountsIfInactive();
        if (this.accessMode.isAdd) {
            this.setDiscountType();
            this.setDiscountCode();
            const storeDiscounts: StoreDiscount[] = this.storeAssignment();
            // You have to remove the control and set the value for it to update, doing a patchArrayValue did not maintain updated StoreDiscount values
            this.form.removeControl('storeDiscounts');
            this.form.setControl(
                'storeDiscounts',
                this.formFactory.array('StoreDiscount', storeDiscounts, this._destroyed)
            );
        }
        this.saveFacade.save(this.form, this.model, this.route).subscribe(
            (createdDiscount: Discount) => {
                // Do nothing, this option is required for the error to process if there is one
            },
            (error) => {
                this.messageFacade.addMessage({
                    severity: 'error',
                    message: `Discount with code ${this.discountCode} already exists.`,
                });
            }
        );
    }

    setDiscountType(): void {
        if (!isNullOrUndefined(this.form.getControlValue('company'))) {
            // If company is provided then it's a local discount
            this.form.patchControlValue('national', false);
        } else {
            // If company is not provided then it's a national discount
            this.form.patchControlValue('national', true);
        }
    }

    setDiscountCode(): void {
        this.form.patchControlValue('code', this.discountCodePrefix + this.discountCode);
    }

    unassignStoreDiscountsIfInactive(): void {
        // If the active flag is changed to unchecked, all stores will be unassigned at save.
        if (this.form.getControl('active').dirty && !this.form.getControlValue('active')) {
            this.form.getArrayValue('storeDiscounts').forEach((store) => {
                store.active = false;
            });
        }
    }

    ngOnDestroy(): void {
        this._destroyed.next();
    }

    /** Updates the sort order of the table data. */
    sortChange(products: MatTableDataSource<TypedFormGroup<DiscountCategory>>) {
        products.sort = this.sort;
    }

    /** @see DataModifyingComponent */
    get unsavedChanges(): boolean {
        return this.form?.dirty;
    }

    get companyCodeAndDescription(): string {
        return Described.codeAndDescriptionMapper(this.form.getControlValue('company'));
    }

    get discountType(): string {
        return this.form.getControlValue('national') ? 'National' : 'Local';
    }

    get discountCodePrefix(): string {
        if (!isNullOrUndefined(this.form.getControlValue('company'))) {
            // Local Discount prefix is the first two letters of the company code
            return this.form.getControlValue('company').code.slice(0, 2);
        } else {
            // National Discount prefix is NA
            return 'NA';
        }
    }

    get discountCode(): string {
        return this.form.getControlValue('code');
    }

    get companyCode(): string {
        return this.form.getControlValue('company').code;
    }

    get national(): boolean {
        return this.form.getControlValue('national');
    }

    get renderSelection(): boolean {
        return (
            !isNullOrUndefined(this.discountCategories) &&
            this.discountCategories.length != 0 &&
            !this.accessMode.isView
        );
    }

    get discountCategories(): FormArray {
        return this.form.getArray('discountCategories');
    }

    get existingProductCategoryCodes(): string[] {
        return this.form
            .getArrayValue('discountCategories')
            .filter((ec) => ec.discountTarget == 'PRODUCT')
            .map((ec) => ec.category.code);
    }

    get existingServiceCategoryCodes(): string[] {
        return this.form
            .getArrayValue('discountCategories')
            .filter((ec) => ec.discountTarget == 'SERVICE')
            .map((ec) => ec.category.code);
    }

    get discountLineItem(): string {
        return 'LINEITEM';
    }

    get discountExcludeLineItem(): string {
        return 'EXCLUDE_LINEITEM';
    }

    get discountInvoice(): string {
        return 'INVOICE';
    }
}
