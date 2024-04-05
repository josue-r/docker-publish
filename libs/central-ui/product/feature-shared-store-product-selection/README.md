# central-ui-product-feature-shared-store-product-selection

This library was generated with [Nx](https://nx.dev).

`ng g @nx/angular:library feature-shared-store-product-selection --directory central-ui/product --simpleModuleName --tags=scope:central-ui,type:feature-shared --style=sass`

### html:

```
<vioc-angular-store-product-selection
    #productSelectionComponent
    [control]="storeProductsControl"
    [searchFn]="searchStoreProducts"
    [excludedColumns]="excludedColumns"
></vioc-angular-store-product-selection>
```

### ts:

```
readonly excludedColumns = ['store', 'vendor']; // will result in the 'store' and 'vendor' columns not being displayable or searchable

readonly searchStoreProducts = (querySearch: QuerySearch): Observable<ResponseEntity<StoreProduct>> =>
    this.storeProductFacade.search(querySearch);

get storeProductsControl(): FormControl {
    return this.form.get('storeProducts') as FormControl;
}
```

## Running unit tests

Run `nx test central-ui-product-feature-shared-store-product-selection` to execute the unit tests.
