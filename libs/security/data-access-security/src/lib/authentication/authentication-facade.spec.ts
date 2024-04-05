import { fakeAsync } from '@angular/core/testing';
import {
    Params,
    PRIMARY_OUTLET,
    Router,
    RouterStateSnapshot,
    UrlSegment,
    UrlSegmentGroup,
    UrlTree,
} from '@angular/router';
import { of } from 'rxjs';
import { RoleFacade } from '../authorization/role-facade';
import { AuthenticationFacade } from './authentication-facade';
import { AuthenticationState } from './authentication-state';

describe('AuthenticationFacade', () => {
    let authenticationFacade: AuthenticationFacade;
    let state: AuthenticationState;
    let router: Router;
    let roleFacade: RoleFacade;

    beforeEach(() => {
        router = { navigate: () => {}, parseUrl: () => {} } as any;
        roleFacade = {
            loadMyRoles: () => Promise.resolve([]),
            clearMyRoles: () => {},
            getMyRoles: () => of([]),
        } as RoleFacade;
        jest.spyOn(roleFacade, 'loadMyRoles');
        jest.spyOn(roleFacade, 'clearMyRoles');
        jest.spyOn(roleFacade, 'getMyRoles');
        state = new AuthenticationState(
            { authority: 'test', client_id: 'test', redirect_uri: 'test', silent_redirect_uri: 'test' },
            null
        );
        authenticationFacade = new AuthenticationFacade(router, roleFacade, state);
    });

    it('should be created', () => {
        expect(authenticationFacade).toBeTruthy();
    });

    describe('login', () => {
        it('should defer to oidc-client to trigger reidrect', async () => {
            jest.spyOn(state.userManager, 'clearStaleState').mockImplementation(() => Promise.resolve(undefined));
            jest.spyOn(state.userManager, 'signinRedirect').mockImplementation(() => Promise.resolve(undefined));

            expect(await authenticationFacade.login());

            expect(state.userManager.clearStaleState).toHaveBeenCalled();
            expect(state.userManager.signinRedirect).toHaveBeenCalled();
        });
    });

    describe('handleLoginRedirect', () => {
        it('should defer to oidc-client', async () => {
            jest.spyOn(state.userManager, 'signinRedirectCallback').mockImplementation(() =>
                Promise.resolve(undefined)
            );

            expect(await authenticationFacade.handleLoginRedirect());

            expect(state.userManager.signinRedirectCallback).toHaveBeenCalled();
        });
    });

    describe('logout', () => {
        it('should end oidc session and redirect to home', fakeAsync(async () => {
            jest.spyOn(state.userManager, 'signoutRedirect').mockImplementation(() => Promise.resolve(undefined));

            const logoutStatus = await authenticationFacade.logout();
            expect(logoutStatus).toBeFalsy();
            expect(state.userManager.signoutRedirect).toHaveBeenCalled();
        }));

        it('should still redirect to home if logic session fails', async () => {
            jest.spyOn(state.userManager, 'signoutRedirect').mockImplementation(() =>
                Promise.reject('Simulating Error')
            );
            jest.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));

            await authenticationFacade.logout();

            expect(router.navigate).toHaveBeenCalled();
            expect(state.userManager.signoutRedirect).toHaveBeenCalled();
        });
    });

    describe('setLoginRedirect', () => {
        const createSnapshot = (url: string, queryParams: Params) => {
            return {
                url,
                root: { queryParams },
            } as RouterStateSnapshot;
        };

        function createUrlTree(...urls: string[]): UrlTree {
            const children: UrlSegmentGroup = {} as any;
            children[PRIMARY_OUTLET] = {
                segments: urls.map((url) => new UrlSegment(url, {})),
            } as UrlSegmentGroup;
            const tree: UrlTree = {
                root: { children } as any,
                queryParams: undefined,
                queryParamMap: undefined,
                fragment: undefined,
                toString: () => urls.toString(),
            };
            return tree;
        }

        it('should capture the state if passed', () => {
            const snapshot = createSnapshot('foo/bar?baz=qux', { baz: 'qux' });
            jest.spyOn(router, 'parseUrl').mockReturnValue(createUrlTree('foo', 'bar'));
            jest.spyOn(state, 'setLoginRedirect');

            authenticationFacade.setLoginRedirect(snapshot);

            expect(state.setLoginRedirect).toHaveBeenCalledWith({
                segments: ['foo', 'bar'],
                queryParams: { baz: 'qux' },
            });
        });

        it('should handle null router snapshot', () => {
            jest.spyOn(state, 'setLoginRedirect');

            authenticationFacade.setLoginRedirect(null);

            expect(state.setLoginRedirect).toHaveBeenCalledWith(null);
        });
    });

    describe('querySessionStatus', () => {
        let signinSilentSpy: jest.SpyInstance<Promise<any>>;

        beforeEach(() => {
            signinSilentSpy = jest.spyOn(state.userManager, 'signinSilent');
        });

        it('should return true if signed in', async () => {
            signinSilentSpy.mockResolvedValue({ profile: { sub: 'v123456' } }); // Only care that it resolves
            await expect(authenticationFacade.querySessionStatus()).resolves.toEqual(true);
            expect(signinSilentSpy).toHaveBeenCalled();
        });

        it('should reject if signinSilent error occurs', async () => {
            signinSilentSpy.mockRejectedValue('I Broke');
            await expect(authenticationFacade.querySessionStatus()).rejects.toBe('I Broke');
            expect(signinSilentSpy).toHaveBeenCalled();
        });

        it('should return false if signInSilent indicates not signed in', async () => {
            signinSilentSpy.mockResolvedValue({}).mockRejectedValue({ error: 'interaction_required' });
            await expect(authenticationFacade.querySessionStatus()).resolves.toEqual(false);
            expect(signinSilentSpy).toHaveBeenCalled();
        });

        it('should reject if signInSilent error occurs besides not being authenticated', async () => {
            signinSilentSpy.mockResolvedValue({}).mockRejectedValue({ error: 'I broke' });
            await expect(authenticationFacade.querySessionStatus()).rejects.toEqual({ error: 'I broke' });
            expect(signinSilentSpy).toHaveBeenCalled();
        });

        it('should reject if signinResponse is present but profile is not', async () => {
            signinSilentSpy.mockResolvedValue({}); // Only care that it resolves

            await expect(authenticationFacade.querySessionStatus())
                .rejects //
                .toThrowError();
            expect(signinSilentSpy).toHaveBeenCalled();
        });
    });
});
