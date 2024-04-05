import { Injectable } from '@angular/core';

import { DataModifier } from '../model/data-modifier';

/**
 * Guard used to prevent navigating away from a DataModifier page if there are unsaved changes.
 * This is provided in the vioc-ui module. It can be added to the canDeactive property of a route
 * that uses a DataModifier and will display a dialog box confirming the user wants to navigate
 * away with unsaved changes.
 */
@Injectable({ providedIn: 'root' })
export class UnsavedChangesGuard {
    /**
     * Checks for unsaved changes and displays a dialog box for the user to confirm navigating
     * away if unsaved changes are found.
     */
    canDeactivate(component: DataModifier): boolean {
        if (component.unsavedChanges) {
            const confirmed = confirm(component.unsavedChangesMessage());
            if (confirmed) {
                // reset the component form, if applicable, to prevent the browser window
                // from displaying a second unsaved changes message
                component.resetComponentForm();
            }
            return confirmed;
        }
        return true;
    }
}
