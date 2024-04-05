import { Component, ViewChild } from '@angular/core';
import { CommonCodeFacade } from '@vioc-angular/central-ui/config/data-access-common-code';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { SearchPageComponent } from '@vioc-angular/central-ui/feature-search-page';
import { CompanyExportFacade } from '@vioc-angular/central-ui/organization/company/data-access-company-export';
import { ResourceFacade } from '@vioc-angular/central-ui/organization/data-access-resources';
import { CompanyProduct, CompanyProductFacade } from '@vioc-angular/central-ui/product/data-access-company-product';
import { MassDeactivateDialogComponent } from '@vioc-angular/central-ui/ui-mass-deactivate-dialog';
import { AssignmentCount, QuerySort } from '@vioc-angular/shared/common-api-models';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { SEARCHABLE_TOKEN } from '@vioc-angular/shared/data-access-search';
import { AbstractDropdownColumn, Column, ColumnConfig, Columns } from '@vioc-angular/shared/util-column';
import { DataModifyingComponent } from '@vioc-angular/shared/util-data-modifying';
import { FormFactoryOptions } from '@vioc-angular/shared/util-form';

@Component({
    selector: 'vioc-angular-company-product-search',
    templateUrl: './company-product-search.component.html',
    providers: [
        CompanyProductFacade,
        ResourceFacade,
        CommonCodeFacade,
        CompanyExportFacade,
        { provide: SEARCHABLE_TOKEN, useValue: CompanyProductFacade },
    ],
})
export class CompanyProductSearchComponent extends DataModifyingComponent {
    @ViewChild('searchPage', { static: true }) readonly searchPage: SearchPageComponent;

    /**
     * Injecting `MassDeactivateDialogComponent` used for mass deactivation purpose.
     */
    @ViewChild(MassDeactivateDialogComponent, { static: true }) massDeactivate: MassDeactivateDialogComponent;

    readonly columns: Columns = {
        company: () => this.resourceFacade.searchColumns.company.contextDropdown('COMPANY_PRODUCT'),
        productCode: {
            apiFieldPath: 'product.code',
            name: 'Product Code',
            type: 'string',
            searchable: { defaultSearch: true },
        },
        invoiceDescription: { apiFieldPath: 'product.description', name: 'Invoice Description', type: 'string' },
        categoryCode: {
            apiFieldPath: 'product.productCategory.code',
            name: 'Category Code',
            type: 'string',
            searchable: { defaultSearch: true },
        },
        categoryDescription: {
            apiFieldPath: 'product.productCategory.description',
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
        uom: () =>
            this.commonCodeFacade.searchColumns //
                .codeDropdown(
                    { type: 'PRDUOM', name: 'UOM', apiFieldPath: 'uom', entityType: 'productUnitOfMeasure' },
                    { displayedByDefault: false }
                ),
        accounting: {
            name: 'Accounting',
            columns: {
                salesAccount: {
                    apiFieldPath: 'salesAccount.code',
                    name: 'Sales Account',
                    type: 'string',
                    nullable: true,
                    gridUpdatable: true,
                },
                costAccount: {
                    apiFieldPath: 'costAccount.code',
                    name: 'Cost Account',
                    type: 'string',
                    nullable: true,
                    gridUpdatable: true,
                },
            },
        },
        reportOrder: { apiFieldPath: 'reportOrder', name: 'Report Order', type: 'string' },
    };

    readonly defaultSorts: QuerySort[];

    constructor(
        public readonly companyProductFacade: CompanyProductFacade,
        private readonly commonCodeFacade: CommonCodeFacade,
        private readonly companyExportFacade: CompanyExportFacade,
        private readonly resourceFacade: ResourceFacade,
        private readonly messageFacade: MessageFacade
    ) {
        super();

        this.defaultSorts = [
            new QuerySort(Column.of((this.columns.company as () => AbstractDropdownColumn<any>)())),
            new QuerySort(Column.of(this.columns.productCode as ColumnConfig)),
        ];
    }

    toPathVariables(companyProduct: CompanyProduct): string[] {
        return [companyProduct.company.code, companyProduct.product.code];
    }

    /**
     * Loads resources assigned to the selected company products for deactiovation.
     */
    loadUsage(): void {
        const selectedIds = this.searchPage.searchComponent.selection.selected.map((selected) => selected.id);
        const usage = this.companyProductFacade.findUsage(selectedIds);
        this.massDeactivate.openDialog(usage);
    }

    /**
     * Activates the selected company products from the mass-activate component based on id.
     */
    activate(): void {
        const ids = this.searchPage.searchComponent.selection.selected.map((companyProduct) => companyProduct.id);
        this.companyProductFacade.activate(ids).subscribe((count) => {
            this.messageFacade.addMessage({ message: `${count} record(s) activated`, severity: 'success' });
            this.searchPage.triggerPreviousSearch();
        });
    }

    /**
     * Deactivates the selected company products from the mass-dactivate component based on id.
     *
     * @param companyProducts Company Products to be deactivated.
     */
    deactivate(companyProducts: AssignmentCount[]): void {
        this.companyProductFacade
            .deactivate(companyProducts.map((companyProduct) => companyProduct.id))
            .subscribe((count) => {
                this.messageFacade.addMessage({ message: `${count} record(s) deactivated`, severity: 'success' });
                this.searchPage.triggerPreviousSearch();
            });
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
