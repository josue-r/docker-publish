import { Component } from '@angular/core';
import { CommonCodeFacade } from '@vioc-angular/central-ui/config/data-access-common-code';
import { ResourceFacade } from '@vioc-angular/central-ui/organization/data-access-resources';
import { Store, StoreFacade } from '@vioc-angular/central-ui/organization/data-access-store';
import { QuerySort } from '@vioc-angular/shared/common-api-models';
import { Described } from '@vioc-angular/shared/common-functionality';
import { SEARCHABLE_TOKEN } from '@vioc-angular/shared/data-access-search';
import { Column, ColumnConfig, Columns, Comparators } from '@vioc-angular/shared/util-column';

@Component({
    selector: 'vioc-angular-store-search',
    templateUrl: './store-search.component.html',
    providers: [StoreFacade, CommonCodeFacade, ResourceFacade, { provide: SEARCHABLE_TOKEN, useValue: StoreFacade }],
})
export class StoreSearchComponent {
    readonly columns: Columns = {
        storeNumber: {
            apiFieldPath: 'code',
            name: 'Store Number',
            type: 'string',
            searchable: { defaultSearch: { comparator: Comparators.startsWith } },
        },
        storeName: {
            apiFieldPath: 'description',
            name: 'Store Name',
            type: 'string',
            searchable: { defaultSearch: { comparator: Comparators.startsWith } },
        },
        company: () =>
            this.resourceFacade.searchColumns.company.contextDropdown('STORE', 'ALL', {
                displayedByDefault: false,
            }),
        region: () =>
            this.resourceFacade.searchColumns.regionCodeAndDescription.contextDropdown('STORE', 'ALL', {
                displayedByDefault: true,
            }),
        market: () =>
            this.resourceFacade.searchColumns.marketCodeAndDescription.contextDropdown('STORE', 'ALL', {
                displayedByDefault: false,
            }),
        area: () =>
            this.resourceFacade.searchColumns.areaCodeAndDescription.contextDropdown('STORE', 'ALL', {
                displayedByDefault: true,
            }),
        city: {
            name: 'City',
            apiFieldPath: 'address.city',
            type: 'string',
            searchable: { defaultSearch: { comparator: Comparators.startsWith } },
        },
        state: () =>
            this.commonCodeFacade.searchColumns.codeDropdown(
                {
                    type: 'STATE',
                    name: 'State',
                    apiFieldPath: 'address.state',
                    entityType: 'string',
                },
                {
                    displayedByDefault: true,
                    searchable: { defaultSearch: { comparator: Comparators.equalTo } },
                    mapToKey: Described.codeMapper,
                    mapToDropdownDisplay: Described.descriptionMapper,
                    mapToTableDisplay: (s) => s,
                }
            ),
        active: {
            name: 'Active',
            apiFieldPath: 'active',
            type: 'boolean',
            displayedByDefault: true,
            searchable: { defaultSearch: true },
        },
        sameStoreReporting: {
            name: 'Same Store',
            apiFieldPath: 'sameStoreReporting',
            type: 'boolean',
            displayedByDefault: false,
            nullable: true,
        },
    };

    readonly defaultSorts: QuerySort[];

    toPathVariables(store: Store): string[] {
        return [store.code];
    }

    constructor(
        private readonly commonCodeFacade: CommonCodeFacade,
        public readonly storeFacade: StoreFacade,
        private readonly resourceFacade: ResourceFacade
    ) {
        this.defaultSorts = [new QuerySort(Column.of(this.columns.storeNumber as ColumnConfig))];
    }
}
