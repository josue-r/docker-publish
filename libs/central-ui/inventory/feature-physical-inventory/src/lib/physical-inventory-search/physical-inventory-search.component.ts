import { Component } from '@angular/core';
import { CommonCodeFacade } from '@vioc-angular/central-ui/config/data-access-common-code';
import {
    PhysicalInventory,
    PhysicalInventoryFacade,
} from '@vioc-angular/central-ui/inventory/data-access-physical-inventory';
import { ResourceFacade } from '@vioc-angular/central-ui/organization/data-access-resources';
import { QuerySort } from '@vioc-angular/shared/common-api-models';
import { SEARCHABLE_TOKEN } from '@vioc-angular/shared/data-access-search';
import { Column, ColumnConfig, Columns, Comparators } from '@vioc-angular/shared/util-column';

@Component({
    selector: 'vioc-angular-physical-inventory-search',
    templateUrl: './physical-inventory-search.component.html',
    providers: [
        PhysicalInventoryFacade,
        ResourceFacade,
        CommonCodeFacade,
        { provide: SEARCHABLE_TOKEN, useValue: PhysicalInventoryFacade },
    ],
})
export class PhysicalInventorySearchComponent {
    readonly columns: Columns;
    readonly defaultSorts: QuerySort[];

    constructor(
        readonly physicalInventoryFacade: PhysicalInventoryFacade,
        private readonly commonCodeFacade: CommonCodeFacade
    ) {
        this.columns = {
            storeNumber: {
                apiFieldPath: 'store.code',
                name: 'Store',
                type: 'string',
                searchable: { defaultSearch: { comparator: Comparators.startsWith } },
            },
            countNumber: {
                apiFieldPath: 'id',
                name: 'Count Number',
                type: 'integer',
                comparators: [Comparators.equalTo, Comparators.notEqualTo],
                searchable: { defaultSearch: { comparator: Comparators.equalTo } },
            },
            createdDate: {
                apiFieldPath: 'createdOn',
                name: 'Created Date',
                type: 'dateTime',
                searchable: {
                    defaultSearch: {
                        comparator: Comparators.after,
                    },
                },
            },
            status: () =>
                this.commonCodeFacade.searchColumns.descriptionDropdown(
                    {
                        type: 'STATUSCD',
                        name: 'Status',
                        apiFieldPath: 'status',
                        entityType: 'inventoryStatus',
                    },
                    { searchable: { defaultSearch: true } }
                ),
            frequency: () =>
                this.commonCodeFacade.searchColumns.descriptionDropdown(
                    {
                        type: 'COUNTFREQ',
                        name: 'Frequency',
                        apiFieldPath: 'frequency',
                        entityType: 'countFrequency',
                    },
                    { searchable: { defaultSearch: true } }
                ),
            finalizedDate: {
                apiFieldPath: 'finalizedOn',
                name: 'Finalized Date',
                type: 'dateTime',
                searchable: {
                    defaultSearch: {
                        comparator: Comparators.after,
                    },
                },
            },
            lastUpdatedBy: {
                apiFieldPath: 'updatedByEmployee.lastName',
                name: 'Last Updated By',
                type: 'string',
                displayedByDefault: false,
            },
        };

        this.defaultSorts = [new QuerySort(Column.of(this.columns.createdDate as ColumnConfig), 'desc')];
    }

    /**
     * Returns the array of url path variables that uniquely identify the entity in the route.
     */
    toPathVariables(physicalInventory: PhysicalInventory): string[] {
        return [physicalInventory.store.code, physicalInventory.id.toString()];
    }
}
