import { NgModule, Optional, SkipSelf } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule, Routes } from '@angular/router';
import { CentralFormUiModule, CentralSearchUiModule } from '@vioc-angular/central-ui/ui-modules';
import { AccessModeActivateGuard, HasRoleActivateGuard } from '@vioc-angular/security/util-authorization';
import { throwIfAlreadyLoaded } from '@vioc-angular/shared/common-functionality';
import { FeatureFeatureFlagModule, FeatureFlagActivateGuard } from '@vioc-angular/shared/feature-feature-flag';
import { UiDialogModule } from '@vioc-angular/shared/ui-dialog';
import { UiFilteredInputModule } from '@vioc-angular/shared/ui-filtered-input';
import { UiLoadingModule } from '@vioc-angular/shared/ui-loading';
import { UiSelectAndGoModule } from '@vioc-angular/shared/ui-select-and-go';
import { UiSlideToggleModule } from '@vioc-angular/shared/ui-slide-toggle';
import { UnsavedChangesGuard } from '@vioc-angular/shared/util-data-modifying';
import { FormFactory } from '@vioc-angular/shared/util-form';
import { PhysicalInventoryAddComponent } from './physical-inventory-add/physical-inventory-add.component';
import { PhysicalInventoryForms } from './physical-inventory-module-forms';
import { PhysicalInventoryProductsComponent } from './physical-inventory-products/physical-inventory-products.component';
import { PhysicalInventorySearchComponent } from './physical-inventory-search/physical-inventory-search.component';
import { PhysicalInventoryComponent } from './physical-inventory/physical-inventory.component';

const routes: Routes = [
    { path: '', redirectTo: 'search', pathMatch: 'full' },
    {
        path: 'search',
        component: PhysicalInventorySearchComponent,
        canActivate: [HasRoleActivateGuard, FeatureFlagActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: { requiredRoles: ['ROLE_PHYSICAL_INVENTORY_READ'], featureFlag: 'physicalInventory.search.enabled' },
    },
    {
        path: ':accessMode',
        component: PhysicalInventoryAddComponent,
        canActivate: [AccessModeActivateGuard, FeatureFlagActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: {
            accessModes: {
                add: ['ROLE_PHYSICAL_INVENTORY_ADD'],
            },
            featureFlag: 'physicalInventory.search.add',
        },
    },
    {
        path: ':accessMode/:storeCode/:productCountNumber',
        component: PhysicalInventoryComponent,
        canActivate: [AccessModeActivateGuard, FeatureFlagActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: {
            accessModes: {
                view: ['ROLE_PHYSICAL_INVENTORY_READ'],
                edit: ['ROLE_PHYSICAL_INVENTORY_UPDATE'],
            },
            featureFlag: 'physicalInventory.search.clickRow',
        },
    },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
        CentralSearchUiModule,
        CentralFormUiModule,
        FeatureFeatureFlagModule,
        MatTableModule,
        MatSortModule,
        MatIconModule,
        MatTooltipModule,
        UiFilteredInputModule,
        UiDialogModule,
        UiSelectAndGoModule,
        UiLoadingModule,
        UiSlideToggleModule,
    ],
    declarations: [
        PhysicalInventorySearchComponent,
        PhysicalInventoryComponent,
        PhysicalInventoryProductsComponent,
        PhysicalInventoryAddComponent,
    ],
    providers: [FormFactory],
})
export class FeaturePhysicalInventoryModule {
    constructor(
        @Optional() @SkipSelf() parentModule: FeaturePhysicalInventoryModule,
        readonly formFactory: FormFactory,
        readonly formBuilder: FormBuilder
    ) {
        throwIfAlreadyLoaded(parentModule, 'FeaturePhysicalInventoryModule');
        PhysicalInventoryForms.registerForms(formFactory, formBuilder);
    }
}
