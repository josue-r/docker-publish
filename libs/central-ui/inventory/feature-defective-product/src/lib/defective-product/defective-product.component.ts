import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonCodeFacade } from '@vioc-angular/central-ui/config/data-access-common-code';
import { ParameterFacade } from '@vioc-angular/central-ui/config/data-access-parameter';
import {
    DefectiveProduct,
    DefectiveProductFacade,
} from '@vioc-angular/central-ui/inventory/data-access-defective-product';
import { VendorFacade } from '@vioc-angular/central-ui/inventory/data-access-vendor';
import { ResourceFacade } from '@vioc-angular/central-ui/organization/data-access-resources';
import { StoreProduct, StoreProductFacade } from '@vioc-angular/central-ui/product/data-access-store-product';
import { SaveFacade } from '@vioc-angular/central-ui/util-component';
import { RouterService } from '@vioc-angular/central-ui/util-router';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { QuerySearch, QuerySort, SearchLine } from '@vioc-angular/shared/common-api-models';
import { Described, formatMoment } from '@vioc-angular/shared/common-functionality';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { DialogComponent } from '@vioc-angular/shared/ui-dialog';
import { ResponseEntity } from '@vioc-angular/shared/util-api';
import { Column, Comparators } from '@vioc-angular/shared/util-column';
import { DataModifyingComponent } from '@vioc-angular/shared/util-data-modifying';
import { FormFactory, TypedFormGroup } from '@vioc-angular/shared/util-form';
import * as moment from 'moment';
import { EMPTY, Observable, of, ReplaySubject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';

@Component({
    selector: 'vioc-angular-defective-product',
    templateUrl: './defective-product.component.html',
    styleUrls: ['./defective-product.component.scss'],
    providers: [
        DefectiveProductFacade,
        StoreProductFacade,
        CommonCodeFacade,
        ResourceFacade,
        VendorFacade,
        ParameterFacade,
    ],
})
export class DefectiveProductComponent extends DataModifyingComponent implements OnInit, OnDestroy {
    private readonly _destroyed = new ReplaySubject(1);

    accessMode: AccessMode;

    /** `DefectiveProduct` model that holds the values of the receipt of material being viewed. */
    model: DefectiveProduct;

    /** `DefectiveProduct` form for validating and updating receipt of material field values. */
    form: TypedFormGroup<DefectiveProduct>;

    isLoading = false;

    /** List used to populate the `Store` dropdown. */
    store$: Observable<Described[]> = EMPTY;

    /** List used to populate the `VendorType` dropdown. */
    vendor$: Observable<Described[]> = of([]);

    /** List used to populate the `Reason` dropdown. */
    reasonType$: Observable<Described[]> = EMPTY;

    productCode: string;

    productGenerated = false;

    readonly defaultSorts: QuerySort[];

    addDisabled = true;

    storeProductModel: StoreProduct;

    finalizeFacade: SaveFacade<DefectiveProduct>;

    finalizedStatus = false;

    /** FormControl is being used to display the product code value after it is getting cleared on form recreation  */
    productCodeControl = new FormControl('');

    /** Function used to trigger a search for the product search dialog. */
    @Input() searchFn: (querySearch: QuerySearch) => Observable<ResponseEntity<StoreProduct>>;

    /** dialog for finalization confirmation */
    @ViewChild('finalizeDefectiveDialog', { static: true }) finalizeDialog: DialogComponent;

    describedEquals = Described.idEquals;

    descriptionDisplayFn = Described.descriptionMapper;

    codeAndDescriptionDisplayFn = Described.codeAndDescriptionMapper;

    private readonly buildRequestObjectFn = (form: TypedFormGroup<DefectiveProduct>, model: DefectiveProduct) => {
        const updatedModel: DefectiveProduct = Object.assign({ ...model }, form.value);
        if (this.accessMode.isAdd) {
            // Include  disabled fields
            updatedModel.store = form.getControlValue('store');
        }
        return updatedModel;
    };
    constructor(
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        private readonly formFactory: FormFactory,
        private readonly routerService: RouterService,
        public readonly defectiveProductFacade: DefectiveProductFacade,
        public readonly storeProductFacade: StoreProductFacade,
        public readonly messageFacade: MessageFacade,
        public readonly commonCodeFacade: CommonCodeFacade,
        public readonly resourceFacade: ResourceFacade,
        public readonly vendorFacade: VendorFacade,
        public readonly parameterFacade: ParameterFacade
    ) {
        super();
        this.finalizeFacade = new SaveFacade(
            this.routerService,
            messageFacade,
            (model) => this.defectiveProductFacade.finalize(model),
            (dp) => `Defective Product ${dp.id ? dp.id + ' ' : ''}finalized successfully`,
            (isLoading: boolean) => (this.isLoading = isLoading),
            this.buildRequestObjectFn
        );
    }

    ngOnInit(): void {
        const params = this.getRouteParams(this.route);
        this.accessMode = params.accessMode;
        this.isLoading = false;
        if (this.accessMode.isAdd) {
            this.model = new DefectiveProduct();
            this.createForm(this.model);
        } else if (this.accessMode.isView || this.accessMode.isEdit) {
            this.getDefectiveProduct(params);
        } else {
            throw Error(`Unhandled Access Mode: ${this.accessMode.urlSegement}`);
        }
    }

    private getRouteParams(route: ActivatedRoute): { accessMode: AccessMode; storeCode: string; defectId: string } {
        const params = route.snapshot.paramMap;
        const accessMode = AccessMode.of(params.get('accessMode'));
        const storeCode = params.get('storeCode');
        const defectId = params.get('defectId');
        return { accessMode, storeCode, defectId };
    }

    private getDefectiveProduct(params: any) {
        this.defectiveProductFacade
            .getDefectiveProduct(params.storeCode, params.defectId)
            .pipe(
                switchMap((defectiveProduct: DefectiveProduct) =>
                    this.storeProductFacade
                        .findByStoreAndProducts(params.storeCode, [defectiveProduct.storeProduct.product.code])
                        .pipe(
                            map((inventoryDetails: StoreProduct[]) => {
                                this.createDefectiveProduct(inventoryDetails, defectiveProduct);
                            })
                        )
                )
            )
            .subscribe();
    }

    private createDefectiveProduct(inventoryDetails: StoreProduct[], defectiveProduct: DefectiveProduct) {
        this.model = defectiveProduct;
        this.storeProductModel = defectiveProduct.storeProduct;
        inventoryDetails.forEach((inventoryDetail) => {
            this.storeProductModel.companyProduct = this.mapUomToProduct(inventoryDetail).companyProduct;
        });
        this.storeProductModel.vendor = defectiveProduct.vendor;
        defectiveProduct.store = defectiveProduct.storeProduct.store;
        defectiveProduct.reason = defectiveProduct.defectProductReason;
        this.productCode = defectiveProduct.storeProduct.product.code;
        this.createForm(defectiveProduct);
    }

    private createForm(defectiveProduct: DefectiveProduct): void {
        this.form = this.formFactory.group('DefectiveProduct', defectiveProduct, this._destroyed, {
            defectiveProductFacade: this.defectiveProductFacade,
            accessMode: this.accessMode,
        });
        /** Form is disabled  for both edit and view mode as there is no edit functionality in defective product.*/
        if (this.accessMode.isEdit || this.accessMode.isView) {
            this.reasonType$ = of([defectiveProduct.defectProductReason].filter((e) => e));
            this.store$ = of([defectiveProduct.storeProduct.store].filter((e) => e));
            this.form.disable();
        } else if (this.accessMode.isAdd) {
            this.form
                .getControl('store')
                .valueChanges.pipe(
                    debounceTime(200),
                    takeUntil(this._destroyed),
                    filter((store) => store !== null),
                    distinctUntilChanged()
                )
                .subscribe((store: Described) => {
                    this.vendor$ = this.vendorFacade.findByStore(store.code);
                    this.addDisabled = false;
                });
            this.reasonType$ = this.commonCodeFacade.findByType('PRODUCT_DEFECT_REASON');
            this.store$ = this.resourceFacade.findStoresByRoles(['ROLE_DEFECTIVE_PRODUCT_ADD']).pipe(
                map((response) => response.resources),
                tap((resources) => {
                    if (resources.length === 1) {
                        this.form.setControlValue('store', resources[0]);
                    }
                })
            );
        }
    }
    get pendingProductGeneration(): boolean {
        return this.accessMode.isAdd && !this.productGenerated;
    }

    generateProduct(products: DefectiveProduct): void {
        /** Creates Form to set validators on product load value change */
        this.form = this.formFactory.group('DefectiveProduct', products, this._destroyed, {
            defectiveProductFacade: this.defectiveProductFacade,
            accessMode: this.accessMode,
        });
        this.productGenerated = true;
        this.form.getControl('store').disable();
        /** Setting the value of product code as it is being cleared after form recreation in product add input */
        this.productCodeControl.setValue(this.storeProductModel?.product.code);
        this.form.markAllAsTouched();
    }

    /** Function that supplies a query to the `ProductAddInputComponent` to searching for products to add to the receipt. */
    readonly searchProductFn = (querySearch: QuerySearch): Observable<ResponseEntity<StoreProduct>> => {
        const store = new SearchLine(
            Column.of({ apiFieldPath: 'store.code', name: 'Store', type: 'string' }),
            Comparators.equalTo,
            this.form.getControlValue('store').code
        ).toQueryRestriction();
        const active = new SearchLine(
            Column.of({ apiFieldPath: 'active', name: 'Active', type: 'boolean' }),
            Comparators.true
        ).toQueryRestriction();
        const valvolineDistributor = new SearchLine(
            Column.of({ apiFieldPath: 'vendor.valvolineDistributor', name: 'ValvolineDistributor', type: 'boolean' }),
            Comparators.true
        ).toQueryRestriction();
        const obsolete = new SearchLine(
            Column.of({ apiFieldPath: 'product.obsolete', name: 'Obsolete', type: 'boolean' }),
            Comparators.falseOrBlank
        ).toQueryRestriction();
        const query = {
            ...querySearch,
            queryRestrictions: [store, active, valvolineDistributor, obsolete].concat(querySearch.queryRestrictions),
        };
        return this.storeProductFacade.search(query);
    };

    addProducts(products: { code: string }[]): void {
        // Map the store products to DefectiveProducts
        this.isLoading = true;
        this.addDisabled = false;
        const productCodes = products.map((p) => p.code);
        this.storeProductFacade
            .findByStoreAndProducts(this.storeNumber, productCodes)
            .pipe(
                map((inventoryDetails: any[]) =>
                    inventoryDetails
                        // Filter to only requested products (the inventoryDetails endpoint can potentially return a related product)
                        .filter((inventoryDetail) => productCodes.includes(inventoryDetail.code))
                        .map((inventoryDetail) => this.mapInventoryDetailToProduct(inventoryDetail))
                )
            )
            .subscribe(
                (newProducts) => {
                    this.generateDefectiveProduct(newProducts, productCodes);
                },
                (error) => {
                    this.isLoading = false;
                    throw error;
                }
            );
    }

    generateDefectiveProduct(newProducts: StoreProduct[], productCodes: string[]) {
        // Show error message if not all requested products were found
        if (newProducts.length < productCodes.length) {
            const missingCodes = productCodes.filter((productCode) =>
                newProducts.every((rp) => rp.product.code !== productCode)
            );
            this.messageFacade.addMessage({
                severity: 'error',
                message: `Unable to add requested product: ${missingCodes}.`,
                hasTimeout: true,
            });
            this.productCodeControl.setValue(this.storeProductModel?.product.code);
        } else {
            this.productReset();
            this.storeProductModel = newProducts[0];
            if (this.storeProductValidation(this.storeProductModel)) {
                this.form.setControlValue('vendor', this.storeProductModel?.vendor);
                this.form.setControlValue('product', this.storeProductModel?.product);
                this.form.setControlValue('storeProduct', this.storeProductModel);
                this.generateProduct(this.form.getRawValue());
            }
        }
        this.form.markAsDirty();
        this.isLoading = false;
    }

    storeProductValidation(storeProductModel: StoreProduct): boolean {
        if (!this.storeProductModel.active) {
            this.messageFacade.addMessage({
                severity: 'error',
                message: `Only active product is allowed.`,
                hasTimeout: true,
            });
            return false;
        }
        return true;
    }

    productReset(): void {
        this.productGenerated = false;
        this.form.getControl('quantity').reset();
        this.form.getControl('reason').reset();
        this.form.getControl('comments').reset();
    }

    private mapUomToProduct(inventoryDetail: any): StoreProduct {
        return {
            ...new StoreProduct(),
            companyProduct: {
                uom: inventoryDetail.uom,
            },
        };
    }

    private mapInventoryDetailToProduct(inventoryDetail: any): StoreProduct {
        return {
            ...new StoreProduct(),
            wholesalePrice: inventoryDetail.wholesalePrice,
            maxStockLimit: inventoryDetail.maxStockLimit,
            product: {
                id: inventoryDetail.id.productId,
                code: inventoryDetail.code,
                description: inventoryDetail.description,
            },
            companyProduct: {
                uom: inventoryDetail.uom,
            },
            vendor: {
                id: inventoryDetail.vendor.id,
                code: inventoryDetail.vendor.code,
                description: inventoryDetail.vendor.description,
                valvolineDistributor: inventoryDetail.vendor.valvolineDistributor,
            },
            quantityOnHand: inventoryDetail.quantityOnHand,
            averageDailyUsage: inventoryDetail.averageDailyUsage,
            active: inventoryDetail.active,
        };
    }

    finalize(): void {
        this.closeFinalizeDialog();
        this.finalizeFacade.save(this.form, this.model, this.route).subscribe();
    }
    openFinalizeDialog(): void {
        this.finalizeDialog.open();
    }
    closeFinalizeDialog(): void {
        this.finalizeDialog.close();
    }

    get existingProductCodes(): string[] {
        return this.storeProductModel?.product?.code ? [this.storeProductModel?.product?.code] : [];
    }
    get productDescription(): string {
        return this.storeProductModel?.product ? Described.descriptionMapper(this.storeProductModel?.product) : '';
    }

    get vendorDescription(): string {
        return this.storeProductModel?.vendor?.description;
    }
    get uom(): string {
        return this.storeProductModel?.companyProduct
            ? Described.descriptionMapper(this.storeProductModel?.companyProduct?.uom)
            : '';
    }

    get defectDate(): any {
        if (this.accessMode.isAdd) {
            return formatMoment(moment().startOf('day'), true);
        } else {
            return formatMoment(this.form.getControl('defectDate').value, true);
        }
    }

    get storeNumber(): string {
        const store = this.form.getControlValue('store');
        return store ? `${store.code}` : '';
    }

    get isStoreEditable(): boolean {
        return this.accessMode.isAdd;
    }

    get isProductEditable(): boolean {
        return this.isStoreEditable && this.form.getControl('store').valid;
    }

    get unsavedChanges(): boolean {
        return this.form && this.form.dirty;
    }
    ngOnDestroy(): void {
        this._destroyed.next();
    }
}
