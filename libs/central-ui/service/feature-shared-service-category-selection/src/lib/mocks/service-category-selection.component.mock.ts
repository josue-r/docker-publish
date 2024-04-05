import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
    selector: 'vioc-angular-service-category-selection',
    template: ``,
})
export class MockServiceCategorySelectionComponent {
    @Input() control: any;
    @Input() multiple: boolean;
    @Input() singleSelection: boolean;
    @Input() selectable: boolean;
    @Input() searchFn: (querySearch: any) => Observable<any>;
    clear = () => {};
}
