import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FeatureSearchMockModule } from '@vioc-angular/shared/feature-search';
import { UtilColumnModule } from '@vioc-angular/shared/util-column';
import { MockSearchPageComponent } from './search-page.component.mock';

@NgModule({
    declarations: [MockSearchPageComponent],
    exports: [MockSearchPageComponent],
    imports: [FeatureSearchMockModule, CommonModule, UtilColumnModule],
})
export class FeatureSearchPageMockModule {}
