import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonConstants } from './button.constants';

@Component({
    selector: 'vioc-button',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './button.component.html',
    styleUrls: ['./button.component.scss'],
})
export class ButtonComponent {
    /**
     * Type of button to be displayed
     *
     * @required
     */
    @Input()
    type: ButtonConstants.Type = ButtonConstants.Type.Primary;

    /**
     * Button contents
     *
     * @required
     */
    @Input()
    label = 'Button';

    /**
     * Optional click handler
     */
    @Output()
    // eslint-disable-next-line @angular-eslint/no-output-on-prefix
    action = new EventEmitter<Event>();

    public get classes(): string[] {
        return ['ui-kit-button', `ui-kit-button--${this.type}`];
    }
}
