import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
// TODO: 06/08/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { UtilFormModule } from '@vioc-angular/shared/util-form';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { FilteredInputComponent } from './filtered-input/filtered-input.component';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatInputModule,
        MatFormFieldModule,
        MatSelectModule,
        NgxMatSelectSearchModule,
        UtilFormModule,
        MatTooltipModule,
    ],
    declarations: [FilteredInputComponent],
    exports: [FilteredInputComponent],
})
export class UiFilteredInputModule {}
