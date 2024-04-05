import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
// TODO: 07/16/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { SearchPageFacade } from '@vioc-angular/central-ui/feature-search-page';
import { QuerySearch } from '@vioc-angular/shared/common-api-models';
import { defaultIfNullOrUndefined, Described } from '@vioc-angular/shared/common-functionality';
import { EntityPatch, GATEWAY_TOKEN, ResponseEntity } from '@vioc-angular/shared/util-api';
import { DynamicDropdownColumn, DynamicDropdownConfig, DynamicDropdownOptions } from '@vioc-angular/shared/util-column';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ProductCategoryApi } from '../api/product-category.api';
import { CategoryLevel } from '../models/category-level';
import { ProductCategory } from '../models/product-category.model';
import { ProductCategoryState } from '../state/product-category.state';

@Injectable()
export class ProductCategoryFacade implements SearchPageFacade<ProductCategory> {
    private readonly api: ProductCategoryApi;
    readonly searchColumns = new SearchColumns(this);

    constructor(
        @Inject(GATEWAY_TOKEN) gateway: string,
        http: HttpClient,
        private readonly state: ProductCategoryState
    ) {
        this.api = new ProductCategoryApi(gateway, { http });
    }

    /** @see Api#save */
    save(productCategory: ProductCategory) {
        // clear now outdated cache
        this.state.clearCache();
        return this.api.save(productCategory);
    }

    /**
     * Find active product categories given a level to search from.
     *
     * Will either get categories from existing state cache:
     * ```ts
     * state.findActive(level)
     * ```
     * Or will call to API and cache results in state:
     * ```ts
     * state.cacheByLevel(level, api.findActive(level));
     * ```
     */
    findActive(level: CategoryLevel): Observable<Described[]> {
        // if categorties for given level have been cached return them, otherwise cache results from api
        return this.state.findActive(level) || this.state.cacheFindActive(level, this.api.findActive(level));
    }

    /** @see ProductCategoryApi#findByCode  */
    findByCode(code: string): Observable<ProductCategory> {
        return this.api.findByCode(code);
    }

    /** @see ProductCategoryApi#findAssignableParents  */
    findAssignableParents(): Observable<Described[]> {
        return this.api.findAssignableParents();
    }

    /** @see ProductCategoryApi#findSecondLevelByStore */
    findSecondLevelByStore(storeCode: string): Observable<Described[]> {
        return (
            this.state.findSecondLevelByStore(storeCode) ||
            this.state.cacheFindSecondLevelByStore(storeCode, this.api.findSecondLevelByStore(storeCode))
        );
    }

    /**
     * @see SearchPageFacade.search
     */
    search(querySearch: QuerySearch): Observable<ResponseEntity<ProductCategory>> {
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

    generateCategories(categoryCodes: string[]): Observable<ProductCategory[]> {
        return this.api.generateCategories(categoryCodes);
    }
}

// TODO: Code needs to be consolidated Bug#5535
class SearchColumns {
    constructor(private readonly facade: ProductCategoryFacade) {}

    /**
     * Build a dropdown for product categories.
     *
     * @param {({ name?: string; level: 'LEAF' | 'ROOT' | 'ALL'; apiFieldPath: string })} config
     * @param {DynamicDropdownOptions} [overrides={}]
     * @returns
     * @memberof SearchColumns
     */
    dropdown(
        config: {
            /** @{link DynamicDropdownOptions.name}. If not set, it will default to `'Product Category'`  */
            name?: string;
            /** Defines which categories to fetch */
            level: 'LEAF' | 'ROOT' | 'ALL';
            /** @{link DropdownOptions.apiFieldPath}  */
            apiFieldPath: string;
        },
        overrides: DynamicDropdownOptions<Described> = {}
    ) {
        config = { ...config }; // copy to prevent updating original
        defaultIfNullOrUndefined(config, 'name', 'Product Category');
        const dropdownConfig: DynamicDropdownConfig<Described> = {
            type: { entityType: 'productCategory' }, // this is defined in core-microservice
            hint: `${config.name} Code`,
            name: config.name,
            ...overrides,
            apiFieldPath: config.apiFieldPath,
            fetchData: () =>
                this.facade
                    .findActive(config.level) //
                    .pipe(
                        tap((c) => {
                            c.sort(Described.codeComparator);
                        })
                    ),
        };
        defaultIfNullOrUndefined(dropdownConfig, 'apiSortPath', `${config.apiFieldPath}.code`);
        return DynamicDropdownColumn.ofDescribed(dropdownConfig);
    }
}
