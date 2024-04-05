import { Component, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { StoreProduct } from '@vioc-angular/central-ui/product/data-access-store-product';
import { RoleFacade } from '@vioc-angular/security/data-access-security';
import { QuerySearch } from '@vioc-angular/shared/common-api-models';
import { DialogComponent } from '@vioc-angular/shared/ui-dialog';
import { ResponseEntity } from '@vioc-angular/shared/util-api';
import { Observable, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
/**
 * Component used to select/enter product information that will be validated and emitted as an output.
 *
 * @usageNotes
 * ```
 * <vioc-angular-product-add-input
 *   [addDisabled]="isLoading"
 *   [existingProductCodes]="existingProductCodes"
 *   [searchFn]="searchProductsFn"
 *   (products)="addRequestProducts($event)"
 * ></vioc-angular-product-add-input>
 * ```
 *
 * ...
 *
 * ```
 * get existingProductCodes(): string[] {
 *    return this.form.getArrayValue('inventoryOrderProducts').map((iop) => iop.product.code);
 * }
 *
 * addRequestedProducts(products: { id: number; code: string }[]): void {
 *   this.isLoading = true;
 *   this.generateProducts(
 *       this.form.getArray('inventoryOrderProducts').getRawValue(),
 *       products.map((p) => p.code)
 *   );
 * }
 * ```
 */
@Component({
    selector: 'vioc-angular-product-add-input',
    templateUrl: './product-add-input.component.html',
    styleUrls: ['./product-add-input.component.scss'],
})
export class ProductAddInputComponent implements OnDestroy {
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
    @Input() existingProductCodes = [];

    /** Function used to trigger a search for the product search dialog. */
    @Input() searchFn: (querySearch: QuerySearch) => Observable<ResponseEntity<StoreProduct>>;

    /** Emits the selected/entered product ids and codes. */
    @Output() products = new EventEmitter<{ id?: number; code: string }[]>();

    /** Controls the value for the product code input. */
    @Input() productCodeControl = new FormControl('');

    /** Controls the value for the product search selection. */
    productSelectionControl = new FormControl([]);

    /** Contains the errors produced by a duplicate product selection/entry. */
    productErrors = '';

    /** Columns excluded from the product selection table. These columns will not be displayed on the table or be searchable. */
    readonly excludedProductSearchColumns = ['store', 'vendor', 'wholesalePrice'];

    private readonly _destroyed = new ReplaySubject(1);

    constructor(private readonly roleFacade: RoleFacade) {}

    ngOnDestroy(): void {
        this._destroyed.next();
    }

    openSearchDialog(): void {
        this.roleFacade.hasAnyRole(['ROLE_WHOLESALE_PRICE_READ']).subscribe((vWP) => {
            if (vWP) {
                const removalIndex = this.excludedProductSearchColumns.indexOf('wholesalePrice');
                if (removalIndex !== -1) this.excludedProductSearchColumns.splice(removalIndex, 1);
            }
        });

        this.searchDialog.open();

        this.searchDialog.dialogRef
            .afterClosed()
            .pipe(takeUntil(this._destroyed))
            .subscribe(() => this.productSelectionControl.reset());
    }

    closeSearchDialog(): void {
        this.searchDialog.close();
    }

    /** Adds the selected products from the search dialog selection. Also filters out duplicated selected products and adds them to a list of errors. */
    addProducts(): void {
        const existingProducts: StoreProduct[] = this.productSelectionControl.value.filter((p: StoreProduct) =>
            this.productAreadyAdded(p.product.code)
        );
        const addedProducts: StoreProduct[] = this.productSelectionControl.value.filter(
            (p: StoreProduct) => !existingProducts.includes(p)
        );
        this.productErrors =
            existingProducts?.length > 0
                ? `Product(s) ${existingProducts.map((p) => p.product.code).join(', ')} already added`
                : '';
        if (addedProducts.length > 0) {
            this.products.emit(
                addedProducts.map((p) => {
                    return { id: p.product.id, code: p.product.code };
                })
            );
        }
        this.closeSearchDialog();
    }

    /** Adds the entered product from the product code input. If the product code already exists, and error will be displayed. */
    addRequestedProduct(): void {
        if (!this.addDisabled) {
            if (this.productAreadyAdded(this.productCodeControl.value)) {
                this.productErrors = 'Product already added';
            } else {
                this.productErrors = '';
                this.products.emit([{ code: this.productCodeControl.value.toUpperCase() }]);
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
        return this.productSelectionControl.value?.length > 0;
    }

    /** Checks the selected product code to see if it already exists in the existing products. */
    private productAreadyAdded(code: string): string {
        return this.existingProductCodes?.find((p) => p.toUpperCase() === code.toUpperCase().trim());
    }
}
