import { fakeAsync, flush } from '@angular/core/testing';
import { ActivatedRouteSnapshot, convertToParamMap, Router } from '@angular/router';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { RoleFacadeMock } from '@vioc-angular/security/data-access-security';
import { AccessModeActivateGuard } from './access-mode-activate.guard';
import { AccessMode } from './models/access-mode';
import { AccessModeRoleMapping } from './models/access-mode-role-mapping';

function routeSnapshot(accessModeInRoute: AccessMode, accessModes: AccessModeRoleMapping): ActivatedRouteSnapshot {
    return {
        paramMap: accessModeInRoute
            ? convertToParamMap({ accessMode: accessModeInRoute.urlSegement })
            : convertToParamMap({}),
        data: accessModes ? { accessModes } : {},
    } as any;
}

let guard: AccessModeActivateGuard;
let router: Router;
let roleFacade: RoleFacadeMock;

describe('AccessModeActivateGuard', () => {
    beforeEach(() => {
        router = ({ navigate: () => Promise.resolve(true) } as any) as Router;
        roleFacade = new RoleFacadeMock();
        guard = new AccessModeActivateGuard(roleFacade, router);
        jest.spyOn(router, 'navigate');
    });

    it('should throw error if "accessModes" not present in route data', () => {
        // snapshot with valid accessMode in url but no route data defined
        const snapshot = routeSnapshot(AccessMode.EDIT, undefined);

        expect(() => guard.canActivate(snapshot)).toThrowError(/No AccessModeActivateMapping found for route.*/);
    });

    it('should throw error if "accessMode" not present in url', () => {
        // snapshot with route data defined but no accessMode in url
        const snapshot = routeSnapshot(undefined, {});

        expect(() => guard.canActivate(snapshot)).toThrowError('No urlSegement passed!');
    });

    it('should emit false and route to forbidden if no roles mapped', fakeAsync(() => {
        const snapshot = routeSnapshot(AccessMode.EDIT, {});
        roleFacade.setRoles(['ROLE_FOO_EDIT', 'ROLE_BAR_EDIT']);

        guard.canActivate(snapshot).subscribe((val) => expect(val).toEqual(false));
        flush();
        expect(router.navigate).toHaveBeenCalled();
    }));

    it('should emit false and route to forbidden if empty roles mapped', fakeAsync(() => {
        const snapshot = routeSnapshot(AccessMode.EDIT, { edit: [] });
        roleFacade.setRoles(['ROLE_FOO_EDIT', 'ROLE_BAR_EDIT']);

        guard.canActivate(snapshot).subscribe((val) => expect(val).toEqual(false));
        flush();
        expect(router.navigate).toHaveBeenCalled();
    }));

    it('should emit false and route to forbidden if non-matching roles mapped', fakeAsync(() => {
        const snapshot = routeSnapshot(AccessMode.EDIT, { edit: 'ROLE_BAR_EDIT' });
        roleFacade.setRoles(['ROLE_FOO_EDIT']);

        guard.canActivate(snapshot).subscribe((val) => expect(val).toEqual(false));
        flush();
        expect(router.navigate).toHaveBeenCalled();
    }));

    it('should emit true if matching single string role mapped', fakeAsync(() => {
        const snapshot = routeSnapshot(AccessMode.EDIT, { edit: 'ROLE_FOO_EDIT' });
        roleFacade.setRoles(['ROLE_FOO_EDIT', 'ROLE_BAR_EDIT']);

        guard.canActivate(snapshot).subscribe((val) => expect(val).toEqual(true));
        flush();
        expect(router.navigate).not.toHaveBeenCalled();
    }));

    it('should emit true if multiple roles mapped with one matching', fakeAsync(() => {
        const snapshot = routeSnapshot(AccessMode.EDIT, { edit: ['ROLE_BAR_EDIT', 'ROLE_FOO_EDIT'] });
        roleFacade.setRoles(['ROLE_FOO_EDIT']);

        guard.canActivate(snapshot).subscribe((val) => expect(val).toEqual(true));
        flush();
        expect(router.navigate).not.toHaveBeenCalled();
    }));

    it('should handle access modes with dashes', fakeAsync(() => {
        const snapshot = routeSnapshot(AccessMode.ADD_LIKE, { 'add-like': ['ROLE_FOO_ADD'] } as AccessModeRoleMapping);
        roleFacade.setRoles(['ROLE_FOO_ADD']);

        guard.canActivate(snapshot).subscribe((val) => expect(val).toEqual(true));
        flush();
        expect(router.navigate).not.toHaveBeenCalled();
    }));
});
