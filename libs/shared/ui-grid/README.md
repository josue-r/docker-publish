# ui-grid

This library was generated with [Nx](https://nx.dev).

Component lib for a ReactiveForm controlled grid. The util-form lib's FormFactory#grid function should be used to build the form. This should allow it to use the same validation that the entity's edit screen uses (if possible) and should display the same errors.

## Example

    <vioc-angular-grid
        [form]="gridForm"
        [columns]="columns"
        [displayedColumns]="displayedColumns"
        [sort]="sort"
        [selection]="selection"
    ></vioc-angular-grid>

## Running unit tests

Run `nx test ui-grid` to execute the unit tests.
