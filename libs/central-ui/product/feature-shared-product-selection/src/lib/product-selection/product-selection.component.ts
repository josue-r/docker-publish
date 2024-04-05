import { Component, Input } from '@angular/core';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { SearchSelection } from '@vioc-angular/central-ui/feature-search-page';
import { Product } from '@vioc-angular/central-ui/product/data-access-product';
import { QueryPage, QuerySearch, QuerySort } from '@vioc-angular/shared/common-api-models';
import { SearchFacade } from '@vioc-angular/shared/data-access-search';
import { ResponseEntity } from '@vioc-angular/shared/util-api';
import { Columns, ColumnConfig } from '@vioc-angular/shared/util-column';
import { Observable } from 'rxjs';

/**
 * Component used to select `Product`s via the `SearchComponent`.
 *
 * @usageNotes
 *  ```
    <vioc-angular-product-selection
        #productSelectionComponent
        [control]="productsControl"
        [searchFn]="searchProducts"
    ></vioc-angular-product-selection>
    ```
 *  ```
    readonly searchProducts = (querySearch: QuerySearch): Observable<ResponseEntity<Product>> =>
        this.productFacade.findUnassignedProductsForCompany(this.companyControl.value, querySearch);

    get productsControl(): FormControl {
        return this.form.get('products') as FormControl;
    }
    ```
 */
@Component({
    selector: 'vioc-angular-product-selection',
    template: `
        <vioc-angular-search
            #search
            [columns]="columns"
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
export class ProductSelectionComponent extends SearchSelection<Product> {
    @Input() searchFn: (querySearch: QuerySearch) => Observable<ResponseEntity<Product>>;

    readonly columns: Columns = {
        code: {
            apiFieldPath: 'code',
            name: 'Product Code',
            type: 'string',
            searchable: { defaultSearch: true },
            displayedByDefault: true,
        },
        description: {
            apiFieldPath: 'description',
            name: 'Invoice Description',
            type: 'string',
            displayedByDefault: true,
        },
        categoryCode: {
            apiFieldPath: 'productCategory.code',
            name: 'Category Code',
            type: 'string',
            searchable: { defaultSearch: true },
            displayedByDefault: true,
        },
        categoryDescription: {
            apiFieldPath: 'productCategory.description',
            name: 'Category Description',
            type: 'string',
            displayedByDefault: true,
        },
        active: {
            apiFieldPath: 'active',
            name: 'Active',
            type: 'boolean',
            searchable: { defaultSearch: true },
            displayedByDefault: true,
        },
    };

    sort = new QuerySort(Columns.toColumn(this.columns.code as ColumnConfig));

    page = new QueryPage(0, 20);
}
