import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusConstants } from './status.constants';

@Component({
    selector: 'vioc-status',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './status.component.html',
    styleUrls: ['./status.component.scss'],
})
export class StatusComponent {
    /**
     * Color of status component to be displayed
     *
     * @required
     */
    @Input()
    color: StatusConstants.Color = StatusConstants.Color.Gray;

    /**
     * Label of status component to be displayed
     *
     * @required
     */
    @Input()
    label = 'greeted';

    public get classes(): string[] {
        return ['ui-kit-bottom-side-status', `ui-kit-bottom-side-status--${this.color}`];
    }
}
