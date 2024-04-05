import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
    GenerateTransferProduct,
    InventoryTransfer,
    InventoryTransferFacade,
    InventoryTransferPK,
    InventoryTransferProduct,
} from '@vioc-angular/central-ui/inventory/data-access-inventory-transfer';
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
import { Observable, ReplaySubject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'vioc-angular-inventory-transfer',
    templateUrl: './inventory-transfer.component.html',
    styleUrls: ['./inventory-transfer.component.scss'],
    providers: [InventoryTransferFacade, ResourceFacade, StoreProductFacade],
})
export class InventoryTransferComponent extends DataModifyingComponent implements OnInit, OnDestroy {
    private readonly _destroyed = new ReplaySubject(1);

    readonly accessRoles = ['ROLE_INVENTORY_TRANSFER_ADD'];

    /**
     * Dialog used to show the user a confirmation message on whether
     * or not they want to cancel the inventory transfer
     */
    @ViewChild('cancelTransferDialog', { static: true }) cancelDialog: DialogComponent;

    /** Dialog used to confirm if user wishes to finalize transfer */
    @ViewChild('finalizeTransferDialog', { static: true }) finalizeDialog: DialogComponent;

    /** Mode that determines state of the page */
    accessMode: AccessMode;

    /** Model that holds values of the Transfer and its products */
    model: InventoryTransfer;

    /** Form that handles validating and updating transfer fields */
    form: TypedFormGroup<InventoryTransfer>;

    fromStores$: Observable<Resources>;

    toStores$: Observable<Described[]>;

    productAddControl = new FormControl();

    isLoading = false;

    addProductError = '';

    saveFacade: SaveFacade<InventoryTransfer>;

    finalizeFacade: SaveFacade<InventoryTransfer>;

    /** Function that supplies a query to the `ProductAddInputComponent` to searching for products to add to the transfer. */
    readonly searchProductsFn = (querySearch: QuerySearch): Observable<ResponseEntity<StoreProduct>> => {
        const storeRestriction = new SearchLine(
            Column.of({ apiFieldPath: 'store.code', name: 'Store', type: 'string' }),
            Comparators.equalTo,
            this.form.getControlValue('fromStore').code
        ).toQueryRestriction();
        const activeRestriction = new SearchLine(
            Column.of({ apiFieldPath: 'active', name: 'Active', type: 'boolean' }),
            Comparators.true
        ).toQueryRestriction();
        const obsoleteRestriction = new SearchLine(
            Column.of({ apiFieldPath: 'product.obsolete', name: 'Obsolete', type: 'boolean' }),
            Comparators.falseOrBlank
        ).toQueryRestriction();
        const query = {
            ...querySearch,
            queryRestrictions: [storeRestriction, activeRestriction, obsoleteRestriction].concat(
                querySearch.queryRestrictions
            ),
        };
        return this.storeProductFacade.search(query);
    };

    constructor(
        private readonly inventoryTransferFacade: InventoryTransferFacade,
        private readonly resourceFacade: ResourceFacade,
        private readonly routerService: RouterService,
        private readonly formFactory: FormFactory,
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        readonly routerHistoryFacade: RouterHistoryFacade,
        private readonly storeProductFacade: StoreProductFacade,
        readonly messageFacade: MessageFacade
    ) {
        super();
        this.saveFacade = new SaveFacade(
            this.routerService,
            messageFacade,
            (model) => this.inventoryTransferFacade.save(model),
            (it) => `Inventory Transfer ${it.id ? it.id.transferId.concat(' ') : ''}saved successfully`,
            (isLoading: boolean) => (this.isLoading = isLoading),
            (form: TypedFormGroup<InventoryTransfer>, model: InventoryTransfer): InventoryTransfer => {
                const updatedModel: InventoryTransfer = Object.assign({ ...model }, form.value);
                if (this.accessMode.isAdd) {
                    // Include newly selected, but disabled, InventoryTransfer fields that aren't included in the model
                    updatedModel.fromStore = form.getControlValue('fromStore');
                    updatedModel.toStore = form.getControlValue('toStore');
                }
                // Include disabled InventoryTransferProduct values
                updatedModel.inventoryTransferProducts = form.getArray('inventoryTransferProducts').getRawValue();
                return updatedModel;
            }
        );
        this.finalizeFacade = new SaveFacade(
            this.routerService,
            messageFacade,
            (model) => this.inventoryTransferFacade.finalize(model),
            (it) => `Inventory Transfer ${it.id ? it.id.transferId.concat(' ') : ''}finalized successfully`,
            (isLoading: boolean) => (this.isLoading = isLoading),
            (form: TypedFormGroup<InventoryTransfer>, model: InventoryTransfer): InventoryTransfer => {
                const updatedModel: InventoryTransfer = Object.assign({ ...model }, form.value);
                if (this.accessMode.isAdd) {
                    // Include newly selected, but disabled, InventoryTransfer fields that aren't included in the model
                    updatedModel.fromStore = form.getControlValue('fromStore');
                    updatedModel.toStore = form.getControlValue('toStore');
                }
                // Include disabled InventoryTransferProduct values
                updatedModel.inventoryTransferProducts = form.getArray('inventoryTransferProducts').getRawValue();
                return updatedModel;
            }
        );
    }

