import { Described } from '@vioc-angular/shared/common-functionality';

export class InventoryTransferProduct {
    product?: Described = null;
    uom?: Described = null;
    quantity?: number = null;
    quantityOnHand?: number = null;
    version?: number = null;
}
