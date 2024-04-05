import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonCodeFacade } from '@vioc-angular/central-ui/config/data-access-common-code';
import { ParameterFacade, ParameterType } from '@vioc-angular/central-ui/config/data-access-parameter';
import {
    ReceiptOfMaterial,
    ReceiptOfMaterialFacade,
    ReceiptOfMaterialPK,
    ReceiptOfMaterialProduct,
} from '@vioc-angular/central-ui/inventory/data-access-receipt-of-material';
import { VendorFacade } from '@vioc-angular/central-ui/inventory/data-access-vendor';
import { ResourceFacade } from '@vioc-angular/central-ui/organization/data-access-resources';
import { StoreProduct, StoreProductFacade } from '@vioc-angular/central-ui/product/data-access-store-product';
import { SaveFacade } from '@vioc-angular/central-ui/util-component';
import { RouterService } from '@vioc-angular/central-ui/util-router';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { QuerySearch, SearchLine } from '@vioc-angular/shared/common-api-models';
import { Described, TypedFormGroupSelectionModel } from '@vioc-angular/shared/common-functionality';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { DialogComponent } from '@vioc-angular/shared/ui-dialog';
import { ResponseEntity } from '@vioc-angular/shared/util-api';
import { Column, Comparators } from '@vioc-angular/shared/util-column';
import { DataModifyingComponent } from '@vioc-angular/shared/util-data-modifying';
import { FormFactory, TypedFormGroup } from '@vioc-angular/shared/util-form';
import { EMPTY, Observable, of, ReplaySubject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { RoleFacade } from '@vioc-angular/security/data-access-security';
@Component({
    selector: 'vioc-angular-receipt-of-material',
    templateUrl: './receipt-of-material.component.html',
    styleUrls: ['./receipt-of-material.component.scss'],
    providers: [
        ReceiptOfMaterialFacade,
        StoreProductFacade,
        CommonCodeFacade,
        ResourceFacade,
        VendorFacade,
        ParameterFacade,
    ],
})
export class ReceiptOfMaterialComponent extends DataModifyingComponent implements OnInit, OnDestroy {
    private readonly _destroyed = new ReplaySubject(1);

    @ViewChild(MatSort, { static: false }) set sort(sort: MatSort) {
        this.rmProducts.sort = sort;
    }

    /**
     * Dialog used to show the user a confirmation message on whether
     * or not they want to cancel the receipt of material.
     */
    @ViewChild('cancelReceiptDialog', { static: true }) cancelDialog: DialogComponent;

    /** dialog for finalization confirmation */
    @ViewChild('finalizeReceiptDialog', { static: true }) finalizeDialog: DialogComponent;

    /** Dialog used to confirm if user wishes to split the receipt */
    @ViewChild('splitReceiptOfMaterialDialog', { static: true }) splitDialog: DialogComponent;

    /** Table containing the products on the receipt */
    @ViewChild(MatTable, { static: false }) table: MatTable<ReceiptOfMaterialProduct>;

    /**
     * Mode that determines the editable state of the page.
     *
     * `AccessMode.VIEW` - all fields disabled
     * `AccessMode.EDIT` - `Quantity Received` is updatable
     */
    accessMode: AccessMode;

    /** `ReceiptOfMaterial` model that holds the values of the receipt of material being viewed. */
    model: ReceiptOfMaterial;

    /** `ReceiptOfMaterial` form for validating and updating receipt of material field values. */
    form: TypedFormGroup<ReceiptOfMaterial>;

    /** List used to populate the `ReceiptType` dropdown. */
    receiptType$: Observable<Described[]> = EMPTY;

    /** List used to populate the `VendorType` dropdown. */
    vendor$: Observable<Described[]> = of([]);

    /** List used to populate the `Store` dropdown. */
    store$: Observable<Described[]> = EMPTY;

    /** RMs associated with the receipt of material */
    associatedRms$: Observable<ReceiptOfMaterial[]> = of([]);

    receiptType: Observable<ReceiptOfMaterial>;

    isLoading = false;

    /** checking if split the receipt or not, by default false i.e. no split */
    split = false;

    saveFacade: SaveFacade<ReceiptOfMaterial>;

    finalizeFacade: SaveFacade<ReceiptOfMaterial>;

    rmProducts = new MatTableDataSource<TypedFormGroup<ReceiptOfMaterialProduct>>([]);

    displayedColumns: string[] = [];

    describedEquals = Described.idEquals;

    descriptionDisplayFn = Described.descriptionMapper;

    codeAndDescriptionDisplayFn = Described.codeAndDescriptionMapper;

    /** Flag to indicate the store and vendor have been locked in */
    receiptGenerated = false;

    /** SelectionModel for the currently selected data in the table. */
    selection = new TypedFormGroupSelectionModel<ReceiptOfMaterialProduct>(true, false, 'product');

    qtyOverADUDays: number;

    qtyOverQOHPercentage: number;

    viewWholesalePrice = false;

    /** Function that supplies a query to the `ProductAddInputComponent` to searching for products to add to the receipt. */
    readonly searchProductsFn = (querySearch: QuerySearch): Observable<ResponseEntity<StoreProduct>> => {
        const storeRestriction = new SearchLine(
            Column.of({ apiFieldPath: 'store.code', name: 'Store', type: 'string' }),
            Comparators.equalTo,
            this.form.getControlValue('store').code
        ).toQueryRestriction();
        const vendorRestriction = new SearchLine(
            Column.of({ apiFieldPath: 'vendor.description', name: 'vendor', type: 'string' }),
            Comparators.equalTo,
            this.form.getControlValue('vendor').description
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
            queryRestrictions: [storeRestriction, vendorRestriction, activeRestriction, obsoleteRestriction].concat(
                querySearch.queryRestrictions
            ),
        };
        return this.storeProductFacade.search(query);
    };

    private readonly buildRequestObjectFn = (form: TypedFormGroup<ReceiptOfMaterial>, model: ReceiptOfMaterial) => {
        const updatedModel: ReceiptOfMaterial = Object.assign({ ...model }, form.value);
        if (this.accessMode.isAdd) {
            // Include newly selected but disabled fields
            updatedModel.store = form.getControlValue('store');
            updatedModel.vendor = form.getControlValue('vendor');
        }
        return updatedModel;
    };

    constructor(
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        private readonly formFactory: FormFactory,
        private readonly routerService: RouterService,
        public readonly receiptOfMaterialFacade: ReceiptOfMaterialFacade,
        public readonly storeProductFacade: StoreProductFacade,
        public readonly messageFacade: MessageFacade,
        public readonly commonCodeFacade: CommonCodeFacade,
        public readonly resourceFacade: ResourceFacade,
        public readonly vendorFacade: VendorFacade,
        public readonly parameterFacade: ParameterFacade,
        private readonly roleFacade: RoleFacade
    ) {
        super();
        this.saveFacade = new SaveFacade(
            this.routerService,
            messageFacade,
            (model) => this.receiptOfMaterialFacade.save(model),
            (rm) => `Receipt of Material ${rm.number ? rm.number + ' ' : ''}saved successfully`,
            (isLoading: boolean) => (this.isLoading = isLoading),
            this.buildRequestObjectFn
        );

        this.finalizeFacade = new SaveFacade(
            this.routerService,
            messageFacade,
            (model) => this.receiptOfMaterialFacade.finalize(model, this.split),
            (rm) => `Receipt of Material ${rm.number ? rm.number + ' ' : ''}finalized successfully`,
            (isLoading: boolean) => (this.isLoading = isLoading),
            this.buildRequestObjectFn
        );
        // this will trigger a reload of the component when the parameters change i.e. switching from RM to associated RM
        this.route.params.pipe(takeUntil(this._destroyed)).subscribe(() => {
            // reinitialize the page after self-navigation, if it has already been initialized before
            if (this.accessMode) {
                this.form = undefined;
                this.ngOnInit();
            }
        });
    }

    ngOnInit(): void {
        const params = this.getRouteParams(this.route);
        this.accessMode = params.accessMode;
        const storeNum = params.storeNum;
        const rmNum = params.rmNum;
        this.roleFacade.hasAnyRole(['ROLE_WHOLESALE_PRICE_READ']).subscribe((vWP) => (this.viewWholesalePrice = vWP));

        if (this.accessMode.isView || this.accessMode.isEdit) {
            this.receiptOfMaterialFacade
                .findReceiptProducts(storeNum, rmNum)
                .pipe(switchMap((receipt: ReceiptOfMaterial) => this.updateProductDetails(receipt)))
                .subscribe((receiptOfMaterial: ReceiptOfMaterial) => {
                    this.model = receiptOfMaterial;
                    this.createForm(this.model);
                    this.getDisplayedColumns();
                    this.initializeTable();
                    this.associatedRms$ = this.receiptOfMaterialFacade
                        .findAssociatedReceiptsOfMaterial(
                            storeNum,
                            this.model.receiptType.code,
                            this.model.source,
                            this.model.sourceStore.code
                        )
                        .pipe(map((rms) => rms.filter((rm) => rm.number !== this.model.number)));
                });
        } else if (this.accessMode.isAdd) {
            this.model = new ReceiptOfMaterial();
            this.createForm(this.model);
            this.getDisplayedColumns();
        } else {
            throw Error(`Unhandled Access Mode: ${this.accessMode.urlSegement}`);
        }
    }

    private getRouteParams(route: ActivatedRoute): { accessMode: AccessMode; storeNum: string; rmNum: string } {
        const params = route.snapshot.paramMap;
        const accessMode = AccessMode.of(params.get('accessMode'));
        const storeNum = params.get('storeNum');
        const rmNum = params.get('rmNum');
        return { accessMode, storeNum, rmNum };
    }

    private createForm(receiptOfMaterial: ReceiptOfMaterial): void {
        // You should not be able to edit a finalized RM - just switch the access mode over to VIEW
        if (this.accessMode.isEdit && receiptOfMaterial.status.code === 'FINALIZED') {
            this.accessMode = AccessMode.VIEW;
        }
        this.form = this.formFactory.group('ReceiptOfMaterial', receiptOfMaterial, this._destroyed, {
            receiptOfMaterialFacade: this.receiptOfMaterialFacade,
            accessMode: this.accessMode,
        });
        // Configure page based on accessibility
        if (this.accessMode.isView) {
            this.receiptType$ = of([receiptOfMaterial.receiptType].filter((e) => e));
            this.vendor$ = of([receiptOfMaterial.vendor].filter((e) => e));
            this.store$ = of([receiptOfMaterial.store].filter((e) => e));
            this.form.disable();
        } else if (this.accessMode.isEdit) {
            this.receiptType$ = of([receiptOfMaterial.receiptType].filter((e) => e));
            this.vendor$ = of([receiptOfMaterial.vendor].filter((e) => e));
            this.store$ = of([receiptOfMaterial.store].filter((e) => e));
            this.form.markAllAsTouched(); // Displays errors for components that are loaded with invalid data
            if (this.isManual) {
                this.loadWarningParameters(receiptOfMaterial.store.id);
            }
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
                    this.form.setControlValue('vendor', null, { emitEvent: false });
                    this.vendor$ = this.vendorFacade.findByStore(store.code);
                    this.loadWarningParameters(store.id);
                });
            this.receiptType$ = this.commonCodeFacade
                .findByType('RECPTTYPE')
                .pipe(map((results) => results.filter((cc) => cc.code !== 'REG' && cc.code !== 'TRB')));
            this.store$ = this.resourceFacade.findStoresByRoles(['ROLE_RECEIPT_OF_MATERIAL_ADD']).pipe(
                map((response) => response.resources),
                tap((resources) => {
                    if (resources.length === 1) {
                        this.form.setControlValue('store', resources[0]);
                    }
                })
            );
        }
    }

    /**
     * Initialize table data source and sorting
     */
    initializeTable(): void {
        this.rmProducts = new MatTableDataSource<TypedFormGroup<ReceiptOfMaterialProduct>>(
            this.form.getArray('receiptProducts').controls as TypedFormGroup<ReceiptOfMaterialProduct>[]
        );
        // for columns with nested properties
        this.rmProducts.sortingDataAccessor = (item, property) => {
            switch (property) {
                case 'secondLevelCategory.description':
                    return item.getControlValue('secondLevelCategory').description;
                case 'product.code':
                    return item.getControlValue('product').code;
                case 'product.description':
                    return item.getControlValue('product').description;
                case 'uom.code':
                    return item.getControlValue('uom').code;
                default:
                    return item.get(property).value;
            }
        };
    }

    /**
     * Adds columns to be displayed
     */
    getDisplayedColumns(): void {
        this.displayedColumns = [
            'select', // 'select' column won't render unless productsEditable
            'secondLevelCategory.description',
            'product.code',
            'product.description',
            'sapNumber',
            'uom.code',
            'quantityOrdered',
            'quantityReceived',
        ];
        if (this.isManual) {
            // Remove "Quantity Ordered" column if not applicable
            this.displayedColumns.splice(this.displayedColumns.indexOf('quantityOrdered'), 1);
        }
        if (this.viewWholesalePrice) {
            // Add the wholesale Price column if role exist
            this.displayedColumns.push('wholesalePrice');
        }
    }

    get isStoreEditable(): boolean {
        return this.accessMode.isAdd && !this.receiptGenerated;
    }

    get isVendorEditable(): boolean {
        return this.isStoreEditable && this.form.getControl('store').valid;
    }

    get pendingReceiptGeneration(): boolean {
        return this.accessMode.isAdd && !this.receiptGenerated;
    }

    get storeNumber(): string {
        const store = this.form.getControlValue('store');
        return store ? `${store.code}` : '';
    }

    get finalizedBy(): string {
        const finalizedBy = this.form.getControlValue('finalizedByEmployee');
        return finalizedBy ? `${finalizedBy.firstName} ${finalizedBy.lastName}` : '';
    }

    get createdBy(): string {
        const createdBy = this.form.getControlValue('createdByEmployee');
        return createdBy ? `${createdBy.firstName} ${createdBy.lastName}` : '';
    }

    get storeCode(): string {
        return this.model.store.code;
    }

    get vendorCode(): string {
        return this.form.getControlValue('vendor')?.code;
    }

    get receiptNumber(): string {
        return this.model.number;
    }

    get receiptProducts(): ReceiptOfMaterialProduct[] {
        return this.form.getControlValue('receiptProducts');
    }

    get receiptProductsForm(): FormArray {
        return this.form.getArray('receiptProducts');
    }

    get existingProductCodes(): string[] {
        return this.receiptProducts.map((rp) => rp.product.code);
    }

    addProducts(products: { code: string }[]): void {
        // Map the store products to ReceiptOfMaterialProducts
        this.isLoading = true;
        const productCodes = products.map((p) => p.code);
        this.storeProductFacade
            .getInventoryDetails(this.storeNumber, this.vendorCode, productCodes)
            .pipe(
                map((inventoryDetails: any[]) =>
                    inventoryDetails
                        // Filter to only requested products (the invenotryDetails endpoint can potentially return a related product)
                        .filter((inventoryDetail) => productCodes.includes(inventoryDetail.code))
                        .map((inventoryDetail) => this.mapInventoryDetailToProduct(inventoryDetail))
                )
            )
            .subscribe(
                (newProducts) => {
                    // Show error message if not all requested products were found
                    if (newProducts.length < productCodes.length) {
                        const missingCodes = productCodes.filter((productCode) =>
                            newProducts.every((rp) => rp.product.code !== productCode)
                        );
                        this.messageFacade.addMessage({
                            severity: 'error',
                            message: `Unable to add requested product(s): ${missingCodes}.`,
                            hasTimeout: true,
                        });
                    }
                    this.addProductsToForm(newProducts);
                    this.isLoading = false;
                },
                (error) => {
                    this.isLoading = false;
                    throw error;
                }
            );
    }

    /** Convert an 'inventoryDetail' response object to a ReceiptOfMaterialProduct */
    private mapInventoryDetailToProduct(inventoryDetail: any): ReceiptOfMaterialProduct {
        return {
            ...new ReceiptOfMaterialProduct(),
            wholesalePrice: inventoryDetail.wholesalePrice,
            maxStockLimit: inventoryDetail.maxStockLimit,
            uom: inventoryDetail.uom,
            product: {
                id: inventoryDetail.id.productId,
                code: inventoryDetail.code,
                description: inventoryDetail.description,
            },
            sapNumber: inventoryDetail.sapNumber,
            secondLevelCategory: inventoryDetail.secondLevelCategory,
            bulk: inventoryDetail.bulk,
            quantityOnHand: inventoryDetail.quantityOnHand,
            averageDailyUsage: inventoryDetail.averageDailyUsage,
        };
    }

    /** Update the form with the new products */
    private addProductsToForm(products: ReceiptOfMaterialProduct[]): void {
        const validator = this.form.getControl('receiptProducts').validator;
        // Create a form array for the new products and existing products
        this.form.setControl(
            'receiptProducts',
            this.formFactory.array(
                'ReceiptOfMaterialProduct',
                // Appending newly added products to the existing products
                this.receiptProducts.concat(products),
                this._destroyed,
                { accessMode: this.accessMode }
            )
        );
        // Copy existing validation into new control
        this.form.getControl('receiptProducts').setValidators(validator);
        this.initializeTable();
        this.table.renderRows();
        this.receiptProductsForm.markAsDirty();
    }

    /**
     * Fetch additional product information and map it back to the receipt products
     */
    updateProductDetails(receipt: ReceiptOfMaterial): Observable<ReceiptOfMaterial> {
        const productCodes = receipt.receiptProducts.map((receiptProduct) => receiptProduct.product.code);
        return this.storeProductFacade.getInventoryDetails(receipt.store.code, receipt.vendor.code, productCodes).pipe(
            map((inventoryDetails) => {
                inventoryDetails
                    // Filter to only requested products (the inventoryDetails endpoint can potentially return a related product)
                    .filter((inventoryDetail) => productCodes.includes(inventoryDetail.code))
                    // Map the details to the associated receipt product
                    .forEach((inventoryDetail) => {
                        const receiptProduct = receipt.receiptProducts.find(
                            (rp) => rp.product.code === inventoryDetail.code
                        );
                        receiptProduct.maxStockLimit = inventoryDetail.maxStockLimit;
                        receiptProduct.bulk = inventoryDetail.bulk;
                        receiptProduct.quantityOnHand = inventoryDetail.quantityOnHand;
                        receiptProduct.averageDailyUsage = inventoryDetail.averageDailyUsage;
                    });
                return receipt;
            })
        );
    }

    /**
     * Load the paramter values for RM_WARN_QTY_ABOVE_ADU and RM_WARN_PERCENT_ABOVE_QOH that
     * will be used to determine if a warning should show for the qty received input.
     */
    private loadWarningParameters(storeId: string): void {
        this.parameterFacade
            .findStoreParameterValue('RM_WARN_QTY_ABOVE_ADU', ParameterType.INTEGER, storeId)
            .pipe(takeUntil(this._destroyed), takeUntil(this.form.getControl('store').valueChanges))
            .subscribe((qtyOverADUDays) => (this.qtyOverADUDays = qtyOverADUDays));
        this.parameterFacade
            .findStoreParameterValue('RM_WARN_PERCENT_ABOVE_QOH', ParameterType.INTEGER, storeId)
            .pipe(takeUntil(this._destroyed), takeUntil(this.form.getControl('store').valueChanges))
            .subscribe((qtyOverQOHPercentage) => (this.qtyOverQOHPercentage = qtyOverQOHPercentage));
    }

    /**
     * Determines if a 'Value entered may be high, please verify quantity' warning displays to the user. This
     * warning can display due one of many reasons.
     */
    showQtyReceivedWarning(receiptProduct: ReceiptOfMaterialProduct): boolean {
        if (this.accessMode.isView || !this.isOpen) {
            return false;
        }
        if (receiptProduct.quantityReceived > receiptProduct.maxStockLimit) {
            // warn if exceeding max stock limit
            return true;
        } else if (this.isManual) {
            if (this.qtyOverADUDays) {
                const aduThreshold = receiptProduct.averageDailyUsage * this.qtyOverADUDays;
                if (receiptProduct.quantityReceived > aduThreshold) {
                    // warn if exceeding expected usage over a parameter controlled number of days
                    return true;
                }
            }
            if (this.qtyOverQOHPercentage) {
                const qoh = receiptProduct.quantityOnHand;
                const qohThreshold = qoh + qoh * (this.qtyOverQOHPercentage * 0.01);
                if (receiptProduct.quantityReceived > qohThreshold) {
                    // warn if exceeding qoh by a parameter controlled percentage
                    return true;
                }
            }
        }
        return false;
    }

    get isTransfer(): boolean {
        return this.model.receiptType?.code === 'TRB';
    }

    get isRegular(): boolean {
        return this.model.receiptType?.code === 'REG';
    }

    get isManual(): boolean {
        return !this.isTransfer && !this.isRegular;
    }

    get isOpen(): boolean {
        return this.accessMode.isAdd || this.model.status.code === 'OPEN';
    }

    get status(): string {
        return this.model.status?.code;
    }

    navigateToRm(storeCode: string, rm: string) {
        this.router.navigate([this.accessMode.urlSegement, storeCode, rm], { relativeTo: this.route.parent });
    }

    openFinalizeDialog(): void {
        if (this.shouldPromptForSplit) {
            this.splitDialog.open();
        } else {
            this.finalizeDialog.open();
        }
    }

    /** Checking if a split is necessary */
    get shouldPromptForSplit(): boolean {
        return (
            this.isRegular &&
            this.receiptProducts.some((rp) => rp.quantityReceived < rp.quantityOrdered) &&
            this.receiptProducts.some((rp) => rp.quantityReceived !== 0)
        );
    }

    closeFinalizeDialog(): void {
        this.finalizeDialog.close();
    }

    closeSplitDialog(): void {
        this.splitDialog.close();
    }

    splitAndFinalize(): void {
        this.split = true;
        this.closeSplitDialog();
        this.finalizeFacade.save(this.form, this.model, this.route).subscribe((res) => {
            this.navigateToRm(res.storeCode, res.number);
        });
        this.split = false;
    }

    isCancelReceiptButtonShown(): boolean {
        return this.accessMode.isEdit && this.isOpen && !(this.isRegular || this.isTransfer);
    }

    openCancelReceiptDialog(): void {
        this.cancelDialog.open();
    }

    closeCancelReceiptDialog(): void {
        this.cancelDialog.close();
    }

    /**
     * Cancels/deletes the receipt of material
     */
    cancelReceiptOfMaterial(): void {
        this.receiptOfMaterialFacade.cancelReceiptOfMaterial(this.storeCode, this.receiptNumber).subscribe(
            () => {
                // Setting the form to null after the receipt is successfully deleted and before routerService.back()
                // is called prevents the unsaved changes dialog from appearing after cancelling a receipt.
                this.form = null;
                this.isLoading = false;
                this.messageFacade.addMessage({
                    message: `Receipt number ${this.receiptNumber} has been canceled.`,
                    severity: 'success',
                });
                this.cancelDialog.close();
                this.routerService.back();
            },
            (err) => {
                this.isLoading = false;
                this.cancelDialog.close();
                throw err;
            }
        );
    }

    /**
     * Apply changes and doesn't navigate and finalizes rm.
     * Finalize should be disabled until all quantities are entered.
     */
    finalize(): void {
        const openState = 0; // Ideally should be using MatDialogState.OPEN, but that resulted in test failures for some reason
        if (this.splitDialog?.dialogRef?.getState() === openState) {
            this.closeSplitDialog();
        } else {
            this.closeFinalizeDialog();
        }
        this.finalizeFacade.save(this.form, this.model, this.route).subscribe();
    }

    apply(): void {
        this.saveFacade
            .apply(this.form, this.model, () => {})
            .subscribe((id: ReceiptOfMaterialPK) => {
                if (this.accessMode.isAdd) {
                    this.router.navigate([AccessMode.EDIT.urlSegement, this.storeNumber, id.number], {
                        relativeTo: this.route.parent,
                    });
                } else {
                    this.form = undefined;
                    this.ngOnInit();
                }
            });
    }

    /** Save changes and navigate back to previous page. */
    save(): void {
        this.saveFacade.save(this.form, this.model, this.route).subscribe();
    }

    generateReceipt(): void {
        this.receiptGenerated = true;
        this.form.getControl('store').disable();
        this.form.getControl('vendor').disable();
    }

    /** Determines if all of the available rows of the table are selected. */
    isAllSelected(data: TypedFormGroup<ReceiptOfMaterialProduct>[]): boolean {
        const numSelected = this.selection && this.selection.selected.length;
        const numRows = data.length;
        return numSelected === numRows;
    }

    /** If no rows are selected selects all available rows, if all rows are selected then clears the selection. */
    masterToggle(data: TypedFormGroup<ReceiptOfMaterialProduct>[]): void {
        this.isAllSelected(data) ? this.selection.clear() : data.forEach((row) => this.selection.select(row));
    }

    get productsEditable(): boolean {
        return (
            (this.accessMode.isAdd && this.receiptGenerated) || (this.accessMode.isEdit && this.isOpen && this.isManual)
        );
    }

    /** Remove selected products */
    removeProducts(): void {
        this.selection.selected.forEach((productFormGroup) => {
            // find index of currently selected product in model
            const index = this.receiptProductsForm.controls.findIndex(
                (productControl) => productControl.value.product.id === productFormGroup.value.product.id
            );
            // remove selected currently product from model at index
            this.receiptProductsForm.removeAt(index);
        });
        this.receiptProductsForm.markAsDirty();
        // rebuild table from updated form and clear selections
        this.initializeTable();
        this.table.renderRows();
        this.selection.clear();
    }

    /** @see DataModifyingComponent */
    get unsavedChanges(): boolean {
        return this.form && this.form.dirty;
    }

    ngOnDestroy(): void {
        this._destroyed.next();
    }
}
