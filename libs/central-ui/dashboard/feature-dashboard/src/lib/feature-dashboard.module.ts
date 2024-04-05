import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DashboardComponent } from './dashboard/dashboard.component';

@NgModule({
    imports: [CommonModule],
    declarations: [DashboardComponent],
    exports: [DashboardComponent],
})
export class FeatureDashboardModule {}
