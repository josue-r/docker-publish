# central-ui-ui-mass-deactivate-dialog

This library was generated with [Nx](https://nx.dev).

Provides a deactivate dialog that will display an [AssignmentCount](../../shared/common-api-models/src/lib/assignment-count.ts) explaining the possible implications of deactivating the resource.

### Example

```ts
...
@ViewChild(MassDeactivateDialogComponent, { static: true }) massDeactivate: MassDeactivateDialogComponent;
...
loadUsage(): void {
    const selectedIds: number[] = this.searchPage.searchComponent.selection.selected.map(selected => selected.id);
    const usage: Observable<Assignment[]> = this.productFacade.findUsage(selectedIds);
    this.massDeactivate.openDialog(usage);
}
deactivate(products: AssignmentCount[]): void { ... }
...
```

```html
...
<button mat-button color="primary" *ngIf="searchPage.hasEditAccess" class="action-button" (click)="loadUsage()"
    >Deactivate</button
>
<vioc-angular-mass-deactivate-dialog (deactivate)="deactivate($event)"> </vioc-angular-mass-deactivate-dialog>
...
```

## Running unit tests

Run `nx test central-ui-ui-mass-deactivate-dialog` to execute the unit tests.
