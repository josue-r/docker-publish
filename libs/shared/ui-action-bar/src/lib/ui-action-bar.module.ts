import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ActionBarComponent } from './action-bar/action-bar.component';
import { UiButtonModule } from '@vioc-angular/shared/ui-button';

@NgModule({
    imports: [CommonModule, UiButtonModule],
    declarations: [ActionBarComponent],
    exports: [ActionBarComponent],
})
export class UiActionBarModule {}
