import { NgModule, Optional, SkipSelf } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
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
import { UiAddRemoveButtonModule } from '@vioc-angular/shared/ui-add-remove-button';
import { UnsavedChangesGuard } from '@vioc-angular/shared/util-data-modifying';
import { FormErrorDirective, FormFactory } from '@vioc-angular/shared/util-form';
import { ServiceCatalogSearchComponent } from './components/service-catalog-search/service-catalog-search/service-catalog-search.component';
import { ServiceCatalogComponent } from './components/service-catalog/service-catalog.component';
import { ServiceCatalogModuleForms } from './service-catalog-module-forms';

const routes: Routes = [
    {
        path: 'search',
        component: ServiceCatalogSearchComponent,
        canActivate: [HasRoleActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: { requiredRoles: ['ROLE_SERVICE_READ'] },
    },
    {
        path: ':accessMode',
        component: ServiceCatalogComponent,
        canActivate: [AccessModeActivateGuard, FeatureFlagActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: {
            accessModes: {
                add: ['ROLE_SERVICE_ADD'],
            } as AccessModeRoleMapping,
            featureFlag: 'service.search.add',
        },
    },
    {
        path: ':accessMode/:serviceCode',
        component: ServiceCatalogComponent,
        canActivate: [AccessModeActivateGuard, FeatureFlagActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: {
            accessModes: {
                view: ['ROLE_SERVICE_READ'],
                edit: ['ROLE_SERVICE_UPDATE'],
                'add-like': ['ROLE_SERVICE_ADD'],
            } as AccessModeRoleMapping,
            featureFlag: 'service.search.clickRow',
        },
    },
    { path: '', redirectTo: 'search', pathMatch: 'full' },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
        CentralFormUiModule,
        UiAddRemoveButtonModule,
        CentralSearchUiModule,
        UiMassDeactivateDialogModule,
    ],
    declarations: [ServiceCatalogComponent, ServiceCatalogSearchComponent],
    providers: [FormFactory],
})
export class FeatureServiceCatalogModule {
    constructor(
        @Optional() @SkipSelf() parentModule: FeatureServiceCatalogModule,
        readonly formFactory: FormFactory,
        readonly formBuilder: FormBuilder
    ) {
        throwIfAlreadyLoaded(parentModule, 'FeatureServiceCatalogModule');

        ServiceCatalogModuleForms.registerForms(formFactory, formBuilder);

        FormErrorDirective.standardErrors.serviceCodeInvalidPattern = () => {
            return `Can only contain letters, numbers, dashes, spaces, and periods`;
        };

        /**
         * Displayed message after receiving an `error.service-api.notFound` `ApiError` when
         * attempting to retrieve a service that does not exist.
         */
        STANDARD_ERROR_MESSAGES['error.service-api.notFound'] = () => {
            return { message: 'Service could not be found' };
        };
    }
}
