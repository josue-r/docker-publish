import { Component, ViewChild } from '@angular/core';
import { CommonCodeFacade } from '@vioc-angular/central-ui/config/data-access-common-code';
// tslint:disable-next-line: nx-enforce-module-boundaries
import { SearchPageComponent } from '@vioc-angular/central-ui/feature-search-page';
import { VendorFacade } from '@vioc-angular/central-ui/inventory/data-access-vendor';
import { ResourceFacade } from '@vioc-angular/central-ui/organization/data-access-resources';
import { StoreProductInventoryStatusFacade } from '@vioc-angular/central-ui/product/data-access-store-product';
import { QuerySort } from '@vioc-angular/shared/common-api-models';
import { Described } from '@vioc-angular/shared/common-functionality';
import { SEARCHABLE_TOKEN } from '@vioc-angular/shared/data-access-search';
import { Column, ColumnConfig, Columns } from '@vioc-angular/shared/util-column';

@Component({
    selector: 'vioc-angular-inventory-status-search',
    templateUrl: './inventory-status-search.component.html',
    providers: [
        StoreProductInventoryStatusFacade,
        CommonCodeFacade,
        ResourceFacade,
        VendorFacade,
        { provide: SEARCHABLE_TOKEN, useValue: StoreProductInventoryStatusFacade },
    ],
})
export class InventoryStatusSearchComponent {
    @ViewChild('searchPage', { static: true }) readonly searchPage: SearchPageComponent;

    readonly defaultSorts: QuerySort[];
    readonly columns: Columns = {
        store: {
            name: 'Store',
            apiFieldPath: 'store.code',
            type: 'string',
            searchable: { defaultSearch: true },
        },
        productCode: {
            apiFieldPath: 'product.code',
            name: 'Product Code',
            type: 'string',
            searchable: { defaultSearch: true },
        },
        partNumber: {
            name: 'Part Number',
            apiFieldPath: 'product.sapNumber',
            type: 'string',
            searchable: false,
        },
        qoh: {
            apiFieldPath: 'quantityOnHand',
            name: 'Qty on Hand',
            type: 'decimal',
            searchable: { defaultSearch: true },
            nullable: false,
            sortable: false,
        },
        uom: {
            apiFieldPath: 'companyProduct.uom.code',
            name: 'UOM',
            type: 'string',
            searchable: false,
            sortable: false,
        },
        vendor: () =>
            this.vendorFacade.searchColumns //
                .descriptionDropdown(
                    {
                        name: 'Vendor',
                        apiFieldPath: 'vendor',
                    },
                    {
                        searchable: { defaultSearch: true },
                        mapToTableDisplay: Described.descriptionMapper,
                    }
                ),
    };
    /**
     * this is required for search screen, but we don't need it here since this screen doesn't have view and edit functions
     */
    readonly routePathVariables = () => null;
    constructor(
        public readonly storeProductInventoryStatusFacade: StoreProductInventoryStatusFacade,
        public readonly commonCodeFacade: CommonCodeFacade,
        public readonly resourceFacade: ResourceFacade,
        public readonly vendorFacade: VendorFacade
    ) {
        this.defaultSorts = [
            new QuerySort(Column.of(this.columns.store as ColumnConfig)),
            new QuerySort(Column.of(this.columns.productCode as ColumnConfig)),
        ];
    }
}
