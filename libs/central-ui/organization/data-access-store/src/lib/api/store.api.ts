import { Api, ApiConfig } from '@vioc-angular/shared/util-api';
import { Observable } from 'rxjs';
import { Store } from '../model/store.model';

export class StoreApi extends Api<Store, any> {
    constructor(baseUrl: string, config: ApiConfig) {
        super(`${baseUrl}/v1/stores`, config);
        // super(`http://localhost:9002/v1/stores`, config);
    }

    /** Searches for a single `Store` by the code. */
    findByCode(code: string): Observable<Store> {
        return this.get<Store>([], { code });
    }
}
