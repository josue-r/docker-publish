import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { QuerySearch } from '@vioc-angular/shared/common-api-models';
import { GATEWAY_TOKEN, ResponseEntity } from '@vioc-angular/shared/util-api';
import { Observable } from 'rxjs';
import { TechnicalAlertApi } from '../api/technical-alert.api';
import { TechnicalAlert } from '../model/technical-alert.model';

@Injectable()
export class TechnicalAlertFacade {
    private readonly api: TechnicalAlertApi;

    constructor(@Inject(GATEWAY_TOKEN) gateway: string, http: HttpClient) {
        this.api = new TechnicalAlertApi(`${gateway}tsb-alert`, { http });
    }

    findById(id: number): Observable<TechnicalAlert> {
        return this.api.findById(id);
    }

    save(technicalAlert: TechnicalAlert) {
        return this.api.save(technicalAlert);
    }

    update(technicalAlert: TechnicalAlert) {
        return this.api.updateTechnicalAlert(technicalAlert);
    }

    add(technicalAlert: TechnicalAlert) {
        return this.api.addTechnicalAlert(technicalAlert);
    }

    search(querySearch: QuerySearch): Observable<ResponseEntity<TechnicalAlert>> {
        return this.api.query(querySearch);
    }

    activate(ids: number[]): Observable<number> {
        return this.api.activate(ids);
    }

    deactivate(ids: number[]): Observable<number> {
        return this.api.deactivate(ids);
    }

    dataSync(ids: number[]): Observable<number> {
        return this.api.dataSync(ids);
    }
}
