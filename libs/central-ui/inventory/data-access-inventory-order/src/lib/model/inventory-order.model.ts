import { Audited, Described } from '@vioc-angular/shared/common-functionality';
import { InventoryOrderPK } from './inventory-order-pk.model';
import { InventoryOrderProduct } from './inventory-order-product.model';

export class InventoryOrder implements Audited {
    id?: InventoryOrderPK = null;
    store?: Described = null;
    status?: Described = null;
    vendor?: Described = null;
    inventoryOrderProducts?: InventoryOrderProduct[] = [];
    comments?: string = null;
    finalizedOn?: string = null;
    finalizedByEmployee?: Employee = null;
    createdOn?: string = null;
    createdByEmployee?: Employee = null;
    updatedOn?: string = null;
    updatedBy?: string = null;
    version?: number = null;
}

class Employee {
    id?: string = null;
    name?: string = null;
    firstName?: string = null;
    lastName?: string = null;
}
