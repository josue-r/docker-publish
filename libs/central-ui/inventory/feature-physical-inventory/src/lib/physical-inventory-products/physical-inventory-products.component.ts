import { SelectionModel } from '@angular/cdk/collections';
import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ParameterFacade, ParameterType } from '@vioc-angular/central-ui/config/data-access-parameter';
import {
    PhysicalInventory,
    PhysicalInventoryCount,
    PhysicalInventoryFacade,
} from '@vioc-angular/central-ui/inventory/data-access-physical-inventory';
import { ProductCategoryFacade } from '@vioc-angular/central-ui/product/data-access-product-category';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { Described, isEmptyInputValue, isNullOrUndefined } from '@vioc-angular/shared/common-functionality';
import { FeatureFlagFacade } from '@vioc-angular/shared/data-access-feature-flag';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { DialogComponent } from '@vioc-angular/shared/ui-dialog';
import { DataModifyingComponent } from '@vioc-angular/shared/util-data-modifying';
import { FormFactory, TypedFormGroup } from '@vioc-angular/shared/util-form';
import { chunk, defaultTo, sum } from 'lodash';
import { Observable, ReplaySubject, throwError } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, filter, map, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'vioc-angular-physical-inventory-products',
    templateUrl: './physical-inventory-products.component.html',
    styleUrls: ['./physical-inventory-products.component.scss'],
    // changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [PhysicalInventoryFacade, ProductCategoryFacade, ParameterFacade, FeatureFlagFacade],
})
export class PhysicalInventoryProductsComponent extends DataModifyingComponent implements OnInit, OnDestroy {
    private readonly _destroyed = new ReplaySubject(1);

    /** Selectable option for the categories filter on the product count table that will display all products. */
    readonly allCategories: Described[] = [{ ...new Described(), code: 'ALL' }];

    /** Timeout length for displaying the success message for auto saving product count changes. */
    readonly saveMessageTimeout = 3000;

    /** Prefix for the product count tolerance company parameter. To be combined with the `supportedUomToleranceTypes`. */
    readonly toleranceParamPrefix = 'PHYS_INV_TOLERANCE_PCT_';

    /** Variable for the show variance company parameter. */
    readonly showVarianceParameter = 'SHOW_VARIANCE_BOOK_ON_PHY_INV';

    /** Supported units of measure that can be used to search for count tolerances. */
    readonly supportedUomToleranceTypes = ['CASE', 'DRUM', 'EACH', 'GALL', 'INCHES', 'LBS', 'PINT', 'QUART'];

    /** Form containing the value changes for the product count table. */
    @Input() form: TypedFormGroup<PhysicalInventory>;

    /** Model containing the original values of the product count. */
    @Input() model: PhysicalInventory;

    /** Mode in which the page is being accessed in. */
    @Input() accessMode: AccessMode;

    /**
     * Used to trigger a search for products on component initialization. If a category value is provided,
     * then a search is triggered for that category. If no value is provided, then not search is triggered.
     */
    @Input() initiateCategorySearch: Described[];

    /** Toggle used to control if the page is being displayed in location based counting mode or normal mode. */
    @Input() isCountingByLocation = false;

    /** Emitter used to update listeners when the component is switched into count by location mode. */
    @Output() switchedToChangeByLocation = new EventEmitter();

    /** Has the index value of the location */
    @Input() selectedValueIndex = 0;

    /** Emmits the user selected value index */
    @Output() selectedValueIndexOutput = new EventEmitter<number>();

    /** Dialog used to confirm if user wishes to close count */
    @ViewChild('closeCountWarningDialog', { static: true }) closeCountWarningDialog: DialogComponent;

    @ViewChild(MatSort, { static: false }) set sort(sort: MatSort) {
        this.products.sort = sort;
    }

    @ViewChild('filterProductInput', { static: false }) filterProductInput: ElementRef;

    /** List of categories that can be selected to filter the list of products listed imn the table. */
    categories$: Observable<Described[]>;

    /** Control that maintains the selected value of the category filter. */
    categoryControl = new FormControl();

    /** Table source that will be used to display the product count values. */
    products = new MatTableDataSource<TypedFormGroup<PhysicalInventoryCount>>([]);

