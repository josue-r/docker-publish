import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { CommonFunctionalityModule } from '@vioc-angular/shared/common-functionality';
import { UtilColumnModule } from '@vioc-angular/shared/util-column';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { DropdownColumnComponent } from './dropdown-column/dropdown-column.component';

@NgModule({
    imports: [
        CommonModule,
        MatSelectModule,
        /**
         * TODO: Review this.  See comment below from: https://www.npmjs.com/package/ngx-mat-select-search
         *
         * Important Note: This project is meant as a temporary implementation of https://github.com/angular/material2/issues/5697.
         * The goal is to have an implementation in the official Angular Material repository, once
         * https://github.com/angular/material2/pull/7835 is merged.
         */
        NgxMatSelectSearchModule,
        ReactiveFormsModule,
        CommonFunctionalityModule,
        UtilColumnModule,
    ],
    declarations: [DropdownColumnComponent],
    exports: [DropdownColumnComponent],
})
export class FeatureDropdownColumnModule {}
