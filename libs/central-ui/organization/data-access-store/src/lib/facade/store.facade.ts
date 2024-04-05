import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { RoleFacade } from '@vioc-angular/security/data-access-security';
import { QuerySearch } from '@vioc-angular/shared/common-api-models';
import { Searchable } from '@vioc-angular/shared/data-access-search';
import { GATEWAY_TOKEN, ResponseEntity } from '@vioc-angular/shared/util-api';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { StoreApi } from '../api/store.api';
import { Store } from '../model/store.model';

@Injectable()
export class StoreFacade implements Searchable<Store> {
    private readonly api: StoreApi;

    constructor(@Inject(GATEWAY_TOKEN) gateway: string, http: HttpClient, public readonly roleFacade: RoleFacade) {
        this.api = new StoreApi(`${gateway}organization`, { http });
    }

    /**
     * @see SearchPageFacade.search
     */
    search(querySearch: QuerySearch): Observable<ResponseEntity<Store>> {
        return this.api.query(querySearch);
    }

    /** @see StoreApi#findByCode */
    findByCode(code: string): Observable<Store> {
        return this.api.findByCode(code);
    }

    /** @see Api#save */
    save(store: Store): Observable<Object> {
        // Switching update endpoints based on authority
        // Checking STORE_UPDATE first since it has priority
        return this.roleFacade.getMyRoles().pipe(
            switchMap((roles) => {
                if (roles.includes('ROLE_STORE_UPDATE')) {
                    return this.api.save(store);
                } else if (roles.includes('ROLE_STORE_LOCATION_CONTENT_UPDATE')) {
                    return this.api.save(store, ['location-content']);
                } else if (roles.includes('ROLE_STORE_LATITUDE_LONGITUDE_UPDATE')) {
                    return this.api.save(store, ['coordinates']);
                }
            })
        );
    }

    /**
     * @see SearchPageFacade.dataSync
     */
    dataSync(ids: number[]): Observable<number> {
        return this.api.dataSync(ids);
    }
}
