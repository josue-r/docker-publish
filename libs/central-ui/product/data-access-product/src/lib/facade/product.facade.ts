import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { SearchPageFacade } from '@vioc-angular/central-ui/feature-search-page';
import { AssignmentCount, QuerySearch } from '@vioc-angular/shared/common-api-models';
import { Described } from '@vioc-angular/shared/common-functionality';
import { EntityPatch, GATEWAY_TOKEN, ResponseEntity } from '@vioc-angular/shared/util-api';
import { Observable } from 'rxjs';
import { ProductApi } from '../api/product-api';
import { Product } from '../models/product.model';

@Injectable()
export class ProductFacade implements SearchPageFacade<Product> {
    private readonly api: ProductApi;

    constructor(@Inject(GATEWAY_TOKEN) gateway: string, http: HttpClient) {
        this.api = new ProductApi(`${gateway}product`, { http });
    }

    /** @see Api#save */
    save(product: Product) {
        return this.api.save(product);
    }

    /** @see ProductApi#findByCode */
    findByCode(code: string): Observable<Product> {
        return this.api.findByCode(code);
    }

    /** @see ProductApi.validateRelatedProduct */
    validateRelatedProduct(relatedProductCode: string, productCode: string) {
        return this.api.validateRelatedProduct(relatedProductCode, productCode);
    }

    /** @see ProductApi#isProductAssigned */
    isProductAssigned(product: Product): Observable<boolean> {
        return this.api.isProductAssigned(product);
    }

    /**
     * @see Api.activate
     */
    activate(ids: number[]): Observable<number> {
        return this.api.activate(ids);
    }

    /**
     * @see Api.deactivate
     */
    deactivate(ids: number[]): Observable<number> {
        return this.api.deactivate(ids);
    }

    /**
     * @see ProductApi.findUsage
     */
    findUsage(ids: number[]): Observable<AssignmentCount[]> {
        return this.api.findUsage(ids);
    }

    /**
     * @see SearchPageFacade.search
     */
    search(querySearch: QuerySearch): Observable<ResponseEntity<Product>> {
        return this.api.query(querySearch);
    }

    /**
     * @see SearchPageFacade.entityPatch
     */
    entityPatch(patches: EntityPatch<number>[]): Observable<Object> {
        return this.api.entityPatch(['patch'], ...patches);
    }

    /**
     * @see SearchPageFacade.dataSync
     */
    dataSync(ids: number[]): Observable<number> {
        return this.api.dataSync(ids);
    }

    /** @see ProductApi.findUnassignedProductsForCompany */
    findUnassignedProductsForCompany(
        company: Described,
        querySearch: QuerySearch
    ): Observable<ResponseEntity<Product>> {
        return this.api.findUnassignedProductsForCompany(company, querySearch);
    }
}
