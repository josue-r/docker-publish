# central-ui-service-feature-shared-service-selection

This library was generated with [Nx](https://nx.dev).

`ng g @nx/angular:library feature-shared-service-selection --directory central-ui/service --simpleModuleName --tags=scope:central-ui,type:feature-shared --style=sass`

## Usage Notes

### html:

```html
<vioc-angular-service-selection
    #serviceSelectionComponent
    [control]="servicesControl"
    [searchFn]="searchServices"
></vioc-angular-service-selection>
```

### ts:

```ts
readonly searchServices = (querySearch: QuerySearch): Observable<ResponseEntity<Service>> =>
    this.serviceFacade.findUnassignedServicesForCompany(this.companyControl.value, querySearch);

get servicesControl(): FormControl {
    return this.form.get('services') as FormControl;
}
```

## Running unit tests

Run `nx test central-ui-service-feature-shared-service-selection` to execute the unit tests.
