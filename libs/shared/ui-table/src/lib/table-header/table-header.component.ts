import { SelectionModel } from '@angular/cdk/collections';
import { Component, Input, TemplateRef } from '@angular/core';

/**
 * Component to provide a header to a table. This header contains a menu
 * of options to be performed on the table as well as displays the current
 * number of selected records if any are selected. It will also display
 * any passed in html when a selection is made which can be used to call
 * certain functions specific to the assigned records.
 */
@Component({
    selector: 'vioc-angular-table-header',
    templateUrl: './table-header.component.html',
    styleUrls: ['./table-header.component.scss'],
})
export class TableHeaderComponent {
    /** SelectionModel representing the currently selected records in the table. */
    @Input() selection: SelectionModel<any>;

    /** Template that should house the actions for the table header. */
    @Input() actionsTemplate: TemplateRef<any>;

    /** Template that should house the actions for the table header when there is a selection. */
    @Input() selectionActionsTemplate: TemplateRef<any>;

    /** Template that should house other actions that will show up in the vertical menu. */
    @Input() menuItemsTemplate: TemplateRef<any>;

    /** Helper method for determining if a value in the selection is selected. */
    valueSelected(): boolean {
        return this.selection && this.selection.hasValue();
    }
}
