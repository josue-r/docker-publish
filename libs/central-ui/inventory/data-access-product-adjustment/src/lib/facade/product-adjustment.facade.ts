import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { QuerySearch } from '@vioc-angular/shared/common-api-models';
import { Searchable } from '@vioc-angular/shared/data-access-search';
import { GATEWAY_TOKEN, ResponseEntity } from '@vioc-angular/shared/util-api';
import { Observable } from 'rxjs';
import { ProductAdjustmentApi } from '../api/product-adjustment.api';
import { ProductAdjustment } from '../model/product-adjustment.model';

@Injectable()
export class ProductAdjustmentFacade implements Searchable<ProductAdjustment> {
    private readonly api: ProductAdjustmentApi;

    constructor(@Inject(GATEWAY_TOKEN) gateway: string, http: HttpClient) {
        this.api = new ProductAdjustmentApi(`${gateway}inventory`, { http });
    }

    findByAdjustmentId(productAdjustmentId: number): Observable<ProductAdjustment> {
        return this.api.findByAdjustmentId(productAdjustmentId);
    }

    /**
     * @see SearchPageFacade.search
     */
    search(querySearch: QuerySearch): Observable<ResponseEntity<ProductAdjustment>> {
        return this.api.query(querySearch);
    }

    /** @see Api#save */
    save(productAdjustment: ProductAdjustment) {
        return this.api.save(productAdjustment);
    }

    /** @see Api#finalize */
    finalize(productAdjustment: ProductAdjustment) {
        productAdjustment.adjustmentProducts.forEach((element) => {
            if (element.sign === '-') {
                const negativeQuantity = element.quantity * -1;
                element.quantity = negativeQuantity;
            }
        });
        return this.api.finalize(productAdjustment);
    }
}
