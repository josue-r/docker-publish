import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonCodeFacade } from '@vioc-angular/central-ui/config/data-access-common-code';
import {
    ProductAdjustment,
    ProductAdjustmentDetail,
    ProductAdjustmentFacade,
} from '@vioc-angular/central-ui/inventory/data-access-product-adjustment';
import { ResourceFacade, Resources } from '@vioc-angular/central-ui/organization/data-access-resources';
import { StoreProduct, StoreProductFacade } from '@vioc-angular/central-ui/product/data-access-store-product';
import { SaveFacade } from '@vioc-angular/central-ui/util-component';
import { RouterService } from '@vioc-angular/central-ui/util-router';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { QuerySearch, SearchLine } from '@vioc-angular/shared/common-api-models';
import { Described, isNullOrUndefined } from '@vioc-angular/shared/common-functionality';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { RouterHistoryFacade } from '@vioc-angular/shared/data-access-router-history';
import { DialogComponent } from '@vioc-angular/shared/ui-dialog';
import { ResponseEntity } from '@vioc-angular/shared/util-api';
import { Column, Comparators } from '@vioc-angular/shared/util-column';
import { DataModifyingComponent } from '@vioc-angular/shared/util-data-modifying';
import { FormFactory, TypedFormGroup } from '@vioc-angular/shared/util-form';
import { EMPTY, Observable, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'vioc-angular-product-adjustment',
    templateUrl: './product-adjustment.component.html',
    styleUrls: ['./product-adjustment.component.scss'],
    providers: [ProductAdjustmentFacade, ResourceFacade, StoreProductFacade, CommonCodeFacade],
})
export class ProductAdjustmentComponent extends DataModifyingComponent implements OnInit, OnDestroy {
    private readonly _destroyed = new ReplaySubject(1);

    readonly accessRoles = ['ROLE_PRODUCT_ADJUSTMENT_ADD'];

    /** Dialog used to confirm if user wishes to finalize adjustment */
    @ViewChild('finalizeAdjustmentDialog', { static: true }) finalizeDialog: DialogComponent;

    /** Mode that determines state of the page */
    accessMode: AccessMode;

    /** Model that holds values of the Adjustment and its products */
    model: ProductAdjustment;

    /** Form that handles validating and updating adjustment fields */
    form: TypedFormGroup<ProductAdjustment>;

    stores$: Observable<Resources>;

    /** List used to populate the `Reason` dropdown. */
    reasonType$: Observable<Described[]> = EMPTY;

    isLoading = false;

    addProductError = '';

    saveFacade: SaveFacade<ProductAdjustment>;

    finalizeFacade: SaveFacade<ProductAdjustment>;

    storeProductModel: StoreProduct;

    reasonArray: any[];

    describedEquals = Described.idEquals;

    /** Function that supplies a query to the `ProductAddInputComponent` to searching for products to add to the adjustment. */
    readonly searchProductsFn = (querySearch: QuerySearch): Observable<ResponseEntity<StoreProduct>> => {
        const storeCodeRestriction = new SearchLine(
            Column.of({ apiFieldPath: 'store.code', name: 'Store', type: 'string' }),
            Comparators.equalTo,
            this.form.getControlValue('store').code
        ).toQueryRestriction();
        const isActiveRestriction = new SearchLine(
            Column.of({ apiFieldPath: 'active', name: 'Active', type: 'boolean' }),
            Comparators.true
        ).toQueryRestriction();
        const obsoleteProductRestriction = new SearchLine(
            Column.of({ apiFieldPath: 'product.obsolete', name: 'Obsolete', type: 'boolean' }),
            Comparators.falseOrBlank
        ).toQueryRestriction();
        const query = {
            ...querySearch,
            queryRestrictions: [storeCodeRestriction, isActiveRestriction, obsoleteProductRestriction].concat(
                querySearch.queryRestrictions
            ),
        };
        return this.storeProductFacade.search(query);
    };

