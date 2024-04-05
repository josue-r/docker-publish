import { Component } from '@angular/core';
import { AuthenticationFacade } from '@vioc-angular/security/data-access-security';

/**
 * Used to log the user out of the application after it has redirected them to
 * the `logout` url path. Needed to allow the application to display window messages before
 * logging the user out of the application.
 */
@Component({
    template: '',
})
export class LogoutComponent {
    constructor(readonly authenticationFacade: AuthenticationFacade) {
        this.authenticationFacade.logout();
    }
}
