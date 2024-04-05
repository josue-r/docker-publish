import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { UiDialogModule } from '@vioc-angular/shared/ui-dialog';
import { UiLoadingModule } from '@vioc-angular/shared/ui-loading';
import { MassDeactivateDialogComponent } from './mass-deactivate-dialog/mass-deactivate-dialog.component';

@NgModule({
    imports: [
        CommonModule,
        MatButtonModule,
        MatCheckboxModule,
        MatDialogModule,
        MatTableModule,
        UiDialogModule,
        UiLoadingModule,
    ],
    declarations: [MassDeactivateDialogComponent],
    exports: [MassDeactivateDialogComponent],
})
export class UiMassDeactivateDialogModule {}
