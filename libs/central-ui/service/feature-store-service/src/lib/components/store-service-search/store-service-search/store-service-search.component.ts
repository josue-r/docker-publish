import { Component, ViewChild } from '@angular/core';
import { CommonCodeFacade } from '@vioc-angular/central-ui/config/data-access-common-code';
// TODO: 04/28/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { SearchPageComponent } from '@vioc-angular/central-ui/feature-search-page';
import { ResourceFacade } from '@vioc-angular/central-ui/organization/data-access-resources';
import { ProductCategoryFacade } from '@vioc-angular/central-ui/product/data-access-product-category';
import { ServiceCategoryFacade } from '@vioc-angular/central-ui/service/data-access-service-category';
import { StoreService, StoreServiceFacade } from '@vioc-angular/central-ui/service/data-access-store-service';
import { QuerySort } from '@vioc-angular/shared/common-api-models';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { SEARCHABLE_TOKEN } from '@vioc-angular/shared/data-access-search';
import { AbstractDropdownColumn, Column, ColumnConfig, Columns } from '@vioc-angular/shared/util-column';
import { DataModifyingComponent } from '@vioc-angular/shared/util-data-modifying';

@Component({
    selector: 'vioc-angular-store-service-search',
    templateUrl: './store-service-search.component.html',
    providers: [
        CommonCodeFacade,
        ServiceCategoryFacade,
        ProductCategoryFacade,
        ResourceFacade,
        StoreServiceFacade,
        { provide: SEARCHABLE_TOKEN, useValue: StoreServiceFacade },
    ],
})
export class StoreServiceSearchComponent extends DataModifyingComponent {
    @ViewChild('searchPage', { static: true }) readonly searchPage: SearchPageComponent;

    constructor(
        private readonly commonCodeFacade: CommonCodeFacade,
        private readonly serviceCategoryFacade: ServiceCategoryFacade,
        private readonly productCategoryFacade: ProductCategoryFacade,
        private readonly resourceFacade: ResourceFacade,
        public readonly storeServiceFacade: StoreServiceFacade,
        public readonly messageFacade: MessageFacade
    ) {
        super();

        this.defaultSorts = [
            new QuerySort(Column.of((this.columns.store as () => AbstractDropdownColumn<any>)())),
            new QuerySort(Column.of(this.columns.service as ColumnConfig)),
        ];
    }

