import { BayCode } from '@vioc-angular/shared/common-event-models';

export interface BayType {
    code: BayCode;
    description: string;
}

export class WorkingBay {
    id: number = null;
    bayNumber: number = null;
    bayType: BayType = null;
    visitInvoiceType: string = null;
    visitCustomerType: string = null;
}
