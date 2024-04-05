import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { Observable } from 'rxjs';
import { WorkingBayApi } from '../api/working-bay.api';
import { WorkingBay } from '../model/working-bay.model';
import { WorkingBayServices } from '../model/working-bay-services.model';

@Injectable()
export class WorkingBayFacade {
    private readonly api: WorkingBayApi;

    constructor(@Inject(GATEWAY_TOKEN) gateway: string, http: HttpClient) {
        // FOR LOCAL TESTING
        // this.api = new WorkingBayApi('http://localhost:4000', { http });
        this.api = new WorkingBayApi(`${gateway}`, { http });
    }

    getWorkingBayStatusByNumber(bayNumber: string): Observable<WorkingBay> {
        return this.api.getWorkingBayStatusByNumber(bayNumber);
    }

    getWorkingBayServicesByNumberAndRootServiceCategoryCode(
        bayNumber: string,
        rootServiceCategoryCode: string
    ): Observable<WorkingBayServices> {
        return this.api.getWorkingBayServicesByNumberAndRootServiceCategoryCode(bayNumber, rootServiceCategoryCode);
    }

    getBooleanAttributeByNumberAndType(bayNumber: string, attributeType: string): Observable<boolean> {
        return this.api.getBooleanAttributeByNumberAndType(bayNumber, attributeType);
    }
}
