import { NgModule } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AcesFacade } from '@vioc-angular/central-ui/technical/data-access-aces';
import { CentralFormUiModule } from '@vioc-angular/central-ui/ui-modules';
import { UiAddRemoveButtonModule } from '@vioc-angular/shared/ui-add-remove-button';
import { UiFilteredInputModule } from '@vioc-angular/shared/ui-filtered-input';
import { FormFactory } from '@vioc-angular/shared/util-form';
import { CommonTechnicalModuleForms } from './common-technical-module-forms';
import { TechnicalVehicleAttributeSelectionComponent } from './components/technical-vehicle-attribute-selection/technical-vehicle-attribute-selection.component';
import { TechnicalVehicleDetailSelectionComponent } from './components/technical-vehicle-detail-selection/technical-vehicle-detail-selection.component';

@NgModule({
    imports: [CentralFormUiModule, UiAddRemoveButtonModule, UiFilteredInputModule, MatIconModule],
    declarations: [TechnicalVehicleAttributeSelectionComponent, TechnicalVehicleDetailSelectionComponent],
    exports: [TechnicalVehicleAttributeSelectionComponent, TechnicalVehicleDetailSelectionComponent],
    providers: [FormFactory, AcesFacade],
})
export class FeatureSharedCommonTechnicalModule {
    constructor(formFactory: FormFactory, formBuilder: FormBuilder) {
        CommonTechnicalModuleForms.registerForms(formFactory, formBuilder);
    }
}
