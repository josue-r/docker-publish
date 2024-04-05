import { Component, Input } from '@angular/core';
// TODO: 06/09/2020: Pending changing the feature-search-page lib to a shared-feature lib
// tslint:disable-next-line: nx-enforce-module-boundaries
import { SearchSelection } from '@vioc-angular/central-ui/feature-search-page';
import { Service } from '@vioc-angular/central-ui/service/data-access-service';
import { QueryPage, QuerySearch, QuerySort } from '@vioc-angular/shared/common-api-models';
import { SearchFacade } from '@vioc-angular/shared/data-access-search';
import { ResponseEntity } from '@vioc-angular/shared/util-api';
import { Columns, ColumnConfig } from '@vioc-angular/shared/util-column';
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
    selector: 'vioc-angular-service-selection',
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
export class ServiceSelectionComponent extends SearchSelection<Service> {
    @Input() searchFn: (querySearch: QuerySearch) => Observable<ResponseEntity<Service>>;

    readonly columns: Columns = {
        code: {
            apiFieldPath: 'code',
            name: 'Service Code',
            type: 'string',
            searchable: { defaultSearch: true },
            displayedByDefault: true,
        },
        description: {
            apiFieldPath: 'description',
            name: 'Service Description',
            type: 'string',
            searchable: { defaultSearch: true },
            displayedByDefault: true,
        },
        categoryCode: {
            apiFieldPath: 'serviceCategory.code',
            name: 'Category Code',
            type: 'string',
            searchable: { defaultSearch: true },
            displayedByDefault: true,
        },
        categoryDescription: {
            apiFieldPath: 'serviceCategory.description',
            name: 'Category Description',
            type: 'string',
            displayedByDefault: true,
        },
        active: {
            apiFieldPath: 'active',
            name: 'Active',
            type: 'boolean',
            searchable: { defaultSearch: true },
            displayedByDefault: true,
        },
    };

    sort = new QuerySort(Columns.toColumn(this.columns.code as ColumnConfig));

    page = new QueryPage(0, 20);
}
