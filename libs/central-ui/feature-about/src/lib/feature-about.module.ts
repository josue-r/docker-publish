import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { CommonFunctionalityModule } from '@vioc-angular/shared/common-functionality';
import { UiDialogModule } from '@vioc-angular/shared/ui-dialog';
import { AboutDialogComponent } from './about-dialog/about-dialog.component';
import { AboutComponent } from './about/about.component';

@NgModule({
    imports: [
        CommonModule,
        MatButtonModule,
        MatDialogModule,
        UiDialogModule,
        HttpClientModule,
        MatTableModule,
        CommonFunctionalityModule,
    ],
    declarations: [AboutComponent, AboutDialogComponent],
    exports: [AboutComponent, AboutDialogComponent],
})
export class FeatureAboutModule {}
