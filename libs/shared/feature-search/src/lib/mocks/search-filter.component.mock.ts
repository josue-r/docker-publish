import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SearchLine } from '@vioc-angular/shared/common-api-models';
import { Column } from '@vioc-angular/shared/util-column';
import { TypedFormGroup } from '@vioc-angular/shared/util-form';
import { SearchChip } from './../models/search-chip';

@Component({
    selector: 'vioc-angular-search-filter',
    template: '',
})
export class MockSearchFilterComponent {
    @Input() columns: Column[];
    @Input() searchForm: TypedFormGroup<{ lines: SearchLine[] }>;
    @Input() chips: SearchChip[] = [];
    @Output() search = new EventEmitter<void[]>();
    @Output() clearFilter = new EventEmitter<void[]>();
    @Output() resetFilter = new EventEmitter<void[]>();
    @Output() addLine = new EventEmitter<void[]>();
    @Output() removeLine = new EventEmitter<void[]>();

    open = () => {};
}
