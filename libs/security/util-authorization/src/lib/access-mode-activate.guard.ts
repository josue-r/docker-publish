import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
// tslint:disable-next-line: nx-enforce-module-boundaries
import { RoleFacade } from '@vioc-angular/security/data-access-security';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AccessMode } from './models/access-mode';
import { AccessModeRoleMapping } from './models/access-mode-role-mapping';

/**
 * Validates the route based on the `AccessMode` and your security.
 *
 * In order for this guard to work, your route must be configured such that:
 * - `:accessMode` is part of your URL
 * - an object named 'acessModes' with a type of AccessModeRoleMapping is defined in your route data
 *
 * Example
 * ```ts
 *    {
 *       path: ':accessMode/:productCode',
 *       component: ProductComponent,
 *       canActivate: [AccessModeActivateGuard],
 *       data: {
 *           accessModes: {
 *               view: ['ROLE_PRODUCT_READ'],
 *               edit: ['ROLE_PRODUCT_UPDATE']
 *           } as AccessModeRoleMapping
 *       }
 *    }
 * ```
 *
 * @export
 * @class AccessModeActivateGuard
 * @implements {CanActivate}
 * @implements {CanActivateChild}
 */
@Injectable({
    providedIn: 'root',
})
export class AccessModeActivateGuard {
    constructor(private readonly roleFacade: RoleFacade, private readonly router: Router) {}

    /**@override */
    canActivate(next: ActivatedRouteSnapshot): Observable<boolean> {
        const mapping: AccessModeRoleMapping = next.data.accessModes;
        if (!mapping) {
            throw new Error(`No AccessModeActivateMapping found for route: ${next.url}.  
                             In order to use AccessModeActivateGuard, an AccessModeActivateMapping named 'accessModes' must be configured
                             in route data.`);
        }
        const accessMode: string = AccessMode.of(next.paramMap.get('accessMode')).urlSegement;
        if (!accessMode) {
            throw new Error(`No "accessMode" found in route route: ${next.url}. 
                             Update your route to include ':accessMode' as part of the path`);
        }

        const requiredRoles: string | string[] = mapping[accessMode];
        return this.hasAccess(requiredRoles).pipe(
            tap((hasAccess) => {
                if (!hasAccess) {
                    this.router.navigate(['forbidden']);
                }
            })
        );
    }

    hasAccess(requiredRoles: string | string[]) {
        if (requiredRoles && requiredRoles.length) {
            const convertedToArray: string[] = [].concat(requiredRoles);
            return this.roleFacade.hasAnyRole(convertedToArray);
        } else {
            return of(false);
        }
    }
}
