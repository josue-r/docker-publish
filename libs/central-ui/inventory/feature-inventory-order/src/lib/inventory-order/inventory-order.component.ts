import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { ParameterFacade, ParameterType } from '@vioc-angular/central-ui/config/data-access-parameter';
import {
    InventoryOrder,
    InventoryOrderFacade,
    InventoryOrderPK,
    InventoryOrderProduct,
} from '@vioc-angular/central-ui/inventory/data-access-inventory-order';
import {
    ReceiptOfMaterial,
    ReceiptOfMaterialFacade,
} from '@vioc-angular/central-ui/inventory/data-access-receipt-of-material';
import { VendorFacade } from '@vioc-angular/central-ui/inventory/data-access-vendor';
import { ResourceFacade } from '@vioc-angular/central-ui/organization/data-access-resources';
import { StoreProduct, StoreProductFacade } from '@vioc-angular/central-ui/product/data-access-store-product';
import { SaveFacade } from '@vioc-angular/central-ui/util-component';
import { RouterService } from '@vioc-angular/central-ui/util-router';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { QuerySearch, SearchLine } from '@vioc-angular/shared/common-api-models';
import { Described, TypedFormGroupSelectionModel, isNullOrUndefined } from '@vioc-angular/shared/common-functionality';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { DialogComponent } from '@vioc-angular/shared/ui-dialog';
import { ResponseEntity } from '@vioc-angular/shared/util-api';
import { Column, Comparators } from '@vioc-angular/shared/util-column';
import { DataModifyingComponent } from '@vioc-angular/shared/util-data-modifying';
import { FormFactory, TypedFormGroup } from '@vioc-angular/shared/util-form';
import * as moment from 'moment';
import { BehaviorSubject, Observable, ReplaySubject, throwError } from 'rxjs';
import { catchError, debounceTime, map, takeUntil, tap } from 'rxjs/operators';
import { InventoryOrderForms } from '../inventory-order-module-forms';

@Component({
    selector: 'vioc-angular-inventory-order',
    templateUrl: './inventory-order.component.html',
    styleUrls: ['./inventory-order.component.scss'],
    providers: [
        InventoryOrderFacade,
        ReceiptOfMaterialFacade,
        ResourceFacade,
        VendorFacade,
        StoreProductFacade,
        ParameterFacade,
    ],
})
export class InventoryOrderComponent extends DataModifyingComponent implements OnInit, OnDestroy {
    @ViewChild(MatSort, { static: false }) sort: MatSort;

    @ViewChild(MatTable, { static: false }) table: MatTable<InventoryOrderProduct>;

    /**
     * Dialog used to show the user a confirmation message on whether
     * or not they want to cancel the inventory order.
     */
    @ViewChild('cancelOrderDialog', { static: true }) cancelDialog: DialogComponent;

    /** Dialog used to confirm if user wishes to finalize order */
    @ViewChild('finalizeOrderDialog', { static: true }) finalizeDialog: DialogComponent;

    @ViewChild('openReceiptsDialog', { static: true }) openReceiptsDialog: DialogComponent;

    @ViewChild('oldOrderDialog', { static: true }) oldOrderDialog: DialogComponent;

    /** Mode that determines state of the page */
    accessMode: AccessMode;

    /** Model that holds values of the Order being viewed */
    model: InventoryOrder;

    /** Form that handles validating and updating order fields */
    form: TypedFormGroup<InventoryOrder>;

    /** List of all stores the user has access to */
    storeList: Described[];

    /** List of all vendors the user has access to based on the store */
    vendorList: Described[];

    /**
     *  Behavior subject of the loaded products for the order
     *  Contains an empty dataSource as initial value, but is still loaded async
     *  Requires extra checks for loading directive
     */
    readonly products$ = new BehaviorSubject(new MatTableDataSource<TypedFormGroup<InventoryOrderProduct>>());

    /** Day used in calculating usage in the product table */
    readonly usageDays = 14;

    /** List of all related rms for buttons creation */
    associatedRms$: Observable<Described[]>;

    /** SelectionModel for the currently selected data in the table. */
    selection = new TypedFormGroupSelectionModel<InventoryOrderProduct>(true, false, 'product');

    /** Status that determines if the page is loading. Used to disable page elements when loading. */
    isLoading = false;

    /** Status that determines if the page is generating an order. */
    isGeneratingOrder = false;

    /** Status indicating that the order is a newly generated order. */
    isOrderGenerated = false;

