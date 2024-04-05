import { Component, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { NonInventoryCatalog } from '@vioc-angular/central-ui/inventory/data-access-non-inventory-order';
import { QuerySearch } from '@vioc-angular/shared/common-api-models';
import { DialogComponent } from '@vioc-angular/shared/ui-dialog';
import { ResponseEntity } from '@vioc-angular/shared/util-api';
import { Observable, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'vioc-angular-non-inventory-item-add-input',
    templateUrl: './non-inventory-item-add-input.component.html',
    styleUrls: ['./non-inventory-item-add-input.component.scss'],
})
export class NonInventoryItemAddInputComponent implements OnDestroy {
    @ViewChild('searchDialog', { static: true }) searchDialog: DialogComponent;

    /** Disables the add functionality of this component including searching and entering a item number in the input. */
    @Input() set addDisabled(addDisabled: boolean) {
        this._addDisabled = addDisabled;
        if (this._addDisabled) {
            this.itemNumberControl.disable({ emitEvent: false });
        } else {
            this.itemNumberControl.enable({ emitEvent: false });
        }
    }
    get addDisabled(): boolean {
        return this._addDisabled;
    }
    private _addDisabled: boolean;

    /** List of item numbers that will be used to to verify that the items being added don't already exist. */
    @Input() existingItemNumbers = [];

    /** Function used to trigger a search for the product search dialog. */
    @Input() searchFn: (querySearch: QuerySearch) => Observable<ResponseEntity<NonInventoryCatalog>>;

    /** Emits the selected/entered item ids and numbers. */
    @Output() items = new EventEmitter<{ id?: number; number: string }[]>();

    /** Controls the value for the item number input. */
    itemNumberControl = new FormControl('');

    /** Controls the value for the item search selection. */
    itemSelectionControl = new FormControl([]);

    /** Contains the errors produced by a duplicate item selection/entry. */
    productErrors = '';

    /** Columns excluded from the item selection table. These columns will not be displayed on the table or be searchable. */
    readonly excludedItemSearchColumns = ['company'];

    private readonly _destroyed = new ReplaySubject(1);

    ngOnDestroy(): void {
        this._destroyed.next();
    }

    openSearchDialog(): void {
        this.searchDialog.open();
        this.searchDialog.dialogRef
            .afterClosed()
            .pipe(takeUntil(this._destroyed))
            .subscribe(() => this.itemSelectionControl.reset());
    }

    closeSearchDialog(): void {
        this.searchDialog.close();
    }

    /** Adds the selected items from the search dialog selection. Also filters out duplicated selected items and adds them to a list of errors. */
    addItems(): void {
        const existingItems: NonInventoryCatalog[] = this.itemSelectionControl.value.filter((p: NonInventoryCatalog) =>
            this.itemAreadyAdded(p.number)
        );
        const addedItems: NonInventoryCatalog[] = this.itemSelectionControl.value.filter(
            (p: NonInventoryCatalog) => !existingItems.includes(p)
        );
        this.productErrors =
            existingItems?.length > 0 ? `Item(s) ${existingItems.map((p) => p.number).join(', ')} already added` : '';
        if (addedItems.length > 0) {
            this.items.emit(
                addedItems.map((p) => {
                    return { id: p.id, number: p.number };
                })
            );
        }
        this.closeSearchDialog();
    }

    /** Adds the entered item from the product code input. If the item number already exists, and error will be displayed. */
    addRequestedItem(): void {
        if (!this.addDisabled) {
            if (this.itemAreadyAdded(this.itemNumberControl.value)) {
                this.productErrors = 'Item already added';
            } else {
                this.productErrors = '';
                this.items.emit([{ number: this.itemNumberControl.value.toUpperCase() }]);
                this.itemNumberControl.setValue('');
            }
        }
    }

    addItemErrorMatcher(error: any): ErrorStateMatcher {
        return {
            isErrorState(): boolean {
                return error;
            },
        } as ErrorStateMatcher;
    }

    /** Validates that item(s) are selected in the item search dialog. */
    isSelected(): boolean {
        return this.itemSelectionControl.value?.length > 0;
    }

    /** Checks the selected item number to see if it already exists in the existing items. */
    private itemAreadyAdded(code: string): string {
        return this.existingItemNumbers?.find((p) => p.toUpperCase() === code.toUpperCase().trim());
    }
}
