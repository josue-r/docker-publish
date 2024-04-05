import { CommonModule } from '@angular/common';
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RouterModule, Routes } from '@angular/router';
import { FeatureSharedProductSelectionModule } from '@vioc-angular/central-ui/product/feature-shared-product-selection';
import { FeatureSharedCommonTechnicalModule } from '@vioc-angular/central-ui/technical/common-technical';
import { FeatureSharedDocumentSelectionModule } from '@vioc-angular/central-ui/technical/feature-shared-document-selection';
import { CentralFormUiModule, CentralSearchUiModule } from '@vioc-angular/central-ui/ui-modules';
import {
    AccessModeActivateGuard,
    AccessModeRoleMapping,
    HasRoleActivateGuard,
} from '@vioc-angular/security/util-authorization';
import { throwIfAlreadyLoaded } from '@vioc-angular/shared/common-functionality';
import { FeatureFeatureFlagModule, FeatureFlagActivateGuard } from '@vioc-angular/shared/feature-feature-flag';
import { UiAddRemoveButtonModule } from '@vioc-angular/shared/ui-add-remove-button';
import { UiDialogModule } from '@vioc-angular/shared/ui-dialog';
import { UnsavedChangesGuard } from '@vioc-angular/shared/util-data-modifying';
import { FormFactory } from '@vioc-angular/shared/util-form';
import { TechnicalAlertForms } from './technical-alert-module.forms';
import { TechnicalAlertSearchComponent } from './technical-alert-search/technical-alert-search.component';
import { TechnicalAlertComponent } from './technical-alert/technical-alert.component';

const routes: Routes = [
    { path: '', redirectTo: 'search', pathMatch: 'full' },
    {
        path: 'search',
        component: TechnicalAlertSearchComponent,
        canActivate: [HasRoleActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: { requiredRoles: ['ROLE_TECHNICAL_ALERT_READ'] },
    },
    {
        path: ':accessMode',
        component: TechnicalAlertComponent,
        canActivate: [AccessModeActivateGuard, FeatureFlagActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: {
            accessModes: {
                add: ['ROLE_TECHNICAL_ALERT_ADD'],
            } as AccessModeRoleMapping,
        },
    },
    {
        path: ':accessMode/:alertId',
        component: TechnicalAlertComponent,
        canActivate: [AccessModeActivateGuard, FeatureFlagActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: {
            accessModes: {
                view: ['ROLE_TECHNICAL_ALERT_READ'],
                edit: ['ROLE_TECHNICAL_ALERT_UPDATE'],
            } as AccessModeRoleMapping,
        },
    },
];
@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        FeatureFeatureFlagModule,
        CentralFormUiModule,
        CentralSearchUiModule,
        FeatureSharedDocumentSelectionModule,
        FeatureSharedCommonTechnicalModule,
        FeatureSharedProductSelectionModule,
        MatListModule,
        MatIconModule,
        UiAddRemoveButtonModule,
        UiDialogModule,
        FeatureFeatureFlagModule,
    ],
    declarations: [TechnicalAlertComponent, TechnicalAlertSearchComponent],
    providers: [FormFactory],
})
export class FeatureTechnicalAlertModule {
    constructor(
        @Optional() @SkipSelf() parentModule: FeatureTechnicalAlertModule,
        readonly formFactory: FormFactory,
        readonly formBuilder: FormBuilder
    ) {
        throwIfAlreadyLoaded(parentModule, 'FeatureTechnicalAlertModule');

        TechnicalAlertForms.registerForms(formFactory, formBuilder);
    }
}