    /** Indicates that an order is being auto generated by passing the store and vendor as query params */
    isAutoGenerating = false;

    /** Indicates that the inventory order is old and should not attempt to load the page until an action has been take for the old order. */
    isOldOrder = false;

    describedEquals = Described.idEquals;
    vendorDisplayFn = Described.descriptionMapper;
    storeDisplayFn = Described.codeAndDescriptionMapper;

    inventoryOrderErrorMapping = InventoryOrderForms.inventoryOrderErrorMapping;

    saveFacade: SaveFacade<InventoryOrder>;

    finalizeFacade: SaveFacade<InventoryOrder>;

    openReceipts: ReceiptOfMaterial[];

    queryParams: ParamMap;

    // Product table config
    displayedColumns = [
        'select',
        'secondLevelCategory.description',
        'product.code',
        'product.description',
        'product.sapNumber',
        'uom.code',
        'minimumOrderQuantity',
        'quantityPerPack',
        'averageDailyUsage',
        'suggestedQuantity',
        'quantityOnHand',
        'quantityOnOrder',
        'quantity',
    ];

    private readonly _destroyed = new ReplaySubject(1);

    /** Function that supplies a query to the `ProductAddInputComponent` to searching for products to add to the order. */
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

    private onStoreSelected = (store: Described) => {
        this.form.setControlValue('vendor', null, { emitEvent: false });
        this.vendorFacade.findByStore(store.code).subscribe((vendors) => {
            this.vendorList = vendors;
            // try to find the vendor indicated in the query params
            if (this.queryParams.get('vendor') && this.isAutoGenerating) {
                const requestedVendor = vendors.find((v) => v.code === this.queryParams.get('vendor'));
                // if found generate the order, if not leave blank
                if (requestedVendor) {
                    this.form.setControlValue('vendor', requestedVendor);
                    this.generateOrder();
                }
                this.isLoading = false;
            }
        });
    };

    private onStoresLoaded = (resources) => {
        this.storeList = resources.resources;
        if (this.queryParams.get('store')) {
            // try to find the store indicated in the query params
            const requestedStore = this.storeList.find((s) => s.code === this.queryParams.get('store'));
            // if found set which will trigger vendor load, if not leave blank
            if (requestedStore) {
                this.form.setControlValue('store', requestedStore);
            } else {
                this.isAutoGenerating = false;
                this.isLoading = false;
            }
        } else if (this.storeList.length === 1) {
            this.form.setControlValue('store', this.storeList[0]);
        }
    };

    constructor(
        private readonly router: Router,
        private readonly route: ActivatedRoute,
        private readonly formFactory: FormFactory,
        private readonly routerService: RouterService,
        private readonly receiptOfMaterialFacade: ReceiptOfMaterialFacade,
        private readonly resourceFacade: ResourceFacade,
        private readonly vendorFacade: VendorFacade,
        private readonly storeProductFacade: StoreProductFacade,
        private readonly parameterFacade: ParameterFacade,
        readonly inventoryOrderFacade: InventoryOrderFacade,
        readonly messageFacade: MessageFacade
    ) {
        super();
        this.saveFacade = new SaveFacade(
            this.routerService,
            messageFacade,
            (model) => this.inventoryOrderFacade.save(model),
            (io) => `Inventory Order ${io.id ? io.id.number.concat(' ') : ''}saved successfully`,
            (isLoading: boolean) => (this.isLoading = isLoading),
            (form: TypedFormGroup<InventoryOrder>, model: InventoryOrder): InventoryOrder => {
                return Object.assign({ ...model }, form.value);
            }
        );
        this.finalizeFacade = new SaveFacade(
            this.routerService,
            messageFacade,
            (model) => this.inventoryOrderFacade.finalize(model),
            (io) => `Inventory Order ${io.id ? io.id.number.concat(' ') : ''}finalized successfully`,
            (isLoading: boolean) => (this.isLoading = isLoading),
            (form: TypedFormGroup<InventoryOrder>, model: InventoryOrder): InventoryOrder => {
                return Object.assign({ ...model }, form.value);
            }
        );
    }

