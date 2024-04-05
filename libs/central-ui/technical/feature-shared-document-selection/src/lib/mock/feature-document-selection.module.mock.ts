import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MockDocumentSelectionComponent } from './document-selection.component.mock';

@NgModule({
    imports: [CommonModule],
    declarations: [MockDocumentSelectionComponent],
    exports: [MockDocumentSelectionComponent],
})
export class FeatureDocumentSelectionMockModule {}
