import { Component, Inject, LOCALE_ID, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { VendorFacade } from '@vioc-angular/central-ui/inventory/data-access-vendor';
import { ResourceFacade } from '@vioc-angular/central-ui/organization/data-access-resources';
import { StoreSelectionComponent } from '@vioc-angular/central-ui/organization/feature-shared-store-selection';
import {
    StoreProduct,
    StoreProductFacade,
    StoreProductMassUpdate,
} from '@vioc-angular/central-ui/product/data-access-store-product';
import { ProductSelectionComponent } from '@vioc-angular/central-ui/product/feature-shared-product-selection';
import { QuerySearch } from '@vioc-angular/shared/common-api-models';
import { Described } from '@vioc-angular/shared/common-functionality';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { MassUpdateComponent } from '@vioc-angular/shared/feature-mass-update';
import { ResponseEntity } from '@vioc-angular/shared/util-api';
import { Column, Columns } from '@vioc-angular/shared/util-column';
import { DataModifyingComponent } from '@vioc-angular/shared/util-data-modifying';
import { FormFactory, TypedFormGroup } from '@vioc-angular/shared/util-form';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'vioc-angular-store-product-mass-update',
    templateUrl: './store-product-mass-update.component.html',
    styleUrls: ['./store-product-mass-update.component.scss'],
    providers: [ResourceFacade, StoreProductFacade, VendorFacade],
})
export class StoreProductMassUpdateComponent extends DataModifyingComponent implements OnInit, OnDestroy {
    private readonly _destroyed = new ReplaySubject();
    private readonly _reset = new Subject();

    @ViewChild('stepper', { static: true }) readonly stepper: MatStepper;

    @ViewChild('storeSelectionComponent', { static: true }) readonly storeSelection: StoreSelectionComponent;

    @ViewChild('productSelectionComponent', { static: true }) readonly productSelection: ProductSelectionComponent;

    @ViewChild('massUpdateComponent', { static: true }) readonly massUpdate: MassUpdateComponent;

    form: TypedFormGroup<StoreProductMassUpdate>;

    isLoading = false;

    /**
     * The maximum number of stores that display in the mass update preview
     * If there are more than 55 stores selected, a read more option will appear to display the remaining stores
     */
    readonly maxPreviewableStores = 55;

    /**
     * The maximum number of products that display in the mass update preview
     * If there are more than 25 products selected, a read more option will appear to display the remaining products
     */
    readonly maxPreviewableProducts = 25;

    readonly accessRoles = ['ROLE_STORE_PRODUCT_UPDATE'];

    columns: Columns = {
        wholesalePrice: {
            name: 'Wholesale Price',
            apiFieldPath: 'wholesalePrice',
            type: 'decimal',
            decimalPlaces: 4,
        },
        retailPrice: {
            name: 'Retail Price',
            apiFieldPath: 'retailPrice',
            type: 'decimal',
        },
        stockLimit: {
            name: 'Stock Limit',
            columns: {
                minStockLimit: {
                    name: 'Min Stock Limit',
                    apiFieldPath: 'minStockLimit',
                    type: 'decimal',
                },
                maxStockLimit: {
                    name: 'Max Stock Limit',
                    apiFieldPath: 'maxStockLimit',
                    type: 'decimal',
                },
                minStockLimitEndDate: {
                    name: 'Min Stock Limit End Date',
                    apiFieldPath: 'minStockLimitEndDate',
                    type: 'date',
                },
            },
        },
        safetyFactor: {
            name: 'Safety Factor',
            columns: {
                safetyFactor: {
                    name: 'Safety Factor',
                    apiFieldPath: 'safetyFactor',
                    type: 'decimal',
                },
                safetyFactorOverride: {
                    name: 'Safety Factor Override',
                    apiFieldPath: 'safetyFactorOverride',
                    type: 'decimal',
                },
            },
        },
        extraCharge: {
            name: 'Extra Charge',
            columns: {
                extraChargeAmount: {
                    name: 'Extra Charge Amount',
                    apiFieldPath: 'extraChargeAmount',
                    type: 'decimal',
                },
                extraChargeDescription: {
                    name: 'Extra Charge Description',
                    apiFieldPath: 'extraChargeDescription',
                    type: 'string',
                },
                extraChargeTaxable: {
                    name: 'Extra Charge Taxable',
                    apiFieldPath: 'extraChargeTaxable',
                    type: 'boolean',
                },
            },
        },
        schedulePriceChange: {
            name: 'Schedule Price Change',
            columns: {
                schedulePriceChange: {
                    name: 'Schedule Price Change',
                    apiFieldPath: 'schedulePriceChange',
                    type: 'decimal',
                },
                schedulePriceDate: {
                    name: 'Schedule Price Change Date',
                    apiFieldPath: 'schedulePriceDate',
                    type: 'date',
                },
            },
        },
        wholesalePriceChange: {
            name: 'Wholesale Price Change',
            columns: {
                wholesalePriceChange: {
                    name: 'Wholesale Price Change',
                    apiFieldPath: 'wholesalePriceChange',
                    type: 'decimal',
                    decimalPlaces: 4,
                },
                wholesalePriceChangeDate: {
                    name: 'Wholesale Price Change Date',
                    apiFieldPath: 'wholesalePriceChangeDate',
                    type: 'date',
                },
            },
        },
        promotionPrice: {
            name: 'Promotion Price',
            columns: {
                promotionPrice: {
                    name: 'Promotion Price',
                    apiFieldPath: 'promotionPrice',
                    type: 'decimal',
                },
                promotionPriceStartDate: {
                    name: 'Promotion Price Start Date',
                    apiFieldPath: 'promotionPriceStartDate',
                    type: 'date',
                },
                promotionPriceEndDate: {
                    name: 'Promotion Price End Date',
                    apiFieldPath: 'promotionPriceEndDate',
                    type: 'date',
                },
            },
        },
        priceOverride: {
            name: 'Price Override',
            columns: {
                overridable: { name: 'Overridable', apiFieldPath: 'overridable', type: 'boolean' },
                minOverridablePrice: {
                    name: 'Min Overridable Price',
                    apiFieldPath: 'minOverridePrice',
                    type: 'decimal',
                },
                maxOverridablePrice: {
                    name: 'Max Overridable Price',
                    apiFieldPath: 'maxOverridePrice',
                    type: 'decimal',
                },
                minMaxOverridable: {
                    name: 'Min/Max Overridable',
                    apiFieldPath: 'minMaxOverridable',
                    type: 'boolean',
                },
            },
        },
        taxable: { name: 'Taxable', apiFieldPath: 'taxable', type: 'boolean' },
        quantity: {
            name: 'Quantity',
            columns: {
                minOrderQuantity: {
                    name: 'Min Order Quantity',
                    apiFieldPath: 'minOrderQuantity',
                    type: 'decimal',
                },
                quantityPerPack: {
                    name: 'Quantity Per Pack',
                    apiFieldPath: 'quantityPerPack',
                    type: 'decimal',
                },
            },
        },
        includeInCount: {
            name: 'Include In Count',
            apiFieldPath: 'includeInCount',
            type: 'boolean',
        },
        reportOrder: { name: 'Report Order', apiFieldPath: 'reportOrder', type: 'string' },
        active: {
            name: 'Active',
            apiFieldPath: 'active',
            type: 'boolean',
        },
        vendor: () =>
            this.vendorFacade.searchColumns.dropdown({
                name: 'Vendor',
                storeNumbers: [],
                apiFieldPath: 'vendor',
            }),
    };

