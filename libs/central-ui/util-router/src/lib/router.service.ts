import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { RouterHistoryFacade } from '@vioc-angular/shared/data-access-router-history';

/**
 * Provide some convenience routing methods for the central-ui app.
 */
@Injectable({ providedIn: 'root' })
export class RouterService {
    constructor(private readonly _router: Router, private readonly _routerHistoryFacade: RouterHistoryFacade) {}

    navigateToForbidden(): Promise<boolean> {
        return this._router.navigate(['forbidden']);
    }

    navigateToPageNotFound(): Promise<boolean> {
        return this._router.navigate(['error/page-not-found']);
    }

    navigateToPageCannotBeDisplayed(): Promise<boolean> {
        return this._router.navigate(['error']);
    }

    /** Navigating via the window will destroy the current state of the app and reload it. */
    destroyAndNavigateToPageCannotBeDisplayed(): void {
        window.location.href = '/error';
    }

    navigateToDashboard(): Promise<boolean> {
        return this._router.navigate(['dashboard']);
    }

    /** Navigate to the most recent route and revert history. */
    back(): void {
        const previousRoute = this._routerHistoryFacade.getPreviousRoute();
        if (previousRoute) {
            this._routerHistoryFacade.revertRouterHistory();
            this._router.navigateByUrl(previousRoute);
        }
    }

    navigateToLogin(): Promise<boolean> {
        return this._router.navigate(['login']);
    }

    navigateToSearchPage(route: ActivatedRoute): Promise<boolean> {
        return this._router.navigate(['search'], { relativeTo: route.parent });
    }
}
