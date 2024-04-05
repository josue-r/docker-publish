import { Component, Input } from '@angular/core';
import { FormArray } from '@angular/forms';

@Component({
    selector: 'vioc-angular-technical-vehicle-detail-selection',
    template: '',
})
export class MockTechnicalVehicleDetailSelectionComponent {
    @Input() vehicleDetails: FormArray;
    @Input() editable = true;
    @Input() filter = false;
}
