# shared-ui-drop-list

This library was generated with [Nx](https://nx.dev).

This library can be used to display a drag and droppable list. This list can be linked to other lists and used to move items between the lists.

Any component using the [DropListComponent](src/lib/drop-list/drop-list.component.ts) will need to convert its data to [DropListItem](src/lib/models/drop-list-item.ts).

### Custom Item Template

    <vioc-angular-drop-list
        [listId]="'displayed-columns'"
        [name]="'Displayed Columns'"
        [data]="columns"
        [displayItemsTemplate]="reorderedItems"
        (selectItem)="select($event)"
            (moveitem)="add($event)">
    </vioc-angular-drop-list>
        <ng-template #reorderedItems let-reorderItem="templateItem">
        <mat-icon>reorder</mat-icon>
        <span class="item-description">{{ reorderItem.name }}</span>
    </ng-template>

### Linked Lists

    <vioc-angular-drop-list
        #availableDropList
        [listId]="'available-list'"
        [name]="'Available List'"
        [data]="availableList"
        [connectedDropLists]="['displayed-list']"
        [sortingDisabled]="true"
        (selectItem)="select($event)"
            (moveItem)="add($event)">
    </vioc-angular-drop-list>
    <vioc-angular-drop-list
        #displayedDropList
        [listId]="'displayed-list'"
        [name]="'Displayed List'"
        [data]="displayedList"
        [connectedDropLists]="['available-list']"
        (selectItem)="select($event)"
            (moveitem)="remove($event)">
    </vioc-angular-drop-list>

## Running unit tests

Run `nx test shared-ui-drop-list` to execute the unit tests.
