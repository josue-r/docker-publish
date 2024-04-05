import { Inject } from '@angular/core';
import { DescribedSort, QuerySearch } from '@vioc-angular/shared/common-api-models';
import { Described, isNullOrUndefined } from '@vioc-angular/shared/common-functionality';
import { Api, ApiConfig, GATEWAY_TOKEN, ResponseEntity } from '@vioc-angular/shared/util-api';
import { Observable } from 'rxjs';
import { ResourceFilterCriteria } from '../model/resource-filter-criteria';
import { activeFilter, childResource, resourceType } from '../model/resource.type';
import { Store } from '../model/store.model';

/**
 * Retrieves organizational resources based on user role access.
 */
export class ResourceApi extends Api<Described, number> {
    constructor(@Inject(GATEWAY_TOKEN) gateway: string, config: ApiConfig) {
        super(`${gateway}organization/v1/resources`, config);
        // super(`http://localhost:9002/v1/resources`, config);
    }

    findCompaniesByRoles(
        roles: string[],
        filter: activeFilter
    ): Observable<{ resources: Described[]; allCompanies: boolean }> {
        return this.findResourcesByRoles('company', roles, filter);
    }

    findRegionsByRoles(
        roles: string[],
        filter: activeFilter,
        sort: DescribedSort = DescribedSort.byDescription,
        loadParents = false,
        resourceFilterCriteria?: ResourceFilterCriteria[]
    ): Observable<{ resources: Described[]; allCompanies: boolean }> {
        return this.findResourcesByRoles('region', roles, filter, sort, loadParents, resourceFilterCriteria);
    }

    findMarketsByRoles(
        roles: string[],
        filter: activeFilter,
        sort: DescribedSort = DescribedSort.byDescription,
        loadParents = false,
        resourceFilterCriteria?: ResourceFilterCriteria[]
    ): Observable<{ resources: Described[]; allCompanies: boolean }> {
        return this.findResourcesByRoles('market', roles, filter, sort, loadParents, resourceFilterCriteria);
    }

    findAreasByRoles(
        roles: string[],
        filter: activeFilter,
        sort: DescribedSort = DescribedSort.byDescription
    ): Observable<{ resources: Described[]; allCompanies: boolean }> {
        return this.findResourcesByRoles('area', roles, filter, sort);
    }

    findStoresByRoles(
        roles: string[],
        filter: activeFilter,
        loadParents = false,
        resourceFilterCriteria?: ResourceFilterCriteria[]
    ): Observable<{ resources: Described[] | Store[]; allCompanies: boolean }> {
        return this.findResourcesByRoles(
            'store',
            roles,
            filter,
            DescribedSort.byCode,
            loadParents,
            resourceFilterCriteria
        );
    }

    /**
     * Returns an array of organization resources based on type and user role access.
     */
    private findResourcesByRoles(
        type: resourceType,
        roles: string[],
        filter: activeFilter,
        sort: DescribedSort = DescribedSort.byCode,
        loadParents = false,
        resourceFilterCriteria?: ResourceFilterCriteria[]
    ): Observable<{ resources: Described[] | childResource[]; allCompanies: boolean }> {
        return this.get<{ resources: Described[] | childResource[]; allCompanies: boolean }>(
            [type],
            {
                roles: roles.join(','),
                activeFilter: filter,
                loadParents: `${loadParents}`,
                resourceFilterCriteria: !isNullOrUndefined(resourceFilterCriteria)
                    ? resourceFilterCriteria.map((f) => f.criteria).join(',')
                    : [],
                sort: sort.sortParameter,
            },
            { 'Content-Type': 'application/json' }
        );
    }

    searchStoresByRoles(
        querySearch: QuerySearch,
        roles: string[],
        projection: 'MINIMAL' | 'FULL' | 'COMPANY' = 'MINIMAL'
    ): Observable<ResponseEntity<Described>> {
        if (!querySearch.additionalParams) {
            querySearch.additionalParams = {};
        }
        querySearch.additionalParams.roles = roles;
        querySearch.additionalParams.projection = projection;
        return this.query(querySearch, ['store', 'search']);
    }

    save(entity: any): Observable<Object> {
        throw Error('UserResourcesAPIClient.save is disabled');
    }
}
