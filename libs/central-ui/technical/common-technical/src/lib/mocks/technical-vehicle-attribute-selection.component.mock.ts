import { Component, Input } from '@angular/core';
import { YearMakeModelEngine } from '@vioc-angular/central-ui/technical/data-access-tsb';
import { TypedFormGroup } from '@vioc-angular/shared/util-form';

@Component({
    selector: 'vioc-angular-technical-vehicle-attribute-selection',
    template: '',
})
export class MockTechnicalVehicleAttributeSelectionComponent {
    @Input() vehicleDetail: TypedFormGroup<YearMakeModelEngine>;
    @Input() editable = true;
}
