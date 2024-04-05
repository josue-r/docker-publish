import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { UiDialogModule } from '@vioc-angular/shared/ui-dialog';
import { UiDropListModule } from '@vioc-angular/shared/ui-drop-list';
import { ManageColumnComponent } from './manage-column/manage-column.component';

@NgModule({
    imports: [CommonModule, MatButtonModule, MatExpansionModule, MatIconModule, UiDialogModule, UiDropListModule],
    declarations: [ManageColumnComponent],
    exports: [ManageColumnComponent],
})
export class UiManageColumnModule {}
