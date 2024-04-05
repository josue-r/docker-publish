# ui-table

This library was generated with [Nx](https://nx.dev).

This library provides a customized set of `table` components that will display, sorting and selection of the provided data. I will also allow additon options to be passed to the components for increased integratin and functionality.

## Example

### Table

    <vioc-ui-table [data]="data" [columns]="displayableColumns" [displayedColumns]="displayedColumns"
            [selection]="selectable ? selection : undefined" [sort]="sort" (sortChange)="onSortChange($event)"
            (rowSelect)="rowSelectChange($event)">
    </vioc-ui-table>

### Table Header

    <vioc-ui-table-header [selection]="selection"
            [actionsTemplate]="tableHeaderActions"
            [selectionActionsTemplate]="tableHeaderSelectionActions"
            [menuItemsTemplate]="tableHeaderMenuItems"
            class="sticky-header">
        <ng-template #tableHeaderActions>
            <button>Add</button>
        </ng-template>
        <ng-template #tableHeaderSelectionActions>
            <button>Activate</button>
            <button>Deactivate</button>
        </ng-template>
        <ng-template #tableHeaderMenuItems>
            <button mat-menu-item>
            <mat-icon>view_column</mat-icon>
            Manage Columns
        </button>
        </ng-template>
    </vioc-ui-table-header>

## Running unit tests

Run `nx test ui-table` to execute the unit tests.