    /** Used to maintain the selected values in the table. */
    selection = new SelectionModel<TypedFormGroup<PhysicalInventoryCount>>(true, []);

    /** Determines whether or not to display the loading overlay over the product count table. */
    isLoadingProducts = false;

    isLoadingCount: boolean[] = [];

    /** Determines if the component is still processing an update. */
    isUpdating = false;

    /** Determines if the component is still processing a update to close counts. */
    isClosing = false;

    /** Limit of product that can have a quantity of zero on a certain Product Count. Used on the dialog  */
    maxZeroCountClosedPerc: number = null;

    /** List of displayable columns in the product count table. */
    displayedColumns: string[];

    /** Map of all applicable tolerances for each units of measure.  */
    uomToleranceMap: Map<string, number> = new Map();

    /** Determine to display record contains only warning */
    showWarning = false;

    /** Determines if warning checkbox is disabled or enabled. */
    isShowWarningDisabled = false;

    /** store selected category code from selected category object.*/
    categoryCode: string[] = [];

    /** reset category while checking category change for dirty page */
    currentCategories: Described[] = [];

    /** Array of `PhysicalInventoryCount`s that have been split into smaller array that will be saved in chunks. */
    closeBatchCounts = [];

    slideToggleLabels: Map<{ physicalInventoryId?: number; line?: number }, string> = new Map();

    innerLabels: Map<{ physicalInventoryId?: number; line?: number }, string> = new Map();

    volumeToHeightCodes: Map<{ physicalInventoryId?: number; line?: number }, { height: string; volume: string }> =
        new Map();

    calculatorEnabled = false;

    /** Toggle used to control if the page is being displayed in location based counting mode or normal mode. */
    showVariance = false;

    describedEquals = Described.idEquals;

    locations = [
        { code: 'BAY', description: 'Bay' },
        { code: 'DISPLAY', description: 'Display' },
        { code: 'SHELF', description: 'Shelf' },
        { code: 'TANK_DRUM', description: 'Tank/Drum' },
        { code: 'TOPSIDE', description: 'Topside' },
    ];

    /** Control used to filter the products by code based on the value. */
    filterProduct = new FormControl();

    /** The currently selected location that products are being counted in. */
    currentLocation = new FormControl();

    constructor(
        public readonly physicalInventoryFacade: PhysicalInventoryFacade,
        public readonly productCategoryFacade: ProductCategoryFacade,
        public readonly parameterFacade: ParameterFacade,
        public readonly messageFacade: MessageFacade,
        public readonly featureFlagFacade: FeatureFlagFacade,
        private readonly formFactory: FormFactory,
        private readonly changeDetector: ChangeDetectorRef
    ) {
        super();
    }

    ngOnInit(): void {
        // set the current location to be the first on the list
        let element = this.locations[this.selectedValueIndex];
        this.locations.splice(this.selectedValueIndex, 1);
        this.locations.splice(0, 0, element);

        this.currentLocation.setValue(this.locations[0].code, { emitEvent: false });

        this.findCompanyCountTolerances();
        this.categories$ = this.productCategoryFacade
            .findSecondLevelByStore(this.form.getControlValue('store').code)
            .pipe(map((pc) => this.allCategories.concat(pc)));
        // Looks up the SHOW_VARIANCE_BOOK_ON_PHY_INV company parameter
        this.parameterFacade
            .findStoreParameterValue(
                this.showVarianceParameter,
                ParameterType.BOOLEAN,
                this.form.getControlValue('store').id
            )
            .subscribe((showVariance: boolean) => {
                this.showVariance = showVariance;
            });
        this.featureFlagFacade
            .isEnabled('physicalInventory.edit.calculator')
            .pipe(takeUntil(this._destroyed))
            .subscribe((e) => (this.calculatorEnabled = e));
        this.filterProduct.valueChanges
            .pipe(takeUntil(this._destroyed), debounceTime(200), distinctUntilChanged())
            .subscribe((v) => {
                this.filterProducts(this.showWarning, v);
                // resets the focus back to the product filter after the table has updated
                this.filterProductInput.nativeElement.focus();
            });
        this.currentLocation.valueChanges
            .pipe(
                takeUntil(this._destroyed),
                distinctUntilChanged(),
                filter(() => !isNullOrUndefined(this.form.getControl('counts')))
            )
            .subscribe(() => {
                this.resetActualCount();
            });
        if (!isNullOrUndefined(this.initiateCategorySearch)) {
            this.categoryControl.setValue(this.initiateCategorySearch);
            this.getProductByCategories();
        }
    }

