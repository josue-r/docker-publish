import { AssignmentCount, QuerySearch } from '@vioc-angular/shared/common-api-models';
import { Described } from '@vioc-angular/shared/common-functionality';
import { Api, ApiConfig, ResponseEntity } from '@vioc-angular/shared/util-api';
import { Observable } from 'rxjs';
import { Service } from '../model/service.model';

export class ServiceApi extends Api<Service, number> {
    constructor(baseUrl: string, config: ApiConfig) {
        super(`${baseUrl}/v1/services`, config);
        //super(`http://localhost:9003/v1/services`, config); //
    }

    /**
     * Returns true if service is assigned to any stores (active or inactive), else returns false if no records found
     * @param service Checls
     */
    isAssignedToAnyStores(service: Service): Observable<boolean> {
        return this.get<boolean>(['serviceAssignedToAnyStores'], { id: service.id });
    }

    /**
     * Returns true if actively assigned to any company or store, else returns false
     * @param service
     */
    checkIfActiveAtStoreOrCompany(service: Service): Observable<boolean> {
        return this.get<boolean>(['is-active-at-company-or-store'], { id: service.id });
    }

    findUnassignedServicesForCompany(
        company: Described,
        querySearch: QuerySearch
    ): Observable<ResponseEntity<Service>> {
        if (!querySearch.additionalParams) {
            querySearch.additionalParams = {};
        }
        querySearch.additionalParams.companyCode = company.code;
        return this.query(querySearch, ['unassigned-at-company']);
    }

    findAssignableServicesForStores(stores: { id: number; company?: { id: number } }[]): Observable<Service[]> {
        const storesWithCompany = stores.map((s) => ({ id: s.id, company: { id: s.company.id } }));
        return this.post<Service[]>(['assignable-to-stores'], storesWithCompany);
    }

    dataSync(ids: number[]) {
        return super.dataSync(ids);
    }

    /**
     * Finds active services
     * Possible optional params:
     *
     * ```ts
     *  findActive()                         // default; finds all active services
     *  findActive({ categorycode: string }) // searches for active services by category code
     * ```
     *
     * @param optionalParameters an object containing optional parameters specifying query conditions
     */
    findActive(optionalParameters: { categoryCode?: string } = {}) {
        return this.get<Described[]>(['active'], optionalParameters);
    }

    findByCode(code: string) {
        return this.get<Service>([], { code });
    }

    findUsage(ids: number[]): Observable<AssignmentCount[]> {
        return this.post<AssignmentCount[]>(['usage'], ids);
    }
}
