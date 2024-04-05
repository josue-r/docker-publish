import { Inject, Injectable } from '@angular/core';
import { FeatureConfiguration, FEATURE_CONFIGURATION_TOKEN } from '@vioc-angular/shared/common-feature-flag';
import { Loggers } from '@vioc-angular/shared/common-logging';
import { get, isArray, isBoolean, isObject, upperCase } from 'lodash';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { FeatureStatus } from './models/feature-status';

@Injectable({ providedIn: 'root' })
export class FeatureFlagState {
    logger = Loggers.get('data-access-feature-flag', 'FeatureFlagState');

    /** Holds the configuration.  Initially deny-all */
    private readonly config: BehaviorSubject<FeatureConfiguration> = new BehaviorSubject({
        default: false, // In case nothing is supplied, default to disabled
        features: {},
    } as FeatureConfiguration);

    constructor(@Inject(FEATURE_CONFIGURATION_TOKEN) readonly configuration: Observable<FeatureConfiguration>) {
        // Load the config
        configuration
            .pipe(
                // ignore empty config
                filter((config) => {
                    if (config) {
                        return true;
                    } else {
                        this.logger.warn('Empty feature flag configuration passed.  Using defaults');
                        return false;
                    }
                }),
                map((config) => ({ default: false, features: {}, ...config })),
                tap((config) => this.logger.debug('Loaded feature flag config:', config))
            )
            .subscribe((config) => this.loadConfiguration(config));
    }

    /**
     * Returns:
     * -`FeatureStatus.ENABLED` if the feature is explicitly enabled for all users OR the passed user
     * -`FeatureStatus.ENABLED` if the feature is explicitly disabled for all users
     * -`FeatureStatus.UNSPECIFIED` if it's not explicitly set or the configuration is invalid
     */
    getStatus(featurePath: string, userId?: string): Observable<FeatureStatus> {
        return this.config.asObservable().pipe(
            map((config) => {
                // valid values are boolean and string[]
                const value = get(config.features, featurePath);
                if (isBoolean(value)) {
                    return value ? FeatureStatus.ENABLED : FeatureStatus.DISABLED;
                } else if (userId && isArray(value)) {
                    const allowedUsers = value.map((v) => upperCase(v));
                    return allowedUsers.includes(upperCase(userId)) ? FeatureStatus.ENABLED : FeatureStatus.DISABLED;
                } else {
                    return FeatureStatus.UNSPECIFIED;
                }
            })
        );
    }

    getDefault(): Observable<boolean> {
        return this.config
            .asObservable() //
            .pipe(map((s) => (s && isObject(s) && s.default) === true));
    }

    loadConfiguration(config: FeatureConfiguration) {
        this.config.next(config);
    }
}
