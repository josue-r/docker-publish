import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationFacade } from '@vioc-angular/security/data-access-security';
import { Loggers } from '@vioc-angular/shared/common-logging';

/**
 * Default/reference login component implementation.  This should be good for most applications.
 *
 * This component serves two purposes:
 * 1. Do the initial OIDC authorization code flow redirect.  This is triggered by no request parameters
 * 2. Consume the redirect back from the OIDC server
 *    - Process the 'code' request parameter by delegating to the `authenticationFacade.handleLoginRedirect()`
 *    - Process any login errors by redirecting to the `login-error` route forwarding the `error` and `error_description`
 */
@Component({
    template: '',
})
export class LoginComponent implements OnInit {
    constructor(
        private readonly authenticationFacade: AuthenticationFacade,
        private readonly route: ActivatedRoute,
        private readonly router: Router
    ) {}

    private readonly logger = Loggers.get('feature-login', 'LoginComponent');

    ngOnInit() {
        // After successful authentication, we will redirect to this page and the auth code will be included as a query parameter.
        if (this.route.snapshot.queryParamMap.keys.length === 0) {
            // Redirect to auth server
            this.authenticationFacade.login();
        } else {
            const authCode = this.route.snapshot.queryParamMap.get('code');
            if (authCode) {
                // If auth code is present, we have already authenticated successfully and received the code from the auth server.
                // Now, connect back and get the bearer token based on the auth code
                this.authenticationFacade
                    .handleLoginRedirect()
                    .catch((err) => this.logger.error('Error loading user profile on login redirect', err))
                    .then(() => {
                        // If an original URL has been captured before the oidc redirect, navigate to it
                        const redirect = this.authenticationFacade.getLoginRedirect();
                        if (redirect) {
                            this.router.navigate(redirect.segments, { queryParams: redirect.queryParams });
                        } else {
                            // Default to home
                            this.router.navigate(['/']);
                        }
                    })
                    .then(() => this.authenticationFacade.setLoginRedirect(null));
            } else {
                // Assume an error
                this.router.navigate(['login-error'], {
                    queryParams: {
                        error: this.route.snapshot.queryParamMap.get('error') || 'UNKNOWN',
                        error_description:
                            this.route.snapshot.queryParamMap.get('error_description') || 'An unknown error occurred',
                    },
                });
            }
        }
    }
}
