import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonCodeFacade } from '@vioc-angular/central-ui/config/data-access-common-code';
import { VendorFacade } from '@vioc-angular/central-ui/inventory/data-access-vendor';
import { ResourceFacade } from '@vioc-angular/central-ui/organization/data-access-resources';
import {
    StoreProduct,
    StoreProductFacade,
    StoreProductMassAdd,
} from '@vioc-angular/central-ui/product/data-access-store-product';
import { SaveFacade } from '@vioc-angular/central-ui/util-component';
import { RouterService } from '@vioc-angular/central-ui/util-router';
import { RoleFacade } from '@vioc-angular/security/data-access-security';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { Described, isNullOrUndefined } from '@vioc-angular/shared/common-functionality';
import { Loggers } from '@vioc-angular/shared/common-logging';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { DataModifyingComponent } from '@vioc-angular/shared/util-data-modifying';
import { FormFactory, TypedFormGroup } from '@vioc-angular/shared/util-form';
import { Observable, of, ReplaySubject } from 'rxjs';
import { debounceTime, filter, map, takeUntil, tap } from 'rxjs/operators';
import { StoreProductModuleForms } from '../store-product-module-forms';

@Component({
    selector: 'vioc-angular-store-product',
    templateUrl: './store-product.component.html',
    styleUrls: ['./store-product.component.scss'],
    providers: [CommonCodeFacade, ResourceFacade, StoreProductFacade, VendorFacade],
})
export class StoreProductComponent extends DataModifyingComponent implements OnInit, OnDestroy {
    private readonly logger = Loggers.get('central-ui', 'StoreProductComponent');

    private readonly _destroyed = new ReplaySubject(1);

    accessMode: AccessMode;

    form: TypedFormGroup<StoreProduct>;

    @Input() massAddForm: TypedFormGroup<StoreProductMassAdd>;

    model: StoreProduct;

    vendorList: Observable<Described[]>;

    frequencyList: Observable<Described[]>;

    describedEquals = Described.idEquals;

    minOrderQuantityErrorMapping = StoreProductModuleForms.minOrderQuantityErrorMapping;

    saveFacade: SaveFacade<StoreProduct>;

    hasAddAccess = false;

    isLoading = false;

    availableStores: Observable<Described[]>;

    private readonly vendorSortFn = (vendors: Described[]) => [...vendors].sort(Described.descriptionComparator);
    private readonly vendorClearFn = (vendors: Described[]) => {
        // clear out selected vendor if it's not an available vendor
        const selectedVendor = this.form.getControlValue('vendor');
        if (selectedVendor && vendors.map((v) => v.id).indexOf(selectedVendor.id) === -1) {
            this.logger.debug('Selected vendor not available. Clearing form value.');
            this.form.patchControlValue('vendor', null);
        }
    };

    constructor(
        private readonly router: Router,
        private readonly route: ActivatedRoute,
        private readonly routerService: RouterService,
        private readonly formFactory: FormFactory,
        private readonly roleFacade: RoleFacade,
        readonly storeProductFacade: StoreProductFacade,
        private readonly commonCodeFacade: CommonCodeFacade,
        private readonly vendorFacade: VendorFacade,
        private readonly messageFacade: MessageFacade,
        private readonly changeDetector: ChangeDetectorRef
    ) {
        super();
        // this will trigger a reload of the component when the parameters change i.e. switching from edit to clone etc
        this.route.params.pipe(takeUntil(this._destroyed)).subscribe(() => {
            // only run ngOnInit if the component is already initialized, otherwise when
            // the component is first created ngOnInit will run twice
            if (this.accessMode) {
                this.form = undefined;
                this.ngOnInit();
            }
        });
        this.saveFacade = new SaveFacade(
            routerService,
            messageFacade,
            (model) => this.storeProductFacade.update(model),
            (sp) => `Store Product ${sp.store.code} - ${sp.product.code} saved successfully`,
            (isLoading: boolean) => (this.isLoading = isLoading)
        );
    }

    ngOnInit(): void {
        this.determineAccessMode();
        this.logger.debug(`Initializing for ${this.accessMode.urlSegement}.`);
        this.roleFacade
            .hasAnyRole(['ROLE_STORE_PRODUCT_ADD'])
            .subscribe((hasAddRole) => (this.hasAddAccess = hasAddRole));
        if (this.accessMode.isAdd) {
            // Mass-add: the form has already been created in the mass-add component.
            this.form = this.massAddForm.getControl('storeProduct') as TypedFormGroup<StoreProduct>;
            this.model = this.form.getRawValue();
            // Update vendor dropdown whenever the selected stores change
            this.massAddForm
                .getControl('stores')
                .valueChanges.pipe(
                    takeUntil(this._destroyed),
                    debounceTime(500),
                    filter((stores) => Array.isArray(stores) && stores.length > 0)
                )
                .subscribe(() => this.loadVendors());
            this.initializeForm();
        } else {
            // View/edit/add-like
            const store = this.route.snapshot.paramMap.get('storeNum');
            const code = this.route.snapshot.paramMap.get('productCode');
            this.storeProductFacade
                .findByStoreAndProduct(store, code) //
                .subscribe((response) => {
                    this.model = response;
                    this.initializeForm();
                });
        }
    }

    private determineAccessMode(): void {
        if (this.massAddForm) {
            // massAddForm input will be set if mass-adding
            this.accessMode = AccessMode.ADD;
        } else {
            this.accessMode = AccessMode.of(this.route.snapshot.paramMap.get('accessMode'));
        }
    }

