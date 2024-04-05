import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { FeatureFlagFacade } from '@vioc-angular/shared/data-access-feature-flag';
import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { FeatureFeatureFlagModule } from './feature-feature-flag.module';

@Injectable({
    providedIn: FeatureFeatureFlagModule,
})
export class FeatureFlagActivateGuard {
    constructor(private readonly featureFlagFacade: FeatureFlagFacade, private readonly router: Router) {}

    canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        return this.canActivate(childRoute);
    }

    canActivate(nextRoute: ActivatedRouteSnapshot): Observable<boolean> {
        if (nextRoute.data?.featureFlag) {
            const featureFlagPath = nextRoute.data.featureFlag;

            return this.featureFlagFacade.isEnabled(featureFlagPath).pipe(
                map((flag) => {
                    if (!flag) {
                        // TODO: If another application changes the route any time in future, then it would have to be made configurable
                        // i.e. rather than passing route url below, will have to be auto configured by fetching as some property
                        //block the route if the feature flag is set to false
                        this.router.navigate(['error/page-not-found']);
                    }
                    return flag;
                })
            );
        } else {
            return of(true);
        }
    }
}
