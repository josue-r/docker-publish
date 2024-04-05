import { HttpClient } from '@angular/common/http';
import { Injectable, Inject } from '@angular/core';
import { QuerySearch } from '@vioc-angular/shared/common-api-models';
import { GATEWAY_TOKEN, ResponseEntity } from '@vioc-angular/shared/util-api';
import { Searchable } from '@vioc-angular/shared/data-access-search';
import { Observable } from 'rxjs';
import { OfferContentApi } from '../api/offer-content.api';
import { OfferContent } from '../model/offer-content.model';

@Injectable()
export class OfferContentFacade implements Searchable<OfferContent> {
    private readonly api: OfferContentApi;

    constructor(@Inject(GATEWAY_TOKEN) gateway: string, http: HttpClient) {
        this.api = new OfferContentApi(`${gateway}discount`, { http });
    }

    /**
     * @see SearchPageFacade.search
     */
    search(querySearch: QuerySearch): Observable<ResponseEntity<OfferContent>> {
        return this.api.query(querySearch);
    }

    /** @see OfferContentApi#findActive */
    findActive() {
        return this.api.findActive();
    }

    /** @see OfferContentApiApi#findByName  */
    findByName(name: string): Observable<OfferContent> {
        return this.api.findByName(name);
    }

    /** @see Api#save */
    save(offerContent: OfferContent) {
        return this.api.save(offerContent);
    }
}
