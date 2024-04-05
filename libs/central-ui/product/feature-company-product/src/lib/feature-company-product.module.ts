import { NgModule, Optional, SkipSelf } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatListModule } from '@angular/material/list';
import { MatStepperModule } from '@angular/material/stepper';
import { RouterModule, Routes } from '@angular/router';
import { CompanyExportValidators } from '@vioc-angular/central-ui/organization/company/data-access-company-export';
import { FeatureSharedProductSelectionModule } from '@vioc-angular/central-ui/product/feature-shared-product-selection';
import { UiMassDeactivateDialogModule } from '@vioc-angular/central-ui/ui-mass-deactivate-dialog';
import { CentralFormUiModule, CentralSearchUiModule } from '@vioc-angular/central-ui/ui-modules';
import { STANDARD_ERROR_MESSAGES } from '@vioc-angular/central-ui/util-message';
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
import { CompanyProductModuleForms } from './company-product-module-forms';
import { CompanyProductMassAddComponent } from './components/company-product-mass-add/company-product-mass-add.component';
import { CompanyProductSearchComponent } from './components/company-product-search/company-product-search.component';
import { CompanyProductComponent } from './components/company-product/company-product.component';

const routes: Routes = [
    { path: '', redirectTo: 'search', pathMatch: 'full' },
    {
        path: 'search',
        component: CompanyProductSearchComponent,
        canActivate: [HasRoleActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: { requiredRoles: ['ROLE_COMPANY_PRODUCT_READ'] },
    },
    {
        path: 'add',
        component: CompanyProductMassAddComponent,
        canActivate: [HasRoleActivateGuard, FeatureFlagActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: { requiredRoles: ['ROLE_COMPANY_PRODUCT_ADD'], featureFlag: 'companyProduct.search.add' },
    },
    {
        path: ':accessMode/:companyCode/:productCode',
        component: CompanyProductComponent,
        canActivate: [AccessModeActivateGuard, FeatureFlagActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: {
            accessModes: {
                view: ['ROLE_COMPANY_PRODUCT_READ'],
                edit: ['ROLE_COMPANY_PRODUCT_UPDATE'],
            } as AccessModeRoleMapping,
            featureFlag: 'companyProduct.search.clickRow',
        },
    },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
        CentralFormUiModule,
        CentralSearchUiModule,
        UiMassDeactivateDialogModule,
        UiStepperNavigationModule,
        FeatureSharedProductSelectionModule,
        MatStepperModule,
        MatListModule,
    ],
    declarations: [CompanyProductSearchComponent, CompanyProductComponent, CompanyProductMassAddComponent],
    providers: [FormFactory, CompanyExportValidators], // TODO: Include FormFactory in separate module with imports
})
export class FeatureCompanyProductModule {
    constructor(
        @Optional() @SkipSelf() parentModule: FeatureCompanyProductModule,
        readonly formFactory: FormFactory,
        readonly formBuilder: FormBuilder,
        readonly companyExportValidators: CompanyExportValidators
    ) {
        throwIfAlreadyLoaded(parentModule, 'FeatureCompanyProductModule');

        CompanyProductModuleForms.registerForms(formFactory, formBuilder, companyExportValidators);

        /**
         * Displayed message after receiving an `error.product-api.productInactive` `ApiError` when
         * attempting to activate a company product for an inactive product.
         */
        STANDARD_ERROR_MESSAGES['error.product-api.productInactive'] = () => {
            return { message: 'Cannot activate a Company Product when the Product is not active' };
        };

        FormErrorDirective.standardErrors.invalidAccount = () => {
            return 'Account does not exist';
        };
    }
}
