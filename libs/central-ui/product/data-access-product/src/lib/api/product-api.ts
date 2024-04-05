import { AssignmentCount, QuerySearch } from '@vioc-angular/shared/common-api-models';
import { Described } from '@vioc-angular/shared/common-functionality';
import { Api, ApiConfig, ResponseEntity } from '@vioc-angular/shared/util-api';
import { Observable, of } from 'rxjs';
import { Product } from '../models/product.model';

export class ProductApi extends Api<Product, any> {
    constructor(baseUrl: string, config: ApiConfig) {
        super(`${baseUrl}/v1/products`, config);
        // super(`http://localhost:9004/v1/products`, config); //
    }
    /** Searches for a single `Product` by the code. */
    findByCode(code: string): Observable<Product> {
        return this.get<Product>([], { code }, this.contentType);
    }
    /**
     * Validates that the related product code entered by the user is valid. Will throw one of three errors if a validation
     * issue occurs:
     *
     * ```ts
     * error.product-api.inactiveRelatedProduct => 'related product code is inactive'
     * error.product-api.notFoundRelatedProduct => 'related product code not found'
     * error.product-api.obsoleteRelatedProduct => 'related product code is obsolete'
     * ```
     */
    validateRelatedProduct(relatedProductCode: string, productCode: string) {
        return this.get<any>(['validate/related-product'], { relatedProductCode, productCode });
    }
    /** Finds if the `Product` is assigned to any `CompanyProduct`s or `StoreProduct`s. */
    isProductAssigned(product: Product): Observable<boolean> {
        return !product.id
            ? of(false)
            : this.get<boolean>(['productAssigned'], { id: product.id.toString() }, this.contentType);
    }
    /**
     * Returns all active products matching the passed restrictions that are not assigned (actively or inactively)
     * to the passed company.
     */
    findUnassignedProductsForCompany(
        company: Described,
        querySearch: QuerySearch
    ): Observable<ResponseEntity<Product>> {
        if (!querySearch.additionalParams) {
            querySearch.additionalParams = {};
        }
        querySearch.additionalParams.companyCode = company.code;
        return this.query(querySearch, ['unassigned-at-company']);
    }
    /**
     * Find the usage of the `Product` to get its id, description, associated `CompanyProduct`
     * active records and associated `StoreProduct` active records.
     */
    findUsage(ids: number[]): Observable<AssignmentCount[]> {
        return this.post<AssignmentCount[]>(['usage'], ids);
    }
}
