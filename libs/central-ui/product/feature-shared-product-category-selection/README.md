# central-ui-product-feature-shared-product-selection

This library was generated with [Nx](https://nx.dev).

`ng g @nx/angular:library feature-shared-product-category-selection --directory central-ui/product --simpleModuleName --tags=scope:central-ui,type:feature-shared --style=sass`

## Usage Notes

### html:

```
<vioc-angular-product-category-selection
    #productSelectionComponent
    [control]="productsControl"
    [searchFn]="searchProducts"
></vioc-angular-product-category-selection>
```

### ts:

```
readonly searchProducts = (querySearch: QuerySearch): Observable<ResponseEntity<Product>> =>
    this.productFacade.findUnassignedProductsForCompany(this.companyControl.value, querySearch);

get productsControl(): FormControl {
    return this.form.get('products') as FormControl;
}
```

## Running unit tests

Run `nx test central-ui-product-feature-shared-product-category-selection` to execute the unit tests.
