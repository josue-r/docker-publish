import { Component, OnInit, ViewChild } from '@angular/core';
// TODO: 05/05/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { SearchPageComponent } from '@vioc-angular/central-ui/feature-search-page';
import { ProductCategoryFacade } from '@vioc-angular/central-ui/product/data-access-product-category';
import { Service, ServiceFacade } from '@vioc-angular/central-ui/service/data-access-service';
import { ServiceCategoryFacade } from '@vioc-angular/central-ui/service/data-access-service-category';
import { MassDeactivateDialogComponent } from '@vioc-angular/central-ui/ui-mass-deactivate-dialog';
import { AssignmentCount, QuerySort } from '@vioc-angular/shared/common-api-models';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { SEARCHABLE_TOKEN } from '@vioc-angular/shared/data-access-search';
import { Column, ColumnConfig, Columns } from '@vioc-angular/shared/util-column';
import { DataModifyingComponent } from '@vioc-angular/shared/util-data-modifying';

@Component({
    selector: 'vioc-angular-service-catalog-search',
    templateUrl: './service-catalog-search.component.html',
    providers: [
        ServiceFacade,
        ServiceCategoryFacade,
        ProductCategoryFacade,
        { provide: SEARCHABLE_TOKEN, useValue: ServiceFacade },
    ],
})
export class ServiceCatalogSearchComponent extends DataModifyingComponent implements OnInit {
    @ViewChild('searchPage', { static: true }) readonly searchPage: SearchPageComponent;

    /**
     * Injecting MassDeactivateDialogComponent used for mass deactivation purpose.
     */
    @ViewChild('massDeactivate', { static: true }) massDeactivate: MassDeactivateDialogComponent;

    readonly columns: Columns = {
        serviceCategory: () =>
            this.serviceCategoryFacade.searchColumns //
                .dropdown(
                    { level: 'LEAF', apiFieldPath: 'serviceCategory' },
                    {
                        searchable: { defaultSearch: true },
                        displayedByDefault: true,
                    }
                ),

        serviceCodeColumn: {
            name: 'Service Code',
            apiFieldPath: 'code',
            type: 'string',
            searchable: { defaultSearch: true },
        },
        description: {
            name: 'Description',
            apiFieldPath: 'description',
            type: 'string',
            searchable: { defaultSearch: true },
        },
        quickSaleSupported: {
            name: 'Quick Sale Supported',
            apiFieldPath: 'supportsQuickSale',
            type: 'boolean',
            displayedByDefault: false,
        },
        quickInvoiceSupported: {
            name: 'Quick Invoice Supported',
            apiFieldPath: 'supportsQuickInvoice',
            type: 'boolean',
            displayedByDefault: false,
        },
        regularInvoiceSupported: {
            name: 'Regular Invoice Supported',
            apiFieldPath: 'supportsRegularInvoice',
            type: 'boolean',
            displayedByDefault: false,
        },
        refillInvoiceSupported: {
            name: 'Refill Invoice Supported',
            apiFieldPath: 'supportsRefillInvoice',
            type: 'boolean',
            displayedByDefault: false,
        },
        tireCheckInvoiceSupported: {
            name: 'Tire Check Invoice Supported',
            apiFieldPath: 'supportsTireCheckInvoice',
            type: 'boolean',
            gridUpdatable: true,
            displayedByDefault: false,
        },
        active: {
            name: 'Active',
            apiFieldPath: 'active',
            type: 'boolean',
            searchable: { defaultSearch: true },
        },
        productCategory: () =>
            this.productCategoryFacade.searchColumns //
                .dropdown(
                    { level: 'LEAF', apiFieldPath: 'serviceProducts.productCategory' },
                    {
                        displayable: false, // not displayable since this is a collection dereference
                        nullable: true,
                    }
                ),
        supportsECommerce: {
            name: 'eCommerce Supported',
            apiFieldPath: 'supportsECommerce',
            type: 'boolean',
            displayedByDefault: false,
            gridUpdatable: true,
        },
    };

    readonly defaultSorts: QuerySort[];

    constructor(
        public readonly serviceFacade: ServiceFacade,
        private readonly productCategoryFacade: ProductCategoryFacade,
        private readonly serviceCategoryFacade: ServiceCategoryFacade,
        private readonly messageFacade: MessageFacade
    ) {
        super();

        this.defaultSorts = [new QuerySort(Column.of(this.columns.serviceCodeColumn as ColumnConfig))];
    }

    ngOnInit(): void {}

    mapToPathVariables(service: Service): string[] {
        return [service.code];
    }

    /**
     * @see DataModifyingComponent
     */
    get unsavedChanges(): boolean {
        return this.searchPage.unsavedChanges;
    }

    /**
     * Loads resources assinged to the selected services for activation/deactivation.
     * If loadUsage is true then the resources are loaded via the API, if false the resource ids are
     * passed for activation/deactivation.
     */
    loadUsage(): void {
        const selectedIds = this.searchPage.searchComponent.selection.selected.map((selected) => selected.id);
        const usage = this.serviceFacade.findUsage(selectedIds);
        this.massDeactivate.openDialog(usage);
    }

    /**
     * Activates the selected services from the mass-activate component based on id.
     *
     * @param services services to be activated.
     */
    activate(): void {
        const ids = this.searchPage.searchComponent.selection.selected.map((s) => s.id);
        this.serviceFacade.activate(ids).subscribe((count) => {
            this.messageFacade.addMessage({ message: `${count} record(s) activated`, severity: 'success' });
            this.searchPage.triggerPreviousSearch();
        });
    }

    /**
     * Deactivates the selected services from the mass-activate component based on id.
     *
     * @param services services with company and store usage information to be deactivated.
     */
    deactivate(services: AssignmentCount[]): void {
        this.serviceFacade.deactivate(services.map((s) => s.id)).subscribe((count) => {
            this.messageFacade.addMessage({ message: `${count} record(s) deactivated`, severity: 'success' });
            this.searchPage.triggerPreviousSearch();
        });
    }
}
