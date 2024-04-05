import { Component, ViewChild } from '@angular/core';
// TODO: 04/30/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { SearchPageComponent } from '@vioc-angular/central-ui/feature-search-page';
import { CompanyExportFacade } from '@vioc-angular/central-ui/organization/company/data-access-company-export';
import { ResourceFacade } from '@vioc-angular/central-ui/organization/data-access-resources';
import {
    CompanyService,
    CompanyServiceFacade,
    PricingStrategy,
} from '@vioc-angular/central-ui/service/data-access-company-service';
import { ServiceCategoryFacade } from '@vioc-angular/central-ui/service/data-access-service-category';
import { MassDeactivateDialogComponent } from '@vioc-angular/central-ui/ui-mass-deactivate-dialog';
import { QuerySort } from '@vioc-angular/shared/common-api-models';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { SEARCHABLE_TOKEN } from '@vioc-angular/shared/data-access-search';
import {
    AbstractDropdownColumn,
    Column,
    ColumnConfig,
    Columns,
    SimpleDropdownColumn,
} from '@vioc-angular/shared/util-column';
import { DataModifyingComponent } from '@vioc-angular/shared/util-data-modifying';
import { FormFactoryOptions } from '@vioc-angular/shared/util-form';

@Component({
    selector: 'vioc-angular-company-service-search',
    templateUrl: './company-service-search.component.html',
    providers: [
        ResourceFacade,
        ServiceCategoryFacade,
        CompanyServiceFacade,
        CompanyExportFacade,
        { provide: SEARCHABLE_TOKEN, useValue: CompanyServiceFacade },
    ],
})
export class CompanyServiceSearchComponent extends DataModifyingComponent {
    @ViewChild('searchPage', { static: true }) readonly searchPage: SearchPageComponent;

    @ViewChild(MassDeactivateDialogComponent, { static: true }) massDeactivate: MassDeactivateDialogComponent;

    constructor(
        public readonly companyServiceFacade: CompanyServiceFacade,
        private readonly serviceCategoryFacade: ServiceCategoryFacade,
        private readonly companyExportFacade: CompanyExportFacade,
        private readonly resourceFacade: ResourceFacade,
        private readonly messageFacade: MessageFacade
    ) {
        super();

        this.defaultSorts = [
            new QuerySort(Column.of((this.columns.company as () => AbstractDropdownColumn<any>)())),
            new QuerySort(Column.of(this.columns.service as ColumnConfig)),
        ];
    }

    readonly columns: Columns = {
        company: () => this.resourceFacade.searchColumns.company.contextDropdown('COMPANY_SERVICE'),
        serviceCategory: {
            name: 'Service Category',
            apiFieldPath: 'service.serviceCategory.code',
            type: 'string',
            searchable: { defaultSearch: true },
            gridUpdatable: false,
        },
        service: {
            name: 'Service Code',
            apiFieldPath: 'service.code',
            type: 'string',
            searchable: { defaultSearch: true },
            gridUpdatable: false,
        },
        serviceDescription: {
            name: 'Description',
            apiFieldPath: 'service.description',
            type: 'string',
            searchable: { defaultSearch: true },
            gridUpdatable: false,
        },
        active: {
            apiFieldPath: 'active',
            name: 'Active',
            type: 'boolean',
            searchable: { defaultSearch: true },
        },
        pricingStrategy: SimpleDropdownColumn.of({
            name: 'Pricing Strategy',
            apiFieldPath: 'pricingStrategy',
            type: { enum: 'pricingStrategy' },
            values: [PricingStrategy.SERVICE, PricingStrategy.PRODUCT],
            displayedByDefault: false,
        }),
        accounting: {
            name: 'Accounting',
            columns: {
                costAccount: {
                    name: 'Cost Account',
                    apiFieldPath: 'costAccount.code',
                    type: 'string',
                    displayedByDefault: false,
                    nullable: true,
                    gridUpdatable: true,
                },
                salesAccount: {
                    name: 'Sales Account',
                    apiFieldPath: 'salesAccount.code',
                    type: 'string',
                    displayedByDefault: false,
                    nullable: true,
                    gridUpdatable: true,
                },
            },
        },
    };

    readonly defaultSorts: QuerySort[];

    mapToPathVariables(companyService: CompanyService): string[] {
        return [companyService.company.code, companyService.service.code];
    }

    /**
     * Activates the selected products from the mass-activate component based on id.
     *
     * @param products Products to be activated.
     */
    activate(): void {
        const ids = this.searchPage.searchComponent.selection.selected.map((s) => s.id);
        this.companyServiceFacade.activate(ids).subscribe((count) => {
            this.messageFacade.addMessage({ message: `${count} record(s) activated`, severity: 'success' });
            this.searchPage.triggerPreviousSearch();
        });
    }

    /**
     * Deactivates the selected products from the mass-activate component based on id.
     *
     * @param services services with company and store usage information to be deactivated.
     */
    deactivate(): void {
        const ids = this.massDeactivate.selection.selected.map((s) => s.id);
        this.companyServiceFacade.deactivate(ids).subscribe((count) => {
            this.messageFacade.addMessage({ message: `${count} record(s) deactivated`, severity: 'success' });
            this.searchPage.triggerPreviousSearch();
        });
    }

    /**
     * Loads resources assigned to the selected company products for deactiovation.
     */
    loadUsage(): void {
        const selectedIds = this.searchPage.searchComponent.selection.selected.map((selected) => selected.id);
        const usage = this.companyServiceFacade.findUsage(selectedIds);
        this.massDeactivate.openDialog(usage);
    }

    /**
     * @see DataModifyingComponent
     */
    get unsavedChanges(): boolean {
        return this.searchPage.unsavedChanges;
    }

    get gridFormOptions(): FormFactoryOptions {
        return { companyExportFacade: this.companyExportFacade };
    }
}
