import { Audited } from '@vioc-angular/shared/common-functionality';

export type CommonCodeId = number;

export class CommonCode implements Audited {
    id: CommonCodeId = null;
    type?: string = null;
    code?: string = null;
    description?: string = null;
    reportOrder?: number = null;
    active?: boolean = null;
    version?: number = null;
    updatedOn?: string = null;
    updatedBy?: string = null;
}
