import { AfterViewInit, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { CommonCodeFacade } from '@vioc-angular/central-ui/config/data-access-common-code';
// tslint:disable-next-line: nx-enforce-module-boundaries
import { SearchPageComponent } from '@vioc-angular/central-ui/feature-search-page';
import {
    ReceiptOfMaterial,
    ReceiptOfMaterialFacade,
} from '@vioc-angular/central-ui/inventory/data-access-receipt-of-material';
import { VendorFacade } from '@vioc-angular/central-ui/inventory/data-access-vendor';
import { ResourceFacade } from '@vioc-angular/central-ui/organization/data-access-resources';
import { QuerySort } from '@vioc-angular/shared/common-api-models';
import { Described } from '@vioc-angular/shared/common-functionality';
import { SEARCHABLE_TOKEN } from '@vioc-angular/shared/data-access-search';
import { Column, ColumnConfig, Columns, Comparators } from '@vioc-angular/shared/util-column';
import { DataModifyingComponent } from '@vioc-angular/shared/util-data-modifying';
import * as moment from 'moment';

@Component({
    selector: 'vioc-angular-receipt-of-material-search',
    templateUrl: './receipt-of-material-search.component.html',
    providers: [
        ReceiptOfMaterialFacade,
        CommonCodeFacade,
        ResourceFacade,
        VendorFacade,
        { provide: SEARCHABLE_TOKEN, useValue: ReceiptOfMaterialFacade },
    ],
})
export class ReceiptOfMaterialSearchComponent extends DataModifyingComponent implements AfterViewInit {
    @ViewChild('searchPage', { static: true }) readonly searchPage: SearchPageComponent;

    readonly columns: Columns;

    readonly defaultSorts: QuerySort[];

    constructor(
        public readonly receiptOfMaterialFacade: ReceiptOfMaterialFacade,
        private readonly commonCodeFacade: CommonCodeFacade,
        private readonly vendorFacade: VendorFacade,
        private readonly resourceFacade: ResourceFacade,
        private readonly changeDetector: ChangeDetectorRef
    ) {
        super();
        this.columns = {
            storeNumber: {
                apiFieldPath: 'store.code',
                name: 'Store Number',
                type: 'string',
                searchable: { defaultSearch: true },
            },
            rmNumber: {
                apiFieldPath: 'number',
                name: 'RM Number',
                type: 'string',
                searchable: { defaultSearch: { comparator: Comparators.equalTo, value: null } },
            },
            type: () =>
                this.commonCodeFacade.searchColumns //
                    .descriptionDropdown(
                        {
                            type: 'RECPTTYPE',
                            name: 'Type',
                            apiFieldPath: 'receiptType',
                            entityType: 'receiptOfMaterialType',
                        },
                        { searchable: { defaultSearch: true } }
                    ),
            status: () =>
                this.commonCodeFacade.searchColumns //
                    .descriptionDropdown(
                        {
                            type: 'RMSTATUS',
                            name: 'Status',
                            apiFieldPath: 'status',
                            entityType: 'receiptOfMaterialStatus',
                        },
                        { searchable: { defaultSearch: true } }
                    ),
            vendor: () =>
                this.vendorFacade.searchColumns //
                    .descriptionDropdown(
                        {
                            name: 'Vendor',
                            apiFieldPath: 'vendor',
                        },
                        {
                            searchable: { defaultSearch: true },
                            mapToTableDisplay: Described.descriptionMapper,
                        }
                    ),
            receiptDate: {
                apiFieldPath: 'receiptDate',
                name: 'Receipt Date',
                type: 'dateTime',
                searchable: {
                    defaultSearch: {
                        comparator: Comparators.after,
                        value: moment().subtract(14, 'days').startOf('day'),
                    },
                    required: true,
                },
            },
            company: () =>
                this.resourceFacade.searchColumns.company.contextDropdown('RECEIPT_OF_MATERIAL', undefined, {
                    apiFieldPath: 'store.company',
                    searchable: { defaultSearch: false },
                    displayedByDefault: false,
                }),
            productCode: {
                apiFieldPath: 'receiptProducts.product.code',
                name: 'Product Code',
                type: 'string',
                searchable: { defaultSearch: false },
                displayable: false,
            },
            finalizedDate: {
                apiFieldPath: 'finalizedOn',
                name: 'Finalized Date',
                type: 'dateTime',
                searchable: { defaultSearch: false },
            },
            createdByName: {
                apiFieldPath: 'createdByEmployee.name',
                apiSortPath: 'createdByEmployee.lastName',
                name: 'Created By',
                type: 'string',
                searchable: false,
                displayedByDefault: false,
            },
            createdBy: {
                apiFieldPath: 'createdByEmployee.lastName',
                name: 'Created By',
                type: 'string',
                searchable: { defaultSearch: false },
                displayable: false,
            },
            finalizedBy: {
                apiFieldPath: 'finalizedByEmployee.lastName',
                name: 'Finalized By',
                type: 'string',
                searchable: { defaultSearch: false },
                displayable: false,
                nullable: true,
            },
            finalizedByName: {
                apiFieldPath: 'finalizedByEmployee.name',
                apiSortPath: 'finalizedByEmployee.lastName',
                name: 'Finalized By',
                type: 'string',
                searchable: false,
                nullable: true,
            },
            orderNumber: {
                apiFieldPath: 'source',
                name: 'Order/Transfer Number',
                type: 'string',
                searchable: { defaultSearch: false },
                nullable: true,
                displayedByDefault: false,
            },
            deliveryTicket: {
                apiFieldPath: 'deliveryTicket',
                name: 'Delivery Ticket',
                type: 'string',
                searchable: { defaultSearch: false },
                nullable: true,
                displayedByDefault: false,
            },
            invoiceNumber: {
                apiFieldPath: 'invoiceNumber',
                name: 'Invoice Number',
                type: 'string',
                searchable: { defaultSearch: false },
                nullable: true,
                displayedByDefault: false,
            },
            poNumber: {
                apiFieldPath: 'poNumber',
                name: 'PO Number',
                type: 'string',
                searchable: { defaultSearch: false },
                nullable: true,
                displayedByDefault: false,
            },
            originalNumber: {
                apiFieldPath: 'originalNumber',
                name: 'Original RM Number',
                type: 'string',
                searchable: { defaultSearch: false },
                nullable: true,
                displayedByDefault: false,
            },
        };

        this.defaultSorts = [
            new QuerySort(Column.of(this.columns.storeNumber as ColumnConfig)),
            new QuerySort(Column.of(this.columns.receiptDate as ColumnConfig), 'desc'),
        ];
    }

    ngAfterViewInit(): void {
        this.searchPage.searchComponent.search();
        this.changeDetector.detectChanges();
    }

    toPathVariables(receiptOfMaterial: ReceiptOfMaterial): string[] {
        return [receiptOfMaterial.store.code, receiptOfMaterial.number];
    }

    /**
     * @see DataModifyingComponent
     */
    get unsavedChanges(): boolean {
        return this.searchPage.unsavedChanges;
    }
}
