import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FeatureSearchModule } from '@vioc-angular/shared/feature-search';
import { ProductCategorySelectionComponent } from './product-category-selection/product-category-selection.component';

@NgModule({
    imports: [CommonModule, FeatureSearchModule],
    declarations: [ProductCategorySelectionComponent],
    exports: [ProductCategorySelectionComponent],
})
export class FeatureSharedProductCategorySelectionModule {}
