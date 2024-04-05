import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PrintButtonComponent } from './print-button/print-button.component';
import { CancelButtonComponent } from './cancel-button/cancel-button.component';

@NgModule({
    imports: [CommonModule, MatButtonModule, MatIconModule],
    declarations: [PrintButtonComponent, CancelButtonComponent],
    exports: [PrintButtonComponent, CancelButtonComponent],
})
export class UiButtonModule {}
