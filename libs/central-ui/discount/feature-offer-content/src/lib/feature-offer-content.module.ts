import { NgModule, Optional, SkipSelf } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CentralFormUiModule, CentralSearchUiModule } from '@vioc-angular/central-ui/ui-modules';
import {
    AccessModeActivateGuard,
    AccessModeRoleMapping,
    HasRoleActivateGuard,
} from '@vioc-angular/security/util-authorization';
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
import { OfferContentSearchComponent } from './components/offer-content-search/offer-content-search.component';
import { OfferContentComponent } from './components/offer-content/offer-content.component';
import { OfferContentModuleForms } from './offer-content-module-forms';
import { FormBuilder } from '@angular/forms';

const routes: Routes = [
    { path: '', redirectTo: 'search', pathMatch: 'full' },
    {
        path: 'search',
        component: OfferContentSearchComponent,
        canActivate: [HasRoleActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: { requiredRoles: ['ROLE_DISCOUNT_OFFER_CONTENT_READ'], featureFlag: 'offerContent.search.enabled' },
    },
    {
        path: ':accessMode/:offerContentName',
        component: OfferContentComponent,
        canActivate: [AccessModeActivateGuard, FeatureFlagActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: {
            accessModes: {
                view: ['ROLE_DISCOUNT_OFFER_CONTENT_READ'],
                edit: ['ROLE_DISCOUNT_OFFER_CONTENT_UPDATE'],
            } as AccessModeRoleMapping,
            featureFlag: 'offerContent.search.clickRow',
        },
    },
    {
        path: ':accessMode',
        component: OfferContentComponent,
        canActivate: [AccessModeActivateGuard, FeatureFlagActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: {
            accessModes: {
                add: ['ROLE_DISCOUNT_OFFER_CONTENT_ADD'],
            },
            featureFlag: 'offerContent.search.add',
        },
    },
];
@NgModule({
    imports: [
        RouterModule.forChild(routes),
        CentralFormUiModule,
        CentralSearchUiModule,
        FeatureFeatureFlagModule,
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
    declarations: [OfferContentSearchComponent, OfferContentComponent],
    providers: [FormFactory],
})
export class FeatureOfferContentModule {
    constructor(
        @Optional() @SkipSelf() parentModule: FeatureOfferContentModule,
        readonly formFactory: FormFactory,
        readonly formBuilder: FormBuilder
    ) {
        throwIfAlreadyLoaded(parentModule, 'FeatureOfferContentModule');

        OfferContentModuleForms.registerForms(formFactory, formBuilder);
    }
}
