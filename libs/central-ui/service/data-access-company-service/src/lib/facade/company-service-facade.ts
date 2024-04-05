import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { SearchPageFacade } from '@vioc-angular/central-ui/feature-search-page';
import { AssignmentCount, QuerySearch } from '@vioc-angular/shared/common-api-models';
import { EntityPatch, GATEWAY_TOKEN, ResponseEntity } from '@vioc-angular/shared/util-api';
import { Observable } from 'rxjs/internal/Observable';
import { CompanyServiceApi } from '../api/company-service-api';
import { CompanyServiceMassAddPreview } from '../model/company-service-mass-add-preview.model';
import { CompanyService } from '../model/company-service.model';

@Injectable()
export class CompanyServiceFacade implements SearchPageFacade<CompanyService> {
    private readonly api: CompanyServiceApi;

    constructor(@Inject(GATEWAY_TOKEN) gateway: string, http: HttpClient) {
        this.api = new CompanyServiceApi(gateway, { http });
    }

    findByCompanyAndServiceCode(companyId: string, serviceId: string): Observable<CompanyService> {
        return this.api.findByCompanyAndServiceCode(companyId, serviceId);
    }

    /**
     * @see Api.activate
     */
    activate(ids: { companyId: number; serviceId: number }[]): Observable<number> {
        return this.api.activate(ids);
    }

    /**
     * @see Api.deactivate
     */
    deactivate(ids: { companyId: number; serviceId: number }[]): Observable<number> {
        return this.api.deactivate(ids);
    }

    update(companyService: CompanyService): Observable<Object> {
        return this.api.update(companyService);
    }

    /**
     * @see SearchPageFacade.search
     */
    search(querySearch: QuerySearch): Observable<ResponseEntity<CompanyService>> {
        return this.api.query(querySearch);
    }

    /**
     * @see CompanyServiceApi.findUsage
     */
    findUsage(ids: { companyId: number; serviceId: number }[]): Observable<AssignmentCount[]> {
        return this.api.findUsage(ids);
    }

    /**
     * @see Api.previewMassAdd
     */
    previewMassAdd(companyIds: number[], serviceIds: number[]): Observable<CompanyServiceMassAddPreview[]> {
        return this.api.previewMassAdd(companyIds, serviceIds);
    }

    /**
     * @see Api.add
     */
    add(companyServices: CompanyService[]): Observable<number> {
        return this.api.add(companyServices);
    }

    /**
     * @see SearchPageFacade.entityPatch
     */
    entityPatch(patches: EntityPatch<{ companyId: number; serviceId: number }>[]): Observable<Object> {
        return this.api.entityPatch(['patch'], ...patches);
    }

    /**
     * @see SearchPageFacade.dataSync
     */
    dataSync(ids: { companyId: number; serviceId: number }[]): Observable<number> {
        return this.api.dataSync(ids);
    }
}
