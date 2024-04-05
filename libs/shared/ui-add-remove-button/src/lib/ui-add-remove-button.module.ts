import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AddRemoveButtonComponent } from './add-remove-button/add-remove-button.component';

@NgModule({
    imports: [CommonModule, MatIconModule, MatButtonModule],
    declarations: [AddRemoveButtonComponent],
    exports: [AddRemoveButtonComponent],
})
export class UiAddRemoveButtonModule {}
