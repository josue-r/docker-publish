# ui-paginator

This library was generated with [Nx](https://nx.dev) and is build for the purpose of navigating large queries by means of smaller peices reffered to as "pages". The paginator itself can change the number of records per-page, as well as navigating the pages by use of the four different arrows: first, previous, next, and last.

##Example

```
<vioc-angular-paginator
    #searchPaginator
    [index]="page.index"
    [size]="page.size"
    [length]="totalElements"
    [sizeOptions]="pageSizeOptions"
    (pageChange)="pageChange($event.pageIndex, $event.pageSize)"
></vioc-angular-paginator>
```

## Running unit tests

Run `nx test ui-paginator` to execute the unit tests.
