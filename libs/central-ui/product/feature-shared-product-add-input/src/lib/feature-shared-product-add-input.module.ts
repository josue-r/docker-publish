import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FeatureSharedStoreProductSelectionModule } from '@vioc-angular/central-ui/product/feature-shared-store-product-selection';
import { CentralFormUiModule } from '@vioc-angular/central-ui/ui-modules';
import { UiDialogModule } from '@vioc-angular/shared/ui-dialog';
import { ProductAddInputComponent } from './product-add-input/product-add-input.component';

@NgModule({
    imports: [
        CommonModule,
        CentralFormUiModule,
        FeatureSharedStoreProductSelectionModule,
        MatIconModule,
        MatTooltipModule,
        UiDialogModule,
    ],
    declarations: [ProductAddInputComponent],
    exports: [ProductAddInputComponent],
})
export class FeatureSharedProductAddInputModule {}
