import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { CommonFunctionalityModule } from '@vioc-angular/shared/common-functionality';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { FeatureDropdownColumnModule } from '@vioc-angular/shared/feature-dropdown-column';
import { UiCurrencyPrefixModule } from '@vioc-angular/shared/ui-currency-prefix';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { UtilColumnModule } from '@vioc-angular/shared/util-column';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { UtilFormModule } from '@vioc-angular/shared/util-form';
import { GridCellComponent } from './grid-cell/grid-cell.component';
import { GridComponent } from './grid/grid.component';

@NgModule({
    imports: [
        CommonModule,
        MatCheckboxModule,
        MatDatepickerModule,
        MatInputModule,
        MatSelectModule,
        MatSortModule,
        MatTableModule,
        ReactiveFormsModule,
        UiCurrencyPrefixModule,
        UtilFormModule,
        CommonFunctionalityModule,
        UtilColumnModule,
        FeatureDropdownColumnModule,
    ],
    declarations: [GridComponent, GridCellComponent],
    exports: [GridComponent],
})
export class UiGridModule {}
