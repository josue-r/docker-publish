import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { QuerySearch } from '@vioc-angular/shared/common-api-models';
import { Described } from '@vioc-angular/shared/common-functionality';
import { Searchable } from '@vioc-angular/shared/data-access-search';
import { GATEWAY_TOKEN, ResponseEntity } from '@vioc-angular/shared/util-api';
import { Observable } from 'rxjs/internal/Observable';
import { GenerateTransferProduct } from '../model/generate-transfer-product.model';
import { InventoryTransferApi } from './../api/inventory-transfer.api';
import { InventoryTransfer } from './../model/inventory-transfer.model';

@Injectable()
export class InventoryTransferFacade implements Searchable<InventoryTransfer> {
    private readonly api: InventoryTransferApi;

    constructor(@Inject(GATEWAY_TOKEN) gateway: string, http: HttpClient) {
        this.api = new InventoryTransferApi(`${gateway}inventory`, { http });
    }

    /**
     * @see SearchPageFacade.search
     */
    search(querySearch: QuerySearch): Observable<ResponseEntity<InventoryTransfer>> {
        return this.api.query(querySearch);
    }

    productLookup(fromStore: string, toStore: string, productCode: string[]): Observable<GenerateTransferProduct[]> {
        return this.api.productLookup(fromStore, toStore, productCode);
    }

    /** @see Api#save */
    save(inventoryTransfer: InventoryTransfer) {
        return this.api.save(inventoryTransfer);
    }

    /** @see Api#save */
    finalize(inventoryTransfer: InventoryTransfer) {
        return this.api.finalize(inventoryTransfer);
    }

    /** @see InventoryTransferApi#getToStores */
    getToStores(fromStore: string): Observable<Described[]> {
        return this.api.getToStores(fromStore);
    }

    /** @see InventoryTransferApi#findByStoreAndId */
    findByFromStoreAndTransferId(fromStore: string, transferId: string): Observable<InventoryTransfer> {
        return this.api.findByFromStoreAndTransferId(fromStore, transferId);
    }

    cancelInventoryTransfer(fromStore: string, transferId: string): Observable<Object> {
        return this.api.cancelInventoryTransfer(fromStore, transferId);
    }
}
