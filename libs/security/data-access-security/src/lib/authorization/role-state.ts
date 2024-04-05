import { Injectable } from '@angular/core';
import { Loggers } from '@vioc-angular/shared/common-logging';
import { ReplaySubject } from 'rxjs';
import { filter } from 'rxjs/operators';

/**
 * State management for `RoleFacade`.
 *
 * @export
 * @class RoleState
 */
@Injectable({ providedIn: 'root' })
export class RoleState {
    /** Subscribable Observable to track role changes */
    private _myRoles$ = new ReplaySubject<string[]>(1);
    private _myCachedRoles: string[] = [];
    private readonly logger = Loggers.get('data-access-security', 'RoleState');

    constructor() {
        this._myRoles$.subscribe((r) => {
            // Use undefined to track whether or not roles have been loaded.
            if (r) {
                this._myCachedRoles = r;
            } else {
                this._myCachedRoles = [];
            }
        });
    }

    /** Replaces the `myRoles` with the passed values and emits to any observers. */
    updateMyRoles(roles: string[]) {
        this.logger.debug('Updating roles', roles);
        this._myRoles$.next(roles);
    }

    /**
     * Clears all roles and emits to any observers of `myRoles`. After calling this method, `myRoles` will emit an empty array but after
     * that, will no longer emit until `updateMyRoles()` is called with a defined array of roles.
     */
    clearMyRoles() {
        this.logger.debug('Clearing roles');
        this.updateMyRoles([]);
        this.updateMyRoles(undefined);
    }

    /** Subscribable access to role changes. Does not emit anything util `updateMyRoles()` is called and stops emitting after `clearMyRoles()`
     * is called `updateMyRoles()` is called again */
    get myRoles() {
        return this._myRoles$.asObservable().pipe(
            // Wait until we have updated roles
            filter((r) => r !== undefined)
        );
    }

    /** Gets the last role array emitted to `myRoles`.*/
    get myCachedRoles() {
        return this._myCachedRoles;
    }
}
