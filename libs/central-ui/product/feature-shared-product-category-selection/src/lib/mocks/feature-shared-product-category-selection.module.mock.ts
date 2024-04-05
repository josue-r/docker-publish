import { NgModule } from '@angular/core';
import { MockProductCategorySelectionComponent } from './product-category-selection.component.mock';

@NgModule({
    declarations: [MockProductCategorySelectionComponent],
    exports: [MockProductCategorySelectionComponent],
})
export class FeatureSharedProductCategorySelectionMockModule {}
