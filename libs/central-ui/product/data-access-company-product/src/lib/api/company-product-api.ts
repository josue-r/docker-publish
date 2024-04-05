import { Inject } from '@angular/core';
import { AssignmentCount } from '@vioc-angular/shared/common-api-models';
import { Api, ApiConfig, GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { Observable } from 'rxjs';
import { CompanyProduct } from '../model/company-product.model';

export class CompanyProductApi extends Api<CompanyProduct, { companyId: number; productId: number }> {
    constructor(@Inject(GATEWAY_TOKEN) gateway: string, config: ApiConfig) {
        super(`${gateway}product/v1/company-products`, config);
        // super(`http://localhost:9004/v1/company-products`, config); //
    }
    /**
     * Searches for `CompanyProduct`s by `Company` and `Product` codes.
     */
    findByCompanyAndProductCode(companyCode: string, productCode: string): Observable<CompanyProduct> {
        return this.get<CompanyProduct>([], { companyCode, productCode });
    }

    /**
     * Saves newly assigned `CompanyProduct`s.
     */
    add(companyProducts: CompanyProduct[]): Observable<number> {
        return super.add(companyProducts);
    }

    /**
     * Find the usage of the `CompanyProduct` to get its id, description, associated `StoreProduct`
     * active records.
     */
    findUsage(ids: { companyId: number; productId: number }[]): Observable<AssignmentCount[]> {
        return this.post<AssignmentCount[]>(['usage'], ids);
    }
}
