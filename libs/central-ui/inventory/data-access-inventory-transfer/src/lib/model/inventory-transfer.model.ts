import { Audited, Described } from '@vioc-angular/shared/common-functionality';
import { InventoryTransferPK } from './inventory-transfer-pk.model';
import { InventoryTransferProduct } from './inventory-transfer-product.model';

export class InventoryTransfer implements Audited {
    id?: InventoryTransferPK = null;
    fromStore?: Described = null;
    toStore?: Described = null;
    createdByEmployee?: Employee = null;
    createdOn?: string = null;
    finalizedByEmployee?: Employee = null;
    finalizedOn?: string = null;
    status?: Described = null;
    carrier?: string = null;
    inventoryTransferProducts?: InventoryTransferProduct[] = [];
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
