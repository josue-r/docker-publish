import { Component, Input } from '@angular/core';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { SearchSelection } from '@vioc-angular/central-ui/feature-search-page';
import { StoreProduct } from '@vioc-angular/central-ui/product/data-access-store-product';
import { QueryPage, QuerySearch, QuerySort } from '@vioc-angular/shared/common-api-models';
import { SearchFacade } from '@vioc-angular/shared/data-access-search';
import { ResponseEntity } from '@vioc-angular/shared/util-api';
import { ColumnConfig, Columns } from '@vioc-angular/shared/util-column';
import { Observable } from 'rxjs';

/**
 * Component used to select `StoreProduct`s via the `SearchComponent`.
 *
 * @usageNotes
 *  ```
    <vioc-angular-store-product-selection
        #productSelectionComponent
        [control]="storeProductsControl"
        [searchFn]="searchStoreProducts"
        [excludedColumns]="excludedColumns"
    ></vioc-angular-store-product-selection>
    ```
 *  ```
    readonly excludedColumns = ['store', 'vendor']; // will result in the 'store' and 'vendor' columns not being displayable or searchable

    readonly searchStoreProducts = (querySearch: QuerySearch): Observable<ResponseEntity<StoreProduct>> =>
        this.storeProductFacade.search(querySearch);

    get storeProductsControl(): FormControl {
        return this.form.get('storeProducts') as FormControl;
    }
    ```
 */
@Component({
    selector: 'vioc-angular-store-product-selection',
    template: `
        <vioc-angular-search
            #search
            [columns]="usableColumns"
            [searchFn]="searchFn"
            [sort]="sort"
            [page]="page"
            [selectable]="true"
            [previousSearchEnabled]="false"
            [singleSelection]="singleSelection"
            (rowSelect)="selectRow($event)"
        >
        </vioc-angular-search>
    `,
    providers: [{ provide: SearchFacade, useValue: {} }],
})
export class StoreProductSelectionComponent extends SearchSelection<StoreProduct> {
    @Input() searchFn: (querySearch: QuerySearch) => Observable<ResponseEntity<StoreProduct>>;

    @Input() set excludedColumns(excludedColumns: string[]) {
        this.usableColumns = { ...this.columns };
        excludedColumns?.forEach((ec) => {
            (this.usableColumns[ec] as ColumnConfig).searchable = false;
            (this.usableColumns[ec] as ColumnConfig).displayable = false;
        });
    }

    readonly columns: Columns = {
        categoryCode: {
            apiFieldPath: 'product.productCategory.code',
            name: 'Category Code',
            type: 'string',
            searchable: { defaultSearch: true },
        },
        categoryDescription: {
            apiFieldPath: 'product.productCategory.description',
            name: 'Category Description',
            type: 'string',
            searchable: { defaultSearch: true },
            displayedByDefault: false,
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
        averageDailyUsage: {
            name: 'Average Daily Usage',
            apiFieldPath: 'averageDailyUsage',
            type: 'decimal',
            decimalPlaces: 4,
            displayedByDefault: false,
            gridUpdatable: false,
            nullable: true,
        },
        invoiceDescription: {
            apiFieldPath: 'product.description',
            name: 'Invoice Description',
            type: 'string',
            displayedByDefault: false,
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
        quantityOnHand: {
            name: 'Qty on Hand',
            apiFieldPath: 'quantityOnHand',
            type: 'decimal',
            gridUpdatable: false,
            nullable: true,
            searchable: { defaultSearch: false },
        },
        retailPrice: {
            name: 'Retail Price',
            apiFieldPath: 'retailPrice',
            type: 'decimal',
            searchable: { defaultSearch: false },
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
        store: {
            apiFieldPath: 'store.code',
            name: 'Store Number',
            type: 'string',
            searchable: { defaultSearch: true },
        },
        taxable: { name: 'Taxable', apiFieldPath: 'taxable', type: 'boolean', displayedByDefault: false },
        vendor: {
            apiFieldPath: 'vendor.code',
            name: 'Vendor Code',
            type: 'string',
            searchable: { defaultSearch: true },
        },
        wholesalePrice: {
            name: 'Wholesale Price',
            apiFieldPath: 'wholesalePrice',
            type: 'decimal',
            decimalPlaces: 4,
            searchable: { defaultSearch: false },
        },
    };

    usableColumns = { ...this.columns };

    sort = new QuerySort(Columns.toColumn(this.columns.productCode as ColumnConfig));

    page = new QueryPage(0, 20);
}
