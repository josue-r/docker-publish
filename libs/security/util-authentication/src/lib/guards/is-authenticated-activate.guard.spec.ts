import { Router } from '@angular/router';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
//  This component needs to be moved to a shared feature and this rule is fixed
// tslint:disable-next-line: nx-enforce-module-boundaries
import { AuthenticationFacade } from '@vioc-angular/security/data-access-security';
import { of } from 'rxjs';
import { IsAuthenticatedActivateGuard } from './is-authenticated-activate.guard';

describe('IsAuthenticatedActivateGuard', () => {
    let authenticationFacade: AuthenticationFacade;
    let isAuthenticatedActivateGuard: IsAuthenticatedActivateGuard;
    let router: Router;

    beforeEach(() => {
        authenticationFacade = {
            isAuthenticated() {},
            setLoginRedirect() {},
        } as any;
        router = { navigate: () => {} } as any;
        isAuthenticatedActivateGuard = new IsAuthenticatedActivateGuard(authenticationFacade, router);
    });

    it('should create', () => {
        expect(isAuthenticatedActivateGuard).toBeTruthy();
    });

    describe('when user is not logged in', () => {
        beforeEach(() => {
            jest.spyOn(authenticationFacade, 'isAuthenticated').mockReturnValue(of(false));
        });

        it('should return false', async () => {
            const canActivate = await isAuthenticatedActivateGuard.canActivate(null, null).toPromise();
            expect(canActivate).toEqual(false);
        });

        it('should navigate to login page', async () => {
            jest.spyOn(router, 'navigate');
            jest.spyOn(authenticationFacade, 'setLoginRedirect');
            await isAuthenticatedActivateGuard.canActivate(null, null).toPromise();
            expect(router.navigate).toHaveBeenCalledWith(['login']);
            expect(authenticationFacade.setLoginRedirect).toHaveBeenCalled();
        });
    });

    describe('when user is logged in', () => {
        beforeEach(() => {
            jest.spyOn(authenticationFacade, 'isAuthenticated').mockReturnValue(of(true));
        });

        it('should return true', async () => {
            const canActivate = await isAuthenticatedActivateGuard.canActivate(null, null).toPromise();
            expect(canActivate).toEqual(true);
        });
    });
});
