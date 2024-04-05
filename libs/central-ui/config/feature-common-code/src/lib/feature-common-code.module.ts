import { NgModule, Optional, SkipSelf } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { CentralFormUiModule, CentralSearchUiModule } from '@vioc-angular/central-ui/ui-modules';
import { STANDARD_ERROR_MESSAGES } from '@vioc-angular/central-ui/util-message';
import {
    AccessModeActivateGuard,
    AccessModeRoleMapping,
    HasRoleActivateGuard,
} from '@vioc-angular/security/util-authorization';
import { throwIfAlreadyLoaded } from '@vioc-angular/shared/common-functionality';
import { FeatureFeatureFlagModule, FeatureFlagActivateGuard } from '@vioc-angular/shared/feature-feature-flag';
import { UiCurrencyPrefixModule } from '@vioc-angular/shared/ui-currency-prefix';
import { UiFilteredInputModule } from '@vioc-angular/shared/ui-filtered-input';
import { UnsavedChangesGuard } from '@vioc-angular/shared/util-data-modifying';
import { FormFactory } from '@vioc-angular/shared/util-form';
import { CommonCodeForms } from './common-code-module.forms';
import { CommonCodeSearchComponent } from './common-code-search/common-code-search.component';
import { CommonCodeComponent } from './common-code/common-code.component';

const routes: Routes = [
    { path: '', redirectTo: 'search', pathMatch: 'full' },
    {
        path: 'search',
        component: CommonCodeSearchComponent,
        canActivate: [HasRoleActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: { requiredRoles: ['ROLE_COMMON_CODE_READ'] },
    },
    {
        path: ':accessMode/:type/:code',
        component: CommonCodeComponent,
        canActivate: [AccessModeActivateGuard, FeatureFlagActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: {
            accessModes: {
                view: ['ROLE_COMMON_CODE_READ'],
                edit: ['ROLE_COMMON_CODE_UPDATE'],
            } as AccessModeRoleMapping,
            featureFlag: 'commonCode.search.clickRow',
        },
    },
    {
        path: ':accessMode',
        component: CommonCodeComponent,
        canActivate: [AccessModeActivateGuard, FeatureFlagActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: {
            accessModes: {
                add: ['ROLE_COMMON_CODE_ADD'],
            },
            featureFlag: 'commonCode.search.add',
        },
    },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
        UiCurrencyPrefixModule,
        CentralFormUiModule,
        CentralSearchUiModule,
        UiFilteredInputModule,
        FeatureFeatureFlagModule,
        ReactiveFormsModule,
        UiFilteredInputModule,
    ],
    declarations: [CommonCodeSearchComponent, CommonCodeComponent],
    providers: [FormFactory],
})
export class FeatureCommonCodeModule {
    constructor(
        @Optional() @SkipSelf() parentModule: FeatureCommonCodeModule,
        readonly formFactory: FormFactory,
        readonly formBuilder: FormBuilder
    ) {
        throwIfAlreadyLoaded(parentModule, 'FeatureCommonCodeModule');

        CommonCodeForms.registerForms(formFactory, formBuilder);

        /**
         * Displayed message after receiving an `error.config-api.commonCodeTypeLocked` `ApiError`
         * when attempting to add or update a common code with an inactive type.
         */
        STANDARD_ERROR_MESSAGES['error.config-api.commonCodeTypeLocked'] = () => {
            return { message: 'Cannot add or update a common code with an inactive type.' };
        };
    }
}
