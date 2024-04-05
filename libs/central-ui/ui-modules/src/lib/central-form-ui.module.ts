import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CommonFunctionalityModule } from '@vioc-angular/shared/common-functionality';
import { UiActionBarModule } from '@vioc-angular/shared/ui-action-bar';
import { UiAuditModule } from '@vioc-angular/shared/ui-audit';
import { UiInfoButtonModule } from '@vioc-angular/shared/ui-info-button';
import { UiLoadingModule } from '@vioc-angular/shared/ui-loading';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { UtilDataModifyingModule } from '@vioc-angular/shared/util-data-modifying';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { UtilFormModule } from '@vioc-angular/shared/util-form';

const commonUiModules = [
    CommonModule, //
    UiLoadingModule,
    UiAuditModule,
    UiActionBarModule,
    UiInfoButtonModule,
];
const commonUtilModules = [
    UtilDataModifyingModule, //
    UtilFormModule,
    CommonFunctionalityModule,
];
const commonAngularModules = [
    ReactiveFormsModule, //
];
const commonAngularMaterialModules = [
    MatCheckboxModule, //
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatOptionModule,
    MatSelectModule,
];

/**
 * A "container" module for all of the common modules that are used for view/edit pages.
 *
 * **This should NOT contain all possible modules that any form component will ever need**.  It should only export the bare minimum.
 *
 * @export
 * @class CentralFormComponentModule
 */
@NgModule({
    exports: [
        //
        ...commonUiModules,
        ...commonUtilModules,
        ...commonAngularModules,
        ...commonAngularMaterialModules,
    ],
})
export class CentralFormUiModule {}
