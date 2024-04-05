import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CommonFunctionalityModule } from '@vioc-angular/shared/common-functionality';
import { AuditTrailComponent } from './audit-trail/audit-trail.component';

@NgModule({
    imports: [CommonModule, CommonFunctionalityModule],
    declarations: [AuditTrailComponent],
    exports: [AuditTrailComponent],
})
export class UiAuditModule {}
