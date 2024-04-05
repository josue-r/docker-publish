import { Component, Input } from '@angular/core';

/**
 * Component that displays a `mat-spinner` on the screen.
 */
@Component({
    selector: 'vioc-angular-loading',
    styleUrls: ['./loading.component.scss'],
    template: `
        <div class="loading" [ngClass]="additionalClass">
            <mat-spinner></mat-spinner>
        </div>
    `,
})
export class LoadingComponent {
    /**
     * Input for asditional CSS stylings to be applied to the component.
     */
    @Input() additionalClass = '';
}
