import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SearchPageFacade } from '@vioc-angular/central-ui/feature-search-page';
import { QuerySearch } from '@vioc-angular/shared/common-api-models';
import { EntityPatch, GATEWAY_TOKEN, ResponseEntity } from '@vioc-angular/shared/util-api';
import { Observable } from 'rxjs';
import { InvoiceApi } from '../api/invoice.api';
import { Invoice } from '../models/invoice.model';

@Injectable()
export class InvoiceFacade implements SearchPageFacade<Invoice> {
    private readonly api: InvoiceApi;

    constructor(@Inject(GATEWAY_TOKEN) gateway: string, http: HttpClient) {
        this.api = new InvoiceApi(`${gateway}invoice`, { http });
    }

    /**
     * @see SearchPageFacade.search
     */
    search(querySearch: QuerySearch): Observable<ResponseEntity<Invoice>> {
        return this.api.query(querySearch);
    }

    /**
     * @see SearchPageFacade.entityPatch
     */
    entityPatch(patches: EntityPatch<number>[]): Observable<Object> {
        return this.api.entityPatch(['patch'], ...patches);
    }

    /**
     * @see SearchPageFacade.dataSync
     */
    dataSync(ids: number[]): Observable<number> {
        return this.api.dataSync(ids);
    }
}
