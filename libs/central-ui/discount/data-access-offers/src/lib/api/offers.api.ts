import { Api, ApiConfig } from '@vioc-angular/shared/util-api';
import { Observable } from 'rxjs';
import { Offer } from '../model/offers.model';

export class OfferApi extends Api<Offer, any> {
    constructor(baseUrl: string, config: ApiConfig) {
        super(`${baseUrl}`, config);
        // super(`http://localhost:9013/v1/discount-offers`, config);
    }

    /** Searches for a single `Offer` by the id */
    findById(id: string): Observable<Offer> {
        return this.get<Offer>(['v1/discount-offers'], { id });
    }
}
