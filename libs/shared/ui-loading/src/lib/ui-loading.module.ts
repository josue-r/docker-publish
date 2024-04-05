import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingOverlayComponent } from './loading-overlay/loading-overlay.component';
import { LoadingComponent } from './loading/loading.component';
import { LoadingDirective } from './loading/loading.directive';

@NgModule({
    imports: [CommonModule, MatProgressSpinnerModule],
    declarations: [LoadingComponent, LoadingOverlayComponent, LoadingDirective],
    exports: [LoadingOverlayComponent, LoadingDirective],
})
export class UiLoadingModule {}
