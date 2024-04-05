import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Described, isNullOrUndefined } from '@vioc-angular/shared/common-functionality';
import { ReplaySubject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'vioc-angular-inventory-transfer-store-selection',
    templateUrl: './inventory-transfer-store-selection.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryTransferStoreSelectionComponent implements OnInit, OnDestroy {
    /**
     * Store in which the product(s) are being transfered from. Must be selected
     * before the `toStore` can be populated.
     *
     * @type {FormControl}
     * @memberof InventoryTransferStoreSelectionComponent
     */
    @Input() fromStore: FormControl;

    /**
     * Store in which the product(s) are being transfered to. Disabled by default
     * until the `fromStore` is selected.
     *
     * @type {FormControl}
     * @memberof InventoryTransferStoreSelectionComponent
     */
    @Input() toStore: FormControl;

    /**
     * List of all stores the user has access to in order to transfer products.
     *
     * @type {Described[]}
     * @memberof InventoryTransferStoreSelectionComponent
     */
    @Input() fromStores: Described[] = [];

    /**
     * List of stores that will be based on the company of the selected `fromStore`.
     *
     * @type {Described[]}
     * @memberof InventoryTransferStoreSelectionComponent
     */
    @Input() toStores: Described[] = [];

    describedEquals = Described.idEquals;

    private readonly _destroyed = new ReplaySubject(1);

    ngOnInit(): void {
        // resets the toStore if the fromStore is change since the toStore list must be reloaded
        this.fromStore.valueChanges
            .pipe(debounceTime(200), takeUntil(this._destroyed))
            .subscribe(() => this.toStore.setValue(null, { emitEvent: false }));
    }

    ngOnDestroy(): void {
        this._destroyed.next();
    }

    /**
     * Filters the list of `toStores` by removed the already selected fromStore from the list.
     */
    get filteredToStores(): Described[] {
        return this.toStores?.filter((s) => s.code !== this.fromStore.value?.code);
    }

    get isToStoreEditable(): boolean {
        return !isNullOrUndefined(this.fromStore.value);
    }
}
