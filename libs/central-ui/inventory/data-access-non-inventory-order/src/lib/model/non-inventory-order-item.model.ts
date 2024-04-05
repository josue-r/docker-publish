import { Described } from '@vioc-angular/shared/common-functionality';
import { NonInventoryCatalog } from './non-inventory-catalog.model';
import { NonInventoryOrderItemPK } from './non-inventory-order-item-pk.model';
import { NonInventoryOrder } from './non-inventory-order.model';

export class NonInventoryOrderItem {
    id?: NonInventoryOrderItemPK = null;
    nonInventoryOrder?: NonInventoryOrder = null;
    lineNumber?: number = null;
    quantity?: number = null;
    uom?: Described = null;
    nonInventoryCatalog?: NonInventoryCatalog = null;
    orderDate?: string = null;
}