    ngOnDestroy(): void {
        this._destroyed.next();
    }

    selectCategoryCodes(option: Described): void {
        const checkStatus = this.categoryControl.value.includes(option);
        if (option.code === 'ALL' && checkStatus) {
            // Maintain If all is checked then all options will be checked.
            this.categories$.subscribe((element) => {
                this.categoryControl.setValue(element);
            });
        } else if (option.code === 'ALL' && !checkStatus) {
            // Maintain If all is unchecked then all options will be unchecked.
            this.categoryControl.setValue([]);
        } else if (option.code !== 'ALL' && !checkStatus) {
            let array: any[] = this.categoryControl.value;
            const index = array.findIndex((x) => x.code === 'ALL');
            //remove selection from all if deselect any option
            if (index !== -1) {
                this.categoryControl.value.splice(index, 1);
                array = this.categoryControl.value;
                this.categoryControl.setValue([]);
                this.categoryControl.setValue(array);
            }
        } else if (option.code !== 'ALL' && checkStatus) {
            //Determine if checkbox selected for all categories then All option will be automatically selected.
            this.categories$.subscribe((element) => {
                if (element.length - 1 === this.categoryControl.value.length) {
                    this.categoryControl.setValue(element);
                }
            });
        }
    }

    openChangedEvent(event): void {
        if (!event && this.categoryControl?.value?.length > 0) {
            this.getProductByCategories();
        } else {
            this.resetCategories();
        }
    }

    setHeight(row, index: number): void {
        row.getControl('height').setValue(row.getControl('actualCount').value);
        const innerLabel = this.getInnerLabel(row);
        if (innerLabel === this.sliderInnerLabel.height) {
            row.patchControlValue('volumeCalculatorEnabled', true);
        }
    }

    getVolume(checked: boolean, row, index: number): void {
        if (checked) {
            if (row.getControl('height').value) {
                this.isLoadingCount[index] = true;
                this.physicalInventoryFacade
                    .calculateVolume(
                        row.getControlValue('product').id,
                        this.form.getControlValue('store').code,
                        row.getControl('height').value
                    )
                    .pipe(
                        catchError((e) => {
                            this.isLoadingCount[index] = false;
                            row.getControl('actualCount').setValue(0.0);
                            return throwError(e);
                        })
                    )
                    .subscribe((volume) => {
                        row.getControl('actualCount').setValue(volume);
                        this.isLoadingCount[index] = false;
                    });
            }
            this.setSlideToggle(row, this.getVolumeToHeight(row).volume);
            this.setInnerLabel(row, this.sliderInnerLabel.volume);

            row.getControl('height').setValue(0.0);
        } else {
            this.setSlideToggle(row, this.getVolumeToHeight(row).height);
            this.setInnerLabel(row, this.sliderInnerLabel.height);
            if (row.getControl('actualCount').value != 0.0) {
                row.getControl('actualCount').setValue(0.0);
                row.markAsDirty();
            }
            row.getControl('height').setValue(0.0);
            this.updateTotalQuantity(row);
        }
        row.patchControlValue('volumeCalculatorEnabled', false);
    }

    resetCategories(): void {
        // Determine all checkbox should selected on open popup if all is selected.
        if (this.categoryControl?.value?.length > 0) {
            const describedList = this.categoryControl.value;
            describedList.forEach((element) => {
                this.categoryCode.push(element.code);
            });
            if (this.categoryCode.includes('ALL')) {
                if (this.currentCategories?.length > 1) {
                    this.categoryControl.setValue(this.currentCategories);
                } else {
                    this.categories$.subscribe((element) => {
                        this.categoryControl.setValue(element);
                    });
                }
            }
        } else {
            this.categoryCode = [];
        }
    }

