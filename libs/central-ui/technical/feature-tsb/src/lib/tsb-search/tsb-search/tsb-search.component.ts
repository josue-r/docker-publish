import { Component, ViewChild } from '@angular/core';
import { CommonCodeFacade } from '@vioc-angular/central-ui/config/data-access-common-code';
// tslint:disable-next-line: nx-enforce-module-boundaries
import { SearchPageComponent } from '@vioc-angular/central-ui/feature-search-page';
import { ServiceCategoryFacade } from '@vioc-angular/central-ui/service/data-access-service-category';
import { AcesFacade } from '@vioc-angular/central-ui/technical/data-access-aces';
import { Tsb, TsbFacade } from '@vioc-angular/central-ui/technical/data-access-tsb';
import { QuerySort } from '@vioc-angular/shared/common-api-models';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { SEARCHABLE_TOKEN } from '@vioc-angular/shared/data-access-search';
import { Column, ColumnConfig, Columns, Comparators } from '@vioc-angular/shared/util-column';
import { DataModifyingComponent } from '@vioc-angular/shared/util-data-modifying';

@Component({
    selector: 'vioc-angular-tsb-search',
    templateUrl: './tsb-search.component.html',
    providers: [
        AcesFacade,
        CommonCodeFacade,
        ServiceCategoryFacade,
        TsbFacade,
        { provide: SEARCHABLE_TOKEN, useValue: TsbFacade },
    ],
})
export class TsbSearchComponent extends DataModifyingComponent {
    @ViewChild('searchPage', { static: true }) readonly searchPage: SearchPageComponent;

    readonly columns: Columns = {
        name: {
            apiFieldPath: 'name',
            name: 'Name',
            type: 'string',
            searchable: { defaultSearch: true },
            displayedByDefault: true,
        },
        serviceCategory: () =>
            this.serviceCategoryFacade.searchColumns //
                .dropdown(
                    { level: 'ROOT', apiFieldPath: 'serviceCategory' },
                    {
                        searchable: { defaultSearch: true },
                        displayedByDefault: true,
                    }
                ),
        documentFileName: {
            apiFieldPath: 'documentFile.fileName',
            name: 'Document File Name',
            type: 'string',
            searchable: { defaultSearch: true },
            displayedByDefault: true,
        },
        year: {
            apiFieldPath: 'year',
            name: 'Year',
            type: { customType: 'vehicleYear', inputType: 'integer' },
            searchable: { defaultSearch: true },
            displayable: false,
            comparators: Comparators.forType('integer'),
        },
        make: () =>
            this.acesFacade.searchColumns.makeDropdown(
                { name: 'Make', apiFieldPath: 'vehicles.makeId' },
                { searchable: { defaultSearch: true }, displayable: false }
            ),
        // TODO (TSP: 03/11/2021): will need a custom search to enable searching by these fields since
        // they require make to be selected. Starting with just the make dropdown for now
        // model: {
        //     apiFieldPath: 'vehicles.modelId',
        //     name: 'Model',
        //     type: 'integer',
        //     searchable: { defaultSearch: true },
        //     displayable: false,
        // },
        // engine: {
        //     apiFieldPath: 'vehicles.engineCofigId',
        //     name: 'Engine',
        //     type: 'integer',
        //     searchable: true,
        //     displayable: false,
        // },
        active: {
            apiFieldPath: 'active',
            name: 'Active',
            type: 'boolean',
            searchable: { defaultSearch: true },
            displayedByDefault: true,
        },
        attributeType: () =>
            this.commonCodeFacade.searchColumns.codeDropdown(
                {
                    type: 'ACES_ATTRIBUTE_TYPE',
                    name: 'Attribute Type',
                    apiFieldPath: 'vehicles.attributes.type',
                    entityType: 'acesAttributeType',
                },
                { searchable: true, displayable: false }
            ),
        // TODO: (JAD 03/12/2021): will need a custom search method to enable since an attribute type
        // will need to be selected to populate a dropdown of possible values
        // attributeValue: () =>
        //     this.commonCodeFacade.searchColumns.codeDropdown(
        //         {
        //             type: 'ACES_ATTRIBUTE_TYPE',
        //             name: 'Attribute Type',
        //             apiFieldPath: 'vehicles.attributes.type',
        //             entityType: 'attribute',
        //         },
        //         { searchable: true, displayable: false }
        //     ),
    };

    readonly defaultSorts: QuerySort[];

    constructor(
        private readonly commonCodeFacade: CommonCodeFacade,
        public readonly tsbFacade: TsbFacade,
        private readonly acesFacade: AcesFacade,
        private readonly serviceCategoryFacade: ServiceCategoryFacade,
        private readonly messageFacade: MessageFacade
    ) {
        super();

        this.defaultSorts = [new QuerySort(Column.of(this.columns.name as ColumnConfig))];
    }

    /**
     * Returns the array of url path variables that uniquely identify the entity in the route.
     */
    toStringId(tsb: Tsb): string[] {
        return [`${tsb.id}`];
    }

    activate() {
        this.tsbFacade.activate(this.selectedIds()).subscribe((count) => {
            this.messageFacade.addMessage({ message: `${count} record(s) activated`, severity: 'success' });
            this.searchPage.triggerPreviousSearch();
        });
    }

    deactivate() {
        this.tsbFacade.deactivate(this.selectedIds()).subscribe((count) => {
            this.messageFacade.addMessage({ message: `${count} record(s) deactivated`, severity: 'success' });
            this.searchPage.triggerPreviousSearch();
        });
    }

    private selectedIds(): number[] {
        return this.searchPage.searchComponent.selection.selected.map((tsb) => tsb.id);
    }

    /**
     * @see DataModifyingComponent
     */
    get unsavedChanges(): boolean {
        return this.searchPage.unsavedChanges;
    }
}
