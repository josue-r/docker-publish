import { Injectable, InjectionToken } from '@angular/core';
import { PRIMARY_OUTLET, Params, Router, RouterStateSnapshot } from '@angular/router';
import { Loggers } from '@vioc-angular/shared/common-logging';
import { User as OidcUser, UserManagerSettings } from 'oidc-client-ts';
import { Observable } from 'rxjs';
import { RoleFacade } from '../authorization/role-facade';
import { User } from '../models/user.model';
import { AuthenticationState } from './authentication-state';

/**
 * Authentication flow
 * 1. After calling the `login()` method, the oidc-client will redirect to the authorization server.
 * 2. After successful authentication, the auth server will redirect to the url specified in `UserManagerSettings.redirect_uri`.  This URL
 *    should call the `handleLoginRedirect()` method to complete the flow.
 *
 * @export
 * @class AuthenticationFacade
 */
@Injectable({ providedIn: 'root' }) // TODO: Do not provide in root.  The RoleFacade must be removed to not provide in root
export class AuthenticationFacade {
    /** @deprecated */
    public static readonly USER_MANAGER_SETTINGS_TOKEN = new InjectionToken<UserManagerSettings>(
        'USER_MANAGER_SETTINGS_INJECTION_TOKEN'
    );

    private readonly logger = Loggers.get('data-access-security', 'AuthenticationFacade');

    /** Track authentication status locally.*/
    constructor(
        private readonly router: Router,
        readonly roleFacade: RoleFacade,
        private readonly state: AuthenticationState
    ) {
        // preload auth details
        // load user & cache authentication details
        // TODO: This needs to be moved to a feature that ties these two facades together
        this.isAuthenticated() //
            .subscribe((authenticated) => (authenticated ? roleFacade.loadMyRoles() : roleFacade.clearMyRoles()));
    }

    /**  Trigger authorization code flow.  (See class level documentation.) */
    async login(): Promise<any> {
        await this.state.userManager.clearStaleState();
        return this.state.userManager.signinRedirect();
    }

    /** Handle the authorization code and exchange for a token. (See class level documentation.)*/
    handleLoginRedirect(): Promise<OidcUser> {
        return this.state.userManager
            .signinRedirectCallback() //
            .then((u) => {
                // uncomment to force expiration after 1:30 minute to test silent refresh after 30 seconds
                //TODO: How can we enable this via configuration?
                // u.expires_at = Math.floor(new Date().getTime() / 1000) + 90;
                // console.log(`expiring at ${u.expires_at}`);
                // this.state.userManager.storeUser(u);
                // this.state.userManager.stopSilentRenew();
                // this.state.userManager.startSilentRenew();
                return u;
            });
    }

    /**
     * Logs the current user out by clearing the access token out of
     * session storage.
     */
    async logout(): Promise<boolean> {
        // Check to see if the OIDC session is active.
        // If we try to end the session and the OIDC provider doesn't have an active session, an ugly JSON response will be shown to the
        //  user.
        // This is particularly useful in the situation where:
        //  1 The client machine is put into sleep/hibernate without logging out
        //  2 The OIDC Provider side session expires
        //  3 The client machine wakes backs up, then the idle timer is hit and tries to end a non-existent session.
        // This may also happen if the provider is restarted mid session.
        // This scenario can be reproduced by having two tabs open using the same OIDC session.  Logout on one and then the other.  If
        //  working properly, the second logout will redirect to home
        let activeOidcSession: boolean;
        try {
            activeOidcSession = await this.querySessionStatus();
        } catch (error) {
            this.logger.error('Error fetching session status before logout', error);
            activeOidcSession = true; // Default to true so that the logout attempt still happens
        }

        const loginPage = ['/login'];
        if (!activeOidcSession) {
            // If we are certain that the OIDC session is inactive, just redirect to the login page
            return this.router.navigate(loginPage);
        } else {
            // If we are know the OIDC session is active or are unsure, trigger the logout
            const handleLogoutError = (e) => {
                this.logger.error('Error logging out', e);
                return this.router.navigate(loginPage);
            };
            return this.state.userManager
                .signoutRedirect() //
                .then(() => {
                    this.logger.debug('Logout Successful');
                    return false;
                }, handleLogoutError);
        }
    }

    /**
     * Determines if a user is currently logged in.
     */
    isAuthenticated(): Observable<boolean> {
        return this.state.authenticated;
    }

    /**
     * Emits the User object if available and null otherwise.
     */
    getUser(): Observable<User> {
        return this.state.getUser();
    }

    /**
     * Returns a promise with the current oauth2 token or null if not present
     */
    getToken(): Promise<string> {
        return this.state.getToken();
    }

    /**
     * Register a post login redirect URL to support deep linking.  This must be done programmatically because the OIDC provider requires a
     * static url.  If the passed state is null or undefined, the redirect will be cleared.
     *
     * @param {RouterStateSnapshot} state
     * @memberof AuthenticationFacade
     */
    setLoginRedirect(state: RouterStateSnapshot) {
        if (state) {
            const segments = this.router.parseUrl(state.url).root.children[PRIMARY_OUTLET].segments.map((s) => s.path);
            const queryParams = state.root.queryParams;
            const redirect = { segments, queryParams };
            this.state.setLoginRedirect(redirect);
        } else {
            // clear
            this.state.setLoginRedirect(null);
        }
    }

    /**
     * Returns the previously registered redirect via `setLoginRedirect` or null if none registered.
     *
     * There will almost always be something registered here unless the user went directly to the oidc provider first.
     *
     * @returns
     * @memberof AuthenticationFacade
     */
    getLoginRedirect(): { segments: string[]; queryParams: Params } {
        return this.state.getLoginRedirect();
    }

    /**
     * This is a re-implementation of UserManager.querySessionStatus.  The current method will never return a response due a ForgeRock bug.
     *  - https://bugster.forgerock.org/jira/browse/OPENAM-3285
     *
     * This re-implementation removes the session status.  This is an attempt to fix Issue#5489 where attempting an endSession when
     *  ForgeRock does not have knowledge of the token in its store shows a JSON response in the browser.  This does trigger a token refresh
     *  as well which isn't ideal but the session will be immediately ended afterwards.
     *
     * @returns {Promise<boolean>} true if authenticated, false if not authenticated. Rejects if error occurs
     * @memberof AuthenticationState
     */
    async querySessionStatus(): Promise<boolean> {
        try {
            const signInResponse = await this.state.userManager.signinSilent();
            if (signInResponse.profile.sub) {
                this.logger.debug('querySessionStatus success; user is authenticated');
                return true;
            } else {
                this.logger.debug('querySessionStatus success; user not authenticated');
                return false;
            }
        } catch (error) {
            if (error.error === 'interaction_required') {
                // This happens when we can't do a silent request (requires login).  This means that an active session does not exist
                //  (likely the user is already logged out.)
                this.logger.debug('querySessionStatus error: Assuming that the we are already logged out', error);
                return false;
            }
            throw error;
        }
    }
}
