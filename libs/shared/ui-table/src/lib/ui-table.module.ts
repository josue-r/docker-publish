import { CdkTableModule } from '@angular/cdk/table';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { CommonFunctionalityModule } from '@vioc-angular/shared/common-functionality';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { UtilColumnModule } from '@vioc-angular/shared/util-column';
import { TableHeaderComponent } from './table-header/table-header.component';
import { TableComponent } from './table/table.component';

@NgModule({
    imports: [
        CommonModule,
        CdkTableModule,
        MatButtonModule,
        MatTableModule,
        MatSortModule,
        MatCheckboxModule,
        MatMenuModule,
        MatIconModule,
        MatDividerModule,
        CommonFunctionalityModule,
        UtilColumnModule,
    ],
    declarations: [TableComponent, TableHeaderComponent],
    exports: [TableComponent, TableHeaderComponent],
})
export class UiTableModule {}
