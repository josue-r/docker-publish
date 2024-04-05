import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { QuerySearch } from '@vioc-angular/shared/common-api-models';
import { Searchable } from '@vioc-angular/shared/data-access-search';
import { GATEWAY_TOKEN, ResponseEntity } from '@vioc-angular/shared/util-api';
import { Observable } from 'rxjs';
import { Tsb } from '../..';
import { TsbApi } from '../api/tsb.api';

@Injectable()
export class TsbFacade implements Searchable<Tsb> {
    private readonly api: TsbApi;

    constructor(@Inject(GATEWAY_TOKEN) gateway: string, http: HttpClient) {
        this.api = new TsbApi(`${gateway}tsb-alert`, { http });
    }

    findById(id: number): Observable<Tsb> {
        return this.api.findById(id);
    }

    /** @see Api#save */
    save(tsb: Tsb) {
        return this.api.save(tsb);
    }

    activate(ids: number[]): Observable<number> {
        return this.api.activate(ids);
    }

    deactivate(ids: number[]): Observable<number> {
        return this.api.deactivate(ids);
    }

    search(querySearch: QuerySearch): Observable<ResponseEntity<Tsb>> {
        return this.api.query(querySearch);
    }

    dataSync(ids: number[]): Observable<number> {
        return this.api.dataSync(ids);
    }
}
