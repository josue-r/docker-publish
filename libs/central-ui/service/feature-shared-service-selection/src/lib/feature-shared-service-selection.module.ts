import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FeatureSearchModule } from '@vioc-angular/shared/feature-search';
import { ServiceSelectionComponent } from './service-selection/service-selection.component';

@NgModule({
    imports: [CommonModule, FeatureSearchModule],
    declarations: [ServiceSelectionComponent],
    exports: [ServiceSelectionComponent],
})
export class FeatureSharedServiceSelectionModule {}
