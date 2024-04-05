import { Described } from '@vioc-angular/shared/common-functionality';
import { Api, ApiConfig } from '@vioc-angular/shared/util-api';
import { Observable } from 'rxjs';
import { GenerateTransferProduct } from '../model/generate-transfer-product.model';
import { InventoryTransferPK } from '../model/inventory-transfer-pk.model';
import { InventoryTransfer } from '../model/inventory-transfer.model';

export class InventoryTransferApi extends Api<InventoryTransfer, InventoryTransferPK> {
    constructor(baseUrl: string, config: ApiConfig) {
        super(`${baseUrl}/v1/inventory-transfers`, config);
        //super(`http://localhost:9007/v1/inventory-transfers`, config);
    }

    finalize(inventoryTransfer: InventoryTransfer): Observable<Object> {
        if (inventoryTransfer.id) {
            return this.put([], inventoryTransfer, { status: 'FINALIZED' });
        } else {
            return this.post([], inventoryTransfer, { status: 'FINALIZED' });
        }
    }

    productLookup(fromStore: string, toStore: string, productCodes: string[]): Observable<GenerateTransferProduct[]> {
        return this.post<GenerateTransferProduct[]>(['product-lookup'], productCodes, { from: fromStore, to: toStore });
    }

    /** Lookup valid "to stores" based on a given "from store". */
    getToStores(fromStore: string): Observable<Described[]> {
        return this.get(['to-stores'], { from: fromStore });
    }

    cancelInventoryTransfer(fromStore: string, transferId: string): Observable<Object> {
        return this.delete([], { fromStore: fromStore, transferId: transferId });
    }

    findByFromStoreAndTransferId(fromStore: string, transferId: string): Observable<InventoryTransfer> {
        return this.get([], { fromStore: fromStore, transferId: transferId }, this.contentType);
    }
}
