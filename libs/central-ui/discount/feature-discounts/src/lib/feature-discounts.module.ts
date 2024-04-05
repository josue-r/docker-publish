import { CommonModule } from '@angular/common';
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule, Routes } from '@angular/router';
import { FeatureSharedProductCategorySelectionModule } from '@vioc-angular/central-ui/product/feature-shared-product-category-selection';
import { FeatureSharedServiceCategorySelectionModule } from '@vioc-angular/central-ui/service/feature-shared-service-category-selection';
import { CentralFormUiModule, CentralSearchUiModule } from '@vioc-angular/central-ui/ui-modules';
import { AccessModeActivateGuard, HasRoleActivateGuard } from '@vioc-angular/security/util-authorization';
import { throwIfAlreadyLoaded } from '@vioc-angular/shared/common-functionality';
import { FeatureFeatureFlagModule, FeatureFlagActivateGuard } from '@vioc-angular/shared/feature-feature-flag';
import { FeatureSearchModule } from '@vioc-angular/shared/feature-search';
import { UiButtonModule } from '@vioc-angular/shared/ui-button';
import { UiDialogModule } from '@vioc-angular/shared/ui-dialog';
import { UiFilteredInputModule } from '@vioc-angular/shared/ui-filtered-input';
import { UiSelectAndGoModule } from '@vioc-angular/shared/ui-select-and-go';
import { UtilColumnModule } from '@vioc-angular/shared/util-column';
import { UnsavedChangesGuard } from '@vioc-angular/shared/util-data-modifying';
import { FormFactory } from '@vioc-angular/shared/util-form';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { DiscountLineItemComponent } from './discount-line-item/discount-line-item.component';
import { DiscountModuleForms } from './discount-module-forms';
import { DiscountsSearchComponent } from './discounts-search/discounts-search.component';
import { DiscountsStoreAssignmentComponent } from './discounts-store-assignment/discounts-store-assignment.component';
import { DiscountsComponent } from './discounts/discounts.component';
import { ProductCategoryAddInputComponent } from './product-category-add-input/product-category-add-input.component';
import { ServiceCategoryAddInputComponent } from './service-category-add-input/service-category-add-input.component';

// Provides non-default roles values that should have edit access.
// This is required for the search-page.component to enable edit mode through clickRow event.
const customEditRoles: string[] = ['ROLE_NATIONAL_DISCOUNT_UPDATE', 'ROLE_LOCAL_DISCOUNT_UPDATE'];

// Provides non-default roles values that should have view access.
// This is required for the search-page.component to enable view mode.
const customViewRoles: string[] = ['ROLE_NATIONAL_DISCOUNT_READ', 'ROLE_LOCAL_DISCOUNT_READ'];

// Provides non-default roles values that should have add access.
// This is required for the search-page.component to enable add mode.
const customAddRoles: string[] = ['ROLE_NATIONAL_DISCOUNT_ADD', 'ROLE_LOCAL_DISCOUNT_ADD'];

const routes: Routes = [
    { path: '', redirectTo: 'search', pathMatch: 'full' },
    {
        path: 'search',
        component: DiscountsSearchComponent,
        canActivate: [HasRoleActivateGuard],
        data: {
            requiredRoles: customViewRoles,
            featureFlag: 'discount.search.enabled',
            customViewRoles: customViewRoles,
            customEditRoles: customEditRoles,
            customAddRoles: customAddRoles,
        },
    },
    {
        path: ':accessMode/:discountCode',
        component: DiscountsComponent,
        canActivate: [AccessModeActivateGuard, FeatureFlagActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: {
            accessModes: {
                view: customViewRoles,
                edit: customEditRoles,
            },
            featureFlag: 'discounts.search.clickRow',
        },
    },
    {
        path: ':accessMode/:discountCode/:companyCode',
        component: DiscountsComponent,
        canActivate: [AccessModeActivateGuard, FeatureFlagActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: {
            accessModes: {
                view: customViewRoles,
                edit: customEditRoles,
            },
            featureFlag: 'discounts.search.clickRow',
        },
    },
    {
        path: ':accessMode',
        component: DiscountsComponent,
        canActivate: [AccessModeActivateGuard, FeatureFlagActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: {
            accessModes: {
                add: customAddRoles,
            },
            featureFlag: 'discounts.search.add',
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
        CommonModule,
        MatIconModule,
        MatExpansionModule,
        MatSortModule,
        MatTableModule,
        MatTooltipModule,
        UiFilteredInputModule,
        UtilColumnModule,
        UiDialogModule,
        UiButtonModule,
        UiSelectAndGoModule,
        FeatureSearchModule,
        InfiniteScrollModule,
        FeatureSharedProductCategorySelectionModule,
        FeatureSharedServiceCategorySelectionModule,
    ],
    declarations: [
        DiscountsSearchComponent,
        DiscountsComponent,
        ProductCategoryAddInputComponent,
        ServiceCategoryAddInputComponent,
        DiscountLineItemComponent,
        DiscountsStoreAssignmentComponent,
    ],
    providers: [FormFactory],
})
export class FeatureDiscountsModule {
    constructor(
        @Optional() @SkipSelf() parentModule: FeatureDiscountsModule,
        readonly formFactory: FormFactory,
        readonly formBuilder: FormBuilder
    ) {
        throwIfAlreadyLoaded(parentModule, 'FeatureDiscountsModule');
        DiscountModuleForms.registerForms(formFactory, formBuilder);
    }
}
