import { Audited, Described } from '@vioc-angular/shared/common-functionality';
import { PhysicalInventoryCount } from './physical-inventory-count.model';

export class PhysicalInventory implements Audited {
    id?: number = null;
    store?: Described = null;
    frequency?: Described = null;
    status?: Described = null;
    createdOn?: string = null;
    finalizedOn?: string = null;
    counts?: PhysicalInventoryCount[] = [];
    updatedByEmployee?: Employee = null;
    updatedBy?: string = null;
    updatedOn?: string = null;
    version?: number = null;
}

class Employee {
    id?: string = null;
    firstName?: string = null;
    lastName?: string = null;
}