    readonly columns: Columns = {
        store: () => this.resourceFacade.searchColumns.store.contextDropdown('STORE_SERVICE'),
        company: () =>
            this.resourceFacade.searchColumns.company.contextDropdown('STORE_SERVICE', undefined, {
                apiFieldPath: 'store.company',
            }),
        serviceCategory: () =>
            this.serviceCategoryFacade.searchColumns //
                .dropdown(
                    { level: 'LEAF', apiFieldPath: 'service.serviceCategory' },
                    {
                        searchable: { defaultSearch: true },
                        displayedByDefault: true,
                    }
                ),
        service: {
            name: 'Service Code',
            apiFieldPath: 'service.code',
            type: 'string',
            searchable: { defaultSearch: true },
        },
        serviceDescription: {
            name: 'Service Description',
            apiFieldPath: 'service.description',
            type: 'string',
            searchable: { defaultSearch: true },
        },
        active: {
            name: 'Active',
            apiFieldPath: 'active',
            type: 'boolean',
            searchable: { defaultSearch: true },
        },
        servicePrice: { name: 'Service Price', apiFieldPath: 'servicePrice', type: 'decimal' },
        laborPrice: { name: 'Labor Price', apiFieldPath: 'laborAmount', type: 'decimal' },
        taxable: { name: 'Taxable', apiFieldPath: 'taxable', type: 'boolean', nullable: true },
        priceOverrideable: {
            name: 'Overridable',
            apiFieldPath: 'priceOverridable',
            type: 'boolean',
            displayedByDefault: false,
        },
        minPrice: {
            name: 'Min Price',
            apiFieldPath: 'priceOverrideMin',
            type: 'decimal',
            displayedByDefault: false,
            nullable: true,
        },
        maxPrice: {
            name: 'Max Price',
            apiFieldPath: 'priceOverrideMax',
            type: 'decimal',
            displayedByDefault: false,
            nullable: true,
        },
        minMaxOverrideable: {
            name: 'Min/Max Overridable',
            apiFieldPath: 'priceOverrideMinMaxOverrideable',
            type: 'boolean',
            displayedByDefault: false,
            nullable: true,
        },
        schedulePrice: {
            name: 'Schedule Price',
            columns: {
                schedPriceChangeDate: {
                    name: 'Sched. Price Change Date',
                    apiFieldPath: 'scheduledChangeDate',
                    type: 'date',
                    displayedByDefault: false,
                    nullable: true,
                },
                schedNewPrice: {
                    name: 'Sched. New Price',
                    apiFieldPath: 'scheduledChangePrice',
                    type: 'decimal',
                    displayedByDefault: false,
                    nullable: true,
                },
            },
        },
        promotionPrice: {
            name: 'Promotion Price',
            columns: {
                promotionPriceStart: {
                    name: 'Promotion Price Start',
                    apiFieldPath: 'promotionStartDate',
                    type: 'date',
                    displayedByDefault: false,
                    nullable: true,
                },
                promotionPriceEnd: {
                    name: 'Promotion Price End',
                    apiFieldPath: 'promotionEndDate',
                    type: 'date',
                    displayedByDefault: false,
                    nullable: true,
                },
                promotionLaborAmount: {
                    name: 'Promotion Labor',
                    apiFieldPath: 'promotionLaborAmount',
                    type: 'decimal',
                    displayedByDefault: false,
                    nullable: true,
                },
                promotionPrice: {
                    name: 'Promotion Price',
                    apiFieldPath: 'promotionPrice',
                    type: 'decimal',
                    displayedByDefault: false,
                    nullable: true,
                },
            },
        },
        productCategory: () =>
            this.productCategoryFacade.searchColumns //
                .dropdown(
                    {
                        name: 'Product Extra Charge Category',
                        level: 'LEAF',
                        apiFieldPath: 'productExtraCharges.productCategory',
                    },
                    {
                        displayable: false, // not displayable since this is a collection dereference
                        nullable: true,
                    }
                ),
        productExtraCharge: {
            name: 'Product Extra Charge',
            columns: {
                productExtraChargeType: () =>
                    this.commonCodeFacade.searchColumns.descriptionDropdown(
                        {
                            type: 'EXTCHRTYPE',
                            name: 'Product Extra Charge Type',
                            apiFieldPath: 'productExtraCharges.charge',
                            entityType: 'extraCharge',
                        },
                        {
                            // not displayed due to 1-to-many
                            displayable: false,
                            nullable: true,
                        }
                    ),

                productExtraChargeAmount: {
                    name: 'Product Extra Charge Amount',
                    apiFieldPath: 'productExtraCharges.amount',
                    type: 'decimal',
                    displayable: false,
                    nullable: true,
                },
                productExtraChargeQuantityIncluded: {
                    name: 'Product Extra Charge Quantity Included',
                    apiFieldPath: 'productExtraCharges.quantityIncluded',
                    type: 'decimal',
                    displayable: false,
                    nullable: true,
                },
                productExtraChargeBegin: {
                    name: 'Product Extra Charge Begin Extra Charge',
                    apiFieldPath: 'productExtraCharges.beginExtraCharge',
                    type: 'decimal',
                    displayable: false,
                    nullable: true,
                },
                productExtraChargeTaxable: {
                    name: 'Product Extra Charge Taxable',
                    apiFieldPath: 'productExtraCharges.taxable',
                    type: 'boolean',
                    displayable: false,
                    nullable: true,
                },
            },
        },
        serviceExtraCharge: {
            name: 'Service Extra Charge',
            columns: {
                serviceExtraChargeType: () =>
                    this.commonCodeFacade.searchColumns.descriptionDropdown(
                        {
                            type: 'EXTCHRTYPE',
                            name: 'Service Extra Charge Type',
                            apiFieldPath: 'extraCharge1.charge',
                            entityType: 'extraCharge',
                        },
                        {
                            // ideally this should search both extraCharge1.charge and extraCharge2.charge.  Not displaying because you can't
                            // display two columns in one
                            displayable: false,
                            nullable: true,
                        }
                    ),
                serviceExtraChargeAmount: {
                    name: 'Service Extra Charge Amount',
                    apiFieldPath: 'extraCharge1.amount',
                    type: 'decimal',
                    displayable: false,
                    nullable: true,
                },
                serviceExtraChargeTaxable: {
                    name: 'Service Extra Charge Taxable',
                    apiFieldPath: 'extraCharge1.taxable',
                    type: 'boolean',
                    displayable: false,
                    nullable: true,
                },
            },
        },
    };

    readonly defaultSorts: QuerySort[];

    /**
     * Activates the selected store services from the mass-activate component based on id.
     */
    activate(): void {
        const ids = this.searchPage.searchComponent.selection.selected.map((s) => s.id);
        this.storeServiceFacade.activate(ids).subscribe((count) => {
            this.messageFacade.addMessage({ message: `${count} record(s) activated`, severity: 'success' });
            this.searchPage.triggerPreviousSearch();
        });
    }

    /**
     * Deactivates the selected store services.
     */
    deactivate(): void {
        const ids = this.searchPage.searchComponent.selection.selected.map((s) => s.id);
        this.storeServiceFacade.deactivate(ids).subscribe((count) => {
            this.messageFacade.addMessage({ message: `${count} record(s) deactivated`, severity: 'success' });
            this.searchPage.triggerPreviousSearch();
        });
    }

    mapToPathVariables(storeService: StoreService): string[] {
        return [storeService.store.code, storeService.service.code];
    }

    /**
     * @see DataModifyingComponent
     */
    get unsavedChanges(): boolean {
        return this.searchPage.unsavedChanges;
    }
}