    ngOnInit(): void {
        // Parse parameters from URL for view
        const params = this.getRouteParams(this.route);
        this.accessMode = params.accessMode;
        const storeCode = params.storeCode;
        const orderNumber = params.orderNumber;
        if (this.accessMode.isView || this.accessMode.isEdit) {
            this.inventoryOrderFacade
                .findByStoreCodeAndOrderNumber(storeCode, orderNumber)
                .subscribe((inventoryOrder) => {
                    this.model = inventoryOrder;
                    this.parameterFacade
                        .findStoreParameterValue(
                            'PRODUCT_ORDER_OLD_HOURS',
                            ParameterType.INTEGER,
                            inventoryOrder.store.id
                        )
                        .subscribe((productOrderOldHours) => {
                            const createdOn = moment(inventoryOrder.createdOn);
                            if (
                                createdOn.add(productOrderOldHours, 'hours').isBefore(moment.now()) &&
                                this.accessMode.isEdit &&
                                productOrderOldHours > 0 &&
                                this.model.status.code === 'OPEN'
                            ) {
                                this.isOldOrder = true;
                                this.openOldOrderDialog();
                            } else {
                                this.associatedRms$ = this.receiptOfMaterialFacade.findAssociatedReceiptsOfMaterial(
                                    inventoryOrder.store.code,
                                    'REG',
                                    inventoryOrder.id.number,
                                    inventoryOrder.store.code // Order RM's store and source store will be the same
                                );
                                this.initializeForm(this.model);
                                this.products$.next(this.initializeTable());
                            }
                        });
                });
        } else if (this.accessMode.isAdd) {
            this.model = new InventoryOrder();
            if (this.queryParams.get('store')) {
                this.isLoading = true;
                this.isAutoGenerating = true;
            }
            this.initializeForm(this.model);
        } else {
            throw Error('Unhandled Access Mode: ' + this.accessMode?.urlSegement);
        }
    }
    /**
     * Get route parameters from URL
     */
    private getRouteParams(route: ActivatedRoute): { accessMode: AccessMode; storeCode: string; orderNumber: string } {
        const params = route.snapshot.paramMap;
        const accessMode = AccessMode.of(params.get('accessMode'));
        const storeCode = params.get('storeCode');
        const orderNumber = params.get('orderNumber');
        this.queryParams = route.snapshot.queryParamMap;
        return { accessMode, storeCode: storeCode, orderNumber };
    }

    /**
     * Initialize form with current values
     */
    private initializeForm(inventoryOrder: InventoryOrder): void {
        // You should not be able to edit a finalized order - just switch the access mode over to VIEW before form is created
        if (this.accessMode.isEdit && inventoryOrder.status.code === 'FINALIZED') {
            this.accessMode = AccessMode.VIEW;
        }
        if (isNullOrUndefined(this.form)) {
            this.form = this.formFactory.group('InventoryOrder', inventoryOrder, this._destroyed, {
                accessMode: this.accessMode,
            });
        }
        // Configure based on accessibility
        if (this.accessMode.isView) {
            this.form.disable();
            // For view mode, prevent external calls and use array of set account value or empty array
            this.vendorList = [this.model.vendor].filter((e) => e);
            this.storeList = [this.model.store];
        } else if (this.accessMode.isEdit) {
            this.vendorList = [this.model.vendor];
            this.storeList = [this.model.store];
        } else if (this.accessMode.isAdd) {
            this.form
                .getControl('store')
                .valueChanges.pipe(debounceTime(200), takeUntil(this._destroyed))
                .subscribe(this.onStoreSelected);
            this.resourceFacade.findStoresByRoles(['ROLE_INVENTORY_ORDER_ADD']).subscribe(this.onStoresLoaded);
        }
    }

    checkForOpenReceipts(): void {
        this.isGeneratingOrder = true;
        this.receiptOfMaterialFacade
            .findOpenReceiptsOfMaterial(
                this.form.getControlValue('store').code,
                this.form.getControlValue('vendor').code
            )
            .subscribe(
                (openRms) => {
                    if (openRms.length > 0) {
                        this.isGeneratingOrder = false;
                        this.openReceipts = openRms;
                        // This if statement Will be true, unless the user navigates away from the page before this point, meaning openReceiptsDialog no longer exists
                        if (this.openReceiptsDialog) {
                            this.openReceiptsDialog.open();
                        } else {
                            // User navigated away from the page while loading so openReceiptsDialog no longer exists to open, show warning instead
                            this.messageFacade.addMessage({
                                message: 'There are open receipts that prevented the order product from being created',
                                severity: 'warn',
                            });
                        }
                    } else {
                        this.generateOrder();
                    }
                },
                (err) => {
                    this.isGeneratingOrder = false;
                    throw err;
                }
            );
    }

    generateOrder(): void {
        this.isGeneratingOrder = true;
        this.generateProducts();
    }

