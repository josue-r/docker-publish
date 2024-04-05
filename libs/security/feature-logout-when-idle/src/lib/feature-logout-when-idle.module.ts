import { CommonModule } from '@angular/common';
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { NgIdleModule } from '@ng-idle/core';
import { throwIfAlreadyLoaded } from '@vioc-angular/shared/common-functionality';
import { UiDialogModule } from '@vioc-angular/shared/ui-dialog';
import { LogoutWhenIdleComponent } from './logout-when-idle/logout-when-idle.component';

@NgModule({
    imports: [CommonModule, NgIdleModule.forRoot(), UiDialogModule],
    declarations: [LogoutWhenIdleComponent],
    exports: [LogoutWhenIdleComponent],
})
export class FeatureLogoutWhenIdleModule {
    constructor(@Optional() @SkipSelf() parentModule: FeatureLogoutWhenIdleModule) {
        throwIfAlreadyLoaded(parentModule, 'FeatureLogoutWhenIdleModule');
    }
}
