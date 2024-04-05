import { Directive, HostListener } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { DataModifier } from '../model/data-modifier';

/**
 * Indicates a component will modify and attempt to save data to the database. This implements DataModifier
 * to provide an unsavedChanges check as well as provides default functionality for dirty messages when refreshing
 * the page or using the back button in the browser.
 */
@Directive() // Directive decorator required for angular functionality (HostListener)
// tslint:disable-next-line: directive-class-suffix (ignoring directive suffix for abstract component class)
export abstract class DataModifyingComponent implements DataModifier {
    /**
     * Abstract method used to check if there is data that has been or is still being modified.
     */
    abstract get unsavedChanges(): boolean;

    /** Optional property that is used in the default method for reseting the components form. */
    form: AbstractControl;

    /** @see DataModifier#unsavedChangesMessage */
    unsavedChangesMessage = () => 'You have unsaved changes. If you leave, your changes will be lost.';

    /** @see DataModifier#resetComponentForm */
    resetComponentForm = () => {
        if (this.form) {
            this.form.reset();
        }
    };

    /**
     * Listens for the beforeunload event which is fired when the DOM in being unloaded which can be caused by
     * refreshing, using the back button in the browser, or closing the window. This triggers a dialog box
     * confirming the user wants to continue forward without saving their changes. Setting the return value
     * triggers the dialog box with the string the return value is set to.
     *
     * See https://developer.mozilla.org/en-US/docs/Web/Events/beforeunload for additional information.
     */
    @HostListener('window:beforeunload', ['$event']) unloadNotification(event: any): void {
        // Temporary fix for testing BeforeUnloadEvent until jsdom is updated: https://github.com/kulshekhar/ts-jest/issues/1035#issuecomment-486442977
        // PR for fixing jsdom: https://github.com/jsdom/jsdom/issues/2527
        const typedEvent: BeforeUnloadEvent = event;
        if (this.unsavedChanges) {
            typedEvent.returnValue = this.unsavedChangesMessage();
        }
    }
}
