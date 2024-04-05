import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonFunctionalityModule } from '@vioc-angular/shared/common-functionality';
import { FeatureFeatureFlagModule } from '@vioc-angular/shared/feature-feature-flag';
import { FeatureSearchModule } from '@vioc-angular/shared/feature-search';
import { UiLoadingModule } from '@vioc-angular/shared/ui-loading';
import { UtilColumnModule } from '@vioc-angular/shared/util-column';
import { UtilDataModifyingModule } from '@vioc-angular/shared/util-data-modifying';
import { SearchPageComponent } from './search-page/search-page.component';

@NgModule({
    imports: [
        CommonModule,
        FeatureSearchModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatTooltipModule,
        UtilColumnModule,
        UtilDataModifyingModule,
        UiLoadingModule,
        FeatureFeatureFlagModule,
        CommonFunctionalityModule,
    ],
    declarations: [SearchPageComponent],
    exports: [SearchPageComponent],
})
export class FeatureSearchPageModule {}
