import { Component, Input } from '@angular/core';
/**
 * Component used to style the button layout on the page.
 *
 * @example
 *  <vioc-angular-action-bar>
 *      <button>SAVE</button>
 *      <button>APPLY</button>
 *      <button>CANCEL</button>
 *  </vioc-angular-action-bar>
 */
@Component({
    selector: 'vioc-angular-action-bar',
    styleUrls: ['./action-bar.component.scss'],
    template: `
        <div class="actions not-printable">
            <vioc-angular-cancel-button *ngIf="isCancelButtonDisplayed"></vioc-angular-cancel-button>
            <ng-content></ng-content>
        </div>
    `,
})
export class ActionBarComponent {
    @Input() isCancelButtonDisplayed = true;
}