    constructor(
        private readonly productAdjustmentFacade: ProductAdjustmentFacade,
        private readonly resourceFacade: ResourceFacade,
        private readonly routerService: RouterService,
        private readonly formFactory: FormFactory,
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        readonly routerHistoryFacade: RouterHistoryFacade,
        public readonly storeProductFacade: StoreProductFacade,
        private readonly commonCodeFacade: CommonCodeFacade,
        readonly messageFacade: MessageFacade
    ) {
        super();
        this.finalizeFacade = new SaveFacade(
            this.routerService,
            messageFacade,
            (model) => this.productAdjustmentFacade.finalize(model),
            (it) => `Product Adjustment ${it.id ? it.id.toString().concat(' ') : ''}finalized successfully`,
            (isLoading: boolean) => (this.isLoading = isLoading),
            (form: TypedFormGroup<ProductAdjustment>, model: ProductAdjustment): ProductAdjustment => {
                const updatedModel: ProductAdjustment = Object.assign({ ...model }, form.value);
                if (this.accessMode.isAdd) {
                    // Include newly selected, but disabled, ProductAdjustment fields that aren't included in the model
                    updatedModel.store = form.getControlValue('store');
                }
                // Include disabled InventoryTransferProduct values
                updatedModel.adjustmentProducts = form.getArray('adjustmentProducts').getRawValue();
                return updatedModel;
            }
        );
    }

    ngOnInit(): void {
        // Parse parameters from URL for view
        const params = this.getRouteParams(this.route);
        this.accessMode = params.accessMode;
        const productAdjustmentId = params.productAdjustmentId;
        if (this.accessMode.isEdit) {
            this.accessMode = AccessMode.VIEW;
        }
        if (this.accessMode.isAdd) {
            this.model = new ProductAdjustment();
            this.stores$ = this.resourceFacade.findStoresByRoles(this.accessRoles, 'ACTIVE', true);
            this.reasonType$ = this.commonCodeFacade.findByType('ADJRSNCD', true, {
                field: 'description',
                direction: 'asc',
            });
            this.initializeForm(this.model);
        } else if (this.accessMode.isView) {
            this.productAdjustmentFacade
                .findByAdjustmentId(parseInt(productAdjustmentId, 10))
                .subscribe((productAdjustment) => {
                    this.model = productAdjustment;
                    this.initializeForm(this.model);
                });
        } else {
            throw Error(`Unhandled Access Mode: ${this.accessMode?.urlSegement}`);
        }
    }

    /**
     * Get route parameters from URL
     */
    private getRouteParams(route: ActivatedRoute): { accessMode: AccessMode; productAdjustmentId: string } {
        const params = route.snapshot.paramMap;
        const accessMode = AccessMode.of(params.get('accessMode'));
        const productAdjustmentId = params.get('adjustmentId');
        return { accessMode, productAdjustmentId };
    }

    /**
     * Initialize form with current values
     */
    private initializeForm(model: ProductAdjustment): void {
        this.form = this.formFactory.group('ProductAdjustment', model, this._destroyed, {
            productAdjustmentFacade: this.productAdjustmentFacade,
            accessMode: this.accessMode,
        });
        // Configure based on accessibility
        if (this.accessMode.isAdd) {
            this.stores$.pipe(takeUntil(this._destroyed)).subscribe((results) => {
                if (results.resources.length === 1) {
                    this.form.setControlValue('store', results.resources[0]);
                    this.form.getControl('store').disable();
                }
            });
        }
        if (this.accessMode.isView) {
            this.form.disable();
        }
    }

    openFinalizeAdjustmentDialog(): void {
        this.finalizeDialog.open();
    }

    closeFinalizeAdjustmentDialog(): void {
        this.finalizeDialog.close();
    }

    finalize(): void {
        this.closeFinalizeAdjustmentDialog();
        this.finalizeFacade.save(this.form, this.model, this.route).subscribe();
    }

    /**
     * Removes the provided productCodes from the products FormArray. Ignores codes that are not in the form
     *
     * @param {string[]} productCodes
     * @memberof ProductAdjustmentComponent
     */
    onRemoveProducts(productCodes: string[]) {
        const productsFormArray = this.form.getArray('adjustmentProducts');
        productCodes.forEach((code) => {
            const index = productsFormArray.controls.findIndex(
                (transferProduct) =>
                    (transferProduct as TypedFormGroup<ProductAdjustmentDetail>).getControlValue('product').code ===
                    code
            );
            if (index !== -1) {
                productsFormArray.removeAt(index);
            }
        });
        this.updateProductArray(this.mapProductFormToModel());
    }

