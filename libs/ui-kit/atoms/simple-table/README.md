# ui-kit-atoms-simple-table

This library was generated with [Nx](https://nx.dev).

# Description

Simple table component to display data. Please check the Storybook to see how it works.

## Basic usage

```
<vioc-simple-table
    [columnConfigurations]="columnConfigurations"
    [displayedColumns]="displayedColumns"
    [data]="tableData"
></vioc-simple-table>
```

Where:

-   columnConfigurations: Is an array of configurations that we should provide in order to define the headers of the table properly.

```
columnConfigurations: ColumnConfiguration[] = [
    {
        columnId: 'position',    // This is the identifier of the column, it should match with the property in data elements.
        label: 'No.',            // This is the text to be displayed as the header.
        customStyles: {          // This lets you define custom styles for a specific column
            width: '20%',
            fontSize: '20px'
        }
    },
    {
        columnId: 'name',
        label: 'Name',
        customStyles: {
            width: '20%'
        },
    },
    {
        columnId: 'weight',
        label: 'Weight',
        customStyles: {
            width: '20%'
        }
    },
    {
        columnId: 'symbol',
        label: 'Symbol',
        customStyles: {
            width: '40%'
        }
    },
];
```

-   displayedColumns: This is an array of strings that defines the names of the columns that we want to display (the names should match with values in the `columnId` property of the configurations).

```
displayedColumns: string[] = ['position', 'name', 'weight']
```

-   data: this is the data to be displayed, it can be anything, but the elements attributes should match with the `columnId` property in order to be displayed properly.

```
tableData = [
    { position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H' },
    { position: 2, name: 'Helium', weight: 4.0026, symbol: 'He' },
    { position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li' },
    { position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be' },
    { position: 5, name: 'Boron', weight: 10.811, symbol: 'B' },
    { position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C' },
    { position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N' },
    { position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O' },
    { position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F' },
    { position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne' },
];
```

## What's next?

If you want to extend this table, please note that this is based on Angular Mat Table component, please take a look to the [documentation](https://material.angular.io/components/table/overview) for more info.

## Running unit tests

Run `nx test ui-kit-atoms-simple-table` to execute the unit tests.
