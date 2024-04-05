import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
    selector: 'vioc-angular-store-selection',
    template: ``,
})
export class MockStoreSelectionComponent {
    @Input() control: any;
    @Input() multiple = true;
    @Input() accessRoles: string[];
    @Input() searchFn: (querySearch: any) => Observable<any>;
    clear = () => {};
}
