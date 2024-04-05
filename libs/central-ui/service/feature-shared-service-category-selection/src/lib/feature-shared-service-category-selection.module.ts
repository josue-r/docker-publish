import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FeatureSearchModule } from '@vioc-angular/shared/feature-search';
import { ServiceCategorySelectionComponent } from './service-category/service-category-selection.component';

@NgModule({
    imports: [CommonModule, FeatureSearchModule],
    declarations: [ServiceCategorySelectionComponent],
    exports: [ServiceCategorySelectionComponent],
})
export class FeatureSharedServiceCategorySelectionModule {}
