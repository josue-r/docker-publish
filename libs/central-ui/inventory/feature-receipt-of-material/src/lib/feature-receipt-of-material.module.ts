import { CommonModule } from '@angular/common';
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { RouterModule, Routes } from '@angular/router';
import { FeatureSharedProductAddInputModule } from '@vioc-angular/central-ui/product/feature-shared-product-add-input';
import { CentralFormUiModule, CentralSearchUiModule } from '@vioc-angular/central-ui/ui-modules';
import {
    AccessModeActivateGuard,
    AccessModeRoleMapping,
    HasRoleActivateGuard,
} from '@vioc-angular/security/util-authorization';
import { throwIfAlreadyLoaded } from '@vioc-angular/shared/common-functionality';
import { FeatureFeatureFlagModule, FeatureFlagActivateGuard } from '@vioc-angular/shared/feature-feature-flag';
import { UiAddRemoveButtonModule } from '@vioc-angular/shared/ui-add-remove-button';
import { UiButtonModule } from '@vioc-angular/shared/ui-button';
import { UiDialogModule } from '@vioc-angular/shared/ui-dialog';
import { UiFilteredInputModule } from '@vioc-angular/shared/ui-filtered-input';
import { UiSelectAndGoModule } from '@vioc-angular/shared/ui-select-and-go';
import { UtilColumnModule } from '@vioc-angular/shared/util-column';
import { UnsavedChangesGuard } from '@vioc-angular/shared/util-data-modifying';
import { FormFactory } from '@vioc-angular/shared/util-form';
import { ReceiptOfMaterialModuleForm } from './components/receipt-of-material-module-form';
import { ReceiptOfMaterialSearchComponent } from './components/receipt-of-material-search/receipt-of-material-search.component';
import { ReceiptOfMaterialComponent } from './components/receipt-of-material/receipt-of-material.component';

const routes: Routes = [
    { path: '', redirectTo: 'search', pathMatch: 'full' },
    {
        path: 'search',
        component: ReceiptOfMaterialSearchComponent,
        canActivate: [HasRoleActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: { requiredRoles: ['ROLE_RECEIPT_OF_MATERIAL_READ'] },
    },
    {
        path: ':accessMode/:storeNum/:rmNum',
        component: ReceiptOfMaterialComponent,
        canActivate: [AccessModeActivateGuard, FeatureFlagActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: {
            accessModes: {
                view: ['ROLE_RECEIPT_OF_MATERIAL_READ'],
                edit: ['ROLE_RECEIPT_OF_MATERIAL_UPDATE'],
            } as AccessModeRoleMapping,
            featureFlag: 'receiptOfMaterial.search.clickRow',
        },
    },
    {
        path: ':accessMode',
        component: ReceiptOfMaterialComponent,
        canActivate: [AccessModeActivateGuard, FeatureFlagActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: {
            accessModes: {
                add: ['ROLE_RECEIPT_OF_MATERIAL_ADD'],
            },
            featureFlag: 'receiptOfMaterial.search.add',
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
        FeatureFeatureFlagModule,
        CommonModule,
        MatTableModule,
        MatSortModule,
        MatIconModule,
        UtilColumnModule,
        UiDialogModule,
        UiButtonModule,
        UiSelectAndGoModule,
        UiFilteredInputModule,
        FeatureSharedProductAddInputModule,
    ],
    declarations: [ReceiptOfMaterialSearchComponent, ReceiptOfMaterialComponent],
    providers: [FormFactory],
})
export class FeatureReceiptOfMaterialModule {
    constructor(
        @Optional() @SkipSelf() parentModule: FeatureReceiptOfMaterialModule,
        readonly formFactory: FormFactory,
        readonly formBuilder: FormBuilder
    ) {
        throwIfAlreadyLoaded(parentModule, 'FeatureReceiptOfMaterialModule');

        ReceiptOfMaterialModuleForm.registerForms(formFactory, formBuilder);
    }
}
