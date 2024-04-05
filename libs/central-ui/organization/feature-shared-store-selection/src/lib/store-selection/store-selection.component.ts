import { Component, Input, OnInit } from '@angular/core';
// TODO: 05/19/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { SearchSelection } from '@vioc-angular/central-ui/feature-search-page';
import { ResourceFacade, Store } from '@vioc-angular/central-ui/organization/data-access-resources';
import { QueryPage, QuerySearch, QuerySort } from '@vioc-angular/shared/common-api-models';
import { isNullOrUndefined } from '@vioc-angular/shared/common-functionality';
import { SearchFacade } from '@vioc-angular/shared/data-access-search';
import { ResponseEntity } from '@vioc-angular/shared/util-api';
import { ColumnConfig, Columns } from '@vioc-angular/shared/util-column';
import { Observable } from 'rxjs';

/**
 * Component used to select `Store`s via the `SearchComponent`.
 *
 * @usageNotes
 *  ```
    <vioc-angular-store-selection
        #storeSelectionComponent
        [control]="storesControl"
        [accessRoles]="accessRoles"
        [searchFn]="searchStores"
    ></vioc-angular-store-selection>
    ```
 *  ```
    accessRoles = ['ROLE_STORE_PRODUCT_ADD'];

    readonly searchStores = (querySearch: QuerySearch): Observable<ResponseEntity<Described>> =>
        this.resourceFacade.searchStoresByRoles(querySearch, this.accessRoles);

    get storesControl(): FormControl {
        return this.form.get('stores') as FormControl;
    }
    ```
 */
@Component({
    selector: 'vioc-angular-store-selection',
    template: `
        <vioc-angular-search
            #search
            [columns]="columns"
            [searchFn]="searchFn"
            [sort]="sort"
            [page]="page"
            [selectable]="true"
            [previousSearchEnabled]="false"
            [pageSizeOptions]="pageSizeOptions"
            (rowSelect)="selectRow($event)"
        >
        </vioc-angular-search>
    `,
    providers: [ResourceFacade, { provide: SearchFacade, useValue: {} }],
})
export class StoreSelectionComponent extends SearchSelection<Store> implements OnInit {
    @Input() searchFn: (querySearch: QuerySearch) => Observable<ResponseEntity<Store>>;

    /** The roles used to secure the store selection dropdowns by. */
    @Input() accessRoles: string[];

    columns: Columns;

    sort: QuerySort;

    page = new QueryPage(0, 1000);

    pageSizeOptions = [20, 50, 100, 1000];

    constructor(private readonly resourceFacade: ResourceFacade) {
        super();
    }

    ngOnInit(): void {
        super.ngOnInit();
        // dropdowns will fail to populate if no accessRoles are provided
        if (isNullOrUndefined(this.accessRoles)) {
            throw new Error('Attribute "accessRoles" is required.');
        }
        this.columns = {
            company: this.resourceFacade.searchColumns.company.rolesDropdown(this.accessRoles),
            region: this.resourceFacade.searchColumns.region.rolesDropdown(this.accessRoles, 'ACTIVE', {
                displayedByDefault: false,
            }),
            market: this.resourceFacade.searchColumns.market.rolesDropdown(this.accessRoles, 'ACTIVE', {
                displayedByDefault: false,
            }),
            area: this.resourceFacade.searchColumns.area.rolesDropdown(this.accessRoles, 'ACTIVE', {
                displayedByDefault: false,
            }),
            code: {
                apiFieldPath: 'code',
                name: 'Store Number',
                type: 'string',
                searchable: { defaultSearch: true },
                displayedByDefault: true,
            },
            description: {
                apiFieldPath: 'description',
                name: 'Store Description',
                type: 'string',
                displayedByDefault: true,
            },
            active: {
                apiFieldPath: 'active',
                name: 'Active',
                type: 'boolean',
                searchable: { defaultSearch: true },
                displayedByDefault: false,
            },
        };
        this.sort = new QuerySort(Columns.toColumn(this.columns.code as ColumnConfig));
    }
}