    getProductByCategories(reloadProducts = false): void {
        // reset the product filter to should all products in the table
        const describedCategories = this.categoryControl.value;
        if (describedCategories !== this.currentCategories || reloadProducts) {
            // reload the products if the selected categories have changed or reloadProducts is true
            this.categoryCode = describedCategories.map((e: Described) => e.code);
            this.isShowWarningDisabled = true;
            this.isLoadingProducts = true;
            this.physicalInventoryFacade
                .searchCountProductsByCategories(
                    this.form.getControlValue('id'),
                    this.categoryCode.includes('ALL') ? null : this.categoryCode,
                    this.isCountingByLocation
                )
                .pipe(filter(() => reloadProducts || this.confirmUnsavedChanges()))
                .subscribe((product) => {
                    this.resetForm();
                    this.isShowWarningDisabled = false;
                    this.isLoadingProducts = false;
                    this.initializeForm(product);
                    this.changeDetector.detectChanges();
                    this.currentCategories = describedCategories;
                });
        }
        if (this.categoryCode.includes('ALL')) {
            //Only All option will be  displayed on popup close and other will be removed.
            this.categoryControl.setValue([this.categoryControl.value[0]]);
        }
    }

    private resetForm(): void {
        // resets the counts control to prevent unsaved
        // changes from triggering after loading a new list
        this.form.getControl('counts')?.reset();
        this.selection.clear();
    }

    warningFilter(event: boolean): void {
        // Display only warnings if true.
        this.showWarning = event;
        if (this.form?.getArray('counts')?.controls && this.categoryControl.value !== null) {
            if (this.showWarning) {
                this.products = new MatTableDataSource<TypedFormGroup<PhysicalInventoryCount>>(
                    this.form
                        .getArray('counts')
                        .controls.filter((c) =>
                            c.get('warning') ? c.get('warning').value.length > 0 : false
                        ) as TypedFormGroup<PhysicalInventoryCount>[]
                );
            } else {
                this.products = new MatTableDataSource<TypedFormGroup<PhysicalInventoryCount>>(
                    this.form.getArray('counts').controls as TypedFormGroup<PhysicalInventoryCount>[]
                );
            }
        }
    }

    /**
     * If the SHOW_VARIANCE_BOOK_ON_PHY_INV company parameter is true, add the variance columns to be displayed
     * Else If in countByLocation is true, exclude the variance columns in the display and include totalQuantity
     * Else display the default columns without the variance or count by location columns
     */
    private initDisplayedColumns(): void {
        if (this.isCountingByLocation) {
            // add count by location columns
            this.displayedColumns = [
                'productCode',
                'categoryCode',
                'uom',
                'actualCount',
                'totalQuantity',
                'closedOn',
                'warning',
            ];
        } else if (this.showVariance) {
            // add variance columns
            this.displayedColumns = [
                'select',
                'productCode',
                'categoryCode',
                'uom',
                'actualCount',
                'qohCountWhenOpened',
                'qohCountWhenClosed',
                'variance',
                'closedOn',
                'warning',
            ];
        } else {
            // set the default column values to be displayed on the screen
            this.displayedColumns = [
                'select',
                'productCode',
                'categoryCode',
                'uom',
                'actualCount',
                'closedOn',
                'warning',
            ];
        }
    }

    /**
     * Creates a map of all applicable tolerances for each units of measure for the counts in the table
     * if Product Count status is open.
     */
    findCompanyCountTolerances(): void {
        if (this.form.getControlValue('status').code === 'OPEN') {
            this.supportedUomToleranceTypes.forEach((t) =>
                this.parameterFacade
                    .findStoreParameterValue(
                        this.toleranceParamPrefix.concat(t),
                        ParameterType.INTEGER,
                        this.form.getControlValue('store').id
                    )
                    .subscribe((v: number) => this.uomToleranceMap.set(t, v))
            );
        }
    }

    initializeForm(products: PhysicalInventoryCount[]): void {
        // remove the initial control from the form and recreate it with a new form array
        this.form.removeControl('counts');
        this.form.setControl(
            'counts',
            this.formFactory.array('PhysicalInventoryCount', products, this._destroyed, {
                accessMode: this.accessMode,
                isCountingByLocation: this.isCountingByLocation,
                currentLocation: this.currentLocation.value,
            })
        );
        this.applyWarnings();
        this.addCalculatorFields();
        this.initializeTable();
    }

    /**
     * Initializes the table source and the ability to sort by the column headers of the table.
     */
    initializeTable(): void {
        this.initDisplayedColumns();
        this.filterProducts(this.showWarning, this.filterProduct.value);
    }

