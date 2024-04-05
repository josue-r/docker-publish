import { Inject, Injectable, InjectionToken, Optional, SkipSelf } from '@angular/core';
import { Loggers } from '@vioc-angular/shared/common-logging';
import { Log, User as OidcUser, UserManager, UserManagerSettings } from 'oidc-client-ts';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { LoginRedirect } from '../models/login-redirect.model';
import { User } from '../models/user.model';

export const USER_MANAGER_SETTINGS_TOKEN = new InjectionToken<UserManagerSettings>(
    'USER_MANAGER_SETTINGS_INJECTION_TOKEN'
);
export const LOGIN_REDIRECT_KEY = 'com.vioc.data-access-security.authentication-state.login-redirect';

@Injectable({ providedIn: 'root' })
export class AuthenticationState {
    private _userManager: UserManager;

    private _authenticated: BehaviorSubject<boolean> = new BehaviorSubject(undefined);
    private _user: BehaviorSubject<User> = new BehaviorSubject(undefined);
    private _storage = window.sessionStorage;

    constructor(
        @Inject(USER_MANAGER_SETTINGS_TOKEN) userManagerSettings: UserManagerSettings,
        @Optional() @SkipSelf() existingState: AuthenticationState
    ) {
        if (existingState) {
            throw new Error('The AuthenticationState should be a singleton since it is provided at root');
        }
        this._userManager = new UserManager(userManagerSettings);
        // Configure logging.
        Log.setLogger(Loggers.get('oidc-client-ts', 'UserManager'));
        Log.setLevel(Log.DEBUG); // Make most chatty so that our Logger can intercept all the messages

        // Handle login and refresh
        this._userManager.events.addUserLoaded((u) => {
            // This should trigger an unload if expired. (all state cleared there)
            const authenticated = u && u.expired === false;
            this._authenticated.next(authenticated);
            this.updateUser(u);
        });

        // Handles expiring & logouts
        this._userManager.events.addUserUnloaded(() => {
            this._authenticated.next(false);
            this.updateUser(undefined);
            this.clearSession();
        });
    }

    public get authenticated() {
        return this._authenticated
            .asObservable() //
            .pipe(
                //
                switchMap((authenticated) => {
                    if (authenticated === undefined) {
                        // If we don't know whether or not we are authenticated, try to get the user from the user manager to determine
                        return from(this._userManager.getUser()) //
                            .pipe(
                                switchMap((user) => {
                                    if (user && user.expired === false) {
                                        // If the user is present and not expired, load it and initialize this._authenticated to true
                                        this._userManager.events.load(user);
                                        this._authenticated.next(true);
                                    } else {
                                        // otherwise, just initialize this._authenticated to false
                                        this._authenticated.next(false);
                                    }
                                    return this._authenticated.asObservable();
                                })
                            );
                    } else {
                        return of(authenticated);
                    }
                })
            );
    }

    /**
     * Emits the User object if available and null otherwise.
     */
    getUser(): Observable<User> {
        return this._user.asObservable();
    }

    /**
     * Returns a promise with the current oauth2 token or null if not present
     */
    getToken(): Promise<string> {
        return this._userManager.getUser().then((u) => (u && u.access_token) || null);
    }

    public get userManager() {
        return this._userManager;
    }

    private updateUser(oidcUser: OidcUser) {
        if (!oidcUser || !oidcUser.profile) {
            this._user.next(undefined);
        } else {
            const user: User = {
                id: oidcUser.profile.sub,
                name: `${oidcUser.profile.given_name} ${oidcUser.profile.family_name}`,
                firstName: oidcUser.profile.given_name,
                lastName: oidcUser.profile.family_name,
                email: oidcUser.profile.email,
                realm: oidcUser.profile.realm as string,
            };
            this._user.next(user);
        }
    }

    /**
     * Clears the current session storage.
     */
    private clearSession(): void {
        sessionStorage.clear();
    }

    /**
     * Register a post login redirect URL to support deep linking.  This must be done programmatically because the OIDC provider requires a
     * static url.  If the passed state is null or undefined, the redirect will be cleared.
     *
     * @param {RouterStateSnapshot} state
     * @memberof AuthenticationState
     */
    setLoginRedirect(loginRedirect: LoginRedirect | null) {
        if (loginRedirect) {
            this._storage.setItem(LOGIN_REDIRECT_KEY, JSON.stringify(loginRedirect));
        } else {
            // clear
            this._storage.removeItem(LOGIN_REDIRECT_KEY);
        }
    }
    /**
     * Returns the previously registered redirect via `setLoginRedirect` or null if none registered
     *
     * @returns
     * @memberof AuthenticationState
     */
    getLoginRedirect(): LoginRedirect {
        const redirect = this._storage.getItem(LOGIN_REDIRECT_KEY);
        if (redirect) {
            return JSON.parse(redirect);
        }
        return null; // unlikely to ever return null unless people to go to directly to forgerock first
    }
}
