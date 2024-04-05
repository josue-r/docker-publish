# data-access-security

This library was generated with [Nx](https://nx.dev).

## RoleFacade

Declares the `RoleFacade` for accessing roles against the API.

## AuthenticationFacade

Declares the OIDC `AuthenticationFacade`.

To configure, an instance of `UserManagerSettings` must be provied with an injection token of `USER_MANAGER_SETTINGS_TOKEN`. This is generally done in the `AppModule`.

Example:

```ts
@NgModule({
    //...
    providers: [
        //...
        // Gateway token required for OAuth2Interceptor
        { provide: GATEWAY_TOKEN, useValue: environment.gateway },
        // Intercepts and adds bearer token to all calls to our APIs
        { provide: HTTP_INTERCEPTORS, useClass: OAuth2Interceptor },
        {
            provide: USER_MANAGER_SETTINGS_TOKEN,
            useValue: {
                client_id: 'VIOCUI',
                scope: 'openid profile email',
                response_type: 'code',
                redirect_uri: `${window.location.origin}/login`,
                silent_redirect_uri: `${window.location.origin}/assets/oidc-client-slient-refresh.html`,
                automaticSilentRenew: true,
                userStore: new WebStorageStateStore({ store: window.sessionStorage }),
                stateStore: new WebStorageStateStore({ store: window.sessionStorage }),

                // Environment level override of defaults.  This should always have the authority property defined
                ...environment.oidc,
            } as UserManagerSettings,
            // ...
        },
    ],
    //...
})
export class AppModule {}
```

## Running unit tests

Run `nx test data-access-security` to execute the unit tests.
