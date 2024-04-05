import { Component, Input } from '@angular/core';
import { ColumnConfig } from '@vioc-angular/shared/util-column';
import { Observable } from 'rxjs';
import { StoreProductSelectionComponent } from '../store-product-selection/store-product-selection.component';

@Component({
    selector: 'vioc-angular-store-product-selection',
    template: ``,
})
export class MockStoreProductSelectionComponent {
    @Input() control: any;
    @Input() multiple = true;
    @Input() singleSelection = false;
    @Input() searchFn: (querySearch: any) => Observable<any>;
    @Input() set excludedColumns(excludedColumns: string[]) {
        this.usableColumns = { ...this.columns };
        excludedColumns?.forEach((ec) => {
            (this.usableColumns[ec] as ColumnConfig).searchable = false;
            (this.usableColumns[ec] as ColumnConfig).displayable = false;
        });
    }
    columns = new StoreProductSelectionComponent().columns;
    usableColumns = { ...this.columns };
    clear = () => {};
}
