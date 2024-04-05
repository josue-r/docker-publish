# util-column

This library was generated with [Nx](https://nx.dev).

This library contains class definitions for different type of data columns to be used for searching and table displays.

## Column

Custom class that defines the way a data column should appear and how it is accessed.

## Dropdown Columns

Dropdown columns are used to load specific values related to the column.

> AbstractDropdownColumn

    Abstract class with additional configuration options for dropdown specific columns.

> SimpleDropdownColumn

    A dropdown with a fixed list of values that are either static or the entire list is loaded once.

> DynamicDropdownColumn

    Dyamic search dropdown configuration that will execute multiple searches based on the user input.

## Comparator

Applicable comparisons to a given data type used to compare user provided data to the data for the column.
