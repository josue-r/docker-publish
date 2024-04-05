import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';

/**
 * Component to provide add and remove buttons to items in a list.
 */
@Component({
    selector: 'vioc-angular-add-remove-button',
    templateUrl: './add-remove-button.component.html',
    styleUrls: ['./add-remove-button.component.scss'],
})
export class AddRemoveButtonComponent {
    /** Static id var to ensure unique ids */
    static componentId = 0;

    @HostBinding() readonly id = `add-remove-button-${AddRemoveButtonComponent.componentId}`;

    readonly removeButtonId = `remove-button-${AddRemoveButtonComponent.componentId}`;

    readonly addButtonId = `add-button-${AddRemoveButtonComponent.componentId}`;

    /**
     * Determines whether the add button should be displayed
     */
    @Input() addButtonDisplayed: boolean;

    /**
     * Determines whether the remove button should be displayed
     */
    @Input() removeButtonDisplayed: boolean;

    /**
     * Determines if the add button is disabled
     */
    @Input() addButtonDisabled = false;

    /**
     * Emits anytime the add button is clicked
     */
    @Output() addItem: EventEmitter<any> = new EventEmitter();

    /**
     * Emits anytime the remove button is clicked
     */
    @Output() removeItem: EventEmitter<any> = new EventEmitter();

    constructor() {
        // increment the componentId for the next instance
        AddRemoveButtonComponent.componentId++;
    }

    /**
     * Function called when the add button is clicked to emit to the parent component
     */
    addButtonClicked(): void {
        this.addItem.emit();
    }

    /**
     * Function called when the remove button is clicked to emit to the parent component
     */
    removeButtonClicked(): void {
        this.removeItem.emit();
    }
}
