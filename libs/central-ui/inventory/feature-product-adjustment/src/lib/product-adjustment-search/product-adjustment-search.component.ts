import { Component } from '@angular/core';
import { CommonCodeFacade } from '@vioc-angular/central-ui/config/data-access-common-code';
import {
    ProductAdjustment,
    ProductAdjustmentFacade,
} from '@vioc-angular/central-ui/inventory/data-access-product-adjustment';
import { ResourceFacade } from '@vioc-angular/central-ui/organization/data-access-resources';
import { QuerySort } from '@vioc-angular/shared/common-api-models';
import { SEARCHABLE_TOKEN } from '@vioc-angular/shared/data-access-search';
import { Column, ColumnConfig, Columns, Comparators } from '@vioc-angular/shared/util-column';

@Component({
    selector: 'vioc-angular-product-adjustment-search',
    templateUrl: './product-adjustment-search.component.html',
    providers: [
        ProductAdjustmentFacade,
        ResourceFacade,
        CommonCodeFacade,
        { provide: SEARCHABLE_TOKEN, useValue: ProductAdjustmentFacade },
    ],
})
export class ProductAdjustmentSearchComponent {
    readonly columns: Columns;
    readonly defaultSorts: QuerySort[];

    constructor(
        readonly productAdjustmentFacade: ProductAdjustmentFacade,
        private readonly commonCodeFacade: CommonCodeFacade
    ) {
        this.columns = {
            storeNumber: {
                apiFieldPath: 'store.code',
                name: 'Store',
                type: 'string',
                searchable: { defaultSearch: { comparator: Comparators.startsWith } },
            },
            adjustmentNumber: {
                apiFieldPath: 'id',
                name: 'Adjustment Number',
                type: 'integer',
                comparators: [Comparators.equalTo, Comparators.notEqualTo],
                searchable: { defaultSearch: { comparator: Comparators.equalTo } },
            },
            adjustmentType: () =>
                this.commonCodeFacade.searchColumns.descriptionDropdown(
                    {
                        type: 'ADJTYPE',
                        name: 'Adjustment Type',
                        apiFieldPath: 'type',
                        entityType: 'adjustmentType',
                    },
                    { searchable: { defaultSearch: true } }
                ),
            createdDate: {
                apiFieldPath: 'createdDate',
                name: 'Created Date',
                type: 'dateTime',
                searchable: {
                    defaultSearch: {
                        comparator: Comparators.after,
                    },
                },
            },
            company: {
                apiFieldPath: 'store.company.code',
                name: 'Company',
                type: 'string',
                displayedByDefault: false,
            },
            productCode: {
                apiFieldPath: 'adjustmentProducts.product.code',
                name: 'Product Code',
                type: 'string',
                displayable: false,
            },
            createdByEmployee: {
                apiFieldPath: 'createdByEmployee.lastName',
                name: 'Created By',
                type: 'string',
                displayedByDefault: false,
            },
            lastUpdatedBy: {
                apiFieldPath: 'updatedByEmployee.lastName',
                name: 'Last Updated By',
                type: 'string',
                displayedByDefault: false,
            },
            lastUpdatedDate: {
                apiFieldPath: 'updatedOn',
                name: 'Last Updated Date',
                type: 'dateTime',
                displayedByDefault: false,
            },
        };

        this.defaultSorts = [new QuerySort(Column.of(this.columns.createdDate as ColumnConfig), 'desc')];
    }

    /**
     * Returns the array of url path variables that uniquely identify the entity in the route.
     */
    toPathVariables(productAdjustment: ProductAdjustment): string[] {
        return [productAdjustment.id.toString()];
    }
}
