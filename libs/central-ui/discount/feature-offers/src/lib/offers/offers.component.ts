import { ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonCodeFacade } from '@vioc-angular/central-ui/config/data-access-common-code';
import { OfferContent, OfferContentFacade } from '@vioc-angular/central-ui/discount/data-access-offer-content';
import { Offer, OfferFacade } from '@vioc-angular/central-ui/discount/data-access-offers';
import { ResourceFacade } from '@vioc-angular/central-ui/organization/data-access-resources';
import { SaveFacade } from '@vioc-angular/central-ui/util-component';
import { RouterService } from '@vioc-angular/central-ui/util-router';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { Described, isNullOrUndefined } from '@vioc-angular/shared/common-functionality';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { DataModifyingComponent } from '@vioc-angular/shared/util-data-modifying';
import { FormFactory, TypedFormGroup } from '@vioc-angular/shared/util-form';
import { Observable, EMPTY, ReplaySubject, of } from 'rxjs';
import { OfferStoresComponent } from '../offer-stores/offer-stores.component';
import { debounceTime, distinctUntilChanged, filter, map, takeUntil, tap } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { DialogComponent } from '@vioc-angular/shared/ui-dialog';
import { QuerySearch } from '@vioc-angular/shared/common-api-models';
import { ResponseEntity } from '@vioc-angular/shared/util-api';
import { Discount, DiscountFacade } from '@vioc-angular/central-ui/discount/data-access-discount';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
    selector: 'vioc-angular-offers',
    templateUrl: './offers.component.html',
    styleUrls: ['./offers.component.scss'],
    providers: [OfferFacade, OfferContentFacade, DiscountFacade, ResourceFacade, CommonCodeFacade],
})
export class OffersComponent extends DataModifyingComponent implements OnInit, OnDestroy {
    private readonly _destroyed = new ReplaySubject(1);

    @ViewChild('searchDialog', { static: true }) searchDialog: DialogComponent;

    @ViewChild('stores', { static: false }) stores: OfferStoresComponent;

    /**
     * Mode that determines the editable state of the page.
     */
    accessMode: AccessMode;

    /** `Offer` model that holds the values of the offer being viewed. */
    model: Offer;

    /** `Offer` form for validating and updating offer field values. */
    form: TypedFormGroup<Offer>;

    /** List of offer content types used to populate the `Offer Content Type` dropdown. */
    offerContentType$: Observable<OfferContent[]> = EMPTY;

    /** List of amount formats used to populate the `Amount Format` dropdown. */
    amountFormat$: Observable<Described[]> = EMPTY;

    /** List used to populate the `Company` dropdown. */
    companies$: Observable<Described[]> = EMPTY;

    /** Comparison function to specify which `Described` option is displayed. */
    describedEquals = Described.idEquals;

    /** Maintains region filter value */
    initiateRegionSearch: Described | undefined = undefined;

    /** Maintains market filter value */
    initiateMarketSearch: Described | undefined = undefined;

    /** FormControl is being used to display the discount code value after it is getting cleared on form recreation  */
    discountCodeControl = new FormControl('');

    /** Emits the selected/entered discount ids and codes. */
    discounts = new EventEmitter<{ id?: string; code: string }[]>();

    /** Controls the value for the discount search selection. */
    discountSelectionControl = new FormControl('');

    /** Used to maintain the selected values in the table. */
    selection = new SelectionModel<TypedFormGroup<Discount>>(true, []);

    codeAndDescriptionDisplayFn = Described.codeAndDescriptionMapper;

    saveFacade: SaveFacade<Offer>;

    discountGenerated = false;

    isLoading = false;

