import { NgModule, Optional, SkipSelf } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
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
import { OfferSearchComponent } from './offers-search/offers-search.component';
import { OffersComponent } from './offers/offers.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { OfferModuleForms } from './offer-module-forms';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { OfferStoresComponent } from './offer-stores/offer-stores.component';
import { CommonModule } from '@angular/common';
import { DiscountSelectionComponent } from './discount-selection/discount-selection.component';

const routes: Routes = [
    { path: '', redirectTo: 'search', pathMatch: 'full' },
    {
        path: 'search',
        component: OfferSearchComponent,
        canActivate: [HasRoleActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: { requiredRoles: ['ROLE_DISCOUNT_OFFER_READ'], featureFlag: 'offers.search.enabled' },
    },
    {
        path: ':accessMode/:offerId',
        component: OffersComponent,
        canActivate: [AccessModeActivateGuard, FeatureFlagActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: {
            accessModes: {
                view: ['ROLE_DISCOUNT_OFFER_READ'],
                edit: ['ROLE_DISCOUNT_OFFER_UPDATE'],
            },
            featureFlag: 'offers.search.clickRow',
        },
    },
    {
        path: ':accessMode',
        component: OffersComponent,
        canActivate: [AccessModeActivateGuard, FeatureFlagActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: {
            accessModes: {
                add: ['ROLE_DISCOUNT_OFFER_ADD'],
            },
            featureFlag: 'offer.search.add',
        },
    },
];
@NgModule({
    imports: [
        RouterModule.forChild(routes),
        CentralFormUiModule,
        CentralSearchUiModule,
        FeatureFeatureFlagModule,
        ReactiveFormsModule,
        FeatureSharedProductAddInputModule,
        CommonModule,
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
        InfiniteScrollModule,
        FeatureSharedProductAddInputModule,
    ],
    declarations: [OfferSearchComponent, OffersComponent, OfferStoresComponent, DiscountSelectionComponent],
    providers: [FormFactory],
})
export class FeatureOfferModule {
    constructor(
        @Optional() @SkipSelf() parentModule: FeatureOfferModule,
        readonly formFactory: FormFactory,
        readonly formBuilder: FormBuilder
    ) {
        throwIfAlreadyLoaded(parentModule, 'FeatureOfferModule');
        OfferModuleForms.registerForms(formFactory, formBuilder);
    }
}
