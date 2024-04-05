import { NgModule, Optional, SkipSelf } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { RouterModule, Routes } from '@angular/router';
import { FeatureSharedStoreSelectionModule } from '@vioc-angular/central-ui/organization/feature-shared-store-selection';
import { FeatureSharedServiceSelectionModule } from '@vioc-angular/central-ui/service/feature-shared-service-selection';
import { CentralFormUiModule, CentralSearchUiModule } from '@vioc-angular/central-ui/ui-modules';
import {
    AccessModeActivateGuard,
    AccessModeRoleMapping,
    HasRoleActivateGuard,
} from '@vioc-angular/security/util-authorization';
import { throwIfAlreadyLoaded } from '@vioc-angular/shared/common-functionality';
import { FeatureFeatureFlagModule, FeatureFlagActivateGuard } from '@vioc-angular/shared/feature-feature-flag';
import { FeatureMassUpdate } from '@vioc-angular/shared/feature-mass-update';
import { UiAddRemoveButtonModule } from '@vioc-angular/shared/ui-add-remove-button';
import { UiCurrencyPrefixModule } from '@vioc-angular/shared/ui-currency-prefix';
import { UiStepperNavigationModule } from '@vioc-angular/shared/ui-stepper-navigation';
import { UtilColumnModule } from '@vioc-angular/shared/util-column';
import { UnsavedChangesGuard } from '@vioc-angular/shared/util-data-modifying';
import { FormFactory } from '@vioc-angular/shared/util-form';
import { ServiceExtraChargeComponent } from './components/service-extra-charge/service-extra-charge.component';
import { StoreServiceMassAddComponent } from './components/store-service-mass-add/store-service-mass-add.component';
import { StoreServiceMassUpdateComponent } from './components/store-service-mass-update/store-service-mass-update.component';
import { StoreServiceSearchComponent } from './components/store-service-search/store-service-search/store-service-search.component';
import { StoreServiceComponent } from './components/store-service/store-service.component';
import { StoreServiceModuleForms } from './store-service-module-forms';

const routes: Routes = [
    // {
    // path: ':accessMode/:storeNum/:serviceCode', component: StoreServiceComponent,
    // canActivate: [HasRoleActiveGuard], canDeactivate: [UnsavedChangesGuard],
    // data: { requiredRoles: ['ROLE_STORE_SERVICE_READ', 'ROLE_STORE_SERVICE_UPDATE'] }
    // },

    {
        path: 'search',
        component: StoreServiceSearchComponent,
        canActivate: [HasRoleActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: { requiredRoles: ['ROLE_STORE_SERVICE_READ'] },
    },
    {
        path: 'add',
        component: StoreServiceMassAddComponent,
        canActivate: [HasRoleActivateGuard, FeatureFlagActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: { requiredRoles: ['ROLE_STORE_SERVICE_ADD'], featureFlag: 'storeService.search.add' },
    },
    {
        path: 'mass-update',
        component: StoreServiceMassUpdateComponent,
        canActivate: [HasRoleActivateGuard, FeatureFlagActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: {
            requiredRoles: ['ROLE_STORE_SERVICE_UPDATE'],
            featureFlag: 'storeService.search.massUpdate',
        },
    },
    {
        path: ':accessMode/:storeNum/:serviceCode',
        component: StoreServiceComponent,
        canActivate: [AccessModeActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: {
            accessModes: {
                view: ['ROLE_STORE_SERVICE_READ'],
                edit: ['ROLE_STORE_SERVICE_UPDATE'],
            } as AccessModeRoleMapping,
        },
    },
    { path: '', redirectTo: 'search', pathMatch: 'full' },
];
@NgModule({
    imports: [
        CentralFormUiModule,
        CentralSearchUiModule,
        FeatureSharedServiceSelectionModule,
        FeatureSharedStoreSelectionModule,
        UiAddRemoveButtonModule,
        UiCurrencyPrefixModule,
        UiStepperNavigationModule,
        MatPaginatorModule,
        MatStepperModule,
        MatTableModule,
        RouterModule.forChild(routes),
        FeatureMassUpdate,
        MatListModule,
        UtilColumnModule,
        FeatureFeatureFlagModule,
    ],
    declarations: [
        StoreServiceComponent,
        StoreServiceSearchComponent,
        ServiceExtraChargeComponent,
        StoreServiceMassAddComponent,
        StoreServiceMassUpdateComponent,
    ],
    providers: [FormFactory],
})
export class FeatureStoreServiceModule {
    constructor(
        @Optional() @SkipSelf() parentModule: FeatureStoreServiceModule,
        readonly formFactory: FormFactory,
        readonly fb: FormBuilder
    ) {
        throwIfAlreadyLoaded(parentModule, 'FeatureStoreServiceModule');

        StoreServiceModuleForms.registerForms(formFactory, fb);
    }
}