    /**
     * Search method for the store selection step of the component.
     */
    readonly searchStores = (querySearch: QuerySearch): Observable<ResponseEntity<Described>> =>
        this.resourceFacade.searchStoresByRoles(querySearch, this.accessRoles, 'FULL');

    /**
     * Search method for the product selection step of the component.
     */
    readonly searchProducts = (querySearch: QuerySearch): Observable<ResponseEntity<Described>> =>
        this.storeProductFacade.searchAssignedProductsByStore(querySearch, this.storesControl.value);

    constructor(
        @Inject(LOCALE_ID) readonly locale: string,
        private readonly resourceFacade: ResourceFacade,
        private readonly storeProductFacade: StoreProductFacade,
        private readonly messageFacade: MessageFacade,
        private readonly formFactory: FormFactory,
        private readonly vendorFacade: VendorFacade
    ) {
        super();
    }

    ngOnInit(): void {
        this.initializeForm();
        this.storesControl.valueChanges.pipe(takeUntil(this._destroyed)).subscribe((stores) => {
            // update the vendor column to query by the selected stores
            this.columns['vendor'] = () =>
                this.vendorFacade.searchColumns.dropdown(
                    {
                        name: 'Vendor',
                        storeNumbers: stores && stores.map((s) => s.code),
                        apiFieldPath: 'vendor',
                    },
                    // update mapToTableDisplay to show code and description on preview page
                    { mapToTableDisplay: Described.codeAndDescriptionMapper }
                );
            // update the columns in the massUpdate component to update the vendor dropdown
            this.massUpdate.columns = this.columns;
            this.productSelection.clear();
        });
    }

    ngOnDestroy(): void {
        this._destroyed.next();
    }

    initializeForm(): void {
        this.form = this.formFactory.group(
            'StoreProductMassUpdate',
            {
                stores: [],
                products: [],
                patch: new StoreProduct(),
            },
            this._destroyed
        );
    }

    update(): void {
        this.isLoading = true;
        this.storeProductFacade.massUpdate(this.form.value, this.updatedFields).subscribe(
            (count: number) => {
                this.isLoading = false;
                this.messageFacade.addSaveCountMessage(count, 'updated');
                // Reset selections, stepper, and form
                this.storeSelection.clear();
                this.productSelection.clear();
                this.massUpdate.reset();
                this.stepper.reset();
                this._reset.next();
            },
            (error) => {
                this.isLoading = false;
                throw error;
            }
        );
    }

    get storesControl(): FormControl {
        return this.form.getControl('stores') as FormControl;
    }

    get productsControl(): FormControl {
        return this.form.getControl('products') as FormControl;
    }

    get patchControl(): FormGroup {
        return this.form.getControl('patch') as FormGroup;
    }

    get updatedFields(): string[] {
        return Object.keys(this.patchControl.controls).filter(
            (key) => this.patchControl.controls[key].valid && this.patchControl.controls[key].dirty
        );
    }

    get updatedColumns(): Column[] {
        return Columns.toColumnArray(this.columns)
            .filter((c) => this.updatedFields.includes(c.apiFieldPath))
            .sort((c1, c2) => c1.name.localeCompare(c2.name));
    }

    /**
     * @see DataModifyingComponent
     */
    get unsavedChanges(): boolean {
        return this.form?.dirty;
    }
}
