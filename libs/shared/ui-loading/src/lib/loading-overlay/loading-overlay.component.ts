import { Component, Input } from '@angular/core';

/**
 * Components that will disable screen interactions by placing an overlay over the screens content when
 * the loading input is `true`.
 *
 * @example
 * ````
 * <vioc-angular-loading-overlay [loading]="isLoading">
 *     <form>
 *         <button>Save</button>
 *         <input matInput placeholder="Retail Price" type="number"/>
 *     </form>
 * </vioc-angular-loading-overlay>
 * ````
 */
@Component({
    selector: 'vioc-angular-loading-overlay',
    styleUrls: ['./loading-overlay.component.scss'],
    template: `
        <div class="loading-wrapper">
            <div class="loading-shade" *ngIf="loading">
                <mat-spinner></mat-spinner>
            </div>
            <ng-content></ng-content>
        </div>
    `,
})
export class LoadingOverlayComponent {
    /**
     * Determines if the loading overlay is being displayed on the screen.
     */
    @Input() loading = false;
}
