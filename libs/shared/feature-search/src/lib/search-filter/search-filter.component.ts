import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { MatExpansionPanel } from '@angular/material/expansion';
import { SearchLine } from '@vioc-angular/shared/common-api-models';
import { DropdownColumnFacade } from '@vioc-angular/shared/data-access-dropdown-column';
import { Column } from '@vioc-angular/shared/util-column';
import { TypedFormGroup } from '@vioc-angular/shared/util-form';
import { SearchChip } from '../models/search-chip';

@Component({
    selector: 'vioc-angular-search-filter',
    templateUrl: './search-filter.component.html',
    styleUrls: ['./search-filter.component.scss'],
    providers: [DropdownColumnFacade],
})
export class SearchFilterComponent {
    /** Expanding panel that will show and hide the search filter content. */
    @ViewChild('filterPanel') expansionPanel: MatExpansionPanel;

    /** Applicable `columns` used for the search filters if they are `searchable`. */
    @Input() set columns(columns: Column[]) {
        this.searchableColumns = columns.filter((column) => column.searchable !== false);
    }

    /** `TypedFormGroup` containing the `searchLines` used for the search query. */
    @Input() searchForm: TypedFormGroup<{ lines: SearchLine[] }>;

    /** Chips to be displayed representing current query restrictions. */
    @Input() chips: SearchChip[] = [];

    /** Add new line button has been clicked. */
    @Output() addLine = new EventEmitter<void>();

    /** Remove button has been clicked for the line at the given index. */
    @Output() removeLine = new EventEmitter<number>();

    /** Search button has been clicked. */
    @Output() search = new EventEmitter<void>();

    /** Clear button has been clicked. */
    @Output() clearFilter = new EventEmitter<void>();

    /** Reset button has been clicked. */
    @Output() resetFilter = new EventEmitter<void>();

    searchableColumns: Column[];

    /** Lines are addable only if they are the last one. */
    isAddLineButtonDisplayed(index: number): boolean {
        return index === this.searchForm.getArray('lines').length - 1;
    }

    /** Add button is disabled if the column field has not been filled out. */
    isAddLineButtonDisabled(line: AbstractControl): boolean {
        return !line.get('column').value;
    }

    /** Lines are removable if not the only one. */
    isRemoveLineButtonDisplayed(line: AbstractControl): boolean {
        return line.get('removable').value === true && this.searchForm.getArray('lines').length > 1;
    }

    /** Open the expansion panel. */
    open(): void {
        this.expansionPanel.open();
    }
}