    filterProducts(showWarning: boolean, filterValue?: string): void {
        this.showWarning = showWarning;
        if (this.form?.getArray('counts')?.controls && this.categoryControl.value !== null) {
            const filteredProducts = this.form.getArray('counts').controls.filter((p) => {
                if (this.showWarning) {
                    // if only showing warning filter products without warnings
                    return p.get('warning') ? p.get('warning').value.length > 0 : false;
                }
                if (!isEmptyInputValue(filterValue)) {
                    // if there is a product filter in place, filter the products that do not match the filter
                    return p.get('product').value.code.toLowerCase().includes(filterValue.trim().toLowerCase());
                }
                return true;
            }) as TypedFormGroup<PhysicalInventoryCount>[];
            this.products = new MatTableDataSource<TypedFormGroup<PhysicalInventoryCount>>(filteredProducts);
            this.applySortToTable();
            this.changeDetector.detectChanges();
        }
    }

    /** Configures how the table should sort on the column headers. */
    applySortToTable(): void {
        // for columns with nested properties
        this.products.sortingDataAccessor = (item, property) => {
            switch (property) {
                case 'productCode':
                    return item.getControlValue('product').code;
                case 'categoryCode':
                    return item.getControlValue('category').code;
                case 'uom': {
                    if (!item.disabled && !isNullOrUndefined(item.getControl('storeTank'))) {
                        if (
                            this.slideToggleLabels.get(item.getControlValue('id')) ===
                            item.getControl('storeTank')?.value?.companyTank?.heightUom?.code
                        ) {
                            return item.getControl('storeTank')?.value?.companyTank?.heightUom?.code;
                        } else {
                            return item.getControlValue('uom').code;
                        }
                    } else {
                        return item.getControlValue('uom').code;
                    }
                }
                default:
                    return item.get(property).value;
            }
        };
    }

    /**
     * Displays a confirmation message to the user if they have made changes to the counts. If the user clicks continue,
     * then this method will return true and continue to load the new list of products. If the user clicks cancel,
     * then this method will return false and not load the products.
     */
    confirmUnsavedChanges(): boolean {
        const changeCategory =
            this.form.pristine || confirm('You have unsaved changes. If you leave, your changes will be lost.');
        if (!changeCategory) {
            this.categoryCode = this.currentCategories.map((e: Described) => e.code);
            this.categoryControl.setValue(this.currentCategories);
        }
        return changeCategory;
    }

    /**
     * Applies warnings to counts that have values the exceed the max stock limit and/or exceed the max variance
     * allowed for the count if the product count is open.
     */
    applyWarnings(): void {
        if (this.form.getControlValue('status').code === 'OPEN') {
            this.form
                .getArray('counts')
                .controls.filter((c) => !isNullOrUndefined(c.value.actualCount))
                .forEach((c: TypedFormGroup<PhysicalInventoryCount>) => {
                    c.addControl('warning', new FormControl([]));
                    const count = c.getRawValue();
                    // check for max stock limit warning
                    if (!isNullOrUndefined(count.maxStockLimit) && count.actualCount > count.maxStockLimit) {
                        c.get('warning').value.push(`Greater than max stock limit ${count.maxStockLimit}`);
                    }
                    // check for variance warning
                    const tolerance = this.uomToleranceMap.get(count.uom.code);
                    if (!isNullOrUndefined(tolerance)) {
                        const qohTolerance = (tolerance / 100) * count.quantityOnHand;
                        if (count.actualCount - count.quantityOnHand > qohTolerance) {
                            c.get('warning').value.push(`Greater than variance ${tolerance}%`);
                        }
                    }
                    c.get('warning').disable();
                });
        }
    }

    addCalculatorFields(): void {
        if (this.form.getControlValue('status').code === 'OPEN') {
            this.form.getArray('counts').controls.forEach((c: TypedFormGroup<PhysicalInventoryCount>, index) => {
                const heightCode = c.getControl('storeTank')?.value?.companyTank?.heightUom?.code;
                this.volumeToHeightCodes.set(c.getControlValue('id'), {
                    height: heightCode,
                    volume: c.getControlValue('uom').code,
                });

                this.setSlideToggle(c, heightCode);
                if (!c.disabled && heightCode) {
                    if (!this.isCountingByLocation && c.getControl('actualCount').value !== 0) {
                        this.setSlideToggle(c, c.getControlValue('uom').code);
                        this.setInnerLabel(c, this.sliderInnerLabel.volume);
                    } else {
                        this.setInnerLabel(c, this.sliderInnerLabel.height);
                    }
                    c.addControl('height', new FormControl());
                }
            });
        }
    }

