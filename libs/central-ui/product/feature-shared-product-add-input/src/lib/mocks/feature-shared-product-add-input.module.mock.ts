import { NgModule } from '@angular/core';
import { MockProductAddInputComponent } from './product-add-input.component.mock';

@NgModule({
    declarations: [MockProductAddInputComponent],
    exports: [MockProductAddInputComponent],
})
export class FeatureSharedProductAddInputMockModule {}
