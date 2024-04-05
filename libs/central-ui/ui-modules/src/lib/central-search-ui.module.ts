import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { FeatureSearchPageModule } from '@vioc-angular/central-ui/feature-search-page';

/**
 * A "container" module for all of the common modules that are used for search pages.
 *
 * **This should NOT contain all possible modules that any search component will ever need**.  It should only export the bare minimum.
 *
 * @export
 * @class CentralSearchUiModule
 */
@NgModule({
    declarations: [],
    imports: [],
    exports: [FeatureSearchPageModule, MatButtonModule],
})
export class CentralSearchUiModule {}
