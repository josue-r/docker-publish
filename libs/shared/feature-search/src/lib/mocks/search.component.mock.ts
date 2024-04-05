import { SelectionModel } from '@angular/cdk/collections';
import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { QueryPage, QuerySearch, QuerySort } from '@vioc-angular/shared/common-api-models';
import { EntityPatch, ResponseEntity } from '@vioc-angular/shared/util-api';
import { Columns } from '@vioc-angular/shared/util-column';
import { FormFactoryOptions } from '@vioc-angular/shared/util-form';
import { Observable } from 'rxjs';

@Component({
    selector: 'vioc-angular-search',
    template: `
        <vioc-angular-search-filter></vioc-angular-search-filter>
        <ng-container *ngTemplateOutlet="actionsTemplate"></ng-container>
        <ng-container *ngTemplateOutlet="selectionActionsTemplate"></ng-container>
        <ng-container *ngTemplateOutlet="menuItemsTemplate"></ng-container>
    `,
})
export class MockSearchComponent {
    @Input() sort: QuerySort;
    @Input() page = new QueryPage(0, 20);
    @Input() selectable = true;
    @Input() pageSizeOptions = [10, 20, 50];
    @Input() previousSearchEnabled = true;
    @Input() isLoading = false;
    @Input() columns: Columns;
    @Input() searchFn: (querySearch: QuerySearch) => Observable<ResponseEntity<any>>;
    @Input() entityType: string;
    @Input() gridModeEnabled: boolean;
    @Input() formOptions: FormFactoryOptions = {};
    @Input() saveFn: (patches: EntityPatch<any>[]) => Observable<Object>;
    @Input() actionsTemplate: TemplateRef<any>;
    @Input() selectionActionsTemplate: TemplateRef<any>;
    @Input() menuItemsTemplate: TemplateRef<any>;
    @Input() multiple: boolean;
    @Input() singleSelection: boolean;
    @Output() rowSelect = new EventEmitter<any>();

    selection = new SelectionModel<any>(true, [], true);
    unsavedChanges = false;
    triggerPreviousSearch = () => {};
    clear = () => {};
    search = () => {};
}
