import { Directive } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DataModifyingComponent } from './data-modifying.component';

describe('DataModifyingComponent', () => {
    @Directive()
    class TestComponent extends DataModifyingComponent {
        unsavedChanges: boolean;

        constructor(unsavedChanges: boolean) {
            super();
            this.unsavedChanges = unsavedChanges;
        }
    }

    const unloadNotification = (unsavedChanges: boolean, message?: string) => {
        const testComponent = new TestComponent(unsavedChanges);
        const defaultMessage = testComponent.unsavedChangesMessage();
        testComponent.unsavedChangesMessage = () => (message ? message : defaultMessage);
        const unloadEvent = {
            returnValue: '',
        } as BeforeUnloadEvent;
        testComponent.unloadNotification(unloadEvent);
        return unloadEvent;
    };

    it('should do nothing if there are no unsaved changes', () => {
        expect(unloadNotification(false).returnValue).toEqual('');
    });

    it('should set returnValue if there are changes', () => {
        expect(unloadNotification(true).returnValue).toEqual(
            'You have unsaved changes. If you leave, your changes will be lost.'
        );
    });

    it('should allow overriding the unsaveChangesMessage', () => {
        expect(unloadNotification(true, 'Test Message').returnValue).toEqual('Test Message');
    });

    it('should set a default function for reseting the form', () => {
        const testComponent = new TestComponent(false);
        testComponent.form = new FormControl('');
        jest.spyOn(testComponent.form, 'reset');
        testComponent.resetComponentForm();
        expect(testComponent.form.reset).toHaveBeenCalled();
    });
});
