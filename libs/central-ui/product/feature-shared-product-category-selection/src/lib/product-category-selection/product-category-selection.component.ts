import { Component, Input } from '@angular/core';
// tslint:disable-next-line: nx-enforce-module-boundaries
import { SearchSelection } from '@vioc-angular/central-ui/feature-search-page';
import { ProductCategory } from '@vioc-angular/central-ui/product/data-access-product-category';
import { QueryPage, QuerySearch, QuerySort } from '@vioc-angular/shared/common-api-models';
import { SearchFacade } from '@vioc-angular/shared/data-access-search';
import { ResponseEntity } from '@vioc-angular/shared/util-api';
import { ColumnConfig, Columns } from '@vioc-angular/shared/util-column';
import { Observable } from 'rxjs';

/**
 * Component used to select `Product Categories via the `SearchComponent`.
 *
 * @usageNotes
 *  ```
    <vioc-angular-product-category-selection
        #productSelectionComponent
        [control]="productsControl"
        [searchFn]="searchProducts"
    ></vioc-angular-product-category-selection>
    ```
 *  ```
    readonly searchProducts = (querySearch: QuerySearch): Observable<ResponseEntity<ProductCategory>> =>
        this.productFacade.findUnassignedProductsForCompany(this.companyControl.value, querySearch);

    get productsControl(): FormControl {
        return this.form.get('products') as FormControl;
    }
    ```
 */
@Component({
    selector: 'vioc-angular-product-category-selection',
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
export class ProductCategorySelectionComponent extends SearchSelection<ProductCategory> {
    @Input() searchFn: (querySearch: QuerySearch) => Observable<ResponseEntity<ProductCategory>>;

    readonly columns: Columns = {
        categoryCode: {
            apiFieldPath: 'code',
            name: 'Category Code',
            type: 'string',
            searchable: { defaultSearch: true },
            gridUpdatable: false,
        },
        categoryDescription: {
            apiFieldPath: 'description',
            name: 'Category Description',
            type: 'string',
            searchable: { defaultSearch: true },
        },
        active: {
            name: 'Active',
            apiFieldPath: 'active',
            type: 'boolean',
            searchable: { defaultSearch: true },
            gridUpdatable: false,
        },
        parentCategory: {
            name: 'Parent Category',
            apiFieldPath: 'parentCategory.description',
            type: 'string',
            searchable: { defaultSearch: true },
            nullable: true,
        },
    };

    sort = new QuerySort(Columns.toColumn(this.columns.categoryCode as ColumnConfig));

    page = new QueryPage(0, 20);
}
