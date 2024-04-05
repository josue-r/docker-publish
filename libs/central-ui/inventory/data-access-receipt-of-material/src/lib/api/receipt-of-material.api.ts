import { isNullOrUndefined } from '@vioc-angular/shared/common-functionality';
import { Api, ApiConfig } from '@vioc-angular/shared/util-api';
import { Observable } from 'rxjs';
import { ReceiptOfMaterial, ReceiptOfMaterialPK } from '../model/receipt-of-material.model';

export class ReceiptOfMaterialApi extends Api<ReceiptOfMaterial, ReceiptOfMaterialPK> {
    constructor(baseUrl: string, config: ApiConfig) {
        super(`${baseUrl}/v2/receipt-of-materials`, config);
        // super(`http://localhost:9015/v1/receipt-of-materials`, config);
    }

    /**
     * Returns a `ReceiptOfMaterial` along with the `ReceiptOfMaterialProduct` details by store number and the receipt number.
     */
    findReceiptProducts(storeCode: string, rmNumber: string): Observable<ReceiptOfMaterial> {
        return this.get<ReceiptOfMaterial>([], { storeCode, rmNumber });
    }

    /**
     * Returns associated `ReceiptOfMaterial` given a store code, receipt type, and order number
     */
    findAssociatedReceiptsOfMaterial(
        storeCode: string,
        receiptTypeCode: string,
        source: string,
        sourceStoreCode: string
    ): Observable<ReceiptOfMaterial[]> {
        return this.get<ReceiptOfMaterial[]>(['associated'], { storeCode, receiptTypeCode, source, sourceStoreCode });
    }

    cancelReceiptOfMaterial(storeCode: string, rmNumber: string): Observable<Object> {
        return this.delete([], { storeCode: storeCode, rmNumber: rmNumber });
    }

    finalize(receiptOfMaterial: ReceiptOfMaterial, split = false): Observable<Object> {
        const status = 'FINALIZED';
        if (isNullOrUndefined(receiptOfMaterial.id)) {
            return this.post([], receiptOfMaterial, { status });
        } else {
            return this.put([], receiptOfMaterial, { status, split: `${split}` });
        }
    }

    findOpenReceiptsOfMaterial(storeCode: string, vendorCode: string): Observable<ReceiptOfMaterial[]> {
        return this.get<ReceiptOfMaterial[]>(
            ['open-order-receipts'],
            { store: storeCode, vendor: vendorCode },
            this.contentType
        );
    }

    findOpenProductCountReceipts(storeCode: string): Observable<ReceiptOfMaterial[]> {
        return this.get<ReceiptOfMaterial[]>(['open-count-receipts'], { store: storeCode });
    }
}
