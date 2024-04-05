import { CommonModule } from '@angular/common';
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
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
import { UiFilteredInputModule } from '@vioc-angular/shared/ui-filtered-input';
import { UnsavedChangesGuard } from '@vioc-angular/shared/util-data-modifying';
import { FormFactory } from '@vioc-angular/shared/util-form';
import { TsbForms } from './tsb-module.forms';
import { TsbSearchComponent } from './tsb-search/tsb-search/tsb-search.component';
import { TsbComponent } from './tsb/tsb.component';

const routes: Routes = [
    { path: '', redirectTo: 'search', pathMatch: 'full' },
    {
        path: 'search',
        component: TsbSearchComponent,
        canActivate: [HasRoleActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: { requiredRoles: ['ROLE_TSB_READ'] },
    },
    {
        path: ':accessMode',
        component: TsbComponent,
        canActivate: [AccessModeActivateGuard, FeatureFlagActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: {
            accessModes: {
                add: ['ROLE_TSB_ADD'],
            } as AccessModeRoleMapping,
            featureFlag: 'tsb.search.add',
        },
    },
    {
        path: ':accessMode/:tsbId',
        component: TsbComponent,
        canActivate: [AccessModeActivateGuard, FeatureFlagActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: {
            accessModes: {
                view: ['ROLE_TSB_READ'],
                edit: ['ROLE_TSB_UPDATE'],
            } as AccessModeRoleMapping,
            featureFlag: 'tsb.search.clickRow',
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
        UiFilteredInputModule,
        FeatureSharedDocumentSelectionModule,
        FeatureSharedCommonTechnicalModule,
    ],
    declarations: [TsbComponent, TsbSearchComponent],
    providers: [FormFactory],
})
export class FeatureTsbModule {
    constructor(
        @Optional() @SkipSelf() parentModule: FeatureTsbModule,
        readonly formFactory: FormFactory,
        readonly formBuilder: FormBuilder
    ) {
        throwIfAlreadyLoaded(parentModule, 'FeatureTsbModule');

        TsbForms.registerForms(formFactory, formBuilder);
    }
}
