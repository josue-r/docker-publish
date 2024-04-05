import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Described } from '@vioc-angular/shared/common-functionality';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { Observable } from 'rxjs';
import { CompanyExportApi } from '../api/company-export-api';
import { CompanyExportState } from '../state/company-export-state';

@Injectable()
export class CompanyExportFacade {
    private readonly api: CompanyExportApi;

    constructor(@Inject(GATEWAY_TOKEN) gateway: string, http: HttpClient, private readonly state: CompanyExportState) {
        this.api = new CompanyExportApi(gateway, { http });
    }

    findByCompanyAndType(companyCode: string, type: 'COST' | 'SALES'): Observable<Described[]> {
        // If the state has the data for this code/type, return them.  Otherwise, trigger cache intialization
        return (
            this.state.findByCompanyAndType(companyCode, type) ||
            this.state.cacheByCompanyAndType(companyCode, type, this.api.findByCompanyAndType(companyCode, type))
        );
    }
}
