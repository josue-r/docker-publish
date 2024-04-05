import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UiFileUploadModule } from '@vioc-angular/shared/ui-file-upload';
import { UiInfoButtonModule } from '@vioc-angular/shared/ui-info-button';
import { DocumentSelectionComponent } from './document-selection/document-selection.component';
import { UtilFormModule } from '@vioc-angular/shared/util-form';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonToggleModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        UiFileUploadModule,
        UiInfoButtonModule,
        UtilFormModule,
    ],
    declarations: [DocumentSelectionComponent],
    exports: [DocumentSelectionComponent],
})
export class FeatureSharedDocumentSelectionModule {}
