import { Component, ViewChild } from '@angular/core';
import { CommonCodeFacade } from '@vioc-angular/central-ui/config/data-access-common-code';
// TODO: 07/21/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
//tslint:disable-next-line: nx-enforce-module-boundaries
import { SearchPageComponent } from '@vioc-angular/central-ui/feature-search-page';
import { CarSystemFacade } from '@vioc-angular/central-ui/service/data-access-car-system';
import { ServiceCategory, ServiceCategoryFacade } from '@vioc-angular/central-ui/service/data-access-service-category';
import { QuerySort } from '@vioc-angular/shared/common-api-models';
import { SEARCHABLE_TOKEN } from '@vioc-angular/shared/data-access-search';
import { Column, ColumnConfig, Columns } from '@vioc-angular/shared/util-column';
import { DataModifyingComponent } from '@vioc-angular/shared/util-data-modifying';

@Component({
    selector: 'vioc-angular-service-category-search',
    templateUrl: './service-category-search.component.html',
    providers: [
        ServiceCategoryFacade,
        CommonCodeFacade,
        CarSystemFacade,
        { provide: SEARCHABLE_TOKEN, useValue: ServiceCategoryFacade },
    ],
})
export class ServiceCategorySearchComponent extends DataModifyingComponent {
    @ViewChild('searchPage', { static: true }) readonly searchPage: SearchPageComponent;

    gridModeEnabled = false;

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
        defaultService: {
            name: 'Default Service',
            apiFieldPath: 'defaultService.code',
            type: 'string',
            searchable: { defaultSearch: false },
            displayedByDefault: false,
            nullable: true,
        },
        premium: {
            name: 'Premium',
            apiFieldPath: 'premium',
            type: 'boolean',
            searchable: { defaultSearch: false },
            gridUpdatable: false,
            displayedByDefault: false,
            nullable: true,
        },
        excludeFromMetrics: {
            name: 'Exclude From Metrics',
            apiFieldPath: 'excludeFromMetrics',
            type: 'boolean',
            searchable: { defaultSearch: false },
            gridUpdatable: false,
            displayedByDefault: false,
            nullable: true,
        },
        nacsProductCode: () =>
            this.commonCodeFacade.searchColumns //
                .descriptionDropdown(
                    {
                        type: 'NACSPRODUCT',
                        name: 'Nacs Product Code',
                        apiFieldPath: 'nacsProductCode',
                        entityType: 'nacsProductCode',
                    },
                    { displayedByDefault: false }
                ),
        fleetProductCode: () =>
            this.commonCodeFacade.searchColumns //
                .descriptionDropdown(
                    {
                        type: 'BILLCODE',
                        name: 'Fleet Product Code',
                        apiFieldPath: 'fleetProductCode',
                        entityType: 'fleetProductCode',
                    },
                    { displayedByDefault: false, nullable: true }
                ),
        nocrGroup: () =>
            this.commonCodeFacade.searchColumns //
                .descriptionDropdown(
                    {
                        type: 'NOCR_METRICS_GROUP',
                        name: 'Non Oil Change Revenue Group',
                        apiFieldPath: 'nocrGroup',
                        entityType: 'nonOilChangeRevenueGroup',
                    },
                    { displayedByDefault: false, nullable: true }
                ),

        carSystem: () =>
            this.carSystemFacade.searchColumns.dropdown(
                {
                    name: 'Car System',
                    apiFieldPath: 'serviceInfo.carSystem',
                },
                { displayedByDefault: false, nullable: true }
            ),

        appearOnWorkOrder: {
            name: 'Appear on Work Order',
            apiFieldPath: 'serviceInfo.appearOnWorkOrder',
            type: 'boolean',
            searchable: { defaultSearch: false },
            displayedByDefault: false,
            gridUpdatable: false,
        },
        competitivePrice: {
            name: 'Competitive Price',
            apiFieldPath: 'serviceInfo.competitivePrice',
            type: 'decimal',
            searchable: { defaultSearch: false },
            displayedByDefault: false,
            gridUpdatable: false,
        },
        serviceTime: {
            name: 'Service Time',
            apiFieldPath: 'serviceInfo.serviceTime',
            type: 'string',
            searchable: { defaultSearch: false },
            displayedByDefault: false,
            gridUpdatable: false,
        },
    };

    readonly defaultSorts: QuerySort[];

    constructor(
        public readonly serviceCategoryFacade: ServiceCategoryFacade,
        private readonly commonCodeFacade: CommonCodeFacade,
        private readonly carSystemFacade: CarSystemFacade
    ) {
        super();

        this.defaultSorts = [new QuerySort(Column.of(this.columns.categoryCode as ColumnConfig))];
    }

    toCode(serviceCategory: ServiceCategory): string[] {
        return [serviceCategory.code];
    }

    /**
     * @see DataModifyingComponent
     */
    get unsavedChanges(): boolean {
        return this.searchPage.unsavedChanges;
    }
}
