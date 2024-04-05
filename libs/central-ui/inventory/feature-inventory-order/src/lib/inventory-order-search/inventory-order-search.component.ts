import { AfterViewInit, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { CommonCodeFacade } from '@vioc-angular/central-ui/config/data-access-common-code';
// tslint:disable-next-line: nx-enforce-module-boundaries
import { SearchPageComponent } from '@vioc-angular/central-ui/feature-search-page';
import { InventoryOrder, InventoryOrderFacade } from '@vioc-angular/central-ui/inventory/data-access-inventory-order';
import { VendorFacade } from '@vioc-angular/central-ui/inventory/data-access-vendor';
import { ResourceFacade } from '@vioc-angular/central-ui/organization/data-access-resources';
import { QuerySort } from '@vioc-angular/shared/common-api-models';
import { Described } from '@vioc-angular/shared/common-functionality';
import { SEARCHABLE_TOKEN } from '@vioc-angular/shared/data-access-search';
import { Column, ColumnConfig, Columns, Comparators } from '@vioc-angular/shared/util-column';
import { DataModifyingComponent } from '@vioc-angular/shared/util-data-modifying';
import * as moment from 'moment';

@Component({
    selector: 'vioc-angular-inventory-order-search',
    templateUrl: './inventory-order-search.component.html',
    providers: [
        InventoryOrderFacade,
        ResourceFacade,
        CommonCodeFacade,
        VendorFacade,
        { provide: SEARCHABLE_TOKEN, useValue: InventoryOrderFacade },
    ],
})
export class InventoryOrderSearchComponent extends DataModifyingComponent implements AfterViewInit {
    @ViewChild('searchPage', { static: true }) readonly searchPage: SearchPageComponent;

    readonly activeRoles = ['ROLE_INVENTORY_ORDER_READ'];

    gridModeEnabled = false;

    readonly columns: Columns;

    readonly defaultSorts: QuerySort[];

    constructor(
        public readonly inventoryOrderFacade: InventoryOrderFacade,
        private readonly resourceFacade: ResourceFacade,
        private readonly commonCodeFacade: CommonCodeFacade,
        private readonly vendorFacade: VendorFacade,
        private readonly changeDetector: ChangeDetectorRef
    ) {
        super();

        this.columns = {
            storeNumber: {
                // TODO: default if user only has access to one store - nice to have
                apiFieldPath: 'store.code',
                name: 'Store',
                type: 'string',
                searchable: { defaultSearch: { comparator: Comparators.startsWith } },
            },
            orderNumber: {
                apiFieldPath: 'number',
                name: 'Order Number',
                type: 'string',
                searchable: { defaultSearch: { comparator: Comparators.startsWith } },
            },
            status: () =>
                this.commonCodeFacade.searchColumns.codeDropdown(
                    {
                        type: 'INVSTATUS',
                        name: 'Status',
                        apiFieldPath: 'status',
                        entityType: 'inventoryStatus',
                    },
                    { searchable: { defaultSearch: true } },
                    (v) => v.code !== 'CANCELLED' && v.code !== 'CLOSED'
                ),
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
            createdDate: {
                apiFieldPath: 'createdOn',
                name: 'Created Date',
                type: 'dateTime',
                searchable: {
                    defaultSearch: {
                        comparator: Comparators.after,
                        value: moment().subtract(14, 'days').startOf('day'),
                    },
                    required: true,
                },
            },

            productCode: {
                apiFieldPath: 'inventoryOrderProducts.product.code',
                name: 'Product Code',
                type: 'string',
                displayable: false,
            },
            finalizedDate: {
                apiFieldPath: 'finalizedOn',
                name: 'Finalized Date',
                type: 'dateTime',
            },
            finalizedByName: {
                apiFieldPath: 'finalizedByEmployee.name',
                apiSortPath: 'finalizedByEmployee.lastName',
                name: 'Finalized By',
                type: 'string',
                searchable: false,
            },
            finalizedBy: {
                apiFieldPath: 'finalizedByEmployee.lastName',
                name: 'Finalized By',
                type: 'string',
                searchable: true,
                displayable: false,
            },
            company: () =>
                this.resourceFacade.searchColumns.company.contextDropdown('INVENTORY_ORDER', 'ACTIVE', {
                    apiFieldPath: 'store.company',
                    searchable: { defaultSearch: false },
                    displayedByDefault: false,
                }),
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
        };

        this.defaultSorts = [
            new QuerySort(Column.of(this.columns.storeNumber as ColumnConfig)),
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
    toPathVariables(inventoryOrder: InventoryOrder): string[] {
        // TODO - to be implemented with order add/edit; determine properties needed for urls
        return [inventoryOrder.store.code, inventoryOrder.id.number];
    }

    /**
     * @see DataModifyingComponent
     */
    get unsavedChanges(): boolean {
        return this.searchPage.unsavedChanges;
    }
}
