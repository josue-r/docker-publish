import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FeatureSearchModule } from '@vioc-angular/shared/feature-search';
import { ProductSelectionComponent } from './product-selection/product-selection.component';

@NgModule({
    imports: [CommonModule, FeatureSearchModule],
    declarations: [ProductSelectionComponent],
    exports: [ProductSelectionComponent],
})
export class FeatureSharedProductSelectionModule {}