    resetDefaultCalculatorFields(): void {
        if (this.form.getControlValue('status').code === 'OPEN') {
            this.form.getArray('counts').controls.forEach((c: TypedFormGroup<PhysicalInventoryCount>, index) => {
                const heightCode = c.getControl('storeTank')?.value?.companyTank?.heightUom?.code;
                this.setSlideToggle(c, heightCode);
                this.setInnerLabel(c, this.sliderInnerLabel.height);
                if (!this.isCountingByLocation && heightCode && c.getControl('actualCount').value !== 0) {
                    this.setSlideToggle(c, c.getControlValue('uom').code);
                    this.setInnerLabel(c, this.sliderInnerLabel.volume);
                }
            });
        }
    }

    /** Toggles the selection of all the values in the table. */
    masterToggle(): void {
        this.isAllSelected()
            ? this.selection.clear()
            : this.products.data
                  // select only the OPEN counts
                  .filter((c) => !c.disabled)
                  .forEach((control) => this.selection.select(control));
    }

    /** Helper method for determining if a value in the selection is selected. */
    valueSelected(): boolean {
        return this.selection && this.selection.hasValue();
    }

    /** Checks if all of the values of the table have been selected. */
    isAllSelected(): boolean {
        return (
            this.selection.selected.length ===
            this.products.data
                // only check the OPEN counts
                .filter((c) => !c.disabled).length
        );
    }

    /** Checks to see if the master toggle should be selectable. */
    isAllSelectable(): boolean {
        return this.products.data.some((c) => !c.disabled);
    }

    /** Open the dialog to ask if the user wants to really close the count */
    openCloseCountWarningDialog(): void {
        this.closeCountWarningDialog.open();
    }

    /** Close the dialog where were asked if the user wanted to close the count */
    closeCloseCountWarningDialog(): void {
        this.closeCountWarningDialog.close();
    }

    /** Cheking if the percentage of closed products on the product count exceeds a certain limit. */
    closeCountsWithQuantityZeroWarning(): void {
        const zeroQuantityModelCounts = this.products.data.filter(
            (c) => c.disabled && 'CLOSED' === c.value.status.code && c.value.actualCount === 0
        );

        const zeroQuantitySelectedCounts = this.selection.selected.filter(
            (c) => c.getControlValue('actualCount') === 0
        );

        const zeroQuantityCountsLength = zeroQuantityModelCounts.length + zeroQuantitySelectedCounts.length;

        this.parameterFacade
            .findStoreParameterValue(
                'MAX_ZERO_COUNT_CLOSED_PERC',
                ParameterType.INTEGER,
                this.form.getControlValue('store').id
            )
            .subscribe((maxZeroCountClosedPerc) => {
                const maxZeroCountClosedInPercentage = maxZeroCountClosedPerc * 0.01 * this.products.data.length;
                if (zeroQuantityCountsLength > maxZeroCountClosedInPercentage) {
                    this.maxZeroCountClosedPerc = maxZeroCountClosedPerc;
                    this.openCloseCountWarningDialog();
                } else {
                    this.closeCount();
                }
            });
        this.resetDefaultCalculatorFields();
    }

    /** Updates the status of the selected rows to CLOSED. */
    closeCount(): void {
        const openState = 0;
        if (this.closeCountWarningDialog?.dialogRef?.getState() === openState) {
            this.closeCloseCountWarningDialog();
        }
        const invalidCounts = this.selection.selected.filter(
            (c) => c.invalid || isEmptyInputValue(c.getControlValue('actualCount'))
        );
        if (invalidCounts.length > 0) {
            this.messageFacade.addMessage({
                severity: 'error',
                message:
                    'The following products have validation errors and cannot be closed: ' +
                    invalidCounts.map((c) => c.getControlValue('product').code).join(', '),
            });
        } else {
            this.batchCloseCounts();
        }
    }

