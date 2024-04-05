import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { QuerySearch } from '@vioc-angular/shared/common-api-models';
import { isNullOrUndefined } from '@vioc-angular/shared/common-functionality';
import { Searchable } from '@vioc-angular/shared/data-access-search';
import { GATEWAY_TOKEN, ResponseEntity } from '@vioc-angular/shared/util-api';
import { Observable } from 'rxjs';
import { NonInventoryOrderApi } from '../api/non-inventory-order.api';
import { NonInventoryOrder } from '../model/non-inventory-order.model';

@Injectable()
export class NonInventoryOrderFacade implements Searchable<NonInventoryOrder> {
    private readonly api: NonInventoryOrderApi;

    constructor(@Inject(GATEWAY_TOKEN) gateway: string, http: HttpClient) {
        this.api = new NonInventoryOrderApi(`${gateway}inventory`, { http });
    }

    /**
     * @see SearchPageFacade.search
     */
    search(querySearch: QuerySearch): Observable<ResponseEntity<NonInventoryOrder>> {
        return this.api.query(querySearch);
    }

    /** @see Api#save */
    save(nonInventoryOrder: NonInventoryOrder): Observable<Object> {
        return this.api.save(nonInventoryOrder);
    }

    finalize(nonInventoryOrder: NonInventoryOrder): Observable<Object> {
        if (isNullOrUndefined(nonInventoryOrder.id)) {
            return this.api.finalizeSave(nonInventoryOrder);
        } else {
            return this.api.finalizeUpdate(nonInventoryOrder);
        }
    }

    findNonInventoryOrder(storeCode: string, orderNumber: string): Observable<NonInventoryOrder> {
        return this.api.findNonInventoryOrder(storeCode, orderNumber);
    }
}
