import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { QuerySearch } from '@vioc-angular/shared/common-api-models';
import { Searchable } from '@vioc-angular/shared/data-access-search';
import { GATEWAY_TOKEN, ResponseEntity } from '@vioc-angular/shared/util-api';
import { Observable } from 'rxjs';
import { ReceiptOfMaterialApi } from '../api/receipt-of-material.api';
import { ReceiptOfMaterial } from '../model/receipt-of-material.model';

@Injectable()
export class ReceiptOfMaterialFacade implements Searchable<ReceiptOfMaterial> {
    private readonly api: ReceiptOfMaterialApi;

    constructor(@Inject(GATEWAY_TOKEN) gateway: string, http: HttpClient) {
        this.api = new ReceiptOfMaterialApi(`${gateway}order`, { http });
    }

    /**
     * @see SearchPageFacade.search
     */
    search(querySearch: QuerySearch): Observable<ResponseEntity<ReceiptOfMaterial>> {
        return this.api.query(querySearch);
    }

    /**
     * @see ReceiptOfMaterialApi.findReceiptProducts
     */
    findReceiptProducts(storeNumber: string, rmNumber: string): Observable<ReceiptOfMaterial> {
        return this.api.findReceiptProducts(storeNumber, rmNumber);
    }

    /**
     * @see ReceiptOfMaterialApi.findAssociatedReceiptsOfMaterial
     */
    findAssociatedReceiptsOfMaterial(
        storeCode: string,
        receiptType: string,
        source: string,
        sourceStoreCode: string
    ): Observable<ReceiptOfMaterial[]> {
        return this.api.findAssociatedReceiptsOfMaterial(storeCode, receiptType, source, sourceStoreCode);
    }

    /** @see Api#save */
    save(receiptOfMaterial: ReceiptOfMaterial): Observable<Object> {
        return this.api.save(receiptOfMaterial);
    }

    /** @see ReceiptOfMaterialApi.cancelReceiptOfMaterial */
    cancelReceiptOfMaterial(storeCode: string, rmNumber: string): Observable<Object> {
        return this.api.cancelReceiptOfMaterial(storeCode, rmNumber);
    }

    /** @see Api#finalize */
    finalize(receiptOfMaterial: ReceiptOfMaterial, split: boolean): Observable<Object> {
        return this.api.finalize(receiptOfMaterial, split);
    }

    findOpenReceiptsOfMaterial(storeCode: string, vendorCode: string): Observable<ReceiptOfMaterial[]> {
        return this.api.findOpenReceiptsOfMaterial(storeCode, vendorCode);
    }

    findOpenProductCountReceipts(storeCode: string): Observable<ReceiptOfMaterial[]> {
        return this.api.findOpenProductCountReceipts(storeCode);
    }
}
