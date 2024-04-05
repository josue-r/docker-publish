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
import { UiButtonModule } from '@vioc-angular/shared/ui-button';
import { UiCurrencyPrefixModule } from '@vioc-angular/shared/ui-currency-prefix';
import { UiDialogModule } from '@vioc-angular/shared/ui-dialog';
import { UiFilteredInputModule } from '@vioc-angular/shared/ui-filtered-input';
import { UiSelectAndGoModule } from '@vioc-angular/shared/ui-select-and-go';
import { UtilColumnModule } from '@vioc-angular/shared/util-column';
import { UnsavedChangesGuard } from '@vioc-angular/shared/util-data-modifying';
import { FormFactory } from '@vioc-angular/shared/util-form';
import { ProductAdjustmentForms } from './product-adjustment-module-forms';
import { ProductAdjustmentProductsComponent } from './product-adjustment-products/product-adjustment-products.component';
import { ProductAdjustmentSearchComponent } from './product-adjustment-search/product-adjustment-search.component';
import { ProductAdjustmentComponent } from './product-adjustment/product-adjustment.component';

const routes: Routes = [
    { path: '', redirectTo: 'search', pathMatch: 'full' },
    {
        path: 'search',
        component: ProductAdjustmentSearchComponent,
        canActivate: [HasRoleActivateGuard, FeatureFlagActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: {
            requiredRoles: ['ROLE_PRODUCT_ADJUSTMENT_READ'],
            featureFlag: ['productAdjustment.search.enabled', 'productAdjustment.search.clickRow'],
        },
    },
    {
        path: ':accessMode',
        component: ProductAdjustmentComponent,
        canActivate: [AccessModeActivateGuard, FeatureFlagActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: {
            accessModes: {
                add: ['ROLE_PRODUCT_ADJUSTMENT_ADD'],
            },
            featureFlag: 'productAdjustment.search.add',
        },
    },
    {
        path: ':accessMode/:adjustmentId',
        component: ProductAdjustmentComponent,
        canActivate: [AccessModeActivateGuard, FeatureFlagActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: {
            accessModes: {
                view: ['ROLE_PRODUCT_ADJUSTMENT_READ'],
                edit: ['ROLE_PRODUCT_ADJUSTMENT_UPDATE'],
            },
            featureFlag: 'productAdjustment.search.clickRow',
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
    ],
    declarations: [ProductAdjustmentSearchComponent, ProductAdjustmentComponent, ProductAdjustmentProductsComponent],
    providers: [FormFactory],
})
export class FeatureProductAdjustmentModule {
    constructor(
        @Optional() @SkipSelf() parentModule: FeatureProductAdjustmentModule,
        readonly formFactory: FormFactory,
        readonly formBuilder: FormBuilder
    ) {
        throwIfAlreadyLoaded(parentModule, 'FeatureProductAdjustmentModule');
        ProductAdjustmentForms.registerForms(formFactory, formBuilder);
    }
}
