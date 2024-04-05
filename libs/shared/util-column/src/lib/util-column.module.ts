import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DropdownDisplayPipe } from './pipes/dropdown-display/dropdown-display.pipe';
import { IsTypePipe } from './pipes/is-type/is-type.pipe';
import { TableDisplayPipe } from './pipes/table-display/table-display.pipe';

@NgModule({
    imports: [CommonModule],
    declarations: [DropdownDisplayPipe, IsTypePipe, TableDisplayPipe],
    exports: [DropdownDisplayPipe, IsTypePipe, TableDisplayPipe],
})
export class UtilColumnModule {}