    /** @see DataModifyingComponent */
    get unsavedChanges(): boolean {
        if (this.closeBatchCounts?.length) {
            return true;
        }
    }

    get sliderInnerLabel() {
        return { height: 'Height', volume: 'Volume' };
    }

    /** Close counts via a batch size of 500 records at a time. */
    batchCloseCounts(): void {
        const closedCounts = this.selection.selected.map((c) => {
            c.disable();
            return c.getRawValue();
        }) as PhysicalInventoryCount[];

        const batchSize = 500;
        this.closeBatchCounts = chunk(closedCounts, batchSize);
        this.closeBatchedCounts();
    }

    /** @see PhysicalInventoryProductsComponent#batchCloseCounts */
    closeBatchedCounts(): void {
        const updatedModel: PhysicalInventory = { ...this.form.getRawValue(), counts: this.closeBatchCounts[0] };
        this.isUpdating = true;
        this.isClosing = true;
        this.isLoadingProducts = true;

        const promises: Promise<void>[] = this.calculateVolumeOnClose(updatedModel);

        Promise.all(promises).then(() => {
            this.physicalInventoryFacade.closeCount(updatedModel).subscribe((updatedValue: PhysicalInventory) => {
                this.updateCountForm(updatedValue);
                this.selection.selected.forEach((c) => {
                    this.updateProductCountForm(updatedValue, c);
                    // Remove all warning messages from the array
                    c.get('warning')?.setValue([]);
                });
                this.closeBatchCounts.shift();
                this.changeDetector.detectChanges();
                if (this.closeBatchCounts && this.closeBatchCounts.length > 0) {
                    this.closeBatchedCounts();
                } else {
                    this.resetSelection();
                }
            });
        });
    }

    /** If there is any changes in height,below method is used to calculate volume on close count. */
    calculateVolumeOnClose(updatedModel: PhysicalInventory): Promise<void>[] {
        return updatedModel.counts
            .filter((c) => !isNullOrUndefined(c.actualCount) && c.volumeCalculatorEnabled)
            .map((count: PhysicalInventoryCount, index: number) => {
                return new Promise((resolve) => {
                    this.physicalInventoryFacade
                        .calculateVolume(
                            count.product.id,
                            this.form.getControlValue('store').code,
                            count.actualCount.toString()
                        )
                        .pipe(
                            catchError((e) => {
                                this.selection.selected.map((c) => {
                                    c.enable();
                                    return c.getRawValue();
                                }) as PhysicalInventoryCount[];
                                this.resetSelection();
                                return throwError(e);
                            })
                        )
                        .subscribe((calculatedVolume) => {
                            updatedModel.counts[index].actualCount = calculatedVolume;
                            resolve();
                        });
                });
            });
    }

    private getSlideToggleLabel(c: TypedFormGroup<PhysicalInventoryCount>): string {
        return this.slideToggleLabels.get(c.getControlValue('id'));
    }

    private getInnerLabel(c: TypedFormGroup<PhysicalInventoryCount>): string {
        return this.innerLabels.get(c.getControlValue('id'));
    }

    private getVolumeToHeight(c: TypedFormGroup<PhysicalInventoryCount>): { height: string; volume: string } {
        return this.volumeToHeightCodes.get(c.getControlValue('id'));
    }

    private setSlideToggle(c: TypedFormGroup<PhysicalInventoryCount>, label: string): void {
        this.slideToggleLabels.set(c.getControlValue('id'), label);
    }

    private setInnerLabel(c: TypedFormGroup<PhysicalInventoryCount>, label: string): void {
        this.innerLabels.set(c.getControlValue('id'), label);
    }

    private resetSelection() {
        this.isUpdating = false;
        this.isClosing = false;
        this.isLoadingProducts = false;
        this.selection.clear();
        this.changeDetector.detectChanges();
    }

    /** Updates the Product Count form with the updated values from the API. */
    private updateCountForm(updatedValue: PhysicalInventory) {
        this.form.patchControlValue('status', updatedValue.status);
        this.form.patchControlValue('finalizedOn', updatedValue.finalizedOn);
        this.form.patchControlValue('updatedBy', updatedValue.updatedBy);
        this.form.patchControlValue('updatedByEmployee', updatedValue.updatedByEmployee);
        this.form.patchControlValue('updatedOn', updatedValue.updatedOn);
        this.form.patchControlValue('version', updatedValue.version);
    }

