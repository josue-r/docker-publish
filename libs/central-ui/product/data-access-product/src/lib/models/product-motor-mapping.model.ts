import { Audited } from '@vioc-angular/shared/common-functionality';

export class ProductMotorMapping implements Audited {
    id?: number = null;
    motorKey?: string = null;
    version?: number = null;
    updatedOn?: string = null;
    updatedBy?: string = null;
}
