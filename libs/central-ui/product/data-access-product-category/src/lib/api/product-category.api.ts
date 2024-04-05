import { Inject } from '@angular/core';
import { Described } from '@vioc-angular/shared/common-functionality';
import { Api, ApiConfig, GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { Observable } from 'rxjs';
import { CategoryLevel } from '../models/category-level';
import { ProductCategory } from '../models/product-category.model';

export class ProductCategoryApi extends Api<ProductCategory, number> {
    constructor(@Inject(GATEWAY_TOKEN) gateway: string, config: ApiConfig) {
        super(`${gateway}product/v1/product-categories`, config);
        // super(`http://localhost:9004/v1/product-categories`, config);
    }
    /** Find the active ProductCategories at the given level. */
    findActive(level: CategoryLevel): Observable<Described[]> {
        return this.get<Described[]>(['active'], { level });
    }

    /** Find ProductCategory by the given code. */
    findByCode(code: string): Observable<ProductCategory> {
        return this.get<ProductCategory>([], { code });
    }

    /** Finds ProductCategories that are suitable parent categories. */
    findAssignableParents(): Observable<Described[]> {
        return this.get<Described[]>(['assignable-parents']);
    }

    /** Finds second level ProductCategories by the prodived storeCode. */
    findSecondLevelByStore(storeCode: string): Observable<Described[]> {
        return this.get<Described[]>(['second-level'], { storeCode });
    }

    generateCategories(categoryCodes?: string[]): Observable<ProductCategory[]> {
        return this.post<ProductCategory[]>(['codes'], categoryCodes);
    }
}