    startNewOrder(): void {
        this.isLoading = true;
        this.closeOldOrderDialog();
        this.inventoryOrderFacade.cancelInventoryOrder(this.storeCode, this.orderNumber).subscribe(
            () => {
                this.router.navigate(['add'], {
                    queryParams: { store: this.model.store.code, vendor: this.model.vendor.code },
                    relativeTo: this.route.parent,
                });
            },
            (error) => {
                this.isOldOrder = false;
                this.isLoading = false;
                throw error;
            }
        );
    }

    /**
     * Method that generates products for the order.
     *
     * If the existing products are provided, then the list of new products will be added to the existing products.
     * If new product codes are provided, then only products for those codes will be generated and added to the existing products.
     */
    generateProducts(existingProducts: InventoryOrderProduct[] = [], newProductCodes: string[] = []): void {
        this.inventoryOrderFacade
            .generateOrderProducts(
                this.form.getControlValue('store').code,
                this.form.getControlValue('vendor').code,
                newProductCodes
            )
            .pipe(
                map((newProducts: InventoryOrderProduct[]) =>
                    /**
                     * We check if newProductCodes length to verify if there is codes to be added to the existing products, and
                     * if the length of the newProductCodes is smaller than the newProducts length, it means that the
                     * inventoryOrderFacade.generateOrderProducts method returned records that does not match that code but they are related products
                     * to the code contained in newProductCodes and, in this case, we need to filter them out.
                     */
                    newProductCodes.length > 0 && newProductCodes.length < newProducts.length
                        ? newProducts
                              // Filter to only requested products (the orderDetails endpoint can potentially return a related product)
                              .filter((inventoryOrder) => newProductCodes.includes(inventoryOrder.product.code))
                              .map((np) => this.mapGeneratedProductToNewProduct(np))
                        : newProducts.map((np) => this.mapGeneratedProductToNewProduct(np))
                ),
                map((newProducts) => {
                    const nonDuplicateProducts = newProducts.filter(
                        (pc) => !this.existingProductCodes.includes(pc.product.code)
                    );
                    if (this.existingProductCodes.length !== 0) {
                        // make newProductsCode only have codes of products that weren't already add
                        const duplicatedProductCodes = newProducts
                            .filter((pc) => this.existingProductCodes.includes(pc.product.code))
                            .map((pc) => pc.product.code);
                        if (duplicatedProductCodes.length > 0) {
                            this.messageFacade.addMessage({
                                severity: 'error',
                                message: `Product(s) ${duplicatedProductCodes.join(', ')} already added.`,
                                hasTimeout: true,
                            });
                        }
                    }

                    this.addProductsToForm(existingProducts, nonDuplicateProducts);
                    return this.initializeTable();
                }),
                tap(() => {
                    this.isLoading = false;
                    this.isGeneratingOrder = false;
                    this.isOrderGenerated = true;
                }),
                catchError((e) => {
                    // No longer generating order but rethrow any error
                    this.isLoading = false;
                    this.isGeneratingOrder = false;
                    return throwError(e);
                })
            )
            .subscribe((dataSource) => this.products$.next(dataSource));
    }

    /** Convert a newly generated order product response to a InventoryOrderProduct */
    mapGeneratedProductToNewProduct(inventoryDetail: any): InventoryOrderProduct {
        // Overlaying each product response on a blank InventoryOrderProduct to make sure all fields are initialized (including ones not included in the response)
        return {
            ...new InventoryOrderProduct(),
            ...inventoryDetail,
            quantity: inventoryDetail.suggestedQuantity === 0 ? null : inventoryDetail.suggestedQuantity,
        };
    }

    private addProductsToForm(existingProducts: InventoryOrderProduct[], newProducts: InventoryOrderProduct[]): void {
        const validator = this.form.getControl('inventoryOrderProducts').validator;
        // create form array for products using generated products
        this.form.setControl(
            'inventoryOrderProducts',
            this.formFactory.array(
                'InventoryOrderProduct',
                // Appending newly added products to the existing products
                existingProducts.concat(newProducts),
                this._destroyed,
                { accessMode: this.accessMode }
            )
        );
        // Copy existing validation into new control
        this.form.getControl('inventoryOrderProducts').setValidators(validator);
        // Run validation in case the new control is empty
        this.form.getControl('inventoryOrderProducts').updateValueAndValidity();
        this.inventoryOrderProducts.markAsDirty();
    }

