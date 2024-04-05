import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeConstants } from './badge.constants';

@Component({
    selector: 'vioc-badge',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './badge.component.html',
    styleUrls: ['./badge.component.scss'],
})
export class BadgeComponent {
    /**
     * Type of badge to be displayed
     *
     * @required
     */
    @Input()
    style: BadgeConstants.Style = BadgeConstants.Style.Round;

    /**
     * Badge color
     *
     * @required
     */
    @Input()
    color: BadgeConstants.Color = BadgeConstants.Color.Primary;

    /**
     * Badge contents
     *
     * @required
     */
    @Input()
    label = 'Badge';

    public get classes(): string[] {
        return ['ui-kit-badge', `ui-kit-badge--${this.style}`, `ui-kit-badge--${this.color}`];
    }
}
