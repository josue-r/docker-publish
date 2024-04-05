# ui-add-remove-button

This library was generated with [Nx](https://nx.dev).

Component to provide add and remove buttons to items in a list.

## Example

    <div class="filter-container" *ngFor="let line of searchCriteria; let i = index;">
        <vioc-ui-add-remove-button (addItem)="addLine()" (removeItem)="removeLine(i)"
            [addButtonDisplayed]="isAddLineButtonDisplayed(i)"
            [removeButtonDisplayed]="isRemoveLineButtonDisplayed(line)"
            [addButtonDisabled]="isAddLineButtonDisabled(line)">
        </vioc-ui-add-remove-button>
    </div>

## Running unit tests

Run `nx test ui-add-remove-button` to execute the unit tests.
