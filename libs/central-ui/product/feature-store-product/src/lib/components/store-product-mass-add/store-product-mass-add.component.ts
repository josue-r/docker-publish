import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatStepper } from '@angular/material/stepper';
import { MatTableDataSource } from '@angular/material/table';
import { ResourceFacade } from '@vioc-angular/central-ui/organization/data-access-resources';
import { StoreSelectionComponent } from '@vioc-angular/central-ui/organization/feature-shared-store-selection';
import { Product, ProductFacade } from '@vioc-angular/central-ui/product/data-access-product';
import {
    StoreProduct,
    StoreProductFacade,
    StoreProductMassAdd,
    StoreProductMassAddPreview,
} from '@vioc-angular/central-ui/product/data-access-store-product';
import { ProductSelectionComponent } from '@vioc-angular/central-ui/product/feature-shared-product-selection';
import { QuerySearch } from '@vioc-angular/shared/common-api-models';
import { Described } from '@vioc-angular/shared/common-functionality';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { ResponseEntity } from '@vioc-angular/shared/util-api';
import { DataModifyingComponent } from '@vioc-angular/shared/util-data-modifying';
import { FormFactory, TypedFormGroup } from '@vioc-angular/shared/util-form';
import { merge, Observable, ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'vioc-angular-store-product-mass-add',
    templateUrl: './store-product-mass-add.component.html',
    styleUrls: ['./store-product-mass-add.component.scss'],
    providers: [ResourceFacade, ProductFacade, StoreProductFacade],
})
export class StoreProductMassAddComponent extends DataModifyingComponent implements OnInit, OnDestroy {
    private readonly _destroyed = new ReplaySubject();
    private readonly _reset = new Subject();

    @ViewChild('stepper', { static: true }) readonly stepper: MatStepper;
    @ViewChild('previewPaginator', { static: true }) previewPaginator: MatPaginator;
    @ViewChild('storeSelectionComponent', { static: true }) storeSelection: StoreSelectionComponent;
    @ViewChild('productSelectionComponent', { static: true }) productSelection: ProductSelectionComponent;

    form: TypedFormGroup<StoreProductMassAdd>;

    // Preview config
    preview = new MatTableDataSource<StoreProductMassAddPreview>([]);
    loadingPreview = false;
    previewDirty = false;
    readonly pageSizeOptions = [20, 50, 100, 1000];
    readonly initialPageSize = 20;

    readonly accessRoles = ['ROLE_STORE_PRODUCT_ADD'];

    private readonly _editStepIndex = 2;
    private readonly _previewStepIndex = 3;

    readonly searchStores = (querySearch: QuerySearch): Observable<ResponseEntity<Described>> =>
        this.resourceFacade.searchStoresByRoles(querySearch, this.accessRoles, 'FULL');

    readonly searchProducts = (querySearch: QuerySearch): Observable<ResponseEntity<Product>> =>
        this.productFacade.search(querySearch);

    get storesControl(): FormControl {
        return this.form.get('stores') as FormControl;
    }

    get productsControl(): FormControl {
        return this.form.get('products') as FormControl;
    }

    get storeProductControl(): FormControl {
        return this.form.get('storeProduct') as FormControl;
    }

    get useDefaultVendorControl(): FormControl {
        return this.form.get('useDefaultVendor') as FormControl;
    }

    get useDefaultReportOrderControl(): FormControl {
        return this.form.get('useDefaultReportOrder') as FormControl;
    }

    constructor(
        private readonly resourceFacade: ResourceFacade,
        private readonly productFacade: ProductFacade,
        private readonly storeProductFacade: StoreProductFacade,
        private readonly formFactory: FormFactory,
        private readonly messageFacade: MessageFacade
    ) {
        super();
    }

    ngOnInit(): void {
        this.initializeForm();
        // Setup preview loading logic
        this.stepper.selectionChange.pipe(takeUntil(this._destroyed)).subscribe((stepChange: StepperSelectionEvent) => {
            // load the preview if current preview is out of date and user is going to the edit or preview step
            if (
                this.previewDirty &&
                (stepChange.selectedIndex === this._editStepIndex ||
                    stepChange.selectedIndex === this._previewStepIndex)
            ) {
                this.previewMassAdd();
            }
        });
    }

    initializeForm(): void {
        this.form = this.formFactory.group(
            'StoreProductMassAdd',
            {
                stores: [],
                products: [],
                useDefaultVendor: undefined,
                useDefaultReportOrder: undefined,
                storeProduct: new StoreProduct(),
            },
            this._destroyed
        );
        // When selected products or stores change, mark the preview dirty so it reloads with updated values
        merge(this.productsControl.valueChanges, this.storesControl.valueChanges)
            .pipe(takeUntil(merge(this._destroyed, this._reset)))
            .subscribe(() => (this.previewDirty = true));
    }

    /**
     * Build a table out of what StoreProducts will be assigned with the selected storeIds and prodIds.
     */
    previewMassAdd() {
        const storeIds = this.storesControl.value.map(Described.idMapper);
        const prodIds = this.productsControl.value.map(Described.idMapper);
        this.loadingPreview = true; // enable loading overlay
        this.previewDirty = false; // mark preview as up to date
        this.storeProductFacade
            .previewMassAdd(storeIds, prodIds)
            // cancel preview call if component is destroyed, selected products change, or selected stores change
            .pipe(takeUntil(merge(this._destroyed, this.productsControl.valueChanges, this.storesControl.valueChanges)))
            .subscribe(
                (results) => {
                    this.preview = new MatTableDataSource<StoreProductMassAddPreview>(results);
                    this.preview.paginator = this.previewPaginator;
                    this.previewPaginator.pageIndex = 0;
                    this.loadingPreview = false;
                },
                () => (this.loadingPreview = false)
            );
    }

    /**
     * Use the given store product values and assign new StoreProducts for the selected stores and products.
     */
    addStoreProducts(): void {
        this.loadingPreview = true; // start loading overlay
        this.storeProductFacade.add(this.form.getRawValue() as StoreProductMassAdd).subscribe(
            (count) => {
                this.messageFacade.addSaveCountMessage(count, 'added');
                // Reset selections, stepper, form subscriptions, and form
                this.storeSelection.clear();
                this.productSelection.clear();
                this.stepper.reset();
                this._reset.next();
                this.initializeForm();
                this.loadingPreview = false;
            },
            (error) => {
                this.loadingPreview = false;
                throw error;
            }
        );
    }

    /** @see DataModifyingComponent */
    get unsavedChanges(): boolean {
        return this.form?.dirty;
    }

    ngOnDestroy(): void {
        this._destroyed.next();
    }
}
