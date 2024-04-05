import { Component, ViewChild } from '@angular/core';
import { CommonCodeFacade } from '@vioc-angular/central-ui/config/data-access-common-code';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { SearchPageComponent } from '@vioc-angular/central-ui/feature-search-page';
import { ProductCategory, ProductCategoryFacade } from '@vioc-angular/central-ui/product/data-access-product-category';
import { QuerySort } from '@vioc-angular/shared/common-api-models';
import { SEARCHABLE_TOKEN } from '@vioc-angular/shared/data-access-search';
import { Column, ColumnConfig, Columns } from '@vioc-angular/shared/util-column';
import { DataModifyingComponent } from '@vioc-angular/shared/util-data-modifying';

@Component({
    selector: 'vioc-angular-product-category-search',
    templateUrl: './product-category-search.component.html',
    providers: [
        ProductCategoryFacade,
        CommonCodeFacade,
        { provide: SEARCHABLE_TOKEN, useValue: ProductCategoryFacade },
    ],
})
export class ProductCategorySearchComponent extends DataModifyingComponent {
    @ViewChild('searchPage', { static: true }) readonly searchPage: SearchPageComponent;

    gridModeEnabled = false;

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
        productRating: {
            name: 'Product Rating',
            columns: {
                productRating: () =>
                    this.commonCodeFacade.searchColumns //
                        .descriptionDropdown(
                            {
                                type: 'PRODRATING',
                                name: 'Product Rating',
                                apiFieldPath: 'productRating',
                                entityType: 'productRating',
                            },
                            { displayedByDefault: false, nullable: true }
                        ),
                productRatingPriority: {
                    apiFieldPath: 'productRatingPriority',
                    name: 'Product Rating Priority',
                    type: 'string',
                    displayedByDefault: false,
                    nullable: true,
                },
            },
        },
        diesel: {
            apiFieldPath: 'diesel',
            name: 'Diesel',
            type: 'boolean',
            displayedByDefault: false,
            nullable: true,
        },
        highMileage: {
            apiFieldPath: 'highMileage',
            name: 'High Mileage',
            type: 'boolean',
            displayedByDefault: false,
            nullable: true,
        },
        nacsProductCode: () =>
            this.commonCodeFacade.searchColumns //
                .descriptionDropdown(
                    {
                        type: 'NACSPRODUCT',
                        name: 'Nacs Product Code',
                        apiFieldPath: 'nacsProductCode',
                        entityType: 'nacsProductCode',
                    },
                    { displayedByDefault: false }
                ),
        fleetProductCode: () =>
            this.commonCodeFacade.searchColumns //
                .descriptionDropdown(
                    {
                        type: 'BILLCODE',
                        name: 'Fleet Product Code',
                        apiFieldPath: 'fleetProductCode',
                        entityType: 'fleetProductCode',
                    },
                    { displayedByDefault: false, nullable: true }
                ),
        reportOrder: {
            apiFieldPath: 'reportOrder',
            name: 'Report Order',
            type: 'integer',
            displayedByDefault: false,
            nullable: true,
        },
    };

    readonly defaultSorts: QuerySort[];

    constructor(
        public readonly productCategoryFacade: ProductCategoryFacade,
        private readonly commonCodeFacade: CommonCodeFacade
    ) {
        super();

        this.defaultSorts = [new QuerySort(Column.of(this.columns.categoryCode as ColumnConfig))];
    }

    toCode(productCategory: ProductCategory): string[] {
        return [productCategory.code];
    }

    /**
     * @see DataModifyingComponent
     */
    get unsavedChanges(): boolean {
        return this.searchPage.unsavedChanges;
    }
}
