import { Inject } from '@angular/core';
import { Described } from '@vioc-angular/shared/common-functionality';
import { Api, ApiConfig, GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { Observable } from 'rxjs';
import { Vendor } from '../model/vendor.model';

export class VendorApi extends Api<Vendor, number> {
    constructor(@Inject(GATEWAY_TOKEN) gateway: string, config: ApiConfig) {
        super(`${gateway}inventory/v1/vendors`, config);
        // super(`http://localhost:9007/v1/vendors`, config);
    }

    /**
     * @deprecated Use findByStores instead
     */
    findByStore(storeNumber: string): Observable<Described[]> {
        return this.get<Described[]>([], { store: storeNumber });
    }

    findByStores(storeNumbers: string[]): Observable<Described[]> {
        return this.post<Described[]>([], storeNumbers);
    }

    findAllAccessibleActive(): Observable<Described[]> {
        return this.get<Described[]>(['all']);
    }
}
