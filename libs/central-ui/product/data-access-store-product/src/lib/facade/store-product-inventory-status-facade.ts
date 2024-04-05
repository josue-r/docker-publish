import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { QuerySearch } from '@vioc-angular/shared/common-api-models';
import { Searchable } from '@vioc-angular/shared/data-access-search';
import { GATEWAY_TOKEN, ResponseEntity } from '@vioc-angular/shared/util-api';
import { Observable } from 'rxjs';
import { StoreProductApi } from '../api/store-product-api';
import { StoreProductInventoryStatus } from '../model/store-product-inventory-status.model';

@Injectable()
export class StoreProductInventoryStatusFacade implements Searchable<StoreProductInventoryStatus> {
    private readonly api: StoreProductApi;

    constructor(@Inject(GATEWAY_TOKEN) gateway: string, http: HttpClient) {
        this.api = new StoreProductApi(`${gateway}product`, { http });
    }
    search(querySearch: QuerySearch): Observable<ResponseEntity<StoreProductInventoryStatus>> {
        return this.api.inventoryStatusSearch(querySearch);
    }
}
