import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { ProductCategory } from '@vioc-angular/central-ui/product/data-access-product-category';
import { RoleFacade } from '@vioc-angular/security/data-access-security';
import { QuerySearch } from '@vioc-angular/shared/common-api-models';
import { DialogComponent } from '@vioc-angular/shared/ui-dialog';
import { ResponseEntity } from '@vioc-angular/shared/util-api';
import { Observable, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'vioc-angular-product-category-add-input',
    templateUrl: './product-category-add-input.component.html',
    styleUrls: ['./product-category-add-input.component.scss'],
})
export class ProductCategoryAddInputComponent {
    @ViewChild('searchDialog', { static: true }) searchDialog: DialogComponent;

    /** Disables the add functionality of this component including searching and entering a product code in the input. */
    @Input() set addDisabled(addDisabled: boolean) {
        this._addDisabled = addDisabled;
        if (this._addDisabled) {
            this.productCodeControl.disable({ emitEvent: false });
        } else {
            this.productCodeControl.enable({ emitEvent: false });
        }
    }
    get addDisabled(): boolean {
        return this._addDisabled;
    }
    private _addDisabled: boolean;

    @Input() singleSelection = false;

    /** List of product codes that will be used to to verify that the products being added don't already exist. */
    @Input() existingProductCategoryCodes: string[] = [];

    /** Function used to trigger a search for the product search dialog. */
    @Input() searchFn: (querySearch: QuerySearch) => Observable<ResponseEntity<ProductCategory>>;
    /** Emits the selected/entered product ids and codes. */
    @Output() categories = new EventEmitter<{ id?: number; code: string }[]>();

    /** Controls the value for the product code input. */
    @Input() productCodeControl = new FormControl('');

    /** Controls the value for the product search selection. */
    productCategorySelectionControl = new FormControl([]);

    /** Contains the errors produced by a duplicate product selection/entry. */
    productErrors = '';

    private readonly _destroyed = new ReplaySubject(1);

    constructor(private readonly roleFacade: RoleFacade) {}

    ngOnDestroy(): void {
        this._destroyed.next();
    }

    openSearchDialog(): void {
        this.searchDialog.open();

        this.searchDialog.dialogRef
            .afterClosed()
            .pipe(takeUntil(this._destroyed))
            .subscribe(() => this.productCategorySelectionControl.reset());
    }

    closeSearchDialog(): void {
        this.searchDialog.close();
    }

    /** Adds the selected productCategory from the search dialog selection. Also filters out duplicated selected productCategories and adds them to a list of errors. */
    addProductCategories(): void {
        const existingProductCategories: ProductCategory[] = this.productCategorySelectionControl.value.filter(
            (p: ProductCategory) => this.categoryAlreadyAdded(p.code)
        );
        const addedProducts: ProductCategory[] = this.productCategorySelectionControl.value.filter(
            (p: ProductCategory) => !existingProductCategories.includes(p)
        );
        this.productErrors =
            existingProductCategories?.length > 0
                ? `Category code(s) ${existingProductCategories.map((p) => p.code).join(', ')} already added`
                : '';
        if (addedProducts.length > 0) {
            this.categories.emit(
                addedProducts.map((p) => {
                    return { id: p.id, code: p.code };
                })
            );
        }
        this.closeSearchDialog();
    }

    /** Adds the entered product from the product code input. If the product code already exists, and error will be displayed. */
    addRequestedProductCategory(): void {
        if (!this.addDisabled) {
            if (this.categoryAlreadyAdded(this.productCodeControl.value)) {
                this.productErrors = 'Category already added';
            } else {
                this.productErrors = '';
                this.categories.emit([{ code: this.productCodeControl.value.toUpperCase() }]);
                if (!this.singleSelection) {
                    this.productCodeControl.setValue('');
                }
            }
        }
    }

    addProductErrorMatcher(error: any): ErrorStateMatcher {
        return {
            isErrorState(): boolean {
                return error;
            },
        } as ErrorStateMatcher;
    }

    /** Validates that product(s) are selected in the product search dialog. */
    isSelected(): boolean {
        return this.productCategorySelectionControl.value?.length > 0;
    }

    /** Checks the selected product code to see if it already exists in the existing products. */
    private categoryAlreadyAdded(code: string): string {
        return this.existingProductCategoryCodes?.find((p) => p.toUpperCase() === code.toUpperCase().trim());
    }
}
