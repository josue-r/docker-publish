import { CommonModule } from '@angular/common';
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HasRoleActivateGuard, AccessModeActivateGuard } from '@vioc-angular/security/util-authorization';
import { throwIfAlreadyLoaded } from '@vioc-angular/shared/common-functionality';
import { FeatureFeatureFlagModule, FeatureFlagActivateGuard } from '@vioc-angular/shared/feature-feature-flag';
import { UnsavedChangesGuard } from '@vioc-angular/shared/util-data-modifying';
import { FormFactory } from '@vioc-angular/shared/util-form';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { FeatureSharedProductAddInputModule } from '@vioc-angular/central-ui/product/feature-shared-product-add-input';
import { CentralFormUiModule, CentralSearchUiModule } from '@vioc-angular/central-ui/ui-modules';
import { UiAddRemoveButtonModule } from '@vioc-angular/shared/ui-add-remove-button';
import { UiButtonModule } from '@vioc-angular/shared/ui-button';
import { UiDialogModule } from '@vioc-angular/shared/ui-dialog';
import { UiFilteredInputModule } from '@vioc-angular/shared/ui-filtered-input';
import { UiSelectAndGoModule } from '@vioc-angular/shared/ui-select-and-go';
import { UtilColumnModule } from '@vioc-angular/shared/util-column';
import { DefectiveProductSearchComponent } from './defective-product-search/defective-product-search.component';
import { DefectiveProductComponent } from './defective-product/defective-product.component';
import { DefectiveProductModuleForm } from './defective-product-module-form';

const routes: Routes = [
    { path: '', redirectTo: 'search', pathMatch: 'full' },
    {
        path: 'search',
        component: DefectiveProductSearchComponent,
        canActivate: [HasRoleActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: { requiredRoles: ['ROLE_DEFECTIVE_PRODUCT_READ'], featureFlag: 'defectiveProduct.search.enabled' },
    },
    {
        path: ':accessMode',
        component: DefectiveProductComponent,
        canActivate: [AccessModeActivateGuard, FeatureFlagActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: {
            accessModes: {
                add: ['ROLE_DEFECTIVE_PRODUCT_ADD'],
            },
            featureFlag: 'defectiveProduct.search.add',
        },
    },
    {
        path: ':accessMode/:storeCode/:defectId',
        component: DefectiveProductComponent,
        canActivate: [AccessModeActivateGuard, FeatureFlagActivateGuard],
        canDeactivate: [UnsavedChangesGuard],
        data: {
            accessModes: {
                view: ['ROLE_DEFECTIVE_PRODUCT_READ'],
                edit: ['ROLE_DEFECTIVE_PRODUCT_UPDATE'],
            },
            featureFlag: 'defectiveProduct.search.clickRow',
        },
    },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
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
    declarations: [DefectiveProductComponent, DefectiveProductSearchComponent],
    providers: [FormFactory],
})
export class FeatureDefectiveProductModule {
    constructor(
        @Optional() @SkipSelf() parentModule: FeatureDefectiveProductModule,
        readonly formFactory: FormFactory,
        readonly formBuilder: FormBuilder
    ) {
        throwIfAlreadyLoaded(parentModule, 'FeatureDefectiveProductModule');
        DefectiveProductModuleForm.registerForms(formFactory, formBuilder);
    }
}