    /** Determines if all of the available rows of the table are selected. */
    isAllSelected(data: TypedFormGroup<InventoryOrderProduct>[]): boolean {
        const numSelected = this.selection && this.selection.selected.length;
        const numRows = data.length;
        return numSelected === numRows;
    }

    /** If no rows are selected selects all available rows, if all rows are selected then clears the selection. */
    masterToggle(data: TypedFormGroup<InventoryOrderProduct>[]): void {
        this.isAllSelected(data) ? this.selection.clear() : data.forEach((row) => this.selection.select(row));
    }

    /** Remove products based on selectionModel */
    removeProducts(): void {
        // iterate over selected proucts to determine which are to be deleted
        this.selection.selected.forEach((productFormGroup) => {
            // find index of currently selected product in model
            const index = this.inventoryOrderProducts.controls.findIndex(
                (orderProduct) => orderProduct.value.product.id === productFormGroup.value.product.id
            );
            // remove selected currently product from model at index
            this.inventoryOrderProducts.removeAt(index);
        });
        // rebuild table from updated model clear selections
        this.products$.next(this.initializeTable());
        this.inventoryOrderProducts.markAsDirty();
        this.table.renderRows();
        this.selection.clear();
    }

    /** Initialize table data source with given products and sorting */
    initializeTable(): MatTableDataSource<TypedFormGroup<InventoryOrderProduct>> {
        const currentSort = this.products$.value?.sort;

        const table = new MatTableDataSource<TypedFormGroup<InventoryOrderProduct>>(
            this.inventoryOrderProducts.controls as TypedFormGroup<InventoryOrderProduct>[]
        );
        // for columns with nested properties
        table.sortingDataAccessor = (item, property) => {
            switch (property) {
                case 'secondLevelCategory.description':
                    return item.getControlValue('secondLevelCategory').description;
                case 'product.code':
                    return item.getControlValue('product').code;
                case 'product.description':
                    return item.getControlValue('product').description;
                case 'product.sapNumber':
                    return item.getControlValue('product').sapNumber;
                case 'uom.code':
                    return item.getControlValue('uom').code;
                default:
                    return item.get(property).value;
            }
        };

        // update data source sorting to use persistant matSort
        if (currentSort) {
            this.sort = currentSort;
        }
        this.sortChange(table);
        return table;
    }

    get inventoryOrderProducts(): FormArray {
        return this.form.getArray('inventoryOrderProducts');
    }

    get orderNumber(): string {
        return this.model.id?.number;
    }

    get storeCode(): string {
        return this.model.store?.code;
    }

    get status(): string {
        return this.model.status?.description;
    }

    get isStoreEditable(): boolean {
        return this.accessMode.isAdd && !this.isGeneratingOrder && !this.isOrderGenerated;
    }

    get isVendorEditable(): boolean {
        return this.isStoreEditable && this.form.getControl('store').valid;
    }

    get renderSelection(): boolean {
        return this.accessMode.isAdd || (this.accessMode.isEdit && this.model.status.code === 'OPEN');
    }

    /** Updates the sort order of the table data. */
    sortChange(products: MatTableDataSource<TypedFormGroup<InventoryOrderProduct>>) {
        products.sort = this.sort;
    }

    quantity(rowIndex: number) {
        return this.form.get('inventoryOrderProducts').get(`${rowIndex}`).get('quantity');
    }

    /**
     * Navigate to receipt page after clicking on associated RM
     */
    navigateToAssociatedReceipt(receiptNumber: string): void {
        this.navigateToReceipt(this.accessMode, this.storeCode, receiptNumber);
    }

    navigateToOpenReceipt(receiptNumber: string): void {
        this.navigateToReceipt(AccessMode.EDIT, this.form.getControlValue('store').code, receiptNumber);
    }

    private navigateToReceipt(accessMode: AccessMode, store: string, receiptNumber: string) {
        this.router.navigate(['/inventory/receipt-of-material', accessMode.urlSegement, store, receiptNumber]);
    }

    isCancelOrderButtonShown(): boolean {
        return this.accessMode.isEdit && this.model.status.code === 'OPEN';
    }

    /**
     * Cancels/deletes the inventory order
     */
    cancelInventoryOrder(): void {
        this.isLoading = true;
        this.cancelDialog.close();
        this.inventoryOrderFacade.cancelInventoryOrder(this.storeCode, this.orderNumber).subscribe(
            () => {
                // Setting the form to null after the order is successfully deleted and before router.navigate
                // is called prevents the unsaved changes dialog from appearing after cancelling an order.
                this.form = null;
                this.isLoading = false;
                this.messageFacade.addMessage({
                    message: `Order number ${this.orderNumber} has been cancelled.`,
                    severity: 'success',
                });
                this.cancelDialog.close();
                this.navigateToSearchPage();
            },
            (err) => {
                this.isLoading = false;
                throw err;
            }
        );
    }

