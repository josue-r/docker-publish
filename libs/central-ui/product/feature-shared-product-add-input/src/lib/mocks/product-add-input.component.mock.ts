import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { StoreProduct } from '@vioc-angular/central-ui/product/data-access-store-product';
import { QuerySearch } from '@vioc-angular/shared/common-api-models';
import { ResponseEntity } from '@vioc-angular/shared/util-api';
import { Observable } from 'rxjs';

@Component({
    selector: 'vioc-angular-product-add-input',
    template: '',
})
export class MockProductAddInputComponent {
    @Input() addDisabled: boolean;
    @Input() singleSelection: boolean;
    @Input() productCodeControl: AbstractControl;
    @Input() existingProductCodes = [];
    @Input() searchFn: (querySearch: QuerySearch) => Observable<ResponseEntity<StoreProduct>>;
    @Output() products = new EventEmitter<{ id?: number; code: string }[]>();
}
