import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MockDialogComponent } from './dialog.component.mock';
import { MockDialog } from './dialog.mock';

@NgModule({
    imports: [CommonModule],
    declarations: [MockDialogComponent],
    exports: [MockDialogComponent],
    providers: [{ provide: MatDialogRef, useValue: MockDialog }],
})
export class UiDialogMockModule {}
