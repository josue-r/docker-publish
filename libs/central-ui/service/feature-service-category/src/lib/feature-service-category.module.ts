import { CommonModule } from '@angular/common';
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { CentralFormUiModule, CentralSearchUiModule } from '@vioc-angular/central-ui/ui-modules';
import {
    AccessModeActivateGuard,
    AccessModeRoleMapping,
    HasRoleActivateGuard,
} from '@vioc-angular/security/util-authorization';
import { throwIfAlreadyLoaded } from '@vioc-angular/shared/common-functionality';
import { FeatureFeatureFlagModule, FeatureFlagActivateGuard } from '@vioc-angular/shared/feature-feature-flag';
import { UiAddRemoveButtonModule } from '@vioc-angular/shared/ui-add-remove-button';
import { UiCurrencyPrefixModule } from '@vioc-angular/shared/ui-currency-prefix';
import { UiDialogModule } from '@vioc-angular/shared/ui-dialog';
import { UiFilteredInputModule } from '@vioc-angular/shared/ui-filtered-input';
import { UnsavedChangesGuard } from '@vioc-angular/shared/util-data-modifying';
import { FormFactory } from '@vioc-angular/shared/util-form';
import { PreventativeMaintenanceQualifierComponent } from './components/preventative-maintenance-qualifier/preventative-maintenance-qualifier.component';
import { ServiceCategoryCarFaxMappingComponent } from './components/service-category-car-fax-mapping/service-category-car-fax-mapping.component';
import { ServiceCategoryMotorInfoComponent } from './components/service-category-motor-info/service-category-motor-info.component';
import { ServiceCategorySearchComponent } from './components/service-category-search/service-category-search.component';
import { ServiceCategoryComponent } from './components/service-category/service-category.component';
import { ServiceCategoryModuleForms } from './service-category-module-forms';

const routes: Routes = [
    { path: '', redirectTo: 'search', pathMatch: 'full' },
    {
        path: 'search',
        component: ServiceCategorySearchComponent,
        canActivate: [HasRoleActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: { requiredRoles: ['ROLE_SERVICE_CATEGORY_READ'] },
    },
    {
        path: ':accessMode/:categoryCode',
        component: ServiceCategoryComponent,
        canActivate: [AccessModeActivateGuard, FeatureFlagActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: {
            accessModes: {
                view: ['ROLE_SERVICE_CATEGORY_READ'],
                edit: ['ROLE_SERVICE_CATEGORY_UPDATE'],
            } as AccessModeRoleMapping,
            featureFlag: 'serviceCategory.search.clickRow',
        },
    },
    {
        path: ':accessMode',
        component: ServiceCategoryComponent,
        canActivate: [AccessModeActivateGuard, FeatureFlagActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: {
            accessModes: {
                add: ['ROLE_SERVICE_CATEGORY_ADD'],
            },
            featureFlag: 'serviceCategory.search.add',
        },
    },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes), //
        CentralFormUiModule,
        CentralSearchUiModule,
        CommonModule,
        FeatureFeatureFlagModule,
        UiAddRemoveButtonModule,
        UiCurrencyPrefixModule,
        UiDialogModule,
        UiFilteredInputModule,
    ],
    declarations: [
        ServiceCategorySearchComponent,
        ServiceCategoryComponent,
        ServiceCategoryMotorInfoComponent,
        PreventativeMaintenanceQualifierComponent,
        ServiceCategoryCarFaxMappingComponent,
    ],
    providers: [FormFactory],
})
export class FeatureServiceCategoryModule {
    constructor(
        @Optional() @SkipSelf() parentModule: FeatureServiceCategoryModule,
        readonly formFactory: FormFactory,
        readonly formBuilder: FormBuilder
    ) {
        throwIfAlreadyLoaded(parentModule, 'FeatureServiceCategoryModule');
        ServiceCategoryModuleForms.registerForms(formFactory, formBuilder);
    }
}
