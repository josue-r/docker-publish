# shared-feature-search

This library was generated with [Nx](https://nx.dev).

Feature library containing search and grid functionality with the `SearchComponent`. Each search screen is also integrated with a `SearchFilterComponent` to allow for filtering search results, as well as a `PaginatorComponent` for viewing different result sets.

# Example

### SearchComponent

    <vioc-angular-search
        #search
        [sort]="sort"
        [page]="page"
        [isLoading]="isLoading"
        [columns]="columns"
        [searchFn]="searchFn"
        [entityType]="entityType"
        [formOptions]="gridFormOptions"
        [gridMode]="gridMode"
        [saveFn]="saveFn"
        [actionsTemplate]="actionsTemplate"
        [selectionActionsTemplate]="selectionItems"
        [menuItemsTemplate]="menuItems"
        (rowSelect)="open($event)"
    >
    </vioc-angular-search>

### SearchFilterComponent

    <vioc-angular-search-filter
        #searchFilter
        [locale]="locale"
        [columns]="columnsArray"
        [searchForm]="searchForm"
        [chips]="searchChips"
        (search)="page.index = 0; search()"
        (clearFilter)="initializeSearchFilterForm([])"
        (resetFilter)="initializeSearchFilterForm()"
        (addLine)="addLine()"
        (removeLine)="removeLine($event)"
    ></vioc-angular-search-filter>

## Running unit tests

Run `nx test shared-feature-search` to execute the unit tests.
