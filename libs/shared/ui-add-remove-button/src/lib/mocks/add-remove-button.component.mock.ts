import { Component, Input, Output, EventEmitter } from '@angular/core';

/**
 * Mocked add-remove button that can test input/output bindings without having
 * to render the actual buttons.
 */
@Component({
    selector: 'vioc-angular-add-remove-button',
    template: '',
})
export class MockAddRemoveButtonComponent {
    @Input() addButtonDisplayed: boolean;
    @Input() removeButtonDisplayed: boolean;
    @Input() addButtonDisabled = false;
    @Output() addItem: EventEmitter<any> = new EventEmitter();
    @Output() removeItem: EventEmitter<any> = new EventEmitter();
}
