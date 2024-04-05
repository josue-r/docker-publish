import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

/**
 * A component to add mat-slider which can be toggle between two different states
 *
 * Usage ex:
 * <vioc-angular-slide-toggle
    [label]="label"
    [checked]="checked"
    [disabled]="disabled"
    (changeEvent)="changeEvent($event)"
    ></vioc-angular-slide-toggle>
 */
@Component({
    selector: 'vioc-angular-slide-toggle',
    template: `<mat-slide-toggle [checked]="toggled" [disabled]="disabled" (change)="emitEvent($event)"
        ><span class="innerLabel">{{ innerLabel }}</span
        ><span class="outerLabel">{{ label }}</span></mat-slide-toggle
    >`,
    styleUrls: ['./slide-toggle.component.scss'],
})
export class SlideToggleComponent {
    @Input() label: string;

    @Input() innerLabel: string;

    @Input() toggled: boolean;

    @Input() disabled = false;

    @Output() changeEvent = new EventEmitter<MatSlideToggleChange>();

    emitEvent(e: MatSlideToggleChange) {
        this.changeEvent.emit(e);
    }
}
