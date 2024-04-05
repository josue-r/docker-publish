import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { NonInventoryCatalog } from '@vioc-angular/central-ui/inventory/data-access-non-inventory-order';
import { QuerySearch } from '@vioc-angular/shared/common-api-models';
import { Searchable } from '@vioc-angular/shared/data-access-search';
import { GATEWAY_TOKEN, ResponseEntity } from '@vioc-angular/shared/util-api';
import { Observable } from 'rxjs';
import { NonInventoryItemApi } from '../api/non-inventory-item.api';

@Injectable()
export class NonInventoryItemFacade implements Searchable<NonInventoryCatalog> {
    private readonly api: NonInventoryItemApi;

    constructor(@Inject(GATEWAY_TOKEN) gateway: string, http: HttpClient) {
        this.api = new NonInventoryItemApi(`${gateway}inventory`, { http });
    }

    /**
     * @see SearchPageFacade.search
     */
    search(querySearch: QuerySearch): Observable<ResponseEntity<NonInventoryCatalog>> {
        return this.api.query(querySearch);
    }

    getItemDetails(companyCode: string, storeCode: string, itemNumbers: string[]): Observable<NonInventoryCatalog[]> {
        return this.api.getItemDetails(companyCode, storeCode, itemNumbers);
    }
}
