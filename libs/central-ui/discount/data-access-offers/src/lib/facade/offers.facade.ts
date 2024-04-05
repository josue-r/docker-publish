import { HttpClient } from '@angular/common/http';
import { Injectable, Inject } from '@angular/core';
import { QuerySearch } from '@vioc-angular/shared/common-api-models';
import { GATEWAY_TOKEN, ResponseEntity } from '@vioc-angular/shared/util-api';
import { Searchable } from '@vioc-angular/shared/data-access-search';
import { Observable } from 'rxjs';
import { OfferApi } from '../api/offers.api';
import { Offer } from '../model/offers.model';

@Injectable()
export class OfferFacade implements Searchable<Offer> {
    private readonly api: OfferApi;

    constructor(@Inject(GATEWAY_TOKEN) gateway: string, http: HttpClient) {
        this.api = new OfferApi(`${gateway}discount`, { http });
    }

    /** @see SearchPageFacade.search */
    search(querySearch: QuerySearch): Observable<ResponseEntity<Offer>> {
        return this.api.query(querySearch, ['v2/discount-offers/search']);
    }

    /** @see OfferApi#findById */
    findById(id: string): Observable<Offer> {
        return this.api.findById(id);
    }

    /** @see Api#save */
    save(offer: Offer): Observable<Object> {
        return this.api.save(offer, ['v1/discount-offers']);
    }
}