    ngOnInit(): void {
        // Parse parameters from URL for view
        const params = this.getRouteParams(this.route);
        this.accessMode = params.accessMode;
        const storeCode = params.storeCode;
        const transferNumber = params.transferNumber;
        if (this.accessMode.isAdd) {
            this.model = new InventoryTransfer();
            this.fromStores$ = this.resourceFacade.findStoresByRoles(this.accessRoles, 'ACTIVE', true);
            this.initializeForm(this.model);
        } else if (this.accessMode.isView || this.accessMode.isEdit) {
            this.inventoryTransferFacade
                .findByFromStoreAndTransferId(storeCode, transferNumber)
                .subscribe((inventoryTransfer) => {
                    this.model = inventoryTransfer;
                    this.initializeForm(this.model);
                });
        } else {
            throw Error(`Unhandled Access Mode: ${this.accessMode?.urlSegement}`);
        }
    }

    /**
     * Get route parameters from URL
     */
    private getRouteParams(
        route: ActivatedRoute
    ): { accessMode: AccessMode; storeCode: string; transferNumber: string } {
        const params = route.snapshot.paramMap;
        const accessMode = AccessMode.of(params.get('accessMode'));
        const storeCode = params.get('storeCode');
        const transferNumber = params.get('transferNumber');
        return { accessMode, storeCode, transferNumber };
    }

    /**
     * Initialize form with current values
     */
    private initializeForm(model: InventoryTransfer): void {
        if (this.accessMode.isEdit && model.status.code !== 'OPEN') {
            this.accessMode = AccessMode.VIEW;
        }
        if (isNullOrUndefined(this.form)) {
            this.form = this.formFactory.group('InventoryTransfer', model, this._destroyed, {
                accessMode: this.accessMode,
            });
        }

        if (this.accessMode.isView) {
            this.form.disable();
        } else if (this.accessMode.isAdd) {
            // adding products is disabled until the stores have been selected
            this.productAddControl.disable();
            this.fromStores$.subscribe((results) => {
                if (results.resources.length === 1) {
                    this.form.setControlValue('fromStore', results.resources[0]);
                    this.toStores$ = this.inventoryTransferFacade.getToStores(results.resources[0].code);
                    this.form.getControl('fromStore').disable();
                } else {
                    this.form
                        .getControl('fromStore')
                        .valueChanges.pipe(debounceTime(500), takeUntil(this._destroyed))
                        .subscribe((fromStore) => {
                            this.toStores$ = this.inventoryTransferFacade.getToStores(fromStore.code);
                        });
                    // disable ability to add products until the toStore is selected
                    this.productAddControl.disable();
                }
            });
            this.form
                .getControl('toStore')
                .valueChanges.pipe(debounceTime(500), takeUntil(this._destroyed))
                .subscribe((v) => {
                    if (v && this.form.getControlValue('fromStore')) {
                        // after the fromStore and toStore are selected, enable add products
                        this.productAddControl.enable();
                    } else {
                        // disable the add products if either are null
                        this.productAddControl.disable();
                    }
                });
        }
    }

    apply(): void {
        const reload = () => {};
        this.saveFacade.apply(this.form, this.model, reload).subscribe((id: InventoryTransferPK) => {
            if (this.accessMode.isAdd) {
                // update the id for save message
                this.model.id = id;
                this.routerHistoryFacade.revertRouterHistory(1);
                this.router.navigate(
                    [AccessMode.EDIT.urlSegement, this.form.getControlValue('fromStore').code, id.transferId],
                    { relativeTo: this.route.parent }
                );
            } else {
                this.form = undefined;
                this.ngOnInit();
            }
        });
    }

    /** Save and navigate back to previous page. */
    save(): void {
        this.saveFacade.save(this.form, this.model, this.route).subscribe();
    }

    openFinalizeTransferDialog(): void {
        this.finalizeDialog.open();
    }

    closeFinalizeTransferDialog(): void {
        this.finalizeDialog.close();
    }

    finalize(): void {
        this.closeFinalizeTransferDialog();
        this.finalizeFacade.save(this.form, this.model, this.route).subscribe();
    }

    /**
     * Removes the provided productCodes from the products FormArray. Ignores codes that are not in the form
     *
     * @param {string[]} productCodes
     * @memberof InventoryTransferComponent
     */
    onRemoveProducts(productCodes: string[]) {
        const productsFormArray = this.form.getArray('inventoryTransferProducts');
        productCodes.forEach((code) => {
            const index = productsFormArray.controls.findIndex(
                (transferProduct) =>
                    (transferProduct as TypedFormGroup<InventoryTransferProduct>).getControlValue('product').code ===
                    code
            );
            if (index !== -1) {
                productsFormArray.removeAt(index);
            }
        });
        this.updateProductArray(this.mapProductFormToModel());
    }

