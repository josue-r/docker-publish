import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CardContentConstants } from '@vioc-angular/ui-kit/atoms/card-content';
import { ContentErrorConstants } from './content-error.constants';

@Component({
    selector: 'vioc-content-error',
    standalone: true,
    imports: [CommonModule, MatIconModule],
    templateUrl: './content-error.component.html',
    styleUrls: ['./content-error.component.scss'],
})
export class ContentErrorComponent {
    /**
     * Size of title to be displayed
     *
     * @required
     */
    @Input()
    size: CardContentConstants.Size = CardContentConstants.Size.Large;
    /**
     * direction of the error
     *
     * @required
     */
    @Input()
    direction: ContentErrorConstants.Orientation = ContentErrorConstants.Orientation.Vertical;
    /**
     * description contents
     *
     * @required
     */
    @Input()
    description = '-';

    public get descriptionClasses(): string[] {
        if (this.description !== '-') {
            return this.errorClasses;
        }
        return ['ui-kit-content-error--description', `ui-kit-content-error--description--${this.size}`];
    }

    public get iconClasses(): string[] {
        return [`ui-kit-content-error--${this.direction}--icon`];
    }

    public get errorClasses(): string[] {
        return [
            'ui-kit-content-error--error',
            `ui-kit-content-error--description--${this.size}`,
            `ui-kit-content-error--${this.direction}`,
        ];
    }

    public get classes(): string[] {
        return [`ui-kit-content-error`, `ui-kit-content-error--${this.direction}`];
    }
}
