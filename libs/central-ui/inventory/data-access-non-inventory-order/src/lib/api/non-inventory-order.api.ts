import { Api, ApiConfig } from '@vioc-angular/shared/util-api';
import { Observable } from 'rxjs';
import { NonInventoryOrderPK } from '../model/non-inventory-order-pk.model';
import { NonInventoryOrder } from '../model/non-inventory-order.model';

export class NonInventoryOrderApi extends Api<NonInventoryOrder, NonInventoryOrderPK> {
    constructor(baseUrl: string, config: ApiConfig) {
        super(`${baseUrl}/v1/non-inventory-orders`, config);
        // super(`http://localhost:9007/v1/non-inventory-orders`, config);
    }

    finalizeSave(nonInventoryOrder: NonInventoryOrder): Observable<Object> {
        return this.post([], nonInventoryOrder, { status: 'FINALIZED' });
    }

    finalizeUpdate(nonInventoryOrder: NonInventoryOrder): Observable<Object> {
        return this.put([], nonInventoryOrder, { status: 'FINALIZED' });
    }

    findNonInventoryOrder(storeCode: string, orderNumber: string): Observable<NonInventoryOrder> {
        return this.get<NonInventoryOrder>([], { storeCode: storeCode, orderNumber: orderNumber });
    }
}
