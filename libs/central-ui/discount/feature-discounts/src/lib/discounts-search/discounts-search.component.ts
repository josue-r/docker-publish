import { Component, ViewChild } from '@angular/core';
import { CommonCodeFacade } from '@vioc-angular/central-ui/config/data-access-common-code';
import { Discount, DiscountFacade } from '@vioc-angular/central-ui/discount/data-access-discount';
import { SearchPageComponent } from '@vioc-angular/central-ui/feature-search-page';
import { ResourceFacade } from '@vioc-angular/central-ui/organization/data-access-resources';
import { RoleFacade } from '@vioc-angular/security/data-access-security';
import { QuerySort } from '@vioc-angular/shared/common-api-models';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { SEARCHABLE_TOKEN } from '@vioc-angular/shared/data-access-search';
import { Column, ColumnConfig, Columns, Comparator, Comparators } from '@vioc-angular/shared/util-column';
import { DataModifyingComponent } from '@vioc-angular/shared/util-data-modifying';
import * as moment from 'moment';

@Component({
    selector: 'vioc-angular-discounts-search',
    templateUrl: './discounts-search.component.html',
    providers: [
        DiscountFacade,
        CommonCodeFacade,
        ResourceFacade,
        { provide: SEARCHABLE_TOKEN, useValue: DiscountFacade },
    ],
})
export class DiscountsSearchComponent extends DataModifyingComponent {
    @ViewChild('searchPage', { static: true }) readonly searchPage: SearchPageComponent;

    readonly defaultSorts: QuerySort[];

    isLoading = false;

    readonly columns: Columns = {
        code: {
            apiFieldPath: 'code',
            name: 'Code',
            type: 'string',
            searchable: { defaultSearch: { comparator: Comparators.startsWith } },
            displayedByDefault: true,
        },
        description: {
            apiFieldPath: 'description',
            name: 'Description',
            type: 'string',
            searchable: { defaultSearch: { comparator: Comparators.startsWith } },
            displayedByDefault: true,
        },
        startDate: {
            apiFieldPath: 'startDate',
            name: 'Start Date',
            type: 'date',
            searchable: { defaultSearch: false },
            displayedByDefault: true,
        },
        endDate: {
            apiFieldPath: 'endDate',
            name: 'End Date',
            type: 'date',
            searchable: {
                defaultSearch: {
                    comparator: Comparators.after,
                    value: moment().startOf('day'),
                },
            },
        },
        active: {
            apiFieldPath: 'active',
            name: 'Active',
            type: 'boolean',
            searchable: { defaultSearch: true },
            displayedByDefault: true,
        },
        typeDisplay: {
            name: 'Type',
            apiFieldPath: 'national',
            type: { customType: 'boolean', inputType: 'boolean' },
            displayedByDefault: true,
            searchable: { defaultSearch: true },
            mapToTableDisplay: (value) => (value ? 'National' : 'Local'),
            comparators: [DiscountsSearchComponent.isNational, DiscountsSearchComponent.isLocal],
        },
        explanationRequired: {
            apiFieldPath: 'explanationRequired',
            name: 'Explanation Required',
            type: 'boolean',
            searchable: { defaultSearch: false },
            displayedByDefault: false,
        },
        fleetOnly: {
            apiFieldPath: 'fleetOnly',
            name: 'Fleet Only',
            type: 'boolean',
            searchable: { defaultSearch: false },
            displayedByDefault: false,
        },
        overridable: {
            apiFieldPath: 'overridable',
            name: 'Allow Override',
            type: 'boolean',
            searchable: { defaultSearch: false },
            displayedByDefault: false,
        },
        brandDescription: {
            apiFieldPath: 'brand.description',
            name: 'Brand',
            type: 'string',
            searchable: { defaultSearch: false },
            displayedByDefault: false,
        },
        discountClassificationDescription: () =>
            this.commonCodeFacade.searchColumns.descriptionDropdown(
                {
                    type: 'DISCCAT',
                    name: 'Category',
                    apiFieldPath: 'discountClassification',
                    entityType: 'discountClassification',
                },
                {
                    searchable: { defaultSearch: false },
                    displayedByDefault: false,
                }
            ),
        deviceDescription: () =>
            this.commonCodeFacade.searchColumns.descriptionDropdown(
                {
                    type: 'DEVICE',
                    name: 'Device',
                    apiFieldPath: 'device',
                    entityType: 'device',
                },
                {
                    searchable: { defaultSearch: false },
                    displayedByDefault: false,
                }
            ),
        audienceDescription: () =>
            this.commonCodeFacade.searchColumns.descriptionDropdown(
                {
                    type: 'AUDIENCE',
                    name: 'Audience',
                    apiFieldPath: 'audience',
                    entityType: 'audience',
                },
                {
                    searchable: { defaultSearch: false },
                    displayedByDefault: false,
                }
            ),
        channelDescription: () =>
            this.commonCodeFacade.searchColumns.descriptionDropdown(
                {
                    type: 'CHANNEL',
                    name: 'Channel',
                    apiFieldPath: 'channel',
                    entityType: 'channel',
                },
                {
                    searchable: { defaultSearch: false },
                    displayedByDefault: false,
                }
            ),
        programDescription: () =>
            this.commonCodeFacade.searchColumns.descriptionDropdown(
                {
                    type: 'PROGRAM',
                    name: 'Program',
                    apiFieldPath: 'program',
                    entityType: 'program',
                },
                {
                    searchable: { defaultSearch: false },
                    displayedByDefault: false,
                }
            ),
        ownerDescription: () =>
            this.commonCodeFacade.searchColumns.descriptionDropdown(
                {
                    type: 'OWNER',
                    name: 'Owner',
                    apiFieldPath: 'owner',
                    entityType: 'owner',
                },
                {
                    searchable: { defaultSearch: false },
                    displayedByDefault: false,
                }
            ),
        approachDescription: () =>
            this.commonCodeFacade.searchColumns.descriptionDropdown(
                {
                    type: 'DISCOUNT_APPROACH',
                    name: 'Discount Approach',
                    apiFieldPath: 'approach',
                    entityType: 'approach',
                },
                {
                    searchable: { defaultSearch: false },
                    displayedByDefault: false,
                }
            ),
        amount: {
            apiFieldPath: 'amount',
            name: 'Amount',
            type: 'decimal',
            displayedByDefault: false,
        },
        extraChargesSupported: {
            apiFieldPath: 'extraChargesSupported',
            name: 'Discount Extra Charge Supported',
            type: 'boolean',
            searchable: { defaultSearch: false },
            displayedByDefault: false,
        },
        uniqueCodeRequired: {
            apiFieldPath: 'uniqueCodeRequired',
            name: 'Unique Code Required',
            type: 'boolean',
            searchable: { defaultSearch: false },
            displayedByDefault: false,
        },
        appliesTo: () =>
            this.commonCodeFacade.searchColumns.descriptionDropdown(
                {
                    type: 'IAPPLIESTO',
                    name: 'Applies To',
                    apiFieldPath: 'type',
                    entityType: 'type',
                },
                {
                    searchable: false,
                    displayedByDefault: false,
                }
            ),
        serviceOffer: () =>
            this.commonCodeFacade.searchColumns.descriptionDropdown(
                {
                    type: 'DISCOUNT_SERVICE_OFFER',
                    name: 'Service Offer',
                    apiFieldPath: 'serviceOffer',
                    entityType: 'serviceOffer',
                },
                {
                    searchable: false,
                    displayedByDefault: false,
                }
            ),
    };

