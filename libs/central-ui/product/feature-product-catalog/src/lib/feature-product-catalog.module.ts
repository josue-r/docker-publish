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
import { ProductSearchComponent } from './components/product-search/product-search.component';
import { ProductComponent } from './components/product/product.component';
import { ProductModuleForms } from './product-module-forms';

const routes: Routes = [
    { path: '', redirectTo: 'search', pathMatch: 'full' },
    {
        path: 'search',
        component: ProductSearchComponent,
        canActivate: [HasRoleActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: { requiredRoles: ['ROLE_PRODUCT_READ'] },
    },
    {
        path: ':accessMode',
        component: ProductComponent,
        canActivate: [AccessModeActivateGuard, FeatureFlagActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: {
            accessModes: {
                add: ['ROLE_PRODUCT_ADD'],
            },
            featureFlag: 'product.search.add',
        },
    },
    {
        path: ':accessMode/:productCode',
        component: ProductComponent,
        canActivate: [AccessModeActivateGuard, FeatureFlagActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: {
            accessModes: {
                view: ['ROLE_PRODUCT_READ'],
                edit: ['ROLE_PRODUCT_UPDATE'],
                'add-like': ['ROLE_PRODUCT_ADD'],
            } as AccessModeRoleMapping,
            featureFlag: 'product.search.clickRow',
        },
    },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes), //
        CentralFormUiModule,
        CentralSearchUiModule,
        UiAddRemoveButtonModule,
        UiMassDeactivateDialogModule,
    ],
    declarations: [ProductSearchComponent, ProductComponent],
    providers: [FormFactory],
})
export class FeatureProductCatalogModule {
    constructor(
        @Optional() @SkipSelf() parentModule: FeatureProductCatalogModule,
        formFactory: FormFactory,
        formBuilder: FormBuilder
    ) {
        throwIfAlreadyLoaded(parentModule, 'FeatureProductCatalogModule');
        ProductModuleForms.registerForms(formFactory, formBuilder);

        // TODO: refactor as part of Story5398 into messageKeys
        FormErrorDirective.standardErrors.relatedProductInactive = () => {
            return 'Product is not active';
        };
        FormErrorDirective.standardErrors.relatedProductInvalid = () => {
            return 'Value is invalid';
        };
        FormErrorDirective.standardErrors.relatedProductObsolete = () => {
            return 'Product is obsolete';
        };
        FormErrorDirective.standardErrors.relatedProductNested = (errors) => {
            return `The entered related product is already related to ${errors.relatedProductNested.code}. Try relating to that product instead`;
        };
        FormErrorDirective.standardErrors.productCode = () => {
            return `Can only contain letters, numbers, spaces, -, _, and /`;
        };
        FormErrorDirective.standardErrors.productCodeStart = () => {
            return `Should start with either a letter or a number`;
        };
        FormErrorDirective.standardErrors.sapNumber = () => {
            return `Can only contain capital letters, numbers, spaces, -, and _`;
        };
        FormErrorDirective.standardErrors.upc = () => {
            return `Can only contain letters, numbers, spaces, single quotes, periods, and -`;
        };

        /**
         * Displayed message after receiving an `error.relatedProductCode.notFound` `ApiError` when
         * attempting to relate a product to another product that is inactive.
         */
        STANDARD_ERROR_MESSAGES['error.product-api.inactiveRelatedProduct'] = () => {
            return { message: 'The Related Product Code is inactive' };
        };
        /**
         * Displayed message after receiving an `error.relatedProductCode.notFound` `ApiError` when
         * attempting to relate a product to another product that does not exist.
         */
        STANDARD_ERROR_MESSAGES['error.product-api.notFoundRelatedProduct'] = () => {
            return { message: "The Related Product Code doesn't exist" };
        };
        /**
         * Displayed message after receiving an `error.relatedProductCode.notFound` `ApiError` when
         * attempting to relate a product to another product that is obsolete.
         */
        STANDARD_ERROR_MESSAGES['error.product-api.obsoleteRelatedProduct'] = () => {
            return { message: 'The Related Product Code is obsolete' };
        };
        /**
         * Displayed message after receiving an `error.product-api.productActiveAtCompanies` `ApiError` when
         * attempting deactivate a product that is assigned to a company.
         */
        STANDARD_ERROR_MESSAGES['error.product-api.productActiveAtCompanies'] = () => {
            return { message: 'Cannot deactivate if assigned to Companies' };
        };
        /**
         * Displayed message after receiving an `error.product-api.productActiveAtStores` `ApiError` when
         * attempting to deactivate a product that is assigned a store.
         */
        STANDARD_ERROR_MESSAGES['error.product-api.productActiveAtStores'] = () => {
            return { message: 'Cannot deactivate if assigned to Stores' };
        };
    }
}
