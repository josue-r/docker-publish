import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
    selector: 'vioc-angular-product-selection',
    template: ``,
})
export class MockProductSelectionComponent {
    @Input() control: any;
    @Input() multiple = true;
    @Input() searchFn: (querySearch: any) => Observable<any>;
    clear = () => {};
}
