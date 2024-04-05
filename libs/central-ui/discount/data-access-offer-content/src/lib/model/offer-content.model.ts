import { Audited } from '@vioc-angular/shared/common-functionality';

export class OfferContent implements Audited {
    id?: number = null;
    name?: string = null;
    shortText?: string = null;
    active?: boolean = null;
    longText?: string = null;
    disclaimerShortText?: string = null;
    disclaimerLongText?: string = null;
    conditions?: string = null;
    version?: number = null;
    updatedOn?: string = null;
    updatedBy?: string = null;
}
