import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Features } from './features';

export const FEATURE_CONFIGURATION_TOKEN = new InjectionToken<Observable<FeatureConfiguration>>(
    'FEATURE_CONFIGURATION'
);

/**
 *
 * Example configuration:
 * ```ts
 * {
 *   default: false,
 *   features: {
 *     'storeService': {
 *         search: {
 *              // feature flag 'storeService.search.massUpdate` is enabled for all users
 *              massUpdate: true,
 *              // feature flag 'storeService.search.deactivate` is disabled for all users
 *              deactivate: false,
 *              // feature flag 'storeService.search.massAdd` is enabled for just the specified users
 *              massAdd: ['a325230', 'v123456']
 *         }
 *     },
 *     serviceCatalog: {
 *         edit: {
 *             save: false
 *         }
 *     }
 *   }
 * }
 * ```
 */
export interface FeatureConfiguration {
    default: boolean;
    features: Features;
}
