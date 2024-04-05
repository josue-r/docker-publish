# central-ui-product-feature-shared-product-add-input

This library was generated with [Nx](https://nx.dev).

`ng g @nx/angular:library feature-shared-product-add-input --directory central-ui/product --simpleModuleName --tags=scope:central-ui,type:feature-shared --style=sass`

### html:

```
<vioc-angular-product-add-input
    [addDisabled]="isLoading"
    [existingProductCodes]="existingProductCodes"
    [searchFn]="searchProductsFn"
    (products)="addRequestProducts($event)"
></vioc-angular-product-add-input>
```

### ts:

```
isLoading = false; // changes depending on the components state

readonly searchProductsFn = (querySearch: QuerySearch): Observable<ResponseEntity<StoreProduct>> => {
    return this.storeProductFacade.search(querySearch);
};

...

get existingProductCodes(): string[] {
    return this.form.getArrayValue('inventoryOrderProducts').map((iop) => iop.product.code);
}

addRequestedProducts(products: { id: number; code: string }[]): void {
    this.isLoading = true;
    this.generateProducts(
        this.form.getArray('inventoryOrderProducts').getRawValue(),
        products.map((p) => p.code)
    );
}
```

## Running unit tests

Run `nx test central-ui-product-feature-shared-product-add-input` to execute the unit tests.
