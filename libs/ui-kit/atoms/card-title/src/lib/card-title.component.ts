import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardTitleConstants } from './card-title.constants';

@Component({
    selector: 'vioc-card-title',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './card-title.component.html',
    styleUrls: ['./card-title.component.scss'],
})
export class CardTitleComponent {
    /**
     * Size of title to be displayed
     *
     * @required
     */
    @Input()
    size: CardTitleConstants.Size = CardTitleConstants.Size.Large;

    /**
     * Title background color
     *
     * @required
     */
    @Input()
    color: CardTitleConstants.Color = CardTitleConstants.Color.Primary;

    /**
     * Title alignment
     *
     * @required
     */
    @Input()
    align: CardTitleConstants.Align = CardTitleConstants.Align.Center;

    /**
     * Title contents
     *
     * @required
     */
    @Input()
    label = 'Title';

    public get classes(): string[] {
        return [
            'ui-kit-card-title',
            `ui-kit-card-title--${this.size}`,
            `ui-kit-card-title--${this.color}`,
            `ui-kit-card-title--${this.align}`,
        ];
    }
}
