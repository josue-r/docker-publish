import { NgModule, Optional, SkipSelf } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule, Routes } from '@angular/router';
import { FeatureSharedProductAddInputModule } from '@vioc-angular/central-ui/product/feature-shared-product-add-input';
import { CentralFormUiModule, CentralSearchUiModule } from '@vioc-angular/central-ui/ui-modules';
import { AccessModeActivateGuard, HasRoleActivateGuard } from '@vioc-angular/security/util-authorization';
import { throwIfAlreadyLoaded } from '@vioc-angular/shared/common-functionality';
import { FeatureFeatureFlagModule, FeatureFlagActivateGuard } from '@vioc-angular/shared/feature-feature-flag';
import { FeatureSearchModule } from '@vioc-angular/shared/feature-search';
import { UiButtonModule } from '@vioc-angular/shared/ui-button';
import { UiCurrencyPrefixModule } from '@vioc-angular/shared/ui-currency-prefix';
import { UiDialogModule } from '@vioc-angular/shared/ui-dialog';
import { UiFilteredInputModule } from '@vioc-angular/shared/ui-filtered-input';
import { UiSelectAndGoModule } from '@vioc-angular/shared/ui-select-and-go';
import { UtilColumnModule } from '@vioc-angular/shared/util-column';
import { UnsavedChangesGuard } from '@vioc-angular/shared/util-data-modifying';
import { FormFactory } from '@vioc-angular/shared/util-form';
import { StoreModuleForms } from './store-module-forms';
import { StoreSearchComponent } from './store-search/store-search.component';
import { StoreComponent } from './store/store.component';

// Provides non-default roles values that should have edit access.
// This is required for the search-page.component to enable edit mode through clickRow event.
const customEditRoles: string[] = ['ROLE_STORE_LOCATION_CONTENT_UPDATE', 'ROLE_STORE_LATITUDE_LONGITUDE_UPDATE'];

const routes: Routes = [
    { path: '', redirectTo: 'search', pathMatch: 'full' },
    {
        path: 'search',
        component: StoreSearchComponent,
        canActivate: [HasRoleActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: {
            requiredRoles: ['ROLE_STORE_READ'],
            featureFlag: 'store.search.enabled',
            customEditRoles: customEditRoles,
        },
    },
    {
        path: ':accessMode/:storeCode',
        component: StoreComponent,
        canActivate: [AccessModeActivateGuard, FeatureFlagActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: {
            accessModes: {
                view: ['ROLE_STORE_READ'],
                edit: ['ROLE_STORE_UPDATE'].concat(customEditRoles),
            },
            featureFlag: 'store.search.clickRow',
        },
    },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
        CentralFormUiModule,
        CentralSearchUiModule,
        FeatureFeatureFlagModule,
        FeatureSharedProductAddInputModule,
        MatIconModule,
        MatSortModule,
        MatTableModule,
        MatTooltipModule,
        UiCurrencyPrefixModule,
        UiFilteredInputModule,
        UtilColumnModule,
        UiDialogModule,
        UiButtonModule,
        UiSelectAndGoModule,
        FeatureSearchModule,
    ],
    declarations: [StoreSearchComponent, StoreComponent],
    providers: [FormFactory],
})
export class FeatureStoreModule {
    constructor(
        @Optional() @SkipSelf() parentModule: FeatureStoreModule,
        readonly formFactory: FormFactory,
        readonly formBuilder: FormBuilder
    ) {
        throwIfAlreadyLoaded(parentModule, 'FeatureStoreModule');
        StoreModuleForms.registerForms(formFactory, formBuilder);
    }
}
