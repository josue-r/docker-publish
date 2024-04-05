import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormArray, FormBuilder } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Discount } from '@vioc-angular/central-ui/discount/data-access-discount';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { Described, TypedFormGroupSelectionModel } from '@vioc-angular/shared/common-functionality';
import { FormFactory, TypedFormGroup } from '@vioc-angular/shared/util-form';
import { DiscountCategory } from 'libs/central-ui/discount/data-access-discount/src/lib/model/discount-category.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
    selector: 'vioc-angular-discount-line-item',
    templateUrl: './discount-line-item.component.html',
})
export class DiscountLineItemComponent {
    @ViewChild(MatSort, { static: false }) sort: MatSort;

    @ViewChild(MatTable, { static: false }) table: MatTable<Discount>;

    @Input() approach$: Observable<Described[]>;

    @Input() form: TypedFormGroup<Discount>;

    /** Mode in which the page is being accessed in. */
    @Input() accessMode: AccessMode;

    @Input() category$ = new BehaviorSubject(new MatTableDataSource<TypedFormGroup<DiscountCategory>>());

    describedEquals = Described.idEquals;

    @Input() model: Discount;

    @Input() renderSelection: boolean;

    /** SelectionModel for the currently selected data in the table. */
    selection = new TypedFormGroupSelectionModel<DiscountCategory>(true, false, 'category');
    @Output() onRemove = new EventEmitter<{
        selection: TypedFormGroupSelectionModel<DiscountCategory>;
        table: MatTable<Discount>;
    }>();

    includedLineItemColumns = ['select', 'discountTarget', 'category.code', 'approach', 'amount'];
    excludedLineItemColumns = ['select', 'discountTarget', 'category.code'];

    constructor(private readonly formFactory: FormFactory, private readonly formBuilder: FormBuilder) {}

    isAllSelected(data: TypedFormGroup<DiscountCategory>[]): boolean {
        const numSelected = this.selection && this.selection.selected.length;
        const numRows = data.length;
        return numSelected === numRows;
    }

    /** If no rows are selected selects all available rows, if all rows are selected then clears the selection. */
    masterToggle(data: TypedFormGroup<DiscountCategory>[]): void {
        this.isAllSelected(data) ? this.selection.clear() : data.forEach((row) => this.selection.select(row));
    }

    /** Remove categories based on selectionModel */
    removeCategories(): void {
        this.onRemove.emit({ selection: this.selection, table: this.table });
    }

    get discountCategories(): FormArray {
        return this.form.getArray('discountCategories');
    }

    get lineItemColumns(): string[] {
        if (this.form?.value?.type?.code == this.discountLineItem) {
            return this.includedLineItemColumns;
        } else if (this.form?.value?.type?.code == this.discountExcludeLineItem) {
            return this.excludedLineItemColumns;
        }
    }

    get discountLineItem(): string {
        return 'LINEITEM';
    }

    get discountExcludeLineItem(): string {
        return 'EXCLUDE_LINEITEM';
    }

    get discountInvoice(): string {
        return 'INVOICE';
    }

    /** Updates the sort order of the table data. */
    sortChange(categories: MatTableDataSource<TypedFormGroup<DiscountCategory>>) {
        categories.sort = this.sort;
    }
}
