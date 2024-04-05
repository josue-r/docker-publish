import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FeatureSearchModule } from '@vioc-angular/shared/feature-search';
import { StoreSelectionComponent } from './store-selection/store-selection.component';

@NgModule({
    imports: [CommonModule, FeatureSearchModule],
    declarations: [StoreSelectionComponent],
    exports: [StoreSelectionComponent],
})
export class FeatureSharedStoreSelectionModule {}
