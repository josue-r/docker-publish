import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockMassUpdateComponent } from './mass-update.component.mock';

@NgModule({
    imports: [CommonModule],
    declarations: [MockMassUpdateComponent],
    exports: [MockMassUpdateComponent],
})
export class FeatureMassUpdateMockModule {}