    deleteOldInventoryOrder(): void {
        this.isLoading = true;
        this.closeOldOrderDialog();
        this.inventoryOrderFacade.cancelInventoryOrder(this.storeCode, this.orderNumber).subscribe(
            () => {
                this.form = null;
                this.isOldOrder = false;
                this.isLoading = false;
                this.messageFacade.addMessage({
                    message: `Order number ${this.orderNumber} has been cancelled.`,
                    severity: 'success',
                });
                this.navigateToSearchPage();
            },
            (err) => {
                this.isOldOrder = false;
                this.isLoading = false;
                throw err;
            }
        );
    }

    openCancelOrderDialog(): void {
        this.cancelDialog.open();
    }

    closeCancelOrderDialog(): void {
        this.cancelDialog.close();
    }

    /** can not close the dialog without choosing any option */
    openOldOrderDialog(): void {
        this.oldOrderDialog.open();
        this.oldOrderDialog.dialogRef.disableClose = true;
        this.oldOrderDialog.dialogRef.backdropClick().subscribe(() => {
            // open the dialog
            this.openOldOrderDialog();
        });
    }
    closeOldOrderDialog(): void {
        this.oldOrderDialog.close();
    }

    /** Save and navigate back to previous page. */
    save(): void {
        this.saveFacade.save(this.form, this.model, this.route).subscribe();
    }

    apply(): void {
        const reload = () => {};
        this.saveFacade.apply(this.form, this.model, reload).subscribe((id: InventoryOrderPK) => {
            if (this.accessMode.isAdd) {
                // update the id for save message
                this.model.id = id;
                this.router.navigate(
                    [`/inventory/inventory-order/edit/${this.form.getControlValue('store').code}/${id.number}`],
                    {
                        relativeTo: this.route.parent,
                    }
                );
            } else {
                this.form = undefined;
                this.ngOnInit();
            }
        });
    }

    openFinalizeOrderDialog(): void {
        this.finalizeDialog.open();
    }

    closeFinalizeOrderDialog(): void {
        this.finalizeDialog.close();
    }

    finalize(): void {
        this.closeFinalizeOrderDialog();
        this.isOrderGenerated = false;
        this.finalizeFacade.save(this.form, this.model, this.route).subscribe();
    }

    /**
     * Maps the user selected/inputed product(s) into `product.codes`. Since the users is able
     * to enter products in the product input box in a comma separated list e.g. 'p1,p2,p3', this
     * method will split that string into the appropriate product codes to be sent to the API as
     * as parameter.
     *
     * ### Example
     *
     * ```
     * user enters:
     * [
     *  {code: 'p1   , p2 ,p3 '},
     * ]
     * --> ['p1','p2','p3']
     *
     * user selects:
     * [
     *  {id: 1, code: 'p1'},
     *  {id: 2, code: 'p2'},
     * ]
     * --> ['p1','p2']
     *
     * ```
     */
    splitDelimitedProducts(products: { id: number; code: string }[]): string[] {
        if (products.length === 1 && isNullOrUndefined(products[0].id)) {
            // user has entered product values via the product-add-input-component input box, which
            // can be comma delimited to enter multiple product codes
            const productCode = products[0].code;
            return productCode.split(',').map((pc) => pc.trim());
        } else {
            return products.map((p) => p.code);
        }
    }

    addRequestedProducts(products: { id: number; code: string }[]): void {
        this.isLoading = true;
        this.generateProducts(
            this.form.getArray('inventoryOrderProducts').getRawValue(),
            this.splitDelimitedProducts(products)
        );
        this.inventoryOrderProducts.markAsDirty();
    }

    get existingProductCodes(): string[] {
        return this.form.getArrayValue('inventoryOrderProducts').map((iop) => iop.product.code);
    }

    private navigateToSearchPage = () => this.router.navigate(['search'], { relativeTo: this.route.parent });

    ngOnDestroy(): void {
        this._destroyed.next();
        this.openReceiptsDialog = null;
    }

    /** @see DataModifyingComponent */
    get unsavedChanges(): boolean {
        return this.accessMode.isAdd ? this.isOrderGenerated && this.form?.dirty : this.form?.dirty;
    }
}
