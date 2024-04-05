import { NgModule, Optional, SkipSelf } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CentralSearchUiModule } from '@vioc-angular/central-ui/ui-modules';
import { HasRoleActivateGuard } from '@vioc-angular/security/util-authorization';
import { throwIfAlreadyLoaded } from '@vioc-angular/shared/common-functionality';
import { FeatureFeatureFlagModule, FeatureFlagActivateGuard } from '@vioc-angular/shared/feature-feature-flag';
import { UnsavedChangesGuard } from '@vioc-angular/shared/util-data-modifying';
import { FormFactory } from '@vioc-angular/shared/util-form';
import { InventoryStatusSearchComponent } from './inventory-status-search/inventory-status-search.component';

const routes: Routes = [
    { path: '', redirectTo: 'search', pathMatch: 'full' },
    {
        path: 'search',
        component: InventoryStatusSearchComponent,
        canActivate: [HasRoleActivateGuard, FeatureFlagActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: { requiredRoles: ['ROLE_INVENTORY_STATUS_READ'], featureFlag: 'inventoryStatus.search.enabled' },
    },
];
@NgModule({
    imports: [RouterModule.forChild(routes), CentralSearchUiModule, FeatureFeatureFlagModule],
    declarations: [InventoryStatusSearchComponent],
    providers: [FormFactory],
})
export class FeatureInventoryStatusModule {
    constructor(@Optional() @SkipSelf() parentModule: FeatureInventoryStatusModule) {
        throwIfAlreadyLoaded(parentModule, 'FeatureInventoryStatusModule');
    }
}
