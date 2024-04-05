import { SelectionModel } from '@angular/cdk/collections';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import { FormArray } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ProductAdjustmentDetail } from '@vioc-angular/central-ui/inventory/data-access-product-adjustment';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { Described, TypedFormGroupSelectionModel } from '@vioc-angular/shared/common-functionality';
import { TypedFormGroup } from '@vioc-angular/shared/util-form';

import { RoleFacade } from '@vioc-angular/security/data-access-security';
import * as _ from 'lodash';

@Component({
    selector: 'vioc-angular-product-adjustment-products',
    templateUrl: './product-adjustment-products.component.html',
    styleUrls: ['./product-adjustment-products.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductAdjustmentProductsComponent implements AfterViewInit, OnInit {
    private _form: FormArray;

    /**
     * FormArray representing all of the product adjustment products to be displayed. This
     * array should be treated as immutable and any modifications that need to happen should
     * be output to the parent
     *
     * @type {FormArray}
     * @memberof ProductAdjustmentProductsComponent
     */
    @Input() set form(form: FormArray) {
        this._form = form;
        this.initializeTable();
    }

    @ViewChild(MatSort, { static: false }) sort: MatSort;

    /** Disables the "Remove Products" button and the checkboxes next to each product */
    @Input() disableSelection: boolean;

    /**
     * String representing the code of the status of the product adjustment
     */
    @Input() status: string;

    @Input() accessMode: AccessMode;

    @Input() reasonType: Described[] = [];

    descriptionDisplayFn = Described.descriptionMapper;

    describedEquals = Described.idEquals;

    get form(): FormArray {
        return this._form;
    }

    /**
     * Emits the product codes that have been selected for removal
     *
     * @memberof ProductAdjustmentProductsComponent
     */
    @Output() removeProducts = new EventEmitter<string[]>();

    displayedColumns = ['select', 'code', 'description', 'unitOfMeasure', 'reason', 'quantity'];

    selection = new TypedFormGroupSelectionModel<ProductAdjustmentDetail>(true, false, 'product');

    products: MatTableDataSource<TypedFormGroup<ProductAdjustmentDetail>>;

    signs = ['+', '-'];

    constructor(private readonly roleFacade: RoleFacade) {}
    ngOnInit() {
        this.roleFacade.hasAnyRole(['ROLE_WHOLESALE_PRICE_READ']).subscribe((vWP) => {
            if (this.accessMode.isAdd) {
                // Adding sign column on adding accessMode after reason column
                this.displayedColumns.splice(5, 0, 'sign');
            }
            if (vWP) {
                // Add the wholesale price column if role exist
                this.displayedColumns.push('wholesalePrice');
            }
            this.displayedColumns = _.uniq(this.displayedColumns);
        });
    }

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
                  this.selection.select(control as TypedFormGroup<ProductAdjustmentDetail>)
              );
    }

    isAllSelected() {
        return this.selection.selected.length === this.form.controls.length;
    }

    /** Initialize table data source with given products and sorting */
    initializeTable(): void {
        this.products = new MatTableDataSource<TypedFormGroup<ProductAdjustmentDetail>>(
            this.form.controls as TypedFormGroup<ProductAdjustmentDetail>[]
        );
        this.products.sort = this.sort;
        // for columns with nested properties
        this.products.sortingDataAccessor = (item, property) => {
            switch (property) {
                case 'code':
                    return item.getControlValue('product').code;
                case 'description':
                    return item.getControlValue('product').description;
                case 'unitOfMeasure':
                    return item.getControlValue('unitOfMeasure').code;
                case 'reason':
                    return item.getControlValue('adjustmentReason').description;
                default:
                    return item.get(property).value;
            }
        };
    }
}
