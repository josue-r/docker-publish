import { fakeAsync, flush } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthenticationFacade, User } from '@vioc-angular/security/data-access-security';
import { FeatureFlagFacade } from '@vioc-angular/shared/data-access-feature-flag';

import { Observable, of, throwError } from 'rxjs';

import { FeatureFlagActivateGuard } from './feature-flag-activate.guard';

describe('FeatureFlagActivate.Guard.Spec.TsService', () => {
    let guard: FeatureFlagActivateGuard;
    let router: Router;
    let facade: FeatureFlagFacade;
    let authFacadeStub: AuthenticationFacade;
    let state: any;

    beforeEach(() => {
        router = ({ navigate: jest.fn() } as any) as Router;

        authFacadeStub = {
            getUser: () => throwError('getUser not mocked') as Observable<User>,
        } as AuthenticationFacade;

        state = {
            getStatus: () => throwError('getUser not mocked') as Observable<any>,
        } as any;

        facade = new FeatureFlagFacade(state, authFacadeStub);

        guard = new FeatureFlagActivateGuard(facade, router);

        // Create spys
        jest.spyOn(router, 'navigate');
    });

    it('should not call router navigate when feature flag is enabled', fakeAsync(() => {
        jest.spyOn(facade, 'isEnabled').mockReturnValue(of(true));

        const route: ActivatedRouteSnapshot = ({
            data: { featureFlag: 'a.b.c' },
        } as any) as ActivatedRouteSnapshot;

        guard
            .canActivate(route) //
            .subscribe((flag) => {
                expect(flag).toEqual(true);
                expect(facade.isEnabled).toHaveBeenCalledWith('a.b.c');
                expect(router.navigate).not.toHaveBeenCalled();
            });
        flush();
    }));

    it('should call router navigate (block route) when feature flag is disabled', fakeAsync(() => {
        jest.spyOn(facade, 'isEnabled').mockReturnValue(of(false));

        const route: ActivatedRouteSnapshot = ({
            data: { featureFlag: 'a.b.c' },
        } as any) as ActivatedRouteSnapshot;

        guard
            .canActivate(route) //
            .subscribe((flag) => {
                expect(flag).toEqual(false);
                expect(facade.isEnabled).toHaveBeenCalledWith('a.b.c');
                expect(router.navigate).toHaveBeenCalled();
            });
        flush();
    }));

    it('should not call router navigate when no feature flag is provided at the route level', fakeAsync(() => {
        jest.spyOn(facade, 'isEnabled').mockReturnValue(of(false));

        // no data element present with feature flag
        const route: ActivatedRouteSnapshot = ({} as any) as ActivatedRouteSnapshot;

        guard
            .canActivate(route) //
            .subscribe((flag) => {
                expect(flag).toEqual(true);
                expect(facade.isEnabled).not.toHaveBeenCalled();
                expect(router.navigate).not.toHaveBeenCalled();
            });
        flush();
    }));
});
