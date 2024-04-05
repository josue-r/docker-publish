import { NgModule, Optional, SkipSelf } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { RouterModule, Routes } from '@angular/router';
import { FeatureSharedProductAddInputModule } from '@vioc-angular/central-ui/product/feature-shared-product-add-input';
import { CentralFormUiModule, CentralSearchUiModule } from '@vioc-angular/central-ui/ui-modules';
import { AccessModeActivateGuard, HasRoleActivateGuard } from '@vioc-angular/security/util-authorization';
import { throwIfAlreadyLoaded } from '@vioc-angular/shared/common-functionality';
import { FeatureFeatureFlagModule, FeatureFlagActivateGuard } from '@vioc-angular/shared/feature-feature-flag';
import { UiDialogModule } from '@vioc-angular/shared/ui-dialog';
import { UiFilteredInputModule } from '@vioc-angular/shared/ui-filtered-input';
import { UnsavedChangesGuard } from '@vioc-angular/shared/util-data-modifying';
import { FormFactory } from '@vioc-angular/shared/util-form';
import { InventoryTransferForms } from './inventory-transfer-module-forms';
import { InventoryTransferSearchComponent } from './inventory-transfer-search/inventory-transfer-search.component';
import { InventoryTransferProductsComponent } from './inventory-transfer/inventory-transfer-products/inventory-transfer-products.component';
import { InventoryTransferStoreSelectionComponent } from './inventory-transfer/inventory-transfer-store-selection/inventory-transfer-store-selection.component';
import { InventoryTransferComponent } from './inventory-transfer/inventory-transfer.component';
const routes: Routes = [
    { path: '', redirectTo: 'search', pathMatch: 'full' },
    {
        path: 'search',
        component: InventoryTransferSearchComponent,
        canActivate: [HasRoleActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: { requiredRoles: ['ROLE_INVENTORY_TRANSFER_READ'] },
    },
    {
        path: ':accessMode',
        component: InventoryTransferComponent,
        canActivate: [AccessModeActivateGuard, FeatureFlagActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: {
            accessModes: {
                add: ['ROLE_INVENTORY_TRANSFER_ADD'],
            },
            featureFlag: 'inventoryTransfer.search.add',
        },
    },
    {
        path: ':accessMode/:storeCode/:transferNumber',
        component: InventoryTransferComponent,
        canActivate: [AccessModeActivateGuard, FeatureFlagActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: {
            accessModes: {
                view: ['ROLE_INVENTORY_TRANSFER_READ'],
                edit: ['ROLE_INVENTORY_TRANSFER_UPDATE'],
            },
            featureFlag: 'inventoryTransfer.search.clickRow',
        },
    },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
        CentralSearchUiModule,
        CentralFormUiModule,
        FeatureFeatureFlagModule,
        FeatureSharedProductAddInputModule,
        MatTableModule,
        MatSortModule,
        MatIconModule,
        UiFilteredInputModule,
        UiDialogModule,
    ],
    declarations: [
        InventoryTransferSearchComponent,
        InventoryTransferComponent,
        InventoryTransferStoreSelectionComponent,
        InventoryTransferProductsComponent,
    ],
    providers: [FormFactory],
})
export class FeatureInventoryTransferModule {
    constructor(
        @Optional() @SkipSelf() parentModule: FeatureInventoryTransferModule,
        readonly formFactory: FormFactory,
        readonly formBuilder: FormBuilder
    ) {
        throwIfAlreadyLoaded(parentModule, 'FeatureInventoryOrderModule');
        InventoryTransferForms.registerForms(formFactory, formBuilder);
    }
}
