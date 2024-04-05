import { Component, Input } from '@angular/core';

@Component({
    selector: 'vioc-angular-loading-overlay',
    template: ` <ng-content></ng-content> `,
})
export class MockLoadingOverlayComponent {
    @Input() loading = false;
}
