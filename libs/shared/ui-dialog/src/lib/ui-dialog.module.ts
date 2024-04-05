import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { DialogComponent } from './dialog/dialog.component';

@NgModule({
    imports: [CommonModule, MatDialogModule],
    declarations: [DialogComponent],
    exports: [DialogComponent],
})
export class UiDialogModule {}
