import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
// tslint:disable-next-line: nx-enforce-module-boundaries
import { RoleFacade } from '@vioc-angular/security/data-access-security';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
/**
 * Secures a url based on the user's role security. A requiredRoles array should be added to the url to
 * specify which roles the url should be secured by. Adding a role of '*' means that the user simply has
 * to have a role to access that url.
 */
@Injectable({
    providedIn: 'root',
})
export class HasRoleActivateGuard {
    constructor(private readonly roleFacade: RoleFacade, private readonly router: Router) {}

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        // check if requiredRoles has been provided
        if (next.data && next.data.requiredRoles && next.data.requiredRoles.length > 0) {
            const requiredRoles: string[] = next.data.requiredRoles;
            // check if the any role wildcard was used, if so check if user has any security
            if (requiredRoles.includes('*')) {
                return this.roleFacade.getMyRoles().pipe(
                    map((roles) => {
                        const hasRoles = roles.length > 0;
                        if (!hasRoles) {
                            this.router.navigate(['forbidden']);
                        }
                        return hasRoles;
                    })
                );
            } else {
                // specific list, check if user has any of the required roles
                return this.roleFacade
                    .hasAnyRole(requiredRoles) //
                    .pipe(
                        map((hasAccess) => {
                            if (!hasAccess) {
                                this.router.navigate(['forbidden']);
                            }
                            return hasAccess;
                        })
                    );
            }
        } else {
            throw new Error(`A requiredRoles array needs to be specified for url ${next.url}`);
        }
    }

    canActivateChild(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        return this.canActivate(next, state);
    }
}