    /**
     * Initializing the form with the current store product values as well as setting up validation and disabled fields.
     */
    private initializeForm(): void {
        // Build the form if needed
        if (isNullOrUndefined(this.form)) {
            this.form = this.formFactory.group('StoreProduct', this.model, this._destroyed, {
                changeDetector: this.changeDetector,
                accessMode: this.accessMode,
            });
        }
        // Configure based on accessibility
        if (this.accessMode.isView) {
            this.form.disable();
            // For view mode, prevent external calls and use array of set account value or empty array
            this.frequencyList = of([this.model.countFrequency].filter((e) => e));
            this.vendorList = of([this.model.vendor].filter((e) => e));
            this.availableStores = of([this.model.store]);
        } else if (this.accessMode.isEdit) {
            this.loadDropdowns();
            this.availableStores = of([this.model.store]);
            this.form.markAllAsTouched(); // Displays errors for components that are loaded with invalid data
        } else if (this.accessMode.isAddLike) {
            this.loadDropdowns();
            // update vendors on store change
            this.storeControl.valueChanges.pipe(takeUntil(this._destroyed)).subscribe(() => this.loadVendors());
            // look for stores available for the product
            this.availableStores = this.storeProductFacade.findAssignableStores(this.productCode);
        } else if (this.accessMode.isAdd) {
            this.loadDropdowns();
        } else {
            throw Error('Unhandled Access Mode: ' + this.accessMode);
        }
    }

    private loadDropdowns(): void {
        this.frequencyList = this.commonCodeFacade.findByType('COUNTFREQ', true);
        this.loadVendors();
    }

    private loadVendors(): void {
        // If mass-add, get stores from the stores control, otherwise use the store product form's store
        if (this.massAddForm) {
            const storeCodes = this.massAddForm.getControlValue('stores').map(Described.codeMapper);
            this.vendorList = this.vendorFacade
                .findByStores(storeCodes)
                .pipe(map(this.vendorSortFn), tap(this.vendorClearFn));
        } else if (this.form.getControlValue('store')) {
            this.vendorList = this.vendorFacade
                .findByStore(this.storeCode)
                .pipe(map(this.vendorSortFn), tap(this.vendorClearFn));
        } else {
            // Store can be empty for add-like without a selected store
            this.vendorList = of([]);
        }
    }

    get storeControl(): AbstractControl {
        return this.form.getControl('store');
    }

    get productDescription(): string {
        return this.model.product ? Described.codeMapper(this.model.product) : '';
    }

    get productCategoryDescription(): string {
        return this.model.product && this.model.product.productCategory
            ? Described.codeMapper(this.model.product.productCategory)
            : '';
    }

    get productInvoiceDescription(): string {
        return this.model.product ? Described.descriptionMapper(this.model.product) : '';
    }

    get uom(): string {
        return this.model.companyProduct ? Described.descriptionMapper(this.model.companyProduct.uom) : '';
    }

    get storeCode(): string {
        return this.form.getControlValue('store') ? Described.codeMapper(this.form.getControlValue('store')) : '';
    }

    get productCode(): string {
        return this.form.getControlValue('product') ? Described.codeMapper(this.form.getControlValue('product')) : '';
    }

    /**
     * A warning should show if the safetyFactorOverride is between 0 and 1.
     */
    get showSafetyFactorWarning(): boolean {
        const safetyFactor = this.form.getControlValue('safetyFactorOverride');
        return !isNullOrUndefined(safetyFactor) && safetyFactor > 0 && safetyFactor < 1;
    }

    /** Try to guess what the user meant to enter for the safetyFactoryWarning */
    get safetyFactorWarningMessage(): string {
        const actual = this.form.getControlValue('safetyFactorOverride');
        const didYouMean = actual * 100;
        return `This should usually be a value greater than 1. If you are wanting ${didYouMean}%, enter ${didYouMean} instead of ${actual}`;
    }

    addLike(): void {
        this.router.navigate(['/maintenance/store-product/add-like', this.storeCode, this.productCode]);
    }

    /**
     * Saves and allows continued editing.
     */
    apply(): void {
        if (this.accessMode.isAddLike) {
            // navigate to the edit page of the newly added product
            this.addProduct((storeCode, productCode) =>
                this.router.navigate(['../../..', AccessMode.EDIT.urlSegement, storeCode, productCode], {
                    relativeTo: this.route,
                })
            );
        } else {
            const reload = () => {
                this.form = undefined;
                this.ngOnInit();
            };
            this.saveFacade.apply(this.form, this.model, reload).subscribe();
        }
    }

    /**
     * Saves the values of the model.
     */
    save(): void {
        if (this.accessMode.isAddLike) {
            // navigate back (probably the edit page of the cloned product)
            this.addProduct(() => this.routerService.back());
        } else {
            this.saveFacade.save(this.form, this.model, this.route).subscribe();
        }
    }

    private addProduct(redirectFn: (storeCode: string, productCode: string) => void) {
        const productCode = this.productCode;
        const storeCode = this.storeCode;
        const storeProductAdd: StoreProductMassAdd = {
            stores: [this.form.getControlValue('store')],
            products: [this.form.getControlValue('product')],
            storeProduct: this.form.getRawValue(),
        };
        this.form.markAsPristine(); // prevent dirty message
        this.form = undefined; // add loading overlay
        this.storeProductFacade.add(storeProductAdd).subscribe(() => {
            this.messageFacade.addMessage({
                severity: 'success',
                message: `Successfully added ${productCode} to store ${storeCode}.`,
            });
            redirectFn(storeCode, productCode);
        });
    }

    /**
     * @see DataModifyingComponent
     */
    get unsavedChanges(): boolean {
        return this.form && this.form.dirty;
    }

    ngOnDestroy(): void {
        this._destroyed.next();
        this._destroyed.unsubscribe();
    }
}
