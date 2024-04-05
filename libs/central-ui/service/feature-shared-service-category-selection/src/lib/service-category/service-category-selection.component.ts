import { Component, Input } from '@angular/core';
// tslint:disable-next-line: nx-enforce-module-boundaries
import { SearchSelection } from '@vioc-angular/central-ui/feature-search-page';
import { ServiceCategory } from '@vioc-angular/central-ui/service/data-access-service-category';
import { QueryPage, QuerySearch, QuerySort } from '@vioc-angular/shared/common-api-models';
import { SearchFacade } from '@vioc-angular/shared/data-access-search';
import { ResponseEntity } from '@vioc-angular/shared/util-api';
import { ColumnConfig, Columns } from '@vioc-angular/shared/util-column';
import { Observable } from 'rxjs';

/**
 * Component used to select `Service`s via the `SearchComponent`.
 *
 * @usageNotes
 *  ``` html
    <vioc-angular-service-selection
        #serviceSelection
        [control]="servicesControl"
        [searchFn]="searchServices"
    ></vioc-angular-service-selection>
    ```

 *  ``` ts
    readonly searchServices = (querySearch: QuerySearch): Observable<ResponseEntity<Service>> =>
        this.serviceFacade.findUnassignedServicesForCompany(this.companyControl.value, querySearch);

    get servicesControl(): FormControl {
        return this.form.get('services') as FormControl;
    }
    ```
 */
@Component({
    selector: 'vioc-angular-service-category-selection',
    template: `
        <vioc-angular-search
            #search
            [columns]="columns"
            [searchFn]="searchFn"
            [sort]="sort"
            [page]="page"
            [selectable]="true"
            [multiple]="multiple"
            [previousSearchEnabled]="false"
            (rowSelect)="selectRow($event)"
        >
        </vioc-angular-search>
    `,
    providers: [{ provide: SearchFacade, useValue: {} }],
})
export class ServiceCategorySelectionComponent extends SearchSelection<ServiceCategory> {
    @Input() searchFn: (querySearch: QuerySearch) => Observable<ResponseEntity<ServiceCategory>>;

    readonly columns: Columns = {
        categoryCode: {
            apiFieldPath: 'code',
            name: 'Category Code',
            type: 'string',
            searchable: { defaultSearch: true },
            gridUpdatable: false,
        },
        categoryDescription: {
            apiFieldPath: 'description',
            name: 'Category Description',
            type: 'string',
            searchable: { defaultSearch: true },
        },
        active: {
            name: 'Active',
            apiFieldPath: 'active',
            type: 'boolean',
            searchable: { defaultSearch: true },
            gridUpdatable: false,
        },
        parentCategory: {
            name: 'Parent Category',
            apiFieldPath: 'parentCategory.description',
            type: 'string',
            searchable: { defaultSearch: true },
            nullable: true,
        },
    };

    sort = new QuerySort(Columns.toColumn(this.columns.categoryCode as ColumnConfig));

    page = new QueryPage(0, 20);
}
