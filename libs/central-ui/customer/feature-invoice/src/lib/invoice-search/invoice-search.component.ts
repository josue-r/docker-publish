import { Component } from '@angular/core';
import { CommonCodeFacade } from '@vioc-angular/central-ui/config/data-access-common-code';
import { Invoice, InvoiceFacade } from '@vioc-angular/central-ui/customer/data-access-invoice';
import { ResourceFacade } from '@vioc-angular/central-ui/organization/data-access-resources';
import { QuerySort } from '@vioc-angular/shared/common-api-models';
import { Described } from '@vioc-angular/shared/common-functionality';
import { SEARCHABLE_TOKEN } from '@vioc-angular/shared/data-access-search';
import { AbstractDropdownColumn, Column, ColumnConfig, Columns, Comparators } from '@vioc-angular/shared/util-column';
import * as moment from 'moment';

@Component({
    selector: 'vioc-angular-invoice-search',
    templateUrl: './invoice-search.component.html',
    providers: [
        InvoiceFacade,
        CommonCodeFacade,
        ResourceFacade,
        { provide: SEARCHABLE_TOKEN, useValue: InvoiceFacade },
    ],
})
export class InvoiceSearchComponent {
    readonly defaultSorts: QuerySort[];

    readonly columns: Columns = {
        store: () => this.resourceFacade.searchColumns.store.contextDropdown('INVOICE'),
        invoiceNumber: {
            apiFieldPath: 'invoiceNumber',
            name: 'Invoice Number',
            type: 'integer',
            searchable: { defaultSearch: { comparator: Comparators.equalTo } },
            comparators: [Comparators.equalTo],
        },
        invoiceDate: {
            apiFieldPath: 'invoiceDate',
            name: 'Invoice Date',
            type: 'dateTime',
            searchable: {
                defaultSearch: {
                    comparator: Comparators.between,
                    value: [moment().subtract(14, 'days').startOf('day'), moment().add(1, 'days').startOf('day')],
                },
                required: true,
            },
            comparators: [Comparators.after, Comparators.before, Comparators.equalTo, Comparators.between],
        },
        customerFirstName: {
            apiFieldPath: 'customer.firstName',
            name: 'Customer First Name',
            type: 'string',
            searchable: { defaultSearch: { comparator: Comparators.startsWith } },
            displayedByDefault: true,
        },
        customerLastName: {
            apiFieldPath: 'customer.lastName',
            name: 'Customer Last Name',
            type: 'string',
            searchable: { defaultSearch: { comparator: Comparators.startsWith } },
            displayedByDefault: true,
        },
        customerState: () =>
            this.commonCodeFacade.searchColumns.codeDropdown(
                {
                    type: 'STATE',
                    name: 'State',
                    apiFieldPath: 'customerAddress.state',
                    entityType: 'string',
                },
                {
                    displayedByDefault: false,
                    searchable: { defaultSearch: { comparator: Comparators.equalTo } },
                    mapToKey: Described.codeMapper,
                    mapToDropdownDisplay: Described.descriptionMapper,
                    mapToTableDisplay: (s) => s,
                }
            ),
        vin: {
            apiFieldPath: 'vehicle.vin',
            name: 'VIN',
            type: 'string',
            searchable: { defaultSearch: { comparator: Comparators.equalTo } },
            displayedByDefault: false,
            comparators: [Comparators.equalTo],
        },
        email: {
            apiFieldPath: 'customer.email',
            name: 'Email',
            type: 'string',
            searchable: { defaultSearch: { comparator: Comparators.equalTo } },
            displayable: true,
            comparators: [Comparators.equalTo],
            displayedByDefault: false,
        },
        year: {
            apiFieldPath: 'vehicle.year',
            name: 'Year',
            type: { customType: 'vehicleYear', inputType: 'integer' },
            searchable: false,
            displayable: true,
            comparators: Comparators.forType('integer'),
        },
        make: {
            apiFieldPath: 'vehicle.makeDescription',
            name: 'Make',
            type: 'string',
            searchable: false,
            displayable: true,
            displayedByDefault: true,
        },
        model: {
            apiFieldPath: 'vehicle.modelDescription',
            name: 'Model',
            type: 'string',
            searchable: false,
            displayable: true,
            displayedByDefault: true,
        },
        amount: {
            apiFieldPath: 'totalDue',
            name: 'Amount',
            type: 'decimal',
            searchable: false,
            displayable: true,
            displayedByDefault: true,
        },
    };

    constructor(
        public readonly invoiceFacade: InvoiceFacade,
        private readonly commonCodeFacade: CommonCodeFacade,
        private readonly resourceFacade: ResourceFacade
    ) {
        this.defaultSorts = [
            new QuerySort(Column.of((this.columns.store as () => AbstractDropdownColumn<any>)())),
            new QuerySort(Column.of(this.columns.invoiceNumber as ColumnConfig)),
            new QuerySort(Column.of(this.columns.invoiceDate as ColumnConfig), 'desc'),
        ];
    }

    /**
     * Returns the array of url path variables that uniquely identify the entity in the route.
     */
    toStringId(invoice: Invoice): string[] {
        return [`${invoice.id}`];
    }
}