    addRequestedProducts(products: { code: string }[]) {
        const productCodes = products.map((p) => p.code).filter((code) => !this.productAlreadyInForm(code));

        if (productCodes?.length > 0) {
            this.isLoading = true;
            this.inventoryTransferFacade
                .productLookup(
                    this.form.getControlValue('fromStore').code,
                    this.form.getControlValue('toStore').code,
                    productCodes
                )
                .subscribe(
                    (productsToAdd) => {
                        if (productsToAdd) {
                            const mappedProducts = this.mapGenerateToInventory(productsToAdd);
                            this.updateProductArray(this.mapProductFormToModel().concat(mappedProducts));
                            this.productAddControl.reset();
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

    addProductErrorMatcher(error: any): ErrorStateMatcher {
        return {
            isErrorState(): boolean {
                return error;
            },
        } as ErrorStateMatcher;
    }

    private mapGenerateToInventory(generateProduct: GenerateTransferProduct[]): InventoryTransferProduct[] {
        return generateProduct.map((gp) => {
            return {
                ...new InventoryTransferProduct(),
                product: {
                    id: gp.id.productId,
                    code: gp.code,
                    description: gp.description,
                },
                uom: gp.uom,
                quantityOnHand: gp.quantityOnHand,
            };
        });
    }

    /**
     * Replaces the existing product array with the passed in products. Does a replace instead
     * of a mutate to ensure the child component properly detects the changes.
     *
     * @private
     * @param {InventoryTransferProduct[]} products
     * @memberof InventoryTransferComponent
     */
    private updateProductArray(products: InventoryTransferProduct[]) {
        const validator = this.form.getControl('inventoryTransferProducts').validator;
        if (products.length > 0) {
            this.form.getControl('fromStore').disable({ emitEvent: false });
            this.form.getControl('toStore').disable({ emitEvent: false });
        } else {
            this.form.getControl('fromStore').enable({ emitEvent: false });
            this.form.getControl('toStore').enable({ emitEvent: false });
        }
        this.form.setControl(
            'inventoryTransferProducts',
            this.formFactory.array('InventoryTransferProduct', products, this._destroyed, {
                status: this.form.getControlValue('status'),
            })
        );

        // Copy existing validation into new control
        this.form.getControl('inventoryTransferProducts').setValidators(validator);
        // Run validation in case the new control is empty
        this.form.getControl('inventoryTransferProducts').updateValueAndValidity();

        this.form.getArray('inventoryTransferProducts').markAsDirty();
    }

    private productAlreadyInForm(code: string) {
        return this.form
            .getArray('inventoryTransferProducts')
            .controls.find(
                (existingProduct) =>
                    (existingProduct as TypedFormGroup<InventoryTransferProduct>)
                        .getControlValue('product')
                        .code.toUpperCase() === code.toUpperCase()
            );
    }

    private mapProductFormToModel(): InventoryTransferProduct[] {
        return this.form
            .getArray('inventoryTransferProducts')
            .controls.map((transferProduct) =>
                (transferProduct as TypedFormGroup<InventoryTransferProduct>).getRawValue()
            );
    }

    get existingProductCodes(): string[] {
        return this.mapProductFormToModel()
            .filter((itp) => !isNullOrUndefined(itp.product))
            .map((itp) => itp.product.code);
    }

    get storesSelected(): boolean {
        return (
            !isNullOrUndefined(this.form.getControlValue('fromStore')) &&
            !isNullOrUndefined(this.form.getControlValue('toStore'))
        );
    }

    get transferNumber(): string {
        return this.model.id?.transferId;
    }

    get transferIsFinalized(): boolean {
        return this.form.getControlValue('status').code === 'FINALIZED';
    }

    get fromStore(): string {
        return this.model.fromStore?.code;
    }

    get transferId(): string {
        return this.model.id?.transferId;
    }

    isCancelTransferButtonShown(): boolean {
        return this.accessMode.isEdit && this.model.status.code === 'OPEN';
    }

    cancelInventoryTransfer(): void {
        this.isLoading = true;
        this.cancelDialog.close();
        this.inventoryTransferFacade.cancelInventoryTransfer(this.fromStore, this.transferId).subscribe(
            () => {
                // Setting the form to null after the transfer is successfully deleted and before routerService.back()
                // i called prevents the unsaved changes dialog from appearing after cancelling a receipt
                this.form = null;
                this.isLoading = false;
                this.messageFacade.addMessage({
                    message: `Transfer number ${this.transferId} has been cancelled.`,
                    severity: 'success',
                });
                this.routerService.back();
            },
            (err) => {
                this.isLoading = false;
                throw err;
            }
        );
    }

    openCancelTransferDialog(): void {
        this.cancelDialog.open();
    }

    closeCancelTransferDialog(): void {
        this.cancelDialog.close();
    }

    /** @see DataModifyingComponent */
    get unsavedChanges(): boolean {
        return this.form?.dirty;
    }

    ngOnDestroy(): void {
        this._destroyed.next();
    }
}
