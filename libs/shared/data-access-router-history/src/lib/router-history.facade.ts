import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { RouterHistoryState } from './router-history.state';

/**
 * Keeping track of router navigations. This is provided in root because it should be a singleton.
 * We only need one of these tracking the router history state.
 */
@Injectable({ providedIn: 'root' })
export class RouterHistoryFacade {
    constructor(private readonly _state: RouterHistoryState, router: Router) {
        // Adding current route to the history and setting up a listener to add future routes.
        this.addRouterHistory(router.url);
        router.events
            .pipe(filter((event) => event instanceof NavigationEnd))
            .subscribe((event: NavigationEnd) => this.addRouterHistory(event.url));
    }

    getRouterHistory(): Observable<string[]> {
        return this._state.routerHistory;
    }

    /** Append a route to the router history */
    addRouterHistory(route: string): void {
        this._state.updateRouterHistory(this._state.cachedRouterHistory.concat(route));
    }

    /** Get the 2nd most recent route in the history. Most recent will be the current route. */
    getPreviousRoute(): string {
        let previousRoute: string;
        if (this._state.cachedRouterHistory.length >= 2) {
            previousRoute = this._state.cachedRouterHistory[this._state.cachedRouterHistory.length - 2];
        }
        return previousRoute;
    }

    /**
     * Remove routes from the history starting at most recent. Defaults to 2 to remove the
     * current and previous route which is useful for a 'back' functionality.
     */
    revertRouterHistory(numOfRoutes = 2): void {
        this._state.updateRouterHistory(this._state.cachedRouterHistory.slice(0, numOfRoutes * -1));
    }
}
