import { Component, Input } from '@angular/core';
import { Discount } from '@vioc-angular/central-ui/discount/data-access-discount';
import { SearchSelection } from '@vioc-angular/central-ui/feature-search-page';
import { QuerySearch, QuerySort, QueryPage } from '@vioc-angular/shared/common-api-models';
import { SearchFacade } from '@vioc-angular/shared/data-access-search';
import { ResponseEntity } from '@vioc-angular/shared/util-api';
import { ColumnConfig, Columns, Comparators } from '@vioc-angular/shared/util-column';
import * as moment from 'moment';
import { Observable } from 'rxjs';

/**
 * Component used to select `Discount`s via the `SearchComponent`.
 *
 * @usageNotes
 *  ```
    <vioc-angular-discount-selection
        #discountSelectionComponent
        [control]="discountControl"
        [searchFn]="searchDiscounts"
    ></vioc-angular-discount-selection>
    ```
 *  ```

    readonly searchDiscounts = (querySearch: QuerySearch): Observable<ResponseEntity<Discount>> =>
        this.discountFacade.search(querySearch);

    get discountControl(): FormControl {
        return this.form.get('discount') as FormControl;
    }
    ```
 */
@Component({
    selector: 'vioc-angular-discount-selection',
    template: `
        <vioc-angular-search
            #search
            [columns]="usableColumns"
            [searchFn]="searchFn"
            [sort]="sort"
            [page]="page"
            [selectable]="true"
            [previousSearchEnabled]="false"
            [singleSelection]="singleSelection"
            (rowSelect)="selectRow($event)"
        >
        </vioc-angular-search>
    `,
    providers: [{ provide: SearchFacade, useValue: {} }],
})
export class DiscountSelectionComponent extends SearchSelection<Discount> {
    @Input() searchFn: (querySearch: QuerySearch) => Observable<ResponseEntity<Discount>>;

    readonly columns: Columns = {
        company: {
            apiFieldPath: 'company.code',
            name: 'Company Code',
            type: 'string',
            searchable: { defaultSearch: true },
        },
        discountCode: {
            apiFieldPath: 'code',
            name: 'Discount Code',
            type: 'string',
            searchable: { defaultSearch: { comparator: Comparators.startsWith } },
        },
        discountDescription: {
            apiFieldPath: 'description',
            name: 'Discount Description',
            type: 'string',
        },
        national: {
            apiFieldPath: 'national',
            name: 'National',
            type: 'boolean',
        },
        endDate: {
            apiFieldPath: 'endDate',
            name: 'End Date',
            type: 'date',
            searchable: {
                defaultSearch: {
                    comparator: Comparators.after,
                    value: moment().startOf('day'),
                },
                required: true,
            },
        },
        startDate: {
            apiFieldPath: 'startDate',
            name: 'Start Date',
            type: 'date',
            searchable: {
                required: false,
            },
        },
        type: {
            name: 'Type',
            apiFieldPath: 'type.code',
            type: 'string',
            displayedByDefault: false,
            searchable: false,
        },
        active: {
            name: 'Active',
            apiFieldPath: 'active',
            type: 'boolean',
            searchable: { defaultSearch: true },
            displayedByDefault: true,
        },
    };

    usableColumns = { ...this.columns };

    sort = new QuerySort(Columns.toColumn(this.columns.discountCode as ColumnConfig));

    page = new QueryPage(0, 20);
}
