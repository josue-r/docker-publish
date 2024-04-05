import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
//  This component needs to be moved to a shared feature and this rule is fixed
// tslint:disable-next-line: nx-enforce-module-boundaries
import { AuthenticationFacade } from '@vioc-angular/security/data-access-security';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class IsAuthenticatedActivateGuard {
    constructor(private readonly authenticationFacade: AuthenticationFacade, private readonly router: Router) {}

    canActivate(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        return this.authenticationFacade.isAuthenticated().pipe(
            map((isAuthenticated) => {
                if (!isAuthenticated) {
                    // capture url and redirect back to this page after logging in.
                    this.authenticationFacade.setLoginRedirect(state);
                    this.router.navigate(['login']);
                }
                return isAuthenticated;
            })
        );
    }

    canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        return this.canActivate(childRoute, state);
    }
}
