# shared-ui-manage-column

This library was generated with [Nx](https://nx.dev).

This library provides a component to manage [Columns](../../../libs\shared\util-column\src\lib\column.ts) that are shown on the screen.

## Example

### Manage Column Component

    <vioc-ui-manage-columns [columns]="columns" [displayedColumns]="displayedColumns"
            (apply)="updateColumns($event)">
    </vioc-ui-manage-columns>

### Managed Columns

> Class used to configure and modify a list of [Managed Columns](./src/lib/models/managed-column.ts).

## Running unit tests

Run `nx test shared-ui-manage-column` to execute the unit tests.
