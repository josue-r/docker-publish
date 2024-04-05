import { Component, Input, TemplateRef, Type, ViewChild } from '@angular/core';
import { QuerySort } from '@vioc-angular/shared/common-api-models';
import { MockSearchComponent } from '@vioc-angular/shared/feature-search';
import { Columns } from '@vioc-angular/shared/util-column';
import { FormFactoryOptions } from '@vioc-angular/shared/util-form';
import { SearchPageFacade } from '../models/search-page-facade';

@Component({
    selector: 'vioc-angular-search-page',
    template: `
        <ng-container *ngTemplateOutlet="actionsTemplate"></ng-container>
        <ng-container *ngTemplateOutlet="selectionActionsTemplate"></ng-container>
        <vioc-angular-search #search></vioc-angular-search>
    `,
})
export class MockSearchPageComponent {
    @ViewChild('search') searchComponent: MockSearchComponent;
    @Input() columns: Columns;
    @Input() entityType: Type<any> | string;
    @Input() routePathVariables: (entity: any) => string[];
    @Input() searchPageFacade: SearchPageFacade<any>;
    @Input() securityDomain: string;
    @Input() dataSyncable = true;
    @Input() gridModeEnabled = true;
    @Input() routePrefix: string;
    @Input() actionsTemplate: TemplateRef<any>;
    @Input() selectionActionsTemplate: TemplateRef<any>;
    @Input() menuItemsTemplate: TemplateRef<any>;
    @Input() gridFormOptions: FormFactoryOptions;
    @Input() sort: QuerySort;
    @Input() defaultSorts: QuerySort[];
    unsavedChanges: boolean;
    hasEditAccess: boolean;
    hasAddAccess: boolean;

    triggerPreviousSearch(): void {}
}
