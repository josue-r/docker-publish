import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MockTechnicalVehicleAttributeSelectionComponent } from './technical-vehicle-attribute-selection.component.mock';
import { MockTechnicalVehicleDetailSelectionComponent } from './technical-vehicle-detail-selection.component.mock';

@NgModule({
    imports: [CommonModule],
    declarations: [MockTechnicalVehicleAttributeSelectionComponent, MockTechnicalVehicleDetailSelectionComponent],
    exports: [MockTechnicalVehicleAttributeSelectionComponent, MockTechnicalVehicleDetailSelectionComponent],
})
export class FeatureSharedCommonTechnicalMockModule {}
