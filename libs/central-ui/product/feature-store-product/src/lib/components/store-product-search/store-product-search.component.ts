import { Component, ViewChild } from '@angular/core';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { SearchPageComponent } from '@vioc-angular/central-ui/feature-search-page';
import { ResourceFacade } from '@vioc-angular/central-ui/organization/data-access-resources';
import { StoreProduct, StoreProductFacade } from '@vioc-angular/central-ui/product/data-access-store-product';
import { QuerySort } from '@vioc-angular/shared/common-api-models';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { SEARCHABLE_TOKEN } from '@vioc-angular/shared/data-access-search';
import { AbstractDropdownColumn, Column, ColumnConfig, Columns } from '@vioc-angular/shared/util-column';
import { DataModifyingComponent } from '@vioc-angular/shared/util-data-modifying';

/**
 * Component to provide an implementation for the store product search screen.
 */
@Component({
    selector: 'vioc-angular-store-product-search',
    templateUrl: './store-product-search.component.html',
    providers: [StoreProductFacade, ResourceFacade, { provide: SEARCHABLE_TOKEN, useValue: StoreProductFacade }],
})
export class StoreProductSearchComponent extends DataModifyingComponent {
    @ViewChild('searchPage', { static: true }) readonly searchPage: SearchPageComponent;

    readonly columns: Columns = {
        company: () =>
            this.resourceFacade.searchColumns.company.contextDropdown('STORE_PRODUCT', undefined, {
                apiFieldPath: 'store.company',
            }),
        store: () => this.resourceFacade.searchColumns.store.contextDropdown('STORE_PRODUCT'),
        categoryCode: {
            apiFieldPath: 'product.productCategory.code',
            name: 'Category Code',
            type: 'string',
            searchable: { defaultSearch: true },
        },
        productCode: {
            apiFieldPath: 'product.code',
            name: 'Product Code',
            type: 'string',
            searchable: { defaultSearch: true },
        },
        productDescription: {
            apiFieldPath: 'product.description',
            name: 'Product Description',
            type: 'string',
            searchable: { defaultSearch: true },
        },
        invoiceDescription: {
            apiFieldPath: 'product.description',
            name: 'Invoice Description',
            type: 'string',
            displayedByDefault: false,
        },
        categoryDescription: {
            apiFieldPath: 'product.productCategory.description',
            name: 'Category Description',
            type: 'string',
            searchable: { defaultSearch: true },
            displayedByDefault: false,
        },
        wholesalePrice: {
            name: 'Wholesale Price',
            apiFieldPath: 'wholesalePrice',
            type: 'decimal',
            // Three decimal places matches what is stored in StoreProduct Table
            decimalPlaces: 3,
            searchable: { defaultSearch: false },
        },
        wholesalePriceChange: {
            name: 'Wholesale Price Change',
            columns: {
                wholesalePriceChange: {
                    name: 'Wholesale Price Change',
                    apiFieldPath: 'wholesalePriceChange',
                    type: 'decimal',
                    displayedByDefault: false,
                    nullable: true,
                },
                wholesalePriceDate: {
                    name: 'Wholesale Price Change Date',
                    apiFieldPath: 'wholesalePriceChangeDate',
                    type: 'date',
                    displayedByDefault: false,
                    nullable: true,
                },
            },
        },
        retailPrice: {
            name: 'Retail Price',
            apiFieldPath: 'retailPrice',
            type: 'decimal',
            searchable: { defaultSearch: false },
        },
        overridePrice: {
            name: 'Override Price',
            columns: {
                minOverridablePrice: {
                    name: 'Min Overridable Price',
                    apiFieldPath: 'minOverridePrice',
                    type: 'decimal',
                    displayedByDefault: false,
                    nullable: true,
                },
                maxOverridablePrice: {
                    name: 'Max Overridable Price',
                    apiFieldPath: 'maxOverridePrice',
                    type: 'decimal',
                    displayedByDefault: false,
                    nullable: true,
                },
                overridable: {
                    name: 'Overridable',
                    apiFieldPath: 'overridable',
                    type: 'boolean',
                    displayedByDefault: false,
                },
            },
        },
        stockLimit: {
            name: 'Stock Limit',
            columns: {
                minStockLimit: {
                    name: 'Min Stock Limit',
                    apiFieldPath: 'minStockLimit',
                    type: 'decimal',
                    displayedByDefault: false,
                    nullable: true,
                },
                maxStockLimit: {
                    name: 'Max Stock Limit',
                    apiFieldPath: 'maxStockLimit',
                    type: 'decimal',
                    displayedByDefault: false,
                    nullable: true,
                },
                minStockLimitEndDate: {
                    name: 'Min Stock Limit End Date',
                    apiFieldPath: 'minStockLimitEndDate',
                    type: 'date',
                    displayedByDefault: false,
                    nullable: true,
                },
            },
        },
        safetyFactor: {
            name: 'Safety Factor',
            apiFieldPath: 'safetyFactor',
            type: 'decimal',
            displayedByDefault: false,
            nullable: true,
        },
        averageDailyUsage: {
            name: 'Average Daily Usage',
            apiFieldPath: 'averageDailyUsage',
            type: 'decimal',
            decimalPlaces: 4,
            displayedByDefault: false,
            gridUpdatable: false,
            nullable: true,
        },
        safetyFactorOverride: {
            name: 'Safety Factor Override',
            apiFieldPath: 'safetyFactorOverride',
            type: 'decimal',
            displayedByDefault: false,
            nullable: true,
        },
        extraCharge: {
            name: 'Extra Charge',
            columns: {
                extraChargeAmount: {
                    name: 'Extra Charge Amount',
                    apiFieldPath: 'extraChargeAmount',
                    type: 'decimal',
                    displayedByDefault: false,
                    nullable: true,
                },
                extraChargeDescription: {
                    apiFieldPath: 'extraChargeDescription',
                    name: 'Extra Charge Description',
                    type: 'string',
                    displayedByDefault: false,
                    nullable: true,
                },
                extraChargeTaxable: {
                    name: 'Extra Charge Taxable',
                    apiFieldPath: 'extraChargeTaxable',
                    type: 'boolean',
                    nullable: true,
                    displayedByDefault: false,
                },
            },
        },
        schedulePrice: {
            name: 'Schedule Price',
            columns: {
                schedulePriceDate: {
                    name: 'Schedule Price Date',
                    apiFieldPath: 'schedulePriceDate',
                    type: 'date',
                    displayedByDefault: false,
                    nullable: true,
                },
                schedulePriceChange: {
                    name: 'Schedule Price Change',
                    apiFieldPath: 'schedulePriceChange',
                    type: 'decimal',
                    displayedByDefault: false,
                    nullable: true,
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
                    displayedByDefault: false,
                    nullable: true,
                },
                promotionPriceEndDate: {
                    name: 'Promotion Price End Date',
                    apiFieldPath: 'promotionPriceEndDate',
                    type: 'date',
                    displayedByDefault: false,
                    nullable: true,
                },
                promotionPriceStartDate: {
                    name: 'Promotion Price Start Date',
                    apiFieldPath: 'promotionPriceStartDate',
                    type: 'date',
                    displayedByDefault: false,
                    nullable: true,
                },
            },
        },
        taxable: { name: 'Taxable', apiFieldPath: 'taxable', type: 'boolean', displayedByDefault: false },
        minMaxOverridable: {
            name: 'Min Max Overridable',
            apiFieldPath: 'minMaxOverridable',
            type: 'boolean',
            displayedByDefault: false,
        },
        quantityOnHand: {
            name: 'Qty on Hand',
            apiFieldPath: 'quantityOnHand',
            type: 'decimal',
            gridUpdatable: false,
            nullable: true,
            searchable: { defaultSearch: false },
        },
        orderQuantity: {
            name: 'Order Quantity',
            columns: {
                quantityPerPack: {
                    name: 'Quantity Per Pack',
                    apiFieldPath: 'quantityPerPack',
                    type: 'decimal',
                    displayedByDefault: false,
                },
                minOrderQuantity: {
                    name: 'Min Order Quantity',
                    apiFieldPath: 'minOrderQuantity',
                    type: 'decimal',
                    displayedByDefault: false,
                },
            },
        },
        includeInCount: {
            name: 'Include In Count',
            apiFieldPath: 'includeInCount',
            type: 'boolean',
            displayedByDefault: false,
        },
        countFrequency: {
            name: 'Count Frequency',
            apiFieldPath: 'countFrequency.description',
            type: 'string',
            displayedByDefault: false,
        },
        reportOrder: { apiFieldPath: 'reportOrder', name: 'Report Order', type: 'string', displayedByDefault: false },
        preferred: { name: 'Preferred', apiFieldPath: 'preferred', type: 'boolean', displayedByDefault: false },
        vendor: {
            apiFieldPath: 'vendor.description',
            name: 'Vendor',
            type: 'string',
            searchable: { defaultSearch: false },
        },
        active: {
            name: 'Active',
            apiFieldPath: 'active',
            type: 'boolean',
            searchable: { defaultSearch: true },
        },
    };

