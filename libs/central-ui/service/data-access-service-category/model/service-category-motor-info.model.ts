import { Described } from '@vioc-angular/shared/common-functionality';

export class ServiceCategoryMotorInfo extends Described {
    id?: number;
    serviceCategory?: Described = null;
    item?: string = null;
    action?: string = null;
    version?: number = null;
}
