import { Component, ViewChild } from '@angular/core';
import { CommonCode, CommonCodeFacade } from '@vioc-angular/central-ui/config/data-access-common-code';
// tslint:disable-next-line: nx-enforce-module-boundaries
import { SearchPageComponent } from '@vioc-angular/central-ui/feature-search-page';
import { QuerySort } from '@vioc-angular/shared/common-api-models';
import { Described } from '@vioc-angular/shared/common-functionality';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { SEARCHABLE_TOKEN } from '@vioc-angular/shared/data-access-search';
import { Column, ColumnConfig, Columns, DynamicDropdownColumn } from '@vioc-angular/shared/util-column';
import { DataModifyingComponent } from '@vioc-angular/shared/util-data-modifying';
import { FormFactoryOptions } from '@vioc-angular/shared/util-form';
import { map, tap } from 'rxjs/operators';

@Component({
    selector: 'vioc-angular-common-code-search',
    templateUrl: './common-code-search.component.html',
    providers: [CommonCodeFacade, { provide: SEARCHABLE_TOKEN, useValue: CommonCodeFacade }],
})
export class CommonCodeSearchComponent extends DataModifyingComponent {
    @ViewChild('searchPage', { static: true }) readonly searchPage: SearchPageComponent;

    readonly columns: Columns = {
        commonCodeType: () =>
            DynamicDropdownColumn.of({
                type: 'string',
                name: 'Common Code Type',
                apiFieldPath: 'type',
                fetchData: () =>
                    this.commonCodeFacade
                        .findByType('CDTYPE') //
                        .pipe(
                            tap((r) => {
                                r.sort(Described.codeComparator);
                            }),
                            map((m) => m.map((n) => n.code))
                        ),
                displayedByDefault: true,
                searchable: { defaultSearch: true },
            }),
        commonCode: {
            apiFieldPath: 'code',
            name: 'Common Code',
            type: 'string',
            searchable: { defaultSearch: true },
        },
        commonCodeDescription: {
            apiFieldPath: 'description',
            name: 'Common Code Description',
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
        reportOrder: {
            apiFieldPath: 'reportOrder',
            name: 'Report Order',
            type: 'integer',
        },
    };

    readonly defaultSorts: QuerySort[];

    constructor(public readonly commonCodeFacade: CommonCodeFacade, private readonly messageFacade: MessageFacade) {
        super();

        this.defaultSorts = [new QuerySort(Column.of(this.columns.commonCode as ColumnConfig))];
    }

    get gridFormOptions(): FormFactoryOptions {
        // provide facade to form for optional async validation
        return { commonCodeFacade: this.commonCodeFacade };
    }

    /**
     * Returns the array of url path variables that uniquely identify the entity in the route.
     */
    viewEditRoutePathVariables(commonCode: CommonCode): string[] {
        //  This should match what is defined at the route config. For example, if the route config is set up like
        //  `path: ':accessMode/:type/:code,` this should be implemented like:
        return [commonCode.type, commonCode.code];
    }

    /**
     * @see DataModifyingComponent
     */
    get unsavedChanges(): boolean {
        return this.searchPage.unsavedChanges;
    }
}
