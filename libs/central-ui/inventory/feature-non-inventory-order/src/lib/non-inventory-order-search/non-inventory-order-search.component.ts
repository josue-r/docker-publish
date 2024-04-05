import { Component } from '@angular/core';
import { CommonCodeFacade } from '@vioc-angular/central-ui/config/data-access-common-code';
import {
    NonInventoryOrder,
    NonInventoryOrderFacade,
} from '@vioc-angular/central-ui/inventory/data-access-non-inventory-order';
import { QuerySort } from '@vioc-angular/shared/common-api-models';
import { SEARCHABLE_TOKEN } from '@vioc-angular/shared/data-access-search';
import { Column, ColumnConfig, Columns, Comparators } from '@vioc-angular/shared/util-column';
import * as moment from 'moment';

@Component({
    selector: 'vioc-angular-non-inventory-order-search',
    templateUrl: './non-inventory-order-search.component.html',
    providers: [
        NonInventoryOrderFacade,
        CommonCodeFacade,
        { provide: SEARCHABLE_TOKEN, useValue: NonInventoryOrderFacade },
    ],
})
export class NonInventoryOrderSearchComponent {
    readonly columns: Columns;
    readonly defaultSorts: QuerySort[];

    constructor(
        readonly nonInventoryOrderFacade: NonInventoryOrderFacade,
        private readonly commonCodeFacade: CommonCodeFacade
    ) {
        this.columns = {
            //display by default
            storeNumber: {
                apiFieldPath: 'store.code',
                name: 'Store',
                type: 'string',
                searchable: { defaultSearch: { comparator: Comparators.startsWith } },
            },
            orderNumber: {
                apiFieldPath: 'orderNumber',
                name: 'Order Number',
                type: 'integer',
                searchable: { defaultSearch: { comparator: Comparators.equalTo } },
            },
            status: () =>
                this.commonCodeFacade.searchColumns.descriptionDropdown(
                    {
                        type: 'NONINVST',
                        name: 'Status',
                        apiFieldPath: 'status',
                        entityType: 'nonInventoryOrderStatus',
                    },
                    {
                        searchable: { defaultSearch: true },
                    }
                ),
            orderDate: {
                apiFieldPath: 'orderDate',
                name: 'Order Date',
                type: 'dateTime',
                searchable: {
                    defaultSearch: {
                        comparator: Comparators.after,
                        value: moment().subtract(14, 'days').startOf('day'),
                    },
                    required: true,
                },
            },
            // not displayed
            company: {
                apiFieldPath: 'store.company.code',
                name: 'Company',
                type: 'string',
                displayedByDefault: false,
            },
            productCode: {
                apiFieldPath: 'nonInventoryOrderItem.nonInventoryCatalog.id',
                name: 'Product Code',
                type: 'integer',
                displayable: false,
                searchable: { defaultSearch: false },
            },
            createdByName: {
                apiFieldPath: 'createdByEmployee.name',
                apiSortPath: 'createdByEmployee.lastName',
                name: 'Created By',
                type: 'string',
                searchable: false,
                displayedByDefault: false,
            },
            createdBy: {
                apiFieldPath: 'createdByEmployee.lastName',
                name: 'Created By',
                type: 'string',
                searchable: { defaultSearch: false },
                displayable: false,
            },
            lastUpdatedBy: {
                apiFieldPath: 'updatedByEmployee.lastName',
                name: 'Last Updated By',
                type: 'string',
                displayedByDefault: true,
            },
            lastUpdatedDate: {
                apiFieldPath: 'updatedOn',
                name: 'Last Updated Date',
                type: 'dateTime',
                displayedByDefault: true,
                searchable: false,
            },
        };

        this.defaultSorts = [new QuerySort(Column.of(this.columns.orderDate as ColumnConfig), 'desc')];
    }

    /**
     * Returns the array of url path variables that uniquely identify the entity in the route.
     */
    toPathVariables(nonInventoryOrder: NonInventoryOrder): string[] {
        return [nonInventoryOrder.store.code, nonInventoryOrder.id.orderNumber.toString()];
    }
}
