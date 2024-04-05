import { NgModule, Optional, SkipSelf } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { RouterModule, Routes } from '@angular/router';
import { FeatureSharedStoreSelectionModule } from '@vioc-angular/central-ui/organization/feature-shared-store-selection';
import { FeatureSharedProductSelectionModule } from '@vioc-angular/central-ui/product/feature-shared-product-selection';
import { CentralFormUiModule, CentralSearchUiModule } from '@vioc-angular/central-ui/ui-modules';
import { STANDARD_ERROR_MESSAGES } from '@vioc-angular/central-ui/util-message';
import {
    AccessModeActivateGuard,
    AccessModeRoleMapping,
    HasRoleActivateGuard,
} from '@vioc-angular/security/util-authorization';
import { throwIfAlreadyLoaded } from '@vioc-angular/shared/common-functionality';
import { FeatureFeatureFlagModule, FeatureFlagActivateGuard } from '@vioc-angular/shared/feature-feature-flag';
import { FeatureMassUpdate } from '@vioc-angular/shared/feature-mass-update';
import { UiCurrencyPrefixModule } from '@vioc-angular/shared/ui-currency-prefix';
import { UiFilteredInputModule } from '@vioc-angular/shared/ui-filtered-input';
import { UiStepperNavigationModule } from '@vioc-angular/shared/ui-stepper-navigation';
import { UtilColumnModule } from '@vioc-angular/shared/util-column';
import { UnsavedChangesGuard } from '@vioc-angular/shared/util-data-modifying';
import { FormFactory } from '@vioc-angular/shared/util-form';
import { StoreProductMassAddComponent } from './components/store-product-mass-add/store-product-mass-add.component';
import { StoreProductMassUpdateComponent } from './components/store-product-mass-update/store-product-mass-update.component';
import { StoreProductSearchComponent } from './components/store-product-search/store-product-search.component';
import { StoreProductModuleForms } from './store-product-module-forms';
import { StoreProductComponent } from './store-product/store-product.component';

const routes: Routes = [
    { path: '', redirectTo: 'search', pathMatch: 'full' },
    {
        path: 'search',
        component: StoreProductSearchComponent,
        canActivate: [HasRoleActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: { requiredRoles: ['ROLE_STORE_PRODUCT_READ'] },
    },
    {
        path: 'add',
        component: StoreProductMassAddComponent,
        canActivate: [HasRoleActivateGuard, FeatureFlagActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: { requiredRoles: ['ROLE_STORE_PRODUCT_ADD'], featureFlag: 'storeProduct.search.add' },
    },
    {
        path: ':accessMode/:storeNum/:productCode',
        component: StoreProductComponent,
        canActivate: [AccessModeActivateGuard, FeatureFlagActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: {
            accessModes: {
                view: ['ROLE_STORE_PRODUCT_READ'],
                edit: ['ROLE_STORE_PRODUCT_UPDATE'],
                'add-like': ['ROLE_STORE_PRODUCT_ADD'],
            } as AccessModeRoleMapping,

            featureFlag: 'storeProduct.search.clickRow',
        },
    },
    {
        path: 'mass-update',
        component: StoreProductMassUpdateComponent,
        canActivate: [HasRoleActivateGuard, FeatureFlagActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        // data: { requiredRoles: ['ROLE_STORE_PRODUCT_MASS_UPDATE'] } TODO: role needs to be added
        data: { requiredRoles: ['ROLE_STORE_PRODUCT_UPDATE'], featureFlag: 'storeProduct.search.massUpdate' },
    },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes), //
        UiCurrencyPrefixModule,
        CentralFormUiModule,
        CentralSearchUiModule,
        UiStepperNavigationModule,
        FeatureFeatureFlagModule,
        FeatureSharedProductSelectionModule,
        FeatureSharedStoreSelectionModule,
        FeatureMassUpdate,
        MatStepperModule,
        MatListModule,
        MatTableModule,
        MatPaginatorModule,
        UiFilteredInputModule,
        UtilColumnModule,
    ],
    declarations: [
        StoreProductSearchComponent,
        StoreProductComponent,
        StoreProductMassAddComponent,
        StoreProductMassUpdateComponent,
    ],
    providers: [FormFactory],
})
export class FeatureStoreProductModule {
    constructor(
        @Optional() @SkipSelf() parentModule: FeatureStoreProductModule,
        readonly formFactory: FormFactory,
        readonly formBuilder: FormBuilder
    ) {
        throwIfAlreadyLoaded(parentModule, 'FeatureCompanyProductModule');
        StoreProductModuleForms.registerForms(formFactory, formBuilder);

        /**
         * Displayed message after receiving an `error.minStockLimitEndDate.minStockLimit.required` `ApiError`
         * when attempting to activate a store product when it is inactive at the company.
         */
        STANDARD_ERROR_MESSAGES['error.product-api.inactiveAtCompany'] = () => {
            return { message: 'Cannot active a Store Product if it is inactive at the Company' };
        };
        /**
         * Displayed message after receiving an `error.minStockLimitEndDate.minStockLimit.required` `ApiError`
         * when the min stock amount not having a value when the min stock end date does.
         */
        STANDARD_ERROR_MESSAGES['error.product-api.minStockLimitEndDate.minStockLimit.required'] = () => {
            return { message: 'If Min Stock End Date is set, Min Stock Amount is also required' };
        };
        /**
         * Displayed message after receiving an `error.minOrderQuantity.notMultipleOfQuantityPerPack` `ApiError`
         * when the min order quantity not being a multiple of the quantity per pack.
         */
        STANDARD_ERROR_MESSAGES['error.product-api.minOrderQuantity.notMultipleOfQuantityPerPack'] = () => {
            return { message: 'Minimum order quantity must be a multiple of Quantity Per Pack' };
        };
        /**
         * Displayed message after receiving an `error.product-api.noPrimaryVendorForStore` `ApiError`
         * when attempting to assign the default vendor of a store that has not primary vendor.
         */
        STANDARD_ERROR_MESSAGES['error.product-api.noPrimaryVendorForStore'] = () => {
            return { message: 'Cannot use default Vendor for a store without a primary Vendor' };
        };
    }
}
