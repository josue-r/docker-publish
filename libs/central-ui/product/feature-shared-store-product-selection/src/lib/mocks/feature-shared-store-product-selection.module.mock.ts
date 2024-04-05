import { NgModule } from '@angular/core';
import { MockStoreProductSelectionComponent } from './store-product-selection.component.mock';

@NgModule({
    declarations: [MockStoreProductSelectionComponent],
    exports: [MockStoreProductSelectionComponent],
})
export class FeatureSharedStoreProductSelectionMockModule {}
