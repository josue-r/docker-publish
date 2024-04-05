import { Audited, Described } from '@vioc-angular/shared/common-functionality';
import { ProductAdjustmentDetail } from './product-adjustment-detail.model';

//@Table(name = "ADJUSTMENTHEADER")
export class ProductAdjustment implements Audited {
    id?: number = null;
    createdDate?: string = null;
    comments?: string = null;
    type?: Described = null;
    status?: Described = null;
    store?: StoreWithCompany = null;
    adjustmentProducts?: ProductAdjustmentDetail[] = [];
    createdByEmployee?: Employee = null;
    updatedByEmployee?: Employee = null;
    updatedBy?: string = null;
    updatedOn?: string = null;
}

class StoreWithCompany {
    id?: any = null;
    code?: string = null;
    description?: string = null;
    version?: number = null;
    company?: Described = null;
}

class Employee {
    id?: string = null;
    firstName?: string = null;
    lastName?: string = null;
    name?: string = null;
}
