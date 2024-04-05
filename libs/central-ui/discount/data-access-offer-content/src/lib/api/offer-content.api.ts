import { Api, ApiConfig } from '@vioc-angular/shared/util-api';
import { Observable } from 'rxjs';
import { OfferContent } from '../model/offer-content.model';

export class OfferContentApi extends Api<OfferContent, any> {
    constructor(baseUrl: string, config: ApiConfig) {
        super(`${baseUrl}/v1/discount-offer-contents`, config);
        // super(`http://localhost:9013/v1/discount-offer-contents`, config);
    }

    findActive() {
        return this.get<OfferContent[]>(['active']);
    }

    /** Find OfferContent by the given name. */
    findByName(name: string): Observable<OfferContent> {
        return this.get<OfferContent>([], { name });
    }
}
