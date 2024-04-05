import { Component, ViewChild } from '@angular/core';
import { CommonCodeFacade } from '@vioc-angular/central-ui/config/data-access-common-code';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { SearchPageComponent } from '@vioc-angular/central-ui/feature-search-page';
import { Product, ProductFacade } from '@vioc-angular/central-ui/product/data-access-product';
import { MassDeactivateDialogComponent } from '@vioc-angular/central-ui/ui-mass-deactivate-dialog';
import { AssignmentCount, QuerySort } from '@vioc-angular/shared/common-api-models';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { SEARCHABLE_TOKEN } from '@vioc-angular/shared/data-access-search';
import { Column, ColumnConfig, Columns } from '@vioc-angular/shared/util-column';
import { DataModifyingComponent } from '@vioc-angular/shared/util-data-modifying';
import { FormFactoryOptions } from '@vioc-angular/shared/util-form';

@Component({
    selector: 'vioc-angular-product-search',
    templateUrl: './product-search.component.html',
    providers: [ProductFacade, CommonCodeFacade, { provide: SEARCHABLE_TOKEN, useValue: ProductFacade }],
})
export class ProductSearchComponent extends DataModifyingComponent {
    @ViewChild('searchPage', { static: true }) readonly searchPage: SearchPageComponent;

    /**
     * Injecting MassDeactivateDialogComponent used for mass deactivation purpose.
     */
    @ViewChild(MassDeactivateDialogComponent, { static: true }) massDeactivate: MassDeactivateDialogComponent;

    readonly columns: Columns = {
        code: {
            apiFieldPath: 'code',
            name: 'Product Code',
            type: 'string',
            searchable: { defaultSearch: true },
        },
        categoryCode: {
            apiFieldPath: 'productCategory.code',
            name: 'Category Code',
            type: 'string',
            searchable: { defaultSearch: true },
        },
        categoryDescription: {
            apiFieldPath: 'productCategory.description',
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
        invoiceDescription: { apiFieldPath: 'description', name: 'Invoice Description', type: 'string' },
        uom: () =>
            this.commonCodeFacade.searchColumns //
                .codeDropdown(
                    { type: 'PRDUOM', name: 'UOM', apiFieldPath: 'defaultUom', entityType: 'productUnitOfMeasure' },
                    { displayedByDefault: false }
                ),
        inventoryDescription: {
            apiFieldPath: 'inventoryDescription',
            name: 'Inventory Description',
            type: 'string',
            displayedByDefault: false,
        },
        sapNumber: {
            apiFieldPath: 'sapNumber',
            name: 'SAP Number',
            type: 'string',
            displayedByDefault: false,
            nullable: true,
        },
        upc: { apiFieldPath: 'upc', name: 'UPC', type: 'string', displayedByDefault: false, nullable: true },
        relatedProductCode: {
            apiFieldPath: 'relatedProductCode',
            name: 'Related Product Code',
            type: 'string',
            displayedByDefault: false,
        },
        obsolete: { apiFieldPath: 'obsolete', name: 'Obsolete', type: 'boolean', displayedByDefault: false },
        bulk: { apiFieldPath: 'bulk', name: 'Bulk', type: 'boolean', displayedByDefault: false },
        tankStorage: { apiFieldPath: 'tankStorage', name: 'Tank Storage', type: 'boolean', displayedByDefault: false },
        productType: () =>
            this.commonCodeFacade.searchColumns //
                .descriptionDropdown(
                    { type: 'PRODTYPE', name: 'Product Type', apiFieldPath: 'type', entityType: 'productType' },
                    { displayedByDefault: false }
                ),
        vendorType: () =>
            this.commonCodeFacade.searchColumns //
                .descriptionDropdown(
                    { type: 'VENDOR_TYPE', name: 'Vendor Type', apiFieldPath: 'vendorType', entityType: 'vendorType' },
                    { displayedByDefault: false, nullable: true }
                ),
        fluidGroup: () =>
            this.commonCodeFacade.searchColumns //
                .codeDropdown(
                    { type: 'FLUID_GROUP', name: 'Fluid Group', apiFieldPath: 'fluidGroup', entityType: 'fluidGroup' },
                    { displayedByDefault: false, nullable: true }
                ),
        reportOrder: { apiFieldPath: 'reportOrder', name: 'Report Order', type: 'string', displayedByDefault: false },
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
        public readonly productFacade: ProductFacade,
        private readonly commonCodeFacade: CommonCodeFacade,
        private readonly messageFacade: MessageFacade
    ) {
        super();

        this.defaultSorts = [new QuerySort(Column.of(this.columns.code as ColumnConfig))];
    }

    toCode(product: Product): string[] {
        return [product.code];
    }

    /**
     * Loads resources assinged to the selected products for activation/deactivation.
     * If loadUsage is true then the resources are loaded via the API, if false the resource ids are
     * passed for activation/deactivation.
     */
    loadUsage(): void {
        const selectedIds = this.searchPage.searchComponent.selection.selected.map((selected) => selected.id);
        const usage = this.productFacade.findUsage(selectedIds);
        this.massDeactivate.openDialog(usage);
    }

    /**
     * Activates the selected products from the mass-activate component based on id.
     *
     * @param products Products to be activated.
     */
    activate(): void {
        const ids = this.searchPage.searchComponent.selection.selected.map((s) => s.id);
        this.productFacade.activate(ids).subscribe((count) => {
            this.messageFacade.addMessage({ message: `${count} record(s) activated`, severity: 'success' });
            this.searchPage.triggerPreviousSearch();
        });
    }

    /**
     * Deactivates the selected products from the mass-activate component based on id.
     *
     * @param products Products with company and store usage information to be deactivated.
     */
    deactivate(products: AssignmentCount[]): void {
        this.productFacade.deactivate(products.map((s) => s.id)).subscribe((count) => {
            this.messageFacade.addMessage({ message: `${count} record(s) deactivated`, severity: 'success' });
            this.searchPage.triggerPreviousSearch();
        });
    }

    get gridFormOptions(): FormFactoryOptions {
        return { productFacade: this.productFacade };
    }

    /**
     * @see DataModifyingComponent
     */
    get unsavedChanges(): boolean {
        return this.searchPage.unsavedChanges;
    }
}
