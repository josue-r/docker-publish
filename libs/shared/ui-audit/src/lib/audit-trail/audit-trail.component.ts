import { Component, Input } from '@angular/core';
import { Audited } from '@vioc-angular/shared/common-functionality';
import { Moment } from 'moment';

@Component({
    selector: 'vioc-angular-audit-trail',
    template: `<div class="audit-trail" *ngIf="on && by">Last updated by {{ by }} on {{ on | moment }}</div>`,
    styleUrls: ['./audit-trail.component.scss'],
})
export class AuditTrailComponent {
    @Input() updatedOn: string | Moment;

    @Input() updatedBy: string;

    @Input() audited: Audited;

    get on(): string | Moment {
        return this.updatedOn || this.audited?.updatedOn;
    }

    get by(): string {
        return this.updatedBy || this.audited?.updatedBy;
    }
}
