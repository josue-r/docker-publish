import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DividerConstants } from './divider.constants';

@Component({
    selector: 'vioc-divider',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './divider.component.html',
    styleUrls: ['./divider.component.scss'],
})
export class DividerComponent {
    /**
     * Type of hr to be displayed
     *
     * @required
     */
    @Input()
    orientation: DividerConstants.Orientation = DividerConstants.Orientation.Horizontal;

    /**
     * Color of hr to be displayed
     *
     * @required
     */
    @Input()
    color: DividerConstants.Color = DividerConstants.Color.Aluminum;

    /**
     * Thickness of hr to be displayed
     *
     * @required
     */
    @Input()
    thickness: DividerConstants.Thickness = DividerConstants.Thickness.Thin;

    public get classes(): string[] {
        return [
            'ui-kit-hr',
            `ui-kit-hr--${this.orientation}`,
            `ui-kit-hr--${this.color}`,
            `ui-kit-hr--${this.thickness}`,
        ];
    }
}
