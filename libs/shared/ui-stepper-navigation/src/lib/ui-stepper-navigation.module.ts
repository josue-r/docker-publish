import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { StepperNavigationComponent } from './stepper-navigation/stepper-navigation.component';

@NgModule({
    imports: [CommonModule, MatIconModule, MatButtonModule],
    declarations: [StepperNavigationComponent],
    exports: [StepperNavigationComponent],
})
export class UiStepperNavigationModule {}
