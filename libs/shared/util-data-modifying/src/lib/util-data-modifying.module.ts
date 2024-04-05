import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { UnsavedChangesGuard } from './guard/unsaved-changes.guard';

@NgModule({
    imports: [CommonModule, ReactiveFormsModule],
    providers: [UnsavedChangesGuard],
})
export class UtilDataModifyingModule {}
