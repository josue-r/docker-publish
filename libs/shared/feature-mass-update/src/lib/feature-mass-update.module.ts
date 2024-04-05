import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CommonFunctionalityModule } from '@vioc-angular/shared/common-functionality';
// TODO: 05/21/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { FeatureDropdownColumnModule } from '@vioc-angular/shared/feature-dropdown-column';
import { UiAddRemoveButtonModule } from '@vioc-angular/shared/ui-add-remove-button';
import { UiCurrencyPrefixModule } from '@vioc-angular/shared/ui-currency-prefix';
import { UtilFormModule } from '@vioc-angular/shared/util-form';
import { MassUpdateComponent } from './mass-update/mass-update.component';

@NgModule({
    imports: [
        CommonModule,
        UiAddRemoveButtonModule,
        MatSelectModule,
        MatOptionModule,
        ReactiveFormsModule,
        MatDatepickerModule,
        UtilFormModule,
        MatInputModule,
        MatFormFieldModule,
        UiCurrencyPrefixModule,
        FeatureDropdownColumnModule,
        CommonFunctionalityModule,
    ],
    declarations: [MassUpdateComponent],
    exports: [MassUpdateComponent],
})
export class FeatureMassUpdate {}