    /** Updates the selected product count forms with the updated values from the API. */
    private updateProductCountForm(
        updatedValue: PhysicalInventory,
        control: TypedFormGroup<PhysicalInventoryCount>
    ): void {
        const updatedCountValue = updatedValue.counts?.find(
            (c) => c.product.code === control.getControlValue('product').code
        );
        if (updatedCountValue) {
            control.patchControlValue('actualCount', updatedCountValue.actualCount);
            control.patchControlValue('closedOn', updatedCountValue.closedOn);
            control.patchControlValue('status', updatedCountValue.status);
            control.patchControlValue('version', updatedCountValue.version);
            // We can only do this if variance, qohCountWhenOpened, and qohCountWhenClosed are
            // returned from the api so when the SHOW_VARIANCE_BOOK_ON_PHY_INV company parameter is true
            if (control.getControl('variance') != null) {
                control.patchControlValue('variance', updatedCountValue.variance);
            }
            if (control.getControl('qohCountWhenClosed') != null) {
                control.patchControlValue('qohCountWhenClosed', updatedCountValue.qohCountWhenClosed);
            }
            control.markAsPristine();
        }
    }

    /** When quantity counted updates, update total quantity to reflect that */
    updateTotalQuantity(row): void {
        if (this.isCountingByLocation) {
            if (
                row
                    .getControl('countsByLocation')
                    .value.map((cl) => cl.location)
                    .includes(this.currentLocation.value)
            ) {
                const index = row
                    .getControl('countsByLocation')
                    .value.findIndex((cl) => cl.location === this.currentLocation.value);
                row.getControl('countsByLocation').value[index] = {
                    location: this.currentLocation.value,
                    count: row.getControlValue('actualCount'),
                };

                const updatedCount = sum(row.getControl('countsByLocation').value.map((cl) => cl.count));
                row.patchControlValue('totalQuantity', updatedCount);
            } else {
                row.getControl('countsByLocation').value.push({
                    location: this.currentLocation.value,
                    count: row.getControlValue('actualCount'),
                });

                // subtract count in the count location and add actual count back
                row.patchControlValue(
                    'totalQuantity',
                    row.getControlValue('totalQuantity') + row.getControlValue('actualCount')
                );
            }
        }
    }

    /** When location changes reset quantity counted to zero for open products */
    resetActualCount(): void {
        this.form
            .getArray('counts')
            .controls.filter((c) => !isNullOrUndefined(c.value.actualCount))
            .forEach((c: TypedFormGroup<PhysicalInventoryCount>) => {
                if (c.getControlValue('status').code === 'OPEN') {
                    const currentLocationCount = c
                        .getControl('countsByLocation')
                        .value.find((cl) => cl.location === this.currentLocation.value);
                    c.patchControlValue('actualCount', defaultTo(currentLocationCount?.count, 0));
                }
            });
        const index = this.locations.findIndex((object) => {
            return object.code === this.currentLocation.value;
        });
        this.selectedValueIndexOutput.emit(index);
    }

    /** Used to switch the component into a search by location mode and trigger a search on the product table. */
    toggleCountByLocation(event): void {
        if (this.confirmUnsavedChanges()) {
            this.isCountingByLocation = !this.isCountingByLocation;
            this.switchedToChangeByLocation.emit(this.isCountingByLocation);
            // reset the filters for the product search
            this.filterProduct.setValue('', { emitEvent: false });
            if (isNullOrUndefined(this.categoryControl.value)) {
                this.categoryControl.setValue([this.allCategories[0]]);
            }
            // set the current location if a value has not already been set
            if (isNullOrUndefined(this.currentLocation.value)) {
                this.currentLocation.setValue(this.locations[0].code, { emitEvent: false });
            }
            // reset the displayed columns in the product table
            this.displayedColumns = null;
            this.getProductByCategories(true);
        } else {
            // trigger the slide toggle to switch back to it's previous state, since the checked state has already
            // change prior to the confirmation. E.g. toggle is checked (true) and the user toggles the slider; checked is changed
            // to false; this method is called. If the user selects cancel from the confirmation dialog, the checked state needs
            // to return to true.
            event.source.toggle();
        }
    }
}
