import { Injectable, Optional } from '@angular/core';
import { AuthenticationFacade } from '@vioc-angular/security/data-access-security';
import { Observable, of } from 'rxjs';
import { defaultIfEmpty, mergeMap } from 'rxjs/operators';
import { FeatureFlagState } from './feature-flag-state';
import { DefaultOverride } from './models/default-override.enum';
import { FeatureStatus } from './models/feature-status';

@Injectable({
    providedIn: 'root',
})
export class FeatureFlagFacade {
    constructor(
        @Optional() private readonly state: FeatureFlagState,
        @Optional() private readonly authFacade: AuthenticationFacade
    ) {
        if (!state) {
            throw new Error('state not passed');
        }
        if (!authFacade) {
            throw new Error('authFacade not passed');
        }
    }

    /**
     * Allows overriding the default at this facade level.  This generally should not be used but can be useful for cases where you have a
     * common component that provides a bunch of default feature flags which should be enabled by default.
     *
     * Note, setting this property only affects this specific facade and does not affect the directive.
     */
    public overrideDefault: DefaultOverride = DefaultOverride.NOT_OVERRIDDEN;

    /**
     * Returns:
     * - `true` if the feature is explicitly enabled globally or at the user level
     * - `false` if the feature is explicitly disabled globally
     * If the feature is neither explicitly enabled nor disabled, the default is returned from the state.
     *
     * The passed `featurePath` Should be a three part string, each part separated by a ".".
     *
     * Examples:
     * - `storeService.search.mass-update`
     * - `storeService.edit.save`
     *
     * @param featurePath
     */
    isEnabled(featurePath: string): Observable<boolean> {
        return this.authFacade
            .getUser() //
            .pipe(
                defaultIfEmpty(null),
                // get the FeatureStatus for this path/user
                mergeMap((user) => this.state.getStatus(featurePath, user && user.id)),
                mergeMap((status) => {
                    switch (status) {
                        case FeatureStatus.ENABLED:
                            return of(true);
                        case FeatureStatus.DISABLED:
                            return of(false);
                        case FeatureStatus.UNSPECIFIED:
                            switch (this.overrideDefault) {
                                case DefaultOverride.ENABLED:
                                    return of(true);
                                case DefaultOverride.DISABLED:
                                    return of(false);
                                case DefaultOverride.NOT_OVERRIDDEN:
                                default:
                                    return this.state.getDefault();
                            }
                        default:
                            throw new Error(`Unhandled feature status returned.  Status ordinal value: ${status}`);
                    }
                })
            );
    }
}