    addRequestedProducts(products: { code: string }[]) {
        let productCodes = products.map((p) => p.code);
        if (productCodes.length === 1) {
            // this is needed if multiple codes are passed by the input field separated by comma
            productCodes = products.map((p) => p.code.split(',').map((c) => c.trim()))[0];
        }

        if (productCodes?.length > 0) {
            this.isLoading = true;
            this.storeProductFacade
                .findByStoreAndProducts(this.form.getControlValue('store').code, productCodes)
                .subscribe(
                    (productsToAdd) => {
                        const productCodesToAdd = productsToAdd.map((p) => p.code);
                        // exclude the duplicated codes passed by the input field separated by comma
                        const duplicateProducts = productCodesToAdd.filter((p) =>
                            this.existingProductCodes?.map((ep) => ep.toUpperCase()).includes(p.toUpperCase())
                        );
                        if (duplicateProducts.length > 0) {
                            this.messageFacade.addMessage({
                                severity: 'error',
                                message: `Product(s) ${duplicateProducts.join(', ')} already added.`,
                                hasTimeout: true,
                            });
                            // remove the duplicate products from the products to be added
                            duplicateProducts.forEach(
                                (dp) => (productsToAdd = productsToAdd.filter((p) => p.code !== dp))
                            );
                        }
                        // show error message if the requested product wasn't found
                        const missingCodes = productCodes.filter((pc) => !productCodesToAdd.includes(pc));
                        if (missingCodes.length > 0) {
                            this.messageFacade.addMessage({
                                severity: 'error',
                                message: `Unable to add requested product(s): ${missingCodes.join(', ')}.`,
                                hasTimeout: true,
                            });
                        }
                        // check if products are valid and show error message if a requested product is not valid
                        productsToAdd.forEach((e, i) => {
                            this.storeProductModel = e;
                            if (!this.storeProductModel.active) {
                                productsToAdd.splice(i, 1);
                                this.messageFacade.addMessage({
                                    severity: 'error',
                                    message: `Only active product is allowed.`,
                                    hasTimeout: true,
                                });
                            }
                        });
                        if (productsToAdd.length !== 0) {
                            const mappedProducts = this.mapGenerateToProductAdjustmentDetail(productsToAdd);
                            this.updateProductArray(this.mapProductFormToModel().concat(mappedProducts));
                        }
                        this.form.markAsDirty();
                        this.isLoading = false;
                    },
                    (error) => {
                        this.isLoading = false;
                        throw error;
                    }
                );
        }
    }

    public mapGenerateToProductAdjustmentDetail(generateProduct: any[]): ProductAdjustmentDetail[] {
        return generateProduct.map((gp) => {
            return {
                ...new ProductAdjustmentDetail(),
                wholesalePrice: gp.wholesalePrice,
                product: {
                    id: gp.id.productId,
                    code: gp.code,
                    description: gp.description,
                    version: gp.version,
                },
                unitOfMeasure: gp.uom,
            };
        });
    }

    /**
     * Replaces the existing product array with the passed in products. Does a replace instead
     * of a mutate to ensure the child component properly detects the changes.
     *
     * @private
     * @param {ProductAdjustmentDetail[]} products
     * @memberof ProductAdjustmentComponent
     */
    private updateProductArray(products: ProductAdjustmentDetail[]) {
        if (products.length > 0) {
            this.form.getControl('store').disable({ emitEvent: false });
        } else {
            this.form.getControl('store').enable({ emitEvent: false });
        }
        this.form.setControl(
            'adjustmentProducts',
            this.formFactory.array('ProductAdjustmentDetail', products, this._destroyed)
        );
        this.form.getArray('adjustmentProducts').markAsDirty();
    }

    private mapProductFormToModel(): ProductAdjustmentDetail[] {
        return this.form
            .getArray('adjustmentProducts')
            .controls.map((adjustmentProduct) =>
                (adjustmentProduct as TypedFormGroup<ProductAdjustmentDetail>).getRawValue()
            );
    }

    get existingProductCodes(): string[] {
        return this.mapProductFormToModel()
            .filter((itp) => !isNullOrUndefined(itp.product))
            .map((itp) => itp.product.code);
    }

    get storesSelected(): boolean {
        return !isNullOrUndefined(this.form.getControlValue('store'));
    }

    get store(): string {
        return this.model.store?.code;
    }

    /** @see DataModifyingComponent */
    get unsavedChanges(): boolean {
        return this.form?.dirty;
    }

    ngOnDestroy(): void {
        this._destroyed.next();
    }
}
