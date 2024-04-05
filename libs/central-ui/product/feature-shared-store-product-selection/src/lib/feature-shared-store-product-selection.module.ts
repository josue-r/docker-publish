import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FeatureSearchModule } from '@vioc-angular/shared/feature-search';
import { StoreProductSelectionComponent } from './store-product-selection/store-product-selection.component';

@NgModule({
    imports: [CommonModule, FeatureSearchModule],
    declarations: [StoreProductSelectionComponent],
    exports: [StoreProductSelectionComponent],
})
export class FeatureSharedStoreProductSelectionModule {}
