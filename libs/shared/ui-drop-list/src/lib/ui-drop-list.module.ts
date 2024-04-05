import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { DropListComponent } from './drop-list/drop-list.component';

@NgModule({
    imports: [CommonModule, DragDropModule, MatIconModule, MatRippleModule],
    declarations: [DropListComponent],
    exports: [DropListComponent],
})
export class UiDropListModule {}
