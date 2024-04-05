import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
// TODO: 07/21/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
//tslint:disable-next-line: nx-enforce-module-boundaries
import { SearchPageFacade } from '@vioc-angular/central-ui/feature-search-page';
import { QuerySearch } from '@vioc-angular/shared/common-api-models';
import { defaultIfNullOrUndefined, Described } from '@vioc-angular/shared/common-functionality';
import { EntityPatch, GATEWAY_TOKEN, ResponseEntity } from '@vioc-angular/shared/util-api';
import { DynamicDropdownColumn, DynamicDropdownConfig, DynamicDropdownOptions } from '@vioc-angular/shared/util-column';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ServiceCategory } from '../model/service-category.model';
import { ServiceCategoryState } from '../state/service-category-state';
import { ServiceCategoryApi } from './../api/service-category-api';

@Injectable()
export class ServiceCategoryFacade implements SearchPageFacade<ServiceCategory> {
    private readonly api: ServiceCategoryApi;
    readonly searchColumns = new SearchColumns(this);

    constructor(
        @Inject(GATEWAY_TOKEN) gateway: string,
        http: HttpClient,
        private readonly state: ServiceCategoryState
    ) {
        this.api = new ServiceCategoryApi(`${gateway}service`, { http });
    }

    /** Fetches all active service categories for the specified type. */
    findActive(level: 'LEAF' | 'ROOT' | 'ALL'): Observable<Described[]> {
        // If the state has the service categories for this level cached, return them.  Otherwise, trigger cache initialization
        return this.state.findActiveByLevel(level) || this.state.cacheActiveByLevel(level, this.api.findActive(level));
    }

    /**
     * Finds service categories by passed `code`
     */
    findByCode(categoryCode: string): Observable<ServiceCategory> {
        return this.api.findByCode(categoryCode);
    }

    /** @see ServiceCategoryApi.validateParentCategory */
    validateParentCategory(parentCategoryCode: string, serviceCategoryCode: string) {
        return this.api.validateParentCategory(parentCategoryCode, serviceCategoryCode);
    }

    /** @see Api#save */
    save(serviceCategory: ServiceCategory) {
        // api does not accept null values for collections
        defaultIfNullOrUndefined(serviceCategory, 'carFaxMapping', []);
        defaultIfNullOrUndefined(serviceCategory, 'motorInfo', []);
        defaultIfNullOrUndefined(serviceCategory, 'preventativeMaintenanceQualifiers', []);

        return this.api.save(serviceCategory);
    }

    /**
     * @see SearchPageFacade.search
     */
    search(querySearch: QuerySearch): Observable<ResponseEntity<ServiceCategory>> {
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

    generateCategories(categoryCodes: string[]): Observable<ServiceCategory[]> {
        return this.api.generateCategories(categoryCodes);
    }
}

class SearchColumns {
    constructor(private readonly facade: ServiceCategoryFacade) {}

    /**
     * Build a dropdown for service categories.
     *
     * @param {({ name?: string; level: 'LEAF' | 'ROOT' | 'ALL'; apiFieldPath: string })} config
     * @param {DynamicDropdownOptions} [overrides={}]
     * @returns
     * @memberof SearchColumns
     */
    dropdown(
        config: {
            /** @{link DynamicDropdownOptions.name}. If not set, it will default to `'Service Category'`  */
            name?: string;
            /** Defines which categories to fetch */
            level: 'LEAF' | 'ROOT' | 'ALL';
            /** @{link DropdownOptions.apiFieldPath}  */
            apiFieldPath: string;
        },
        overrides: DynamicDropdownOptions<Described> = {}
    ) {
        config = { ...config }; // copy to prevent updating original
        defaultIfNullOrUndefined(config, 'name', 'Service Category');
        const dropdownConfig: DynamicDropdownConfig<Described> = {
            type: { entityType: 'serviceCategory' }, // this is defined in core-micro-service
            hint: `${config.name} Code`,
            name: config.name,
            ...overrides,
            apiFieldPath: config.apiFieldPath,
            fetchData: () =>
                this.facade.findActive(config.level).pipe(
                    tap((c) => {
                        c.sort(Described.codeComparator);
                    })
                ),
        };
        defaultIfNullOrUndefined(dropdownConfig, 'apiSortPath', `${config.apiFieldPath}.code`);
        return DynamicDropdownColumn.ofDescribed(dropdownConfig);
    }
}