    static get isNational(): Comparator {
        return { displayValue: 'is National', value: 'true', requiresData: false, multiValue: false };
    }
    static get isLocal(): Comparator {
        return { displayValue: 'is Local', value: 'false', requiresData: false, multiValue: false };
    }

    constructor(
        private readonly resourceFacade: ResourceFacade,
        public readonly discountFacade: DiscountFacade,
        private readonly commonCodeFacade: CommonCodeFacade,
        private readonly roleFacade: RoleFacade,
        private readonly messageFacade: MessageFacade
    ) {
        super();
        this.roleFacade.hasAnyRole(['ROLE_LOCAL_DISCOUNT_READ']).subscribe((local) => {
            if (local) {
                // Add the company column if role exists
                this.columns.company = () =>
                    this.resourceFacade.searchColumns.company.contextDropdown('LOCAL_DISCOUNT', undefined, {
                        apiFieldPath: 'company',
                        searchable: { defaultSearch: true },
                        displayedByDefault: true,
                    });
            }
        });
        this.defaultSorts = [
            new QuerySort(Column.of(this.columns.code as ColumnConfig)),
            new QuerySort(Column.of(this.columns.description as ColumnConfig)),
        ];
    }

    /**
     * Returns the array of url path variables that uniquely identify the entity in the route.
     */
    toPathVariables(discount: Discount): string[] {
        if (discount.national) {
            return [discount.code];
        } else {
            return [discount.code, discount.company.code];
        }
    }

    activate() {
        this.isLoading = true;
        this.discountFacade.activate(this.selectedIds()).subscribe((count) => {
            this.isLoading = false;
            this.messageFacade.addMessage({ message: `${count} record(s) activated`, severity: 'success' });
            this.searchPage.triggerPreviousSearch();
        });
    }

    deactivate() {
        this.isLoading = true;
        this.discountFacade.deactivate(this.selectedIds()).subscribe((count) => {
            this.isLoading = false;
            this.messageFacade.addMessage({ message: `${count} record(s) deactivated`, severity: 'success' });
            this.searchPage.triggerPreviousSearch();
        });
    }

    private selectedIds(): number[] {
        return this.searchPage.searchComponent.selection.selected.map((discount) => discount.id);
    }

    /**
     * @see DataModifyingComponent
     */
    get unsavedChanges(): boolean {
        return this.searchPage.unsavedChanges;
    }
}
