import { NgModule } from '@angular/core';
import { MockLoadingOverlayComponent } from './loading-overlay.component.mock';
import { MockLoadingDirective } from './loading.directive.mock';

@NgModule({
    declarations: [MockLoadingOverlayComponent, MockLoadingDirective],
    exports: [MockLoadingOverlayComponent, MockLoadingDirective],
})
export class UiLoadingMockModule {}
