import { Component } from '@angular/core';
import { CommonCodeFacade } from '@vioc-angular/central-ui/config/data-access-common-code';
import {
    DefectiveProduct,
    DefectiveProductFacade,
} from '@vioc-angular/central-ui/inventory/data-access-defective-product';
import { QuerySort } from '@vioc-angular/shared/common-api-models';
import { SEARCHABLE_TOKEN } from '@vioc-angular/shared/data-access-search';
import { Column, ColumnConfig, Columns, Comparators } from '@vioc-angular/shared/util-column';
import * as moment from 'moment';

@Component({
    selector: 'vioc-angular-defective-product-search',
    templateUrl: './defective-product-search.component.html',
    providers: [
        DefectiveProductFacade,
        CommonCodeFacade,
        { provide: SEARCHABLE_TOKEN, useValue: DefectiveProductFacade },
    ],
})
export class DefectiveProductSearchComponent {
    readonly columns: Columns;
    readonly defaultSorts: QuerySort[];

    constructor(
        readonly defectiveProductFacade: DefectiveProductFacade,
        private readonly commonCodeFacade: CommonCodeFacade
    ) {
        this.columns = {
            storeNumber: {
                apiFieldPath: 'storeProduct.store.code',
                name: 'Store',
                type: 'string',
                searchable: { defaultSearch: { comparator: Comparators.startsWith } },
            },
            adjustmentId: {
                apiFieldPath: 'adjustment.id',
                name: 'Adjustment Id',
                type: 'integer',
                searchable: false,
            },
            productCode: {
                apiFieldPath: 'storeProduct.product.code',
                name: 'Product',
                type: 'string',
                searchable: { defaultSearch: { comparator: Comparators.startsWith } },
            },

            quantity: {
                apiFieldPath: 'quantity',
                name: 'Quantity',
                type: 'decimal',
                searchable: false,
            },
            reason: () =>
                this.commonCodeFacade.searchColumns.descriptionDropdown(
                    {
                        type: 'PRODUCT_DEFECT_REASON',
                        name: 'Reason',
                        apiFieldPath: 'defectProductReason',
                        entityType: 'defectProductReason',
                    },
                    { searchable: { defaultSearch: true } }
                ),
            defectDate: {
                apiFieldPath: 'defectDate',
                name: 'Defect Date',
                type: 'dateTime',
                searchable: {
                    defaultSearch: {
                        comparator: Comparators.after,
                        value: moment().subtract(14, 'days').startOf('day'),
                    },
                },
            },
        };

        this.defaultSorts = [new QuerySort(Column.of(this.columns.defectDate as ColumnConfig), 'desc')];
    }

    /**
     * Returns the array of url path variables that uniquely identify the entity in the route.
     */
    toPathVariables(defectiveProduct: DefectiveProduct): string[] {
        return [defectiveProduct.storeProduct.store.code, defectiveProduct.id.toString()];
    }
}
