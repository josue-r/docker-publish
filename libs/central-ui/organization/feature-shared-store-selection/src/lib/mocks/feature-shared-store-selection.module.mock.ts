import { NgModule } from '@angular/core';
import { MockStoreSelectionComponent } from './store-selection.component.mock';

@NgModule({
    declarations: [MockStoreSelectionComponent],
    exports: [MockStoreSelectionComponent],
})
export class FeatureSharedStoreSelectionMockModule {}
