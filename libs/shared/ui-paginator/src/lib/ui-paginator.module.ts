import { MatPaginatorModule } from '@angular/material/paginator';
import { PaginatorComponent } from './paginator.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
    imports: [CommonModule, MatPaginatorModule],
    declarations: [PaginatorComponent],
    exports: [PaginatorComponent],
})
export class UiPaginatorModule {}