    constructor(
        private readonly routerService: RouterService,
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        private readonly formFactory: FormFactory,
        public readonly resourceFacade: ResourceFacade,
        public readonly messageFacade: MessageFacade,
        public readonly offerFacade: OfferFacade,
        public readonly discountFacade: DiscountFacade,
        public readonly offerContentFacade: OfferContentFacade,
        public readonly commonCodeFacade: CommonCodeFacade,
        private readonly changeDetector: ChangeDetectorRef
    ) {
        super();
        this.saveFacade = new SaveFacade(
            this.routerService,
            messageFacade,
            (model) => this.offerFacade.save(model),
            (offer) => `Offer ${offer.id ? offer.id.concat(' ') : ''}saved successfully`,
            (isLoading: boolean) => (this.isLoading = isLoading),
            (form: TypedFormGroup<Offer>, model: Offer): Offer => {
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
        const offerId = params.offerId;
        if (this.accessMode.isView || this.accessMode.isEdit) {
            // Load data into the form
            this.offerFacade.findById(offerId).subscribe((offer: Offer) => {
                this.model = offer;
                this.initializeForm(this.model);
            });
        } else if (this.accessMode.isAdd) {
            this.model = new Offer();
            this.initializeForm(this.model);
        } else {
            throw Error('Unhandled Access Mode: ' + this.accessMode?.urlSegement);
        }
    }

    /** Initialize form with current values. */
    private initializeForm(offer: Offer): void {
        // Build the form
        if (isNullOrUndefined(this.form)) {
            this.form = this.formFactory.group('Offer', offer, this._destroyed);
        }
        // Configure based on access
        if (this.accessMode.isView) {
            this.amountFormat$ = of([offer.amountFormat].filter((e) => e));
            this.offerContentType$ = this.offerContentFacade.findActive();
            this.form.disable();
        } else if (this.accessMode.isEdit) {
            this.loadDropdowns();
            this.form.markAllAsTouched(); // Displays errors for components that are loaded with invalid data
        } else if (this.accessMode.isAdd) {
            this.companies$ = this.resourceFacade.findCompaniesByRoles(['ROLE_DISCOUNT_OFFER_ADD']).pipe(
                map((response) => response.resources),
                tap((resources) => {
                    if (resources.length === 1) {
                        this.form.setControlValue('company', resources[0]);
                    }
                })
            );
            this.loadDropdowns();
            this.form.markAllAsTouched();
            this.changeDetector.detectChanges(); // Needed to check validity of page on load
        }
    }

    private getRouteParams(): { accessMode: AccessMode; offerId: string } {
        const params = this.route.snapshot.paramMap;
        const accessMode = AccessMode.of(params.get('accessMode'));
        const offerId = params.get('offerId');
        return { accessMode, offerId };
    }

    private loadDropdowns(): void {
        this.amountFormat$ = this.commonCodeFacade.findByType('OFFER_AMOUNT_FORMAT', true, {
            field: 'code',
            direction: 'asc',
        });
        this.offerContentType$ = this.offerContentFacade.findActive();
    }

    /** Function that supplies a query to the discount add searching for active discounts to add. */
    readonly searchDiscountFn = (querySearch: QuerySearch): Observable<ResponseEntity<Discount>> => {
        // active is true and endDate > today is enforced in the vioc-angular-discount-selection so it appears on the search
        const query = {
            ...querySearch,
            queryRestrictions: [].concat(querySearch.queryRestrictions),
        };
        return this.discountFacade.searchV1(query);
    };

    /** Save changes and reload the entity from the API. */
    apply(): void {
        if (this.accessMode.isEdit || this.accessMode.isView) {
            // Used to maintain filter values after applying changes
            this.initiateRegionSearch = this.stores.regionControl.value;
            this.initiateMarketSearch = this.stores.marketControl.value;
        }

        this.unassignStoreDiscountsIfInactive();
        const reload = () => {};
        if (this.accessMode.isAdd) {
            this.setDefaultValueForName();
        }
        this.saveFacade.apply(this.form, this.model, reload).subscribe(
            (createdOffer: Offer) => {
                if (!isNullOrUndefined(createdOffer) && this.accessMode.isAdd) {
                    if (this.accessMode.isAdd) {
                        this.router.navigate([`/digital/offers/edit/${createdOffer.id}`], {
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
                    message: `Discount offer for ${this.form.getControlValue('company').code} with discount code ${
                        this.form.getControlValue('discount').code
                    } and discount name ${this.form.getControlValue('name')} already exists.`,
                });
            }
        );
    }

    /** Save and navigate back to previous page. */
    save(): void {
        this.unassignStoreDiscountsIfInactive();
        if (this.accessMode.isAdd) {
            this.setDefaultValueForName();
        }
        this.saveFacade.save(this.form, this.model, this.route).subscribe(
            (createdOffer: Offer) => {
                // Do nothing, this option is required for the error to process if there is one
            },
            (error) => {
                this.messageFacade.addMessage({
                    severity: 'error',
                    message: `Discount offer for ${this.form.getControlValue('company').code} with discount code ${
                        this.form.getControlValue('discount').code
                    } and discount name ${this.form.getControlValue('name')} already exists.`,
                });
            }
        );
    }

    unassignStoreDiscountsIfInactive(): void {
        // If the active flag is changed to unchecked, all stores will be unassigned at save.
        if (this.form.getControl('active').dirty && !this.form.getControlValue('active')) {
            this.form.getArray('storeDiscounts').clear();
        }
    }

    get isDiscountSelectable(): boolean {
        return this.accessMode.isAdd && !isNullOrUndefined(this.form.getControlValue('company'));
    }

    setDefaultValueForName(): void {
        this.form.patchControlValue('name', this.form.getControlValue('offerContent').name);
    }

    openSearchDialog(): void {
        this.searchDialog.open();

        this.searchDialog.dialogRef
            .afterClosed()
            .pipe(takeUntil(this._destroyed))
            .subscribe(() => this.discountSelectionControl.reset());
    }

    /** Validates that discount(s) are selected in the discount search dialog. */
    isSelected(): boolean {
        return this.discountSelectionControl.value?.length > 0;
    }

    /** Adds the selected discounts from the discount code input. */
    addDiscountFromInput(): void {
        this.isLoading = true;
        const addedDiscount = this.discountCodeControl.value;
        this.discountFacade.findByCodeAndCompany(addedDiscount, this.form.getControlValue('company').code).subscribe(
            (discount) => {
                this.form.patchControlValue('discount', discount);
                this.discountCodeControl.disable();
                this.discountGenerated = true;
                this.isLoading = false;
                this.changeDetector.detectChanges();
            },
            (error) => {
                this.messageFacade.addMessage({
                    severity: 'error',
                    message: `Discount ${this.discountCodeControl.value} not found for Company ${
                        this.form.getControlValue('company').code
                    }`,
                });
                this.isLoading = false;
                this.changeDetector.detectChanges();
            }
        );
    }

    /** Adds the selected discounts from the search dialog selection. */
    addDiscountFromSearch(): void {
        const addedDiscounts: Discount = this.discountSelectionControl.value as Discount;
        if (!isNullOrUndefined(addedDiscounts)) {
            // Using the selectionControl returns an array, for discounts there is only allowed to be one discount selected so location will always be 0
            const addedDiscountLocation = 0;
            this.discountCodeControl.patchValue(addedDiscounts[addedDiscountLocation].code);
            this.changeDetector.detectChanges();
            this.addDiscountFromInput();
            this.closeSearchDialog();
        }
    }

    closeSearchDialog(): void {
        this.searchDialog.close();
    }

    get pendingDiscountGeneration(): boolean {
        return this.accessMode.isAdd && !this.discountGenerated;
    }

    get pendingOfferContentTypeSelection(): boolean {
        return isNullOrUndefined(this.form.getControlValue('offerContent'));
    }

    /** @see DataModifyingComponent */
    get unsavedChanges(): boolean {
        return this.form?.dirty;
    }

    get companyCodeAndDescription(): string {
        return Described.codeAndDescriptionMapper(this.form.getControlValue('company'));
    }

    get discountCode(): string {
        const discount = this.form.getControlValue('discount');
        return discount ? `${discount.code}` : '';
    }

    get discountDescription(): string {
        const discount = this.form.getControlValue('discount');
        return discount ? `${discount.description}` : '';
    }

    get startDate(): string {
        const discount = this.form.getControlValue('discount');
        return discount ? `${discount.startDate}` : '';
    }

    get endDate(): string {
        const discount = this.form.getControlValue('discount');
        return discount ? `${discount.endDate}` : '';
    }

    get discountType(): string {
        const discount = this.form.getControlValue('discount');
        return Described.codeAndDescriptionMapper(discount.type);
    }

    get offerContentDisclaimerShortText(): string {
        const offerContent = this.form.getControlValue('offerContent');
        return !isNullOrUndefined(offerContent.disclaimerShortText) ? `${offerContent.disclaimerShortText}` : '';
    }

    get offerContentConditions(): string {
        const offerContent = this.form.getControlValue('offerContent');
        return !isNullOrUndefined(offerContent.conditions) ? `${offerContent.conditions}` : '';
    }

    ngOnDestroy(): void {
        this._destroyed.next();
    }
}
