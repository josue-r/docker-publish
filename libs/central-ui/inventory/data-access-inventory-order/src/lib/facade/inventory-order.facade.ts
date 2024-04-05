import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { QuerySearch } from '@vioc-angular/shared/common-api-models';
// tslint:disable-next-line: nx-enforce-module-boundaries
import { Searchable } from '@vioc-angular/shared/data-access-search';
import { GATEWAY_TOKEN, ResponseEntity } from '@vioc-angular/shared/util-api';
import { Observable } from 'rxjs';
import { InventoryOrderApi } from '../api/inventory-order.api';
import { InventoryOrderProduct } from '../model/inventory-order-product.model';
import { InventoryOrder } from '../model/inventory-order.model';

@Injectable()
export class InventoryOrderFacade implements Searchable<InventoryOrder> {
    private readonly api: InventoryOrderApi;

    constructor(@Inject(GATEWAY_TOKEN) gateway: string, http: HttpClient) {
        this.api = new InventoryOrderApi(gateway, { http });
    }

    /**
     * @see SearchPageFacade.search
     */
    search(querySearch: QuerySearch): Observable<ResponseEntity<InventoryOrder>> {
        return this.api.query(querySearch);
    }

    /** @see Api#save */
    save(inventoryOrder: InventoryOrder) {
        return this.api.save(inventoryOrder);
    }

    /** @see Api#finalize */
    finalize(inventoryOrder: InventoryOrder) {
        return this.api.finalize(inventoryOrder);
    }

    /** @see Api#findByStoreCodeAndOrderNumber */
    findByStoreCodeAndOrderNumber(storeCode: string, orderNumber: string): Observable<InventoryOrder> {
        return this.api.findByStoreCodeAndOrderNumber(storeCode, orderNumber);
    }

    /** @see Api#cancelInventoryOrder */
    cancelInventoryOrder(storeCode: string, orderNumber: string): Observable<InventoryOrder> {
        return this.api.cancelInventoryOrder(storeCode, orderNumber);
    }

    /** @see Api#generateOrderProducts */
    generateOrderProducts(
        storeCode: string,
        vendorCode: string,
        productCodes?: string[]
    ): Observable<InventoryOrderProduct[]> {
        return this.api.generateOrderProducts(storeCode, vendorCode, productCodes);
    }
}
