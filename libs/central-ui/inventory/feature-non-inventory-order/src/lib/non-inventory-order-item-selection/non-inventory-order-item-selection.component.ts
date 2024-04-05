import { Component, Input } from '@angular/core';
// tslint:disable-next-line: nx-enforce-module-boundaries
import { SearchSelection } from '@vioc-angular/central-ui/feature-search-page';
import { NonInventoryCatalog } from '@vioc-angular/central-ui/inventory/data-access-non-inventory-order';
import { QueryPage, QuerySearch, QuerySort } from '@vioc-angular/shared/common-api-models';
import { SearchFacade } from '@vioc-angular/shared/data-access-search';
import { ResponseEntity } from '@vioc-angular/shared/util-api';
import { ColumnConfig, Columns } from '@vioc-angular/shared/util-column';
import { Observable } from 'rxjs';

@Component({
    selector: 'vioc-angular-non-inventory-order-item-selection',
    template: `
        <vioc-angular-search
            #search
            [columns]="usableColumns"
            [searchFn]="searchFn"
            [sort]="sort"
            [page]="page"
            [selectable]="true"
            [previousSearchEnabled]="false"
            (rowSelect)="selectRow($event)"
        >
        </vioc-angular-search>
    `,
    providers: [{ provide: SearchFacade, useValue: {} }],
})
export class NonInventoryOrderItemSelectionComponent extends SearchSelection<NonInventoryCatalog> {
    @Input() searchFn: (querySearch: QuerySearch) => Observable<ResponseEntity<NonInventoryCatalog>>;

    @Input() set excludedColumns(excludedColumns: string[]) {
        this.usableColumns = { ...this.columns };
        excludedColumns?.forEach((ec) => {
            (this.usableColumns[ec] as ColumnConfig).searchable = false;
            (this.usableColumns[ec] as ColumnConfig).displayable = false;
        });
    }

    readonly columns: Columns = {
        company: {
            apiFieldPath: 'company.code',
            name: 'Company',
            type: 'string',
            searchable: { defaultSearch: true },
        },
        categoryCode: {
            apiFieldPath: 'category.code',
            name: 'Category Code',
            type: 'string',
            searchable: { defaultSearch: true },
        },
        categoryDescription: {
            apiFieldPath: 'category.description',
            name: 'Category Description',
            type: 'string',
            searchable: { defaultSearch: true },
            displayedByDefault: false,
        },
        itemNumber: {
            apiFieldPath: 'number',
            name: 'Item Code',
            type: 'string',
            searchable: { defaultSearch: true },
        },
        itemDescription: {
            apiFieldPath: 'description',
            name: 'Item Description',
            type: 'string',
            searchable: { defaultSearch: true },
        },
        uom: {
            apiFieldPath: 'uom.code',
            name: 'UOM',
            type: 'string',
            searchable: { defaultSearch: true },
        },
    };

    usableColumns = { ...this.columns };

    sort = new QuerySort(Columns.toColumn(this.columns.itemNumber as ColumnConfig));

    page = new QueryPage(0, 20);
}
