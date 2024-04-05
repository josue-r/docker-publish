import { Inject } from '@angular/core';
import { AssignmentCount } from '@vioc-angular/shared/common-api-models';
import { Api, ApiConfig, GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { Observable } from 'rxjs';
import { CompanyServiceMassAddPreview } from '../model/company-service-mass-add-preview.model';
import { CompanyService } from '../model/company-service.model';

export class CompanyServiceApi extends Api<CompanyService, { companyId: number; serviceId: number }> {
    constructor(@Inject(GATEWAY_TOKEN) gateway: string, config: ApiConfig) {
        super(`${gateway}service/v1/company-services`, config);
        // super(`http://localhost:9003/v1/company-services`, config); //
    }

    findByCompanyAndServiceCode(companyCode: string, serviceCode: string): Observable<CompanyService> {
        return this.get<CompanyService>([], { companyCode, serviceCode });
    }

    findUsage(ids: { companyId: number; serviceId: number }[]): Observable<AssignmentCount[]> {
        return this.post<AssignmentCount[]>(['usage'], ids);
    }
    // protected addSingle(service: CompanyService): Observable<Object> {
    //     return this.post([], [service]);
    // }
    // public add(services: CompanyService[]): Promise<number> {
    //     return super.add(services);
    // }
    // dataSync(ids: { companyId: number, serviceId: number }[]) {
    //     return super.dataSync(ids);
    // }

    /**
     * Retrieve a preview of what `CompanyServices` are assignable out of the given companyIds and serviceIds.
     */
    previewMassAdd(companyIds: number[], serviceIds: number[]): Observable<CompanyServiceMassAddPreview[]> {
        return this.post(['mass-add-preview'], { companyIds, serviceIds });
    }
}
