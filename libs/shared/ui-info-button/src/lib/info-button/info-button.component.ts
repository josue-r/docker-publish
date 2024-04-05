import { Component, Input } from '@angular/core';

@Component({
    selector: 'vioc-angular-info-button',
    template: `
        <button
            mat-icon-button
            class="info-button"
            color="primary"
            [matTooltip]="info"
            #tooltip="matTooltip"
            matTooltipPosition="after"
            (click)="tooltip.toggle()"
            >i</button
        >
    `,
    styleUrls: ['./info-button.component.scss'],
})
export class InfoButtonComponent {
    @Input() info: string;

    constructor() {}
}
