import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { DropListItem } from '../models/drop-list-item';

/**
 * Component used to display a drag and droppable list. This list can be linked to
 * other lists and used to move items between the lists.
 *
 * #### Custom Item Template
 * @example
 * <vioc-angular-drop-list
 *      [listId]="'displayed-columns'"
 *      [name]="'Displayed Columns'"
 *      [data]="columns"
 *      [displayItemsTemplate]="reorderedItems"
 *      (selectItem)="select($event)"
 *      (moveitem)="add($event)">
 * </vioc-angular-drop-list>
 * <ng-template #reorderedItems let-reorderItem="templateItem">
 *      <mat-icon>reorder</mat-icon>
 *      <span class="item-description">{{ reorderItem.name }}</span>
 * </ng-template>
 *
 * #### Linked Lists
 * @example
 * <vioc-angular-drop-list
 *      #availableDropList
 *      [listId]="'available-list'"
 *      [name]="'Available List'"
 *      [data]="availableList"
 *      [connectedDropLists]="['displayed-list']"
 *      [sortingDisabled]="true"
 *      (selectItem)="select($event)"
 *      (moveItem)="add($event)">
 * </vioc-angular-drop-list>
 * <vioc-angular-drop-list
 *      #displayedDropList
 *      [listId]="'displayed-list'"
 *      [name]="'Displayed List'"
 *      [data]="displayedList"
 *      [connectedDropLists]="['available-list']"
 *      (selectItem)="select($event)"
 *      (moveitem)="remove($event)">
 * </vioc-angular-drop-list>
 */
@Component({
    selector: 'vioc-angular-drop-list',
    templateUrl: './drop-list.component.html',
    styleUrls: ['./drop-list.component.scss'],
})
export class DropListComponent {
    /**
     * Name of the list that will appear in the header.
     */
    @Input() name: string;

    /**
     * Identifier for the drop list to be used with other linked lists.
     */
    @Input() set listId(listId: string) {
        this._listId = listId;
    }
    get listId() {
        // if the listId is provided use it, otherwise convert the name to a listId if provided
        return this._listId || (this.name && this.name.toLowerCase().trim().replace(/\s/g, '-'));
    }
    private _listId: string;

    /**
     * `DropListItem`s to appear in the list.
     */
    @Input() data: DropListItem[];

    /**
     * List of ids to other `DropListComponent`s.
     */
    @Input() connectedDropLists: string[] = [];

    /**
     * `TemplateRef` used to provided a custom display for list items.
     */
    @Input() displayItemsTemplate: TemplateRef<any>;

    /**
     * Enables or disables the ability to sort the items in the list.
     * Defaults to `false`.
     */
    @Input() sortingDisabled = false;

    /**
     * Event emitter to let other components that a `DropListItem` has been selected.
     */
    @Output() selectItem = new EventEmitter<DropListItem>();

    /**
     * Event emitter to let other components that a `DropListItem` has been moved.
     */
    @Output() moveItem = new EventEmitter<DropListItem>();

    /**
     * An `DropListItem` has been selected/deselected by a user.
     */
    select(item: DropListItem): void {
        this.selectItem.emit(item);
    }

    /**
     * Emits an event to move a `DropListItem`, presumably to a linked list.
     */
    move(item: DropListItem): void {
        this.moveItem.emit(item);
    }

    /**
     * Keeps track of the moved items in a list when a user drops an item into a different order.
     */
    drop(event: CdkDragDrop<DropListItem[]>): void {
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            event.previousContainer.data[event.previousIndex].selected = false;
            transferArrayItem(
                event.previousContainer.data,
                event.container.data,
                event.previousIndex,
                event.currentIndex
            );
        }
    }
}
