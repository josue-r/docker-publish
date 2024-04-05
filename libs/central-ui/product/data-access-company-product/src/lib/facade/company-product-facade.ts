import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { SearchPageFacade } from '@vioc-angular/central-ui/feature-search-page';
import { AssignmentCount, QuerySearch } from '@vioc-angular/shared/common-api-models';
import { EntityPatch, GATEWAY_TOKEN, ResponseEntity } from '@vioc-angular/shared/util-api';
import { Observable } from 'rxjs/internal/Observable';
import { CompanyProductApi } from '../api/company-product-api';
import { CompanyProduct } from '../model/company-product.model';

@Injectable()
export class CompanyProductFacade implements SearchPageFacade<CompanyProduct> {
    private readonly api: CompanyProductApi;

    constructor(@Inject(GATEWAY_TOKEN) gateway: string, http: HttpClient) {
        this.api = new CompanyProductApi(gateway, { http });
    }

    /**
     * @see CompanyProductApi.findByCompanyAndProductCode
     */
    findByCompanyAndProductCode(companyCode: string, productCode: string): Observable<CompanyProduct> {
        return this.api.findByCompanyAndProductCode(companyCode, productCode);
    }

    /**
     * @see CompanyProductApi.add
     */
    add(companyProducts: CompanyProduct[]): Observable<number> {
        return this.api.add(companyProducts);
    }

    /**
     * @see CompanyProductApi.update
     */
    update(companyProduct: CompanyProduct): Observable<Object> {
        return this.api.update(companyProduct);
    }

    /**
     * @see Api.activate
     */
    activate(ids: { companyId: number; productId: number }[]): Observable<number> {
        return this.api.activate(ids);
    }

    /**
     * @see Api.deactivate
     */
    deactivate(ids: { companyId: number; productId: number }[]): Observable<number> {
        return this.api.deactivate(ids);
    }

    /**
     * @see CompanyProductApi.findUsage
     */
    findUsage(ids: { companyId: number; productId: number }[]): Observable<AssignmentCount[]> {
        return this.api.findUsage(ids);
    }

    /**
     * @see SearchPageFacade.search
     */
    search(querySearch: QuerySearch): Observable<ResponseEntity<CompanyProduct>> {
        return this.api.query(querySearch);
    }

    /**
     * @see SearchPageFacade.entityPatch
     */
    entityPatch(patches: EntityPatch<{ companyId: number; productId: number }>[]): Observable<Object> {
        return this.api.entityPatch(['patch'], ...patches);
    }

    /**
     * @see SearchPageFacade.dataSync
     */
    dataSync(ids: { companyId: number; productId: number }[]): Observable<number> {
        return this.api.dataSync(ids);
    }
}
