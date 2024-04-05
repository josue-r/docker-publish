import { NgModule } from '@angular/core';
import { MockProductSelectionComponent } from './product-selection.component.mock';

@NgModule({
    declarations: [MockProductSelectionComponent],
    exports: [MockProductSelectionComponent],
})
export class FeatureSharedProductSelectionMockModule {}
