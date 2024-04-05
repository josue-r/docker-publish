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
import { NonInventoryItemAddInputComponent } from './non-inventory-item-add-input/non-inventory-item-add-input.component';
import { NonInventoryOrderItemSelectionComponent } from './non-inventory-order-item-selection/non-inventory-order-item-selection.component';
import { NonInventoryOrderForms } from './non-inventory-order-module-forms';
import { NonInventoryOrderSearchComponent } from './non-inventory-order-search/non-inventory-order-search.component';
import { NonInventoryOrderComponent } from './non-inventory-order/non-inventory-order.component';

const routes: Routes = [
    { path: '', redirectTo: 'search', pathMatch: 'full' },
    {
        path: 'search',
        component: NonInventoryOrderSearchComponent,
        canActivate: [HasRoleActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: { requiredRoles: ['ROLE_NON_INVENTORY_ORDER_READ'], featureFlag: 'nonInventoryOrder.search.enabled' },
    },
    {
        path: ':accessMode',
        component: NonInventoryOrderComponent,
        canActivate: [AccessModeActivateGuard, FeatureFlagActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: {
            accessModes: {
                add: ['ROLE_NON_INVENTORY_ORDER_ADD'],
            },
            featureFlag: 'nonInventoryOrder.search.add',
        },
    },
    {
        path: ':accessMode/:storeCode/:orderNumber',
        component: NonInventoryOrderComponent,
        canActivate: [AccessModeActivateGuard, FeatureFlagActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: {
            accessModes: {
                view: ['ROLE_NON_INVENTORY_ORDER_READ'],
                edit: ['ROLE_NON_INVENTORY_ORDER_UPDATE'],
            },
            featureFlag: 'nonInventoryOrder.search.clickRow',
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
    declarations: [
        NonInventoryOrderSearchComponent,
        NonInventoryOrderItemSelectionComponent,
        NonInventoryItemAddInputComponent,
        NonInventoryOrderComponent,
    ],
    providers: [FormFactory],
})
export class FeatureNonInventoryOrderModule {
    constructor(
        @Optional() @SkipSelf() parentModule: FeatureNonInventoryOrderModule,
        readonly formFactory: FormFactory,
        readonly formBuilder: FormBuilder
    ) {
        throwIfAlreadyLoaded(parentModule, 'FeatureNonInventoryOrderModule');
        NonInventoryOrderForms.registerForms(formFactory, formBuilder);
    }
}
