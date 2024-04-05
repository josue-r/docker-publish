import { fakeAsync, flush } from '@angular/core/testing';
import { mockStorage } from '@vioc-angular/test/util-test';
import { User as OidcClientUser } from 'oidc-client-ts';
import { LoginRedirect } from '../models/login-redirect.model';
import { AuthenticationState, LOGIN_REDIRECT_KEY } from './authentication-state';

describe('AuthenticationState', () => {
    let state: AuthenticationState;

    beforeEach(() => {
        state = new AuthenticationState({ authority: 'test', client_id: 'test', redirect_uri: 'test' }, null);
        window.sessionStorage.clear();
    });

    describe('constructor', () => {
        it('should create an instance if one does not exist', () => {
            expect(
                new AuthenticationState({ authority: 'test', client_id: 'test', redirect_uri: 'test' }, null)
            ).toBeTruthy();
        });
        it('should throw an error if an existing instance is injected', () => {
            const existingState = new AuthenticationState(
                { authority: 'test', client_id: 'test', redirect_uri: 'test' },
                null
            );
            expect(
                () =>
                    new AuthenticationState(
                        { authority: 'test', client_id: 'test', redirect_uri: 'test' },
                        existingState
                    )
            ).toThrowError();
        });
    });

    describe('event: loading a user', () => {
        const isAuthenticated = () => state['_authenticated'].value;
        describe('if NOT expired', () => {
            it('should mark as authenticated and load authorities', fakeAsync(() => {
                expect(isAuthenticated()).toBeUndefined();
                const user: OidcClientUser = {
                    expired: false,
                    profile: { given_name: 'Test', family_name: 'User' },
                } as any;
                state.userManager.events.load(user);

                expect(isAuthenticated()).toEqual(true);
                expect(state['_user'].value.name).toEqual('Test User');
            }));
        });
        describe('if expired', () => {
            it('should mark as unauthenticated', () => {
                expect(isAuthenticated()).toBeUndefined();
                const user: OidcClientUser = { expired: true } as any;
                state.userManager.events.load(user);

                expect(isAuthenticated()).toEqual(false);
                expect(state['_user'].value).toBeUndefined();
            });
        });
    });

    describe('event: unloading a user', () => {
        it('should mark as unauthenticated & clear all state', () => {
            // load a user
            state.userManager.events.load({ expired: false } as any);

            // create some state
            mockStorage({ foo: 'bar' });

            // verify preconditions
            expect(state['_authenticated'].value).toEqual(true);
            expect(window.sessionStorage.getItem('foo')).toBe('bar');

            // then unload it
            state.userManager.events.unload();

            // verify unload event
            expect(state['_authenticated'].value).toEqual(false);
            expect(window.sessionStorage.getItem('foo')).toBeNull();
        });
    });

    describe('isAuthenticated', () => {
        describe.each`
            userInStorage             | authenticated | description
            ${{ expired: false }}     | ${true}       | ${'an unexpired user is present in storage'}
            ${{ expired: true }}      | ${false}      | ${'an expired user is present in storage'}
            ${{ expired: undefined }} | ${false}      | ${'the user is present in storage but expired is not set'}
            ${null}                   | ${false}      | ${'the user is not present (null) in storage'}
            ${undefined}              | ${false}      | ${'the user is not present (undefined) in storage'}
        `('if the user is not loaded', ({ userInStorage, authenticated, description }) => {
            it(`should emit ${authenticated} if ${description}`, fakeAsync(() => {
                jest.spyOn(state.userManager, 'getUser') //
                    .mockReturnValue(Promise.resolve(userInStorage));

                // isAuthenticated() is called in the constructor.  We need to reset it so that it is not initialized
                state['_authenticated'].next(undefined);

                let isAuthenticated: boolean;
                state.authenticated.subscribe((a) => (isAuthenticated = a));
                flush();
                expect(isAuthenticated).toBe(authenticated);
                expect.assertions(1);
            }));
        });
    });
    describe('getUser', () => {
        it('should emit the user if present', () => {
            const oidcUser: OidcClientUser = {
                id_token: 'some-id',
                access_token: '3027fa67-7b7d-41e7-b34d-c56b41b63b3f',
                token_type: 'Bearer',
                scope: 'openid profile email',
                profile: {
                    sub: 'a325230',
                    auditTrackingId: 'a07a2cb9-613b-4fa6-ba22-31bd2cc4c761-27898',
                    tokenName: 'id_token',
                    'org.forgerock.openidconnect.ops': '4b5ed6e9-dba9-4db1-80e2-f5131e3a2c87',
                    azp: 'VIOCUI',
                    auth_time: 1579112092,
                    realm: '/valvoline',
                    tokenType: 'JWTToken',
                    name: 'Joseph Feldman',
                    given_name: 'Joseph',
                    family_name: 'Feldman',
                    email: 'JLFeldman@valvoline.com',
                },
                expires_at: 1579112757,
            } as any;
            state['updateUser'](oidcUser);

            expect(state['_user'].value).toEqual({
                id: 'a325230',
                name: 'Joseph Feldman',
                firstName: 'Joseph',
                lastName: 'Feldman',
                email: 'JLFeldman@valvoline.com',
                realm: '/valvoline',
            });
        });

        it('should emit null if the is user is not loaded', () => {
            expect(state['_user'].value).toBeUndefined();
        });
    });

    describe('getToken', () => {
        it('should return null if the OidcUser is not set', async () => {
            jest.spyOn(state['_userManager'], 'getUser').mockReturnValue(Promise.resolve(null));

            expect(await state.getToken()).toBeNull();
        });
        it('should return null if the OidcUser is set but does not have a token', async () => {
            jest.spyOn(state['_userManager'], 'getUser').mockReturnValue(
                Promise.resolve({ access_token: null } as any)
            );

            expect(await state.getToken()).toBeNull();
        });
        it('should return the token if the OidcUser is set and has a token', async () => {
            jest.spyOn(state['_userManager'], 'getUser').mockReturnValue(
                Promise.resolve({ access_token: 'foo' } as any)
            );

            expect(await state.getToken()).toEqual('foo');
        });
    });

    describe('setLoginRedirect', () => {
        it('should capture the state if passed', () => {
            const loginRedirect: LoginRedirect = { segments: ['foo', 'bar'], queryParams: { baz: 'qux' } };
            state.setLoginRedirect(loginRedirect);

            expect(state.getLoginRedirect()).toEqual(loginRedirect);
        });

        it('should clear the state if not passed', () => {
            const loginRedirect: LoginRedirect = { segments: ['foo', 'bar'], queryParams: { baz: 'qux' } };
            state.setLoginRedirect(loginRedirect);
            // precondition: redirect set
            expect(state.getLoginRedirect()).toEqual(loginRedirect);

            // clear
            state.setLoginRedirect(null);

            // validate cleared
            expect(state.getLoginRedirect()).toBeNull();
        });
    });

    describe('getLoginRedirect', () => {
        it('should return the state if set', () => {
            window.sessionStorage.setItem(LOGIN_REDIRECT_KEY, '{"segments":["foo","bar"],"queryParams":{"baz":"qux"}}');

            expect(state.getLoginRedirect()).toEqual({
                segments: ['foo', 'bar'],
                queryParams: { baz: 'qux' },
            });
        });

        it('should return null if not set', () => {
            expect(state.getLoginRedirect()).toBeNull();
        });
    });
});
