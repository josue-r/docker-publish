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
import { InventoryOrderForms } from './inventory-order-module-forms';
import { InventoryOrderSearchComponent } from './inventory-order-search/inventory-order-search.component';
import { InventoryOrderComponent } from './inventory-order/inventory-order.component';

const routes: Routes = [
    { path: '', redirectTo: 'search', pathMatch: 'full' },
    {
        path: 'search',
        component: InventoryOrderSearchComponent,
        canActivate: [HasRoleActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: { requiredRoles: ['ROLE_INVENTORY_ORDER_READ'] },
    },
    {
        path: ':accessMode',
        component: InventoryOrderComponent,
        canActivate: [AccessModeActivateGuard, FeatureFlagActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: {
            accessModes: {
                add: ['ROLE_INVENTORY_ORDER_ADD'],
            },
            featureFlag: 'inventoryOrder.search.add',
        },
    },
    {
        path: ':accessMode/:storeCode/:orderNumber',
        component: InventoryOrderComponent,
        canActivate: [AccessModeActivateGuard, FeatureFlagActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: {
            accessModes: {
                view: ['ROLE_INVENTORY_ORDER_READ'],
                edit: ['ROLE_INVENTORY_ORDER_UPDATE'],
            },
            featureFlag: 'inventoryOrder.search.clickRow',
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
    declarations: [InventoryOrderSearchComponent, InventoryOrderComponent],
    providers: [FormFactory],
})
export class FeatureInventoryOrderModule {
    constructor(
        @Optional() @SkipSelf() parentModule: FeatureInventoryOrderModule,
        readonly formFactory: FormFactory,
        readonly formBuilder: FormBuilder
    ) {
        throwIfAlreadyLoaded(parentModule, 'FeatureInventoryOrderModule');
        InventoryOrderForms.registerForms(formFactory, formBuilder);
    }
}
