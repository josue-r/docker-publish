import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
    selector: 'vioc-angular-product-category-selection',
    template: ``,
})
export class MockProductCategorySelectionComponent {
    @Input() control: any;
    @Input() multiple = true;
    @Input() searchFn: (querySearch: any) => Observable<any>;
    clear = () => {};
}
