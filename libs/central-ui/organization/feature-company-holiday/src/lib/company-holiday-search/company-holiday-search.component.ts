import { AfterViewInit, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { CommonCodeFacade } from '@vioc-angular/central-ui/config/data-access-common-code';
import { SearchPageComponent } from '@vioc-angular/central-ui/feature-search-page';
import {
    CompanyHoliday,
    CompanyHolidayFacade,
} from '@vioc-angular/central-ui/organization/data-access-company-holiday';
import { ResourceFacade } from '@vioc-angular/central-ui/organization/data-access-resources';
import { QuerySort } from '@vioc-angular/shared/common-api-models';
import { SEARCHABLE_TOKEN } from '@vioc-angular/shared/data-access-search';
import { AbstractDropdownColumn, Column, ColumnConfig, Columns, Comparators } from '@vioc-angular/shared/util-column';
import * as moment from 'moment';

@Component({
    selector: 'company-holiday-search',
    templateUrl: './company-holiday-search.component.html',
    providers: [
        CompanyHolidayFacade,
        CommonCodeFacade,
        ResourceFacade,
        { provide: SEARCHABLE_TOKEN, useValue: CompanyHolidayFacade },
    ],
})
export class CompanyHolidaySearchComponent implements AfterViewInit {
    @ViewChild('searchPage', { static: true }) readonly searchPage: SearchPageComponent;

    readonly defaultSorts: QuerySort[];

    readonly columns: Columns = {
        company: () => this.resourceFacade.searchColumns.company.contextDropdown('COMPANY_HOLIDAY'),
        holidayDate: {
            apiFieldPath: 'holidayDate',
            name: 'Holiday Date',
            type: 'date',
            searchable: {
                defaultSearch: {
                    comparator: Comparators.after,
                    value: moment().startOf('day'),
                },
                required: true,
            },
        },
        holiday: {
            apiFieldPath: 'name',
            name: 'Holiday',
            type: 'string',
            searchable: false,
        },
    };

    /**
     * Returns the array of url path variables that uniquely identify the entity in the route.
     */
    toPathVariables(companyHoliday: CompanyHoliday): string[] {
        return [companyHoliday.company.code, companyHoliday.holidayDate];
    }

    constructor(
        public readonly companyHolidayFacade: CompanyHolidayFacade,
        private readonly resourceFacade: ResourceFacade,
        private readonly changeDetector: ChangeDetectorRef
    ) {
        this.defaultSorts = [
            new QuerySort(Column.of((this.columns.company as () => AbstractDropdownColumn<any>)())),
            new QuerySort(Column.of(this.columns.holidayDate as ColumnConfig)),
        ];
    }

    ngAfterViewInit(): void {
        this.searchPage.searchComponent.search();
        this.changeDetector.detectChanges();
    }
}
