import { Audited, Described } from '@vioc-angular/shared/common-functionality';
import { NonInventoryOrderItem } from './non-inventory-order-item.model';
import { NonInventoryOrderPK } from './non-inventory-order-pk.model';

export class NonInventoryOrder implements Audited {
    id?: NonInventoryOrderPK = null;
    orderNumber?: number = null;
    exported?: boolean = null;
    comments?: string = null;
    createdBy?: string = null;
    createdByEmployee?: Employee = null;
    status?: Described = null;
    store?: StoreWithCompany = null;
    orderDate?: string = null;
    nonInventoryOrderItems?: NonInventoryOrderItem[] = [];
    updatedByEmployee?: Employee = null;
    updatedBy?: string = null;
    updatedOn?: string = null;
    version?: number = null;
}

class Employee {
    id?: string = null;
    name?: string = null;
    firstName?: string = null;
    lastName?: string = null;
    version?: number = null;
}

class StoreWithCompany extends Described {
    company?: Described = null;
}
