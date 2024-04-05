import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardContentConstants } from './card-content.constants';

@Component({
    selector: 'vioc-card-content',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './card-content.component.html',
    styleUrls: ['./card-content.component.scss'],
})
export class CardContentComponent {
    /**
     * Size of title to be displayed
     *
     * @required
     */
    @Input()
    size: CardContentConstants.Size = CardContentConstants.Size.Large;

    /**
     * Title color
     *
     * @required
     */
    @Input()
    titleColor: CardContentConstants.Color = CardContentConstants.Color.Primary;

    /**
     * Title contents
     *
     * @required
     */
    @Input()
    title = '';

    /**
     * description contents
     *
     * @required
     */
    @Input()
    description = '';

    public get titleClasses(): string[] {
        return [
            'ui-kit-card-content--title',
            `ui-kit-card-content--${this.titleColor}`,
            `ui-kit-card-content--title--${this.size}`,
        ];
    }

    public get descriptionClasses(): string[] {
        return ['ui-kit-card-content--description', `ui-kit-card-content--description--${this.size}`];
    }
}
