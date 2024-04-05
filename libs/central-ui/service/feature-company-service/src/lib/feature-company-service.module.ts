import { NgModule, Optional, SkipSelf } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatListModule } from '@angular/material/list';
import { MatStepperModule } from '@angular/material/stepper';
import { RouterModule, Routes } from '@angular/router';
import { CompanyExportValidators } from '@vioc-angular/central-ui/organization/company/data-access-company-export';
import { FeatureSharedServiceSelectionModule } from '@vioc-angular/central-ui/service/feature-shared-service-selection';
import { UiMassDeactivateDialogModule } from '@vioc-angular/central-ui/ui-mass-deactivate-dialog';
import { CentralFormUiModule, CentralSearchUiModule } from '@vioc-angular/central-ui/ui-modules';
import {
    AccessModeActivateGuard,
    AccessModeRoleMapping,
    HasRoleActivateGuard,
} from '@vioc-angular/security/util-authorization';
import { throwIfAlreadyLoaded } from '@vioc-angular/shared/common-functionality';
import { FeatureFlagActivateGuard } from '@vioc-angular/shared/feature-feature-flag';
import { UiStepperNavigationModule } from '@vioc-angular/shared/ui-stepper-navigation';
import { UnsavedChangesGuard } from '@vioc-angular/shared/util-data-modifying';
import { FormErrorDirective, FormFactory } from '@vioc-angular/shared/util-form';
import { CompanyServiceMassAddComponent } from './company-service-mass-add/company-service-mass-add.component';
import { CompanyServiceModuleForms } from './company-service-module-forms';
import { CompanyServiceSearchComponent } from './company-service-search/company-service-search/company-service-search.component';
import { CompanyServiceComponent } from './company-service/company-service.component';

const routes: Routes = [
    // {
    //     path: 'add', component: CompanyServiceAddComponent,
    //     canActivate: [HasRoleActiveGuard], canDeactivate: [UnsavedChangesGuard],
    //     data: { requiredRoles: ['ROLE_COMPANY_SERVICE_ADD'] }
    // }

    {
        path: 'search',
        component: CompanyServiceSearchComponent,
        canActivate: [HasRoleActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: { requiredRoles: ['ROLE_COMPANY_SERVICE_READ'] },
    },
    {
        path: 'add',
        component: CompanyServiceMassAddComponent,
        canActivate: [HasRoleActivateGuard, FeatureFlagActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: { requiredRoles: ['ROLE_COMPANY_SERVICE_ADD'], featureFlag: 'companyService.search.add' },
    },
    {
        path: ':accessMode/:companyCode/:serviceCode',
        component: CompanyServiceComponent,
        canActivate: [AccessModeActivateGuard, FeatureFlagActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: {
            accessModes: {
                view: ['ROLE_COMPANY_SERVICE_READ'],
                edit: ['ROLE_COMPANY_SERVICE_UPDATE'],
            } as AccessModeRoleMapping,
            featureFlag: 'companyService.search.clickRow',
        },
    },
    { path: '', redirectTo: 'search', pathMatch: 'full' },
];

@NgModule({
    imports: [
        CentralFormUiModule,
        CentralSearchUiModule,
        RouterModule.forChild(routes),
        UiMassDeactivateDialogModule,
        UiStepperNavigationModule,
        FeatureSharedServiceSelectionModule,
        MatStepperModule,
        MatListModule,
    ],
    declarations: [CompanyServiceComponent, CompanyServiceSearchComponent, CompanyServiceMassAddComponent],
    providers: [FormFactory, CompanyExportValidators],
})
export class FeatureCompanyServiceModule {
    constructor(
        @Optional() @SkipSelf() parentModule: FeatureCompanyServiceModule,
        readonly formFactory: FormFactory,
        readonly fb: FormBuilder,
        readonly companyExportValidators: CompanyExportValidators
    ) {
        throwIfAlreadyLoaded(parentModule, 'FeatureCompanyServiceModule');

        CompanyServiceModuleForms.registerForms(formFactory, fb, companyExportValidators);

        FormErrorDirective.standardErrors.invalidAccount = () => {
            return 'Account does not exist';
        };
    }
}
