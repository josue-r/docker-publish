import { Inject } from '@angular/core';
import { isNullOrUndefined } from '@vioc-angular/shared/common-functionality';
import { Api, ApiConfig, GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { Observable } from 'rxjs';
import { InventoryOrderPK } from '../model/inventory-order-pk.model';
import { InventoryOrderProduct } from '../model/inventory-order-product.model';
import { InventoryOrder } from '../model/inventory-order.model';

export class InventoryOrderApi extends Api<InventoryOrder, InventoryOrderPK> {
    constructor(@Inject(GATEWAY_TOKEN) gateway: string, config: ApiConfig) {
        const apiGatewayPath = 'order';
        const controllerPath = 'v2/inventory-orders';
        super(`${gateway}${apiGatewayPath}/${controllerPath}`, config);
        // super(`http://localhost:9015/${controllerPath}`, config);
    }

    findByStoreCodeAndOrderNumber(storeCode: string, orderNumber: string): Observable<InventoryOrder> {
        return this.get<InventoryOrder>([], { storeCode: storeCode, orderNumber: orderNumber });
    }

    cancelInventoryOrder(storeCode: string, orderNumber: string): Observable<InventoryOrder> {
        return this.delete([], { storeCode: storeCode, orderNumber: orderNumber });
    }

    generateOrderProducts(
        storeCode: string,
        vendorCode: string,
        productCodes?: string[]
    ): Observable<InventoryOrderProduct[]> {
        return this.get<InventoryOrderProduct[]>(['generate'], {
            store: storeCode,
            vendor: vendorCode,
            product: productCodes ? productCodes : [],
        });
    }

    finalize(inventoryOrder: InventoryOrder): Observable<Object> {
        // When finalizing from the add screen, the inventoryOrder will not have an id yet
        if (isNullOrUndefined(inventoryOrder.id)) {
            return this.post([], inventoryOrder, { status: 'FINALIZED' });
        }
        return this.put([], inventoryOrder, { status: 'FINALIZED' });
    }
}
