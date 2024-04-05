import { CommonModule } from '@angular/common';
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
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
import { UiFilteredInputModule } from '@vioc-angular/shared/ui-filtered-input';
import { UnsavedChangesGuard } from '@vioc-angular/shared/util-data-modifying';
import { FormFactory } from '@vioc-angular/shared/util-form';
import { ProductCategorySearchComponent } from './components/product-category-search/product-category-search.component';
import { ProductCategoryComponent } from './components/product-category/product-category.component';
import { ProductCategoryModuleForms } from './product-category-module-forms';

const routes: Routes = [
    { path: '', redirectTo: 'search', pathMatch: 'full' },
    {
        path: 'search',
        component: ProductCategorySearchComponent,
        canActivate: [HasRoleActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: { requiredRoles: ['ROLE_PRODUCT_CATEGORY_READ'] },
    },
    {
        path: ':accessMode/:productCategoryCode',
        component: ProductCategoryComponent,
        canActivate: [AccessModeActivateGuard, FeatureFlagActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: {
            accessModes: {
                view: ['ROLE_PRODUCT_CATEGORY_READ'],
                edit: ['ROLE_PRODUCT_CATEGORY_UPDATE'],
            } as AccessModeRoleMapping,
            featureFlag: 'productCategory.search.clickRow',
        },
    },
    {
        path: ':accessMode',
        component: ProductCategoryComponent,
        canActivate: [AccessModeActivateGuard, FeatureFlagActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: {
            accessModes: {
                add: ['ROLE_PRODUCT_CATEGORY_ADD'],
            },
            featureFlag: 'productCategory.search.add',
        },
    },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes), //
        CentralFormUiModule,
        CentralSearchUiModule,
        UiAddRemoveButtonModule,
        ReactiveFormsModule,
        CommonModule,
        UiFilteredInputModule,
        FeatureFeatureFlagModule,
    ],
    declarations: [ProductCategorySearchComponent, ProductCategoryComponent],
    providers: [FormFactory],
})
export class FeatureProductCategoryModule {
    constructor(
        @Optional() @SkipSelf() parentModule: FeatureProductCategoryModule,
        readonly formFactory: FormFactory,
        readonly formBuilder: FormBuilder
    ) {
        throwIfAlreadyLoaded(parentModule, 'FeatureProductCategoryModule');

        ProductCategoryModuleForms.registerForms(formFactory, formBuilder);
    }
}
