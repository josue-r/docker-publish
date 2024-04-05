import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardTitleComponent, CardTitleConstants } from '@vioc-angular/ui-kit/atoms/card-title';

@Component({
    selector: 'vioc-card',
    standalone: true,
    imports: [CommonModule, CardTitleComponent],
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.scss'],
})
export class CardComponent {
    @Input() title: string = '';
    @Input() titleSize!: CardTitleConstants.Size;
    @Input() titleColor!: CardTitleConstants.Color;
    @Input() titleAlign!: CardTitleConstants.Align;
}
