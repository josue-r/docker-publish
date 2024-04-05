import { Component, ViewChild } from '@angular/core';
import { SearchPageComponent } from '@vioc-angular/central-ui/feature-search-page';
import { ResourceFacade } from '@vioc-angular/central-ui/organization/data-access-resources';
import { QuerySort } from '@vioc-angular/shared/common-api-models';
import { SEARCHABLE_TOKEN } from '@vioc-angular/shared/data-access-search';
import { AbstractDropdownColumn, Column, ColumnConfig, Columns, Comparators } from '@vioc-angular/shared/util-column';
import { Offer, OfferFacade } from 'libs/central-ui/discount/data-access-offers/src';
import * as moment from 'moment';

@Component({
    selector: 'vioc-angular-offers-search',
    templateUrl: './offers-search.component.html',
    providers: [OfferFacade, ResourceFacade, { provide: SEARCHABLE_TOKEN, useValue: OfferFacade }],
})
export class OfferSearchComponent {
    @ViewChild('searchPage', { static: true }) readonly searchPage: SearchPageComponent;

    readonly defaultSorts: QuerySort[];

    readonly columns: Columns = {
        company: () =>
            this.resourceFacade.searchColumns.company.contextDropdown('DISCOUNT_OFFER', 'ALL', {
                apiFieldPath: 'company',
            }),
        discountCode: {
            apiFieldPath: 'discount.code',
            name: 'Discount Code',
            type: 'string',
            searchable: { defaultSearch: { comparator: Comparators.startsWith } },
        },
        discountDescription: {
            apiFieldPath: 'discount.description',
            name: 'Discount Description',
            type: 'string',
        },
        endDate: {
            apiFieldPath: 'discount.endDate',
            name: 'End Date',
            type: 'date',
            searchable: {
                defaultSearch: {
                    comparator: Comparators.after,
                    value: moment().startOf('day'),
                },
                required: true,
            },
        },
        offerName: {
            apiFieldPath: 'name',
            name: 'Offer Name',
            type: 'string',
            searchable: { defaultSearch: { comparator: Comparators.contains } },
            displayedByDefault: false,
        },
        offerShortText: {
            apiFieldPath: 'offerContent.shortText',
            name: 'Offer Short Text',
            type: 'string',
            displayedByDefault: false,
        },
        amount: {
            apiFieldPath: 'amount',
            name: 'Amount',
            type: 'decimal',
            displayedByDefault: false,
        },
        disclaimer: {
            apiFieldPath: 'offerContent.disclaimerShortText',
            name: 'Disclaimer',
            type: 'string',
            displayedByDefault: false,
        },
        conditions: {
            apiFieldPath: 'offerContent.conditions',
            name: 'Conditions',
            type: 'string',
            displayedByDefault: false,
        },
        active: {
            name: 'Active',
            apiFieldPath: 'active',
            type: 'boolean',
            searchable: { defaultSearch: true },
            displayedByDefault: true,
        },
    };

    /**
     * Returns the array of url path variables that uniquely identify the entity in the route
     */
    toPathVariables(offer: Offer): string[] {
        return [offer.id];
    }

    constructor(public readonly offerFacade: OfferFacade, private readonly resourceFacade: ResourceFacade) {
        this.defaultSorts = [
            new QuerySort(Column.of((this.columns.company as () => AbstractDropdownColumn<any>)())),
            new QuerySort(Column.of(this.columns.offerName as ColumnConfig)),
        ];
    }
}
