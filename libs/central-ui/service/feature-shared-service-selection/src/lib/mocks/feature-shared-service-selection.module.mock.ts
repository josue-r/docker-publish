import { NgModule } from '@angular/core';
import { MockServiceSelectionComponent } from './service-selection.component.mock';

@NgModule({
    declarations: [MockServiceSelectionComponent],
    exports: [MockServiceSelectionComponent],
})
export class FeatureSharedServiceSelectionMockModule {}
