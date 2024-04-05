import { fakeAsync, flush } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { RoleFacadeMock } from '@vioc-angular/security/data-access-security';
import { of } from 'rxjs';
import { HasRoleActivateGuard } from './has-role-activate.guard';

describe('HasRoleActiveGuard', () => {
    let hasRoleActiveGuard: HasRoleActivateGuard;
    let router: Router;
    let roleFacade: RoleFacadeMock;

    beforeEach(() => {
        router = ({ navigate: () => Promise.resolve(true) } as any) as Router;
        roleFacade = new RoleFacadeMock();
        hasRoleActiveGuard = new HasRoleActivateGuard(roleFacade, router);

        // Create spys
        jest.spyOn(router, 'navigate');
    });

    const activatedRouteSnapshot = (...roles: string[]): ActivatedRouteSnapshot => {
        const snapshot = new ActivatedRouteSnapshot();
        if (roles) {
            snapshot.data = { requiredRoles: roles };
        }
        return snapshot;
    };

    describe('with specific role security', () => {
        it('canActivate should allow if having roles', fakeAsync(() => {
            roleFacade.setRoles(['ROLE_READ']);

            hasRoleActiveGuard
                .canActivate(activatedRouteSnapshot('ROLE_READ'), null) //
                .subscribe((hasAccess) => {
                    expect(hasAccess).toEqual(true);
                    expect(router.navigate).not.toHaveBeenCalled();
                });
            flush();
        }));

        it('canActivate should deny and redirect if not having correct roles', fakeAsync(() => {
            roleFacade.setRoles(['ROLE_JUNK']);

            hasRoleActiveGuard
                .canActivate(activatedRouteSnapshot('ROLE_READ'), null) //
                .subscribe((hasAccess) => {
                    expect(hasAccess).toEqual(false);
                    expect(router.navigate).toHaveBeenCalled();
                });
            flush();
        }));
    });

    describe('with any role security', () => {
        it('should allow user with any roles', fakeAsync(() => {
            roleFacade.setRoles(['ANY_ROLE']);

            hasRoleActiveGuard.canActivate(activatedRouteSnapshot('*'), null).subscribe((hasAccess) => {
                expect(hasAccess).toBeTruthy();
                expect(router.navigate).not.toHaveBeenCalled();
            });
            flush();
        }));

        it('should deny user with no roles', fakeAsync(() => {
            roleFacade.setRoles([]);

            hasRoleActiveGuard.canActivate(activatedRouteSnapshot('*'), null).subscribe((hasAccess) => {
                expect(hasAccess).toBeFalsy();
                expect(router.navigate).toHaveBeenCalled();
            });
            flush();
        }));
    });

    it('should throw an error with no role security defined', () => {
        roleFacade.setRoles([]);

        expect(() => hasRoleActiveGuard.canActivate(activatedRouteSnapshot(), null)).toThrow();
    });

    it('canActivateChild should delegate to canActivate', fakeAsync(() => {
        roleFacade.setRoles(['ROLE_READ']);
        const spyCanActivate = jest.spyOn(hasRoleActiveGuard, 'canActivate').mockReturnValue(of(true));

        hasRoleActiveGuard
            .canActivate(activatedRouteSnapshot('ROLE_READ'), null)
            .subscribe((hasAccess) => expect(hasAccess).toEqual(true));
        expect(spyCanActivate).toHaveBeenCalled();
    }));
});
