# central-ui-organization-feature-shared-store-selection

This library was generated with [Nx](https://nx.dev).

`ng g @nx/angular:library feature-shared-store-selection --directory central-ui/organization --simpleModuleName --tags=scope:central-ui,type:feature-shared --style=sass`

## Usage Notes

### html:

```
<vioc-angular-store-selection
    #storeSelectionComponent
    [control]="storesControl"
    [accessRoles]="accessRoles"
    [searchFn]="searchStores"
></vioc-angular-store-selection>
```

### ts:

```
accessRoles = ['ROLE_STORE_PRODUCT_ADD'];

readonly searchStores = (querySearch: QuerySearch): Observable<ResponseEntity<Described>> =>
    this.resourceFacade.searchStoresByRoles(querySearch, this.accessRoles);

get storesControl(): FormControl {
    return this.form.get('stores') as FormControl;
}
```

## Running unit tests

Run `nx test central-ui-organization-feature-shared-store-selection` to execute the unit tests.
