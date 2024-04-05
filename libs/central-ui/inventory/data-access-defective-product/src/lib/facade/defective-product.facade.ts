import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { QuerySearch } from '@vioc-angular/shared/common-api-models';
import { Searchable } from '@vioc-angular/shared/data-access-search';
import { GATEWAY_TOKEN, ResponseEntity } from '@vioc-angular/shared/util-api';
import { Observable } from 'rxjs';
import { DefectiveProductApi } from '../api/defective-product.api';
import { DefectiveProduct } from '../model/defective-product.model';

@Injectable()
export class DefectiveProductFacade implements Searchable<DefectiveProduct> {
    private readonly api: DefectiveProductApi;

    constructor(@Inject(GATEWAY_TOKEN) gateway: string, http: HttpClient) {
        this.api = new DefectiveProductApi(`${gateway}inventory`, { http });
    }

    /**
     * @see SearchPageFacade.search
     */
    search(querySearch: QuerySearch): Observable<ResponseEntity<DefectiveProduct>> {
        return this.api.query(querySearch);
    }

    /** @see Api#finalize */
    finalize(defectiveProduct: DefectiveProduct): Observable<Object> {
        return this.api.finalize(defectiveProduct);
    }

    getDefectiveProduct(storeCode: string, defectId: string): Observable<Object> {
        return this.api.getDefectiveProduct(storeCode, defectId);
    }
}
