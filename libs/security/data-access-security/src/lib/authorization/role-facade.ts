import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RoleApi } from './role-api';
import { RoleState } from './role-state';

@Injectable({ providedIn: 'root' })
export class RoleFacade {
    private readonly api: RoleApi;

    constructor(@Inject(GATEWAY_TOKEN) gateway: string, http: HttpClient, protected readonly state: RoleState) {
        this.api = new RoleApi(gateway, { http });
    }

    /**
     * Returns all role names that are assigned to the current authenticated user.
     */
    getMyRoles(): Observable<string[]> {
        return this.state.myRoles;
    }

    /**
     * Reloads the `RoleFacade.myRoles()` from the API.  If you care about the result, you should be subscribed to `getMyRoles()`.
     *
     * @memberof RoleFacade
     */
    loadMyRoles(): Promise<string[]> {
        return this.api
            .myRoles()
            .pipe(
                map((roles) => {
                    this.state.updateMyRoles(roles);
                    return roles;
                })
            )
            .toPromise();
    }

    /**
     * Resets the roles.  After executing this method, you will have no security.
     *
     * @memberof RoleFacade
     */
    clearMyRoles(): void {
        this.state.clearMyRoles();
    }

    /**
     * Returns an observable of `true` if any of the request roles are present for this user.
     *
     * @param {string[]} roles
     * @returns {Observable<boolean>}
     * @memberof RoleFacade
     */
    hasAnyRole(roles: string[]): Observable<boolean> {
        return this.getMyRoles() //
            .pipe(map((actualRoles) => roles.some((r) => actualRoles.some((actual) => r === actual))));
    }
}
