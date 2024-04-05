import { Component, ViewChild } from '@angular/core';
import { SearchPageComponent } from '@vioc-angular/central-ui/feature-search-page';
import { QuerySort } from '@vioc-angular/shared/common-api-models';
import { SEARCHABLE_TOKEN } from '@vioc-angular/shared/data-access-search';
import { Columns, Comparator, Comparators } from '@vioc-angular/shared/util-column';
import { OfferContent, OfferContentFacade } from 'libs/central-ui/discount/data-access-offer-content/src';
import * as _ from 'lodash';

@Component({
    selector: 'vioc-angular-offer-content-search',
    templateUrl: './offer-content-search.component.html',
    providers: [OfferContentFacade, { provide: SEARCHABLE_TOKEN, useValue: OfferContentFacade }],
})
export class OfferContentSearchComponent {
    @ViewChild('searchPage', { static: true }) readonly searchPage: SearchPageComponent;

    readonly defaultSorts: QuerySort[];

    readonly columns: Columns = {
        name: {
            name: 'Name',
            apiFieldPath: 'name',
            type: 'string',
            searchable: { defaultSearch: true },
            displayedByDefault: true,
            comparators: this.getStringComparatorsWithContainsAsDefault(),
        },
        active: {
            name: 'Active',
            apiFieldPath: 'active',
            type: 'boolean',
            searchable: { defaultSearch: true },
            displayedByDefault: true,
        },
        shortText: {
            name: 'Short Text',
            apiFieldPath: 'shortText',
            type: 'string',
            searchable: { defaultSearch: true },
            displayedByDefault: true,
            comparators: this.getStringComparatorsWithContainsAsDefault(),
        },
        longText: {
            name: 'Long Text',
            apiFieldPath: 'longText',
            type: 'string',
            displayable: false,
            comparators: this.getStringComparatorsWithContainsAsDefault(),
        },
        conditions: {
            name: 'Conditions',
            apiFieldPath: 'conditions',
            type: 'string',
            displayable: false,
            comparators: this.getStringComparatorsWithContainsAsDefault(),
        },
        disclaimerShortText: {
            name: 'Disclaimer Short Text',
            apiFieldPath: 'disclaimerShortText',
            type: 'string',
            displayable: false,
            comparators: this.getStringComparatorsWithContainsAsDefault(),
        },
        disclaimerLongText: {
            name: 'Disclaimer Long Text',
            apiFieldPath: 'disclaimerLongText',
            type: 'string',
            displayable: false,
            comparators: this.getStringComparatorsWithContainsAsDefault(),
        },
    };

    getStringComparatorsWithContainsAsDefault(): Comparator[] {
        const defaultStringComparators = Comparators.forType('string');
        return _.sortBy(defaultStringComparators, (c) => (c.value === Comparators.contains.value ? 0 : 1));
    }

    /**
     * Returns the array of url path variables that uniquely identify the entity in the route.
     */
    toPathVariables(offerContent: OfferContent): string[] {
        return [offerContent.name];
    }

    constructor(public readonly offerContentFacade: OfferContentFacade) {}
}
