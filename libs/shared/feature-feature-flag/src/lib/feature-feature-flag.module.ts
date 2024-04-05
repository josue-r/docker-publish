import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FeatureFlagDirective } from './feature-flag.directive';

/**
 *
 *
 * In order to use feature flags, you have to provide a factory method to load the configuration.
 *
 * Example:
 *
 * ```ts
 * const featureFlagConfigurationFactory = () => of(environment.features); // returns Observable<FeatureConfiguration>
 * //...
 * @NgModule({
 *     declarations: [AppComponent],
 *     imports: [
 *        //...
 *     ],
 *     providers: [
 *         //...
 *         { provide: FEATURE_CONFIGURATION_TOKEN, useFactory: featureFlagConfigurationFactory }
 *     ],
 *     bootstrap: [AppComponent]
 * })
 * export class AppModule
 * ```
 *
 * @export
 * @class FeatureFeatureFlagModule
 */
@NgModule({
    imports: [CommonModule],
    declarations: [FeatureFlagDirective],
    exports: [FeatureFlagDirective],
})
export class FeatureFeatureFlagModule {}
