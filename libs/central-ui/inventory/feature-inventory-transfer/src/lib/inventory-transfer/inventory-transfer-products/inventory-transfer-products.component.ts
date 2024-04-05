import { SelectionModel } from '@angular/cdk/collections';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    Output,
    ViewChild,
} from '@angular/core';
import { FormArray } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { InventoryTransferProduct } from '@vioc-angular/central-ui/inventory/data-access-inventory-transfer';
import { TypedFormGroupSelectionModel, isNullOrUndefined } from '@vioc-angular/shared/common-functionality';
import { TypedFormGroup } from '@vioc-angular/shared/util-form';

@Component({
    selector: 'vioc-angular-inventory-transfer-products',
    templateUrl: './inventory-transfer-products.component.html',
    styleUrls: ['./inventory-transfer-products.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryTransferProductsComponent implements AfterViewInit {
    private _form: FormArray;

    /**
     * FormArray representing all of the inventory transfer products to be displayed. This
     * array should be treated as immutable and any modifications that need to happen should
     * be output to the parent
     *
     * @type {FormArray}
     * @memberof InventoryTransferProductsComponent
     */
    @Input() set form(form: FormArray) {
        this._form = form;
        this.initializeTable();
    }

    @ViewChild(MatSort, { static: false }) sort: MatSort;

    /** Disables the "Remove Products" button and the checkboxes next to each product */
    @Input() disableSelection: boolean;

    /**
     * String representing the code of the status of the inventory transfer
     */
    @Input() status: string;

    get form(): FormArray {
        return this._form;
    }

    get isTransferFinalized(): boolean {
        return this.status === 'FINALIZED';
    }

    /**
     * Emits the product codes that have been selected for removal
     *
     * @memberof InventoryTransferProductsComponent
     */
    @Output() removeProducts = new EventEmitter<string[]>();

    readonly displayedColumns = ['select', 'code', 'description', 'quantityOnHand', 'uom', 'quantity'];

    readonly qohWarningMapping = {
        qohLessThanZero: () => 'Qty on Hand is less than zero',
        quantityGreaterThanQoh: () => 'Quantity is greater than the available Qty on Hand',
    };

    selection = new TypedFormGroupSelectionModel<InventoryTransferProduct>(true, false, 'product');

    products: MatTableDataSource<TypedFormGroup<InventoryTransferProduct>>;

    ngAfterViewInit() {
        if (this.sort) {
            this.products.sort = this.sort;
        }
    }

    removeSelectedProducts() {
        this.removeProducts.emit(this.selection.selected.map((group) => group.getControlValue('product').code));
        this.selection.clear();
    }

    masterToggle() {
        this.isAllSelected()
            ? this.selection.clear()
            : this.form.controls.forEach((control) =>
                  this.selection.select(control as TypedFormGroup<InventoryTransferProduct>)
              );
    }

    isAllSelected() {
        return this.selection.selected.length === this.form.controls.length;
    }

    qohWarning(product: InventoryTransferProduct): string {
        if (isNullOrUndefined(this.status) || this.status === 'OPEN') {
            if (product.quantityOnHand < 0) {
                return this.qohWarningMapping.qohLessThanZero();
            } else if (product.quantity > product.quantityOnHand) {
                return this.qohWarningMapping.quantityGreaterThanQoh();
            }
        }
        return null;
    }

    /** Initialize table data source with given products and sorting */
    initializeTable(): void {
        this.products = new MatTableDataSource<TypedFormGroup<InventoryTransferProduct>>(
            this.form.controls as TypedFormGroup<InventoryTransferProduct>[]
        );
        this.products.sort = this.sort;
        // for columns with nested properties
        this.products.sortingDataAccessor = (item, property) => {
            switch (property) {
                case 'code':
                    return item.getControlValue('product').code;
                case 'description':
                    return item.getControlValue('product').description;
                case 'uom':
                    return item.getControlValue('uom').code;
                default:
                    return item.get(property).value;
            }
        };
    }
}
