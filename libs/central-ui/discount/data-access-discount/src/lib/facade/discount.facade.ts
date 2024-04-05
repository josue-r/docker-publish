import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { QuerySearch } from '@vioc-angular/shared/common-api-models';
import { Searchable } from '@vioc-angular/shared/data-access-search';
import { GATEWAY_TOKEN, ResponseEntity } from '@vioc-angular/shared/util-api';
import { Observable } from 'rxjs';
import { DiscountApi } from '../api/discount.api';
import { Discount } from '../model/discount.model';

@Injectable()
export class DiscountFacade implements Searchable<Discount> {
    private readonly api: DiscountApi;

    constructor(@Inject(GATEWAY_TOKEN) gateway: string, http: HttpClient) {
        this.api = new DiscountApi(`${gateway}discount`, { http });
    }

    /**
     * @see SearchPageFacade.search
     */
    search(querySearch: QuerySearch): Observable<ResponseEntity<Discount>> {
        return this.api.query(querySearch, ['v2/discounts/search']);
    }

    /** @see DiscountApi#findByCodeAndCompany */
    findByCodeAndCompany(discountCode: string, companyCode: string): Observable<Discount> {
        return this.api.findByCodeAndCompany(discountCode, companyCode);
    }

    /**
     * Legacy search for the Offers screen.
     * We can do this since that component doesn't use the DiscountFacade.search function automatically
     * but calls it directly instead.
     * This way we can also use a single API and Facade for the Discounts
     */
    searchV1(querySearch: QuerySearch): Observable<ResponseEntity<Discount>> {
        return this.api.query(querySearch, ['v1/discounts/search']);
    }

    /** @see Api#save */
    save(discount: Discount): Observable<Object> {
        return this.api.save(discount, ['v2/discounts']);
    }

    /** @see DiscountApi#findByCodeAndCompany */
    findByCodeAndCompanyV2(discountCode: string, companyCode: string): Observable<Discount> {
        return this.api.findByCodeAndCompanyV2(discountCode, companyCode);
    }

    activate(ids: number[]): Observable<number> {
        return this.api.activate(ids, ['v1/discounts/activate']);
    }

    deactivate(ids: number[]): Observable<number> {
        return this.api.deactivate(ids, ['v1/discounts/deactivate']);
    }

    dataSync(ids: number[]): Observable<number> {
        return this.api.dataSync(ids, ['v1/discounts/datasync']);
    }
}