    readonly defaultSorts: QuerySort[];

    constructor(
        readonly storeProductFacade: StoreProductFacade,
        private readonly resourceFacade: ResourceFacade,
        private readonly messageFacade: MessageFacade
    ) {
        super();

        this.defaultSorts = [
            new QuerySort(Column.of((this.columns.store as () => AbstractDropdownColumn<any>)())),
            new QuerySort(Column.of(this.columns.productCode as ColumnConfig)),
        ];
    }

    toPathVariables(storeProduct: StoreProduct): string[] {
        return [storeProduct.store.code, storeProduct.product.code];
    }

    /**
     * Activates the selected store products from the mass-activate component based on id.
     */
    activate(): void {
        const ids = this.searchPage.searchComponent.selection.selected.map((sp) => sp.id);
        this.storeProductFacade.activate(ids).subscribe((count) => {
            this.messageFacade.addMessage({ message: `${count} record(s) activated`, severity: 'success' });
            this.searchPage.triggerPreviousSearch();
        });
    }

    /**
     * Deactivates the selected store products.
     */
    deactivate(): void {
        const ids = this.searchPage.searchComponent.selection.selected.map((sp) => sp.id);
        this.storeProductFacade.deactivate(ids).subscribe((count) => {
            this.messageFacade.addMessage({ message: `${count} record(s) deactivated`, severity: 'success' });
            this.searchPage.triggerPreviousSearch();
        });
    }

    /**
     * @see DataModifyingComponent
     */
    get unsavedChanges(): boolean {
        return this.searchPage.unsavedChanges;
    }
}
