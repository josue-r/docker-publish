import { AfterViewInit, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { CommonCodeFacade } from '@vioc-angular/central-ui/config/data-access-common-code';
// tslint:disable-next-line: nx-enforce-module-boundaries
import { SearchPageComponent } from '@vioc-angular/central-ui/feature-search-page';
import {
    InventoryTransfer,
    InventoryTransferFacade,
} from '@vioc-angular/central-ui/inventory/data-access-inventory-transfer';
import { ResourceFacade } from '@vioc-angular/central-ui/organization/data-access-resources';
import { QuerySort } from '@vioc-angular/shared/common-api-models';
import { SEARCHABLE_TOKEN } from '@vioc-angular/shared/data-access-search';
import { Column, ColumnConfig, Columns, Comparators } from '@vioc-angular/shared/util-column';
import * as moment from 'moment';

@Component({
    selector: 'vioc-angular-inventory-transfer-search',
    templateUrl: './inventory-transfer-search.component.html',
    providers: [
        InventoryTransferFacade,
        ResourceFacade,
        CommonCodeFacade,
        { provide: SEARCHABLE_TOKEN, useValue: InventoryTransferFacade },
    ],
})
export class InventoryTransferSearchComponent implements AfterViewInit {
    @ViewChild('searchPage', { static: true }) readonly searchPage: SearchPageComponent;

    readonly columns: Columns;

    readonly defaultSorts: QuerySort[];

    constructor(
        readonly inventoryTransferFacade: InventoryTransferFacade,
        private readonly commonCodeFacade: CommonCodeFacade,
        private readonly resourceFacade: ResourceFacade,
        private readonly changeDetector: ChangeDetectorRef
    ) {
        this.columns = {
            toStoreNumber: {
                apiFieldPath: 'toStore.code',
                name: 'To Store',
                type: 'string',
                searchable: { defaultSearch: { comparator: Comparators.startsWith } },
            },
            fromStoreNumber: {
                apiFieldPath: 'fromStore.code',
                name: 'From Store',
                type: 'string',
                searchable: { defaultSearch: { comparator: Comparators.startsWith } },
            },
            transferNumber: {
                apiFieldPath: 'id.transferId',
                name: 'Transfer Number',
                type: 'string',
            },
            status: () =>
                this.commonCodeFacade.searchColumns.codeDropdown(
                    {
                        type: 'TRNSSTATUS',
                        name: 'Status',
                        apiFieldPath: 'status',
                        entityType: 'inventoryTransferStatus',
                    },
                    { searchable: { defaultSearch: true } },
                    (v) => v.code !== 'CANCELLED' && v.code !== 'CLOSED'
                ),
            createdDate: {
                apiFieldPath: 'createdOn',
                name: 'Created Date',
                type: 'dateTime',
                searchable: {
                    defaultSearch: {
                        comparator: Comparators.after,
                        value: moment().subtract(30, 'days').startOf('day'),
                    },
                    required: true,
                },
            },
            company: () =>
                this.resourceFacade.searchColumns.company.contextDropdown('INVENTORY_TRANSFER', undefined, {
                    apiFieldPath: 'fromStore.company',
                    searchable: { defaultSearch: false },
                    displayedByDefault: false,
                }),
            finalizedDate: {
                apiFieldPath: 'finalizedOn',
                name: 'Finalized Date',
                type: 'dateTime',
                displayedByDefault: false,
            },
        };

        this.defaultSorts = [
            new QuerySort(Column.of(this.columns.fromStoreNumber as ColumnConfig)),
            new QuerySort(Column.of(this.columns.createdDate as ColumnConfig), 'desc'),
        ];
    }

    ngAfterViewInit(): void {
        this.searchPage.searchComponent.search();
        this.changeDetector.detectChanges();
    }

    /**
     * Returns the array of url path variables that uniquely identify the entity in the route.
     */
    toPathVariables(inventoryTransfer: InventoryTransfer): string[] {
        return [inventoryTransfer.fromStore.code, inventoryTransfer.id.transferId];
    }
}
