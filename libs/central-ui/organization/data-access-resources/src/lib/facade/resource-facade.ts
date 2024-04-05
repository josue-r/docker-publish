import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { DescribedSort, QuerySearch } from '@vioc-angular/shared/common-api-models';
import { defaultIfNullOrUndefined, Described } from '@vioc-angular/shared/common-functionality';
import { GATEWAY_TOKEN, ResponseEntity } from '@vioc-angular/shared/util-api';
import { DynamicDropdownColumn, DynamicDropdownConfig, DynamicDropdownOptions } from '@vioc-angular/shared/util-column';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResourceApi } from '../api/resource-api';
import { ResourceFilterCriteria } from '../model/resource-filter-criteria';
import { activeFilter } from '../model/resource.type';
import { Resources } from '../model/resources.model';
import { ResourceState } from '../state/resource-state';

/**
 * Retrieves organizational resources based on user role access.
 */
@Injectable()
export class ResourceFacade {
    private readonly api: ResourceApi;
    readonly searchColumns = new SearchColumns(this);

    constructor(@Inject(GATEWAY_TOKEN) gateway: string, http: HttpClient, private readonly _state: ResourceState) {
        this.api = new ResourceApi(gateway, { http });
    }
    findCompaniesByRoles(roles: string[], filter: activeFilter = 'ACTIVE'): Observable<Resources> {
        return (
            this._state.findResoucesByType('company', filter, roles) ||
            this._state.cacheResoucesByType('company', filter, roles, this.api.findCompaniesByRoles(roles, filter))
        );
    }

    findRegionsByRoles(roles: string[], filter: activeFilter = 'ACTIVE'): Observable<Resources> {
        return (
            this._state.findResoucesByType('region', filter, roles) ||
            this._state.cacheResoucesByType('region', filter, roles, this.api.findRegionsByRoles(roles, filter))
        );
    }

    findRegionsByRolesAndCompany(
        roles: string[],
        company: string,
        filter: activeFilter = 'ACTIVE'
    ): Observable<Resources> {
        return (
            this._state.findResoucesByType('region', filter, roles, false, [
                ResourceFilterCriteria.byCompany(company),
            ]) ||
            this._state.cacheResoucesByType(
                'region',
                filter,
                roles,
                this.api.findRegionsByRoles(roles, filter, DescribedSort.byCode, false, [
                    ResourceFilterCriteria.byCompany(company),
                ])
            )
        );
    }

    findMarketsByRoles(roles: string[], filter: activeFilter = 'ACTIVE'): Observable<Resources> {
        return (
            this._state.findResoucesByType('market', filter, roles) ||
            this._state.cacheResoucesByType('market', filter, roles, this.api.findMarketsByRoles(roles, filter))
        );
    }

    findMarketsByRolesAndCompany(
        roles: string[],
        company: string,
        filter: activeFilter = 'ACTIVE'
    ): Observable<Resources> {
        return (
            this._state.findResoucesByType('market', filter, roles, false, [
                ResourceFilterCriteria.byCompany(company),
            ]) ||
            this._state.cacheResoucesByType(
                'market',
                filter,
                roles,
                this.api.findMarketsByRoles(roles, filter, DescribedSort.byCode, false, [
                    ResourceFilterCriteria.byCompany(company),
                ])
            )
        );
    }

    findMarketsByRolesAndCompanyAndRegion(
        roles: string[],
        company: string,
        region: string,
        filter: activeFilter = 'ACTIVE'
    ): Observable<Resources> {
        return (
            this._state.findResoucesByType('market', filter, roles, false, [
                ResourceFilterCriteria.byRegion(company, region),
            ]) ||
            this._state.cacheResoucesByType(
                'market',
                filter,
                roles,
                this.api.findMarketsByRoles(roles, filter, DescribedSort.byCode, false, [
                    ResourceFilterCriteria.byRegion(company, region),
                ])
            )
        );
    }

    findAreasByRoles(roles: string[], filter: activeFilter = 'ACTIVE'): Observable<Resources> {
        return (
            this._state.findResoucesByType('area', filter, roles) ||
            this._state.cacheResoucesByType('area', filter, roles, this.api.findAreasByRoles(roles, filter))
        );
    }

    findStoresByRoles(
        roles: string[],
        filter: activeFilter = 'ACTIVE',
        loadParents = false,
        resourceFilterCriteria?: ResourceFilterCriteria[]
    ): Observable<Resources> {
        return (
            this._state.findResoucesByType('store', filter, roles, loadParents, resourceFilterCriteria) ||
            this._state.cacheResoucesByType(
                'store',
                filter,
                roles,
                this.api.findStoresByRoles(roles, filter, loadParents, resourceFilterCriteria),
                loadParents,
                resourceFilterCriteria
            )
        );
    }

    searchStoresByRoles(
        querySearch: QuerySearch,
        roles: string[],
        projection: 'MINIMAL' | 'FULL' | 'COMPANY' = 'MINIMAL'
    ): Observable<ResponseEntity<Described>> {
        return this.api.searchStoresByRoles(querySearch, roles, projection);
    }
}

export class ResourceSearchColumns {
    constructor(
        protected readonly name: string,
        private readonly findByRoles: (roles: string[], filter: activeFilter) => Observable<Resources>,
        protected readonly defaults: DynamicDropdownOptions<Described> = {}
    ) {}

    protected setDefaults(config: DynamicDropdownOptions<Described>) {
        const lowerCasedName = this.name.toLowerCase();
        defaultIfNullOrUndefined(config, 'apiFieldPath', lowerCasedName); // ex. 'company'
        defaultIfNullOrUndefined(config, 'type', { entityType: lowerCasedName }); // ex. { entityType: 'company' }
        defaultIfNullOrUndefined(config, 'hint', `${this.name} Code`); // ex. 'Company Code'
        // If apiFieldPath was overridden but sort path was not, update the sort path to include 'code'
        defaultIfNullOrUndefined(config, 'apiSortPath', `${config.apiFieldPath}.code`); // ex. 'company.code'
    }

    /**
     * Maps the security context passed along with the passed privileges to create a role collection and then delegates on to
     *  {@link rolesDropdown} to build a dropdown with the accessible companies.
     *
     * The privileges + context map to the role names. Example, if the `context='FOO` and `privileges=['READ', 'UPDATE']`, the roles passed
     *  to {@link rolesDropdown} will be `['ROLE_FOO_READ','ROLE_FOO_UPDATE]`.
     *
     * @param {string} context
     * @param {DropdownOptions} [overrides={}]
     * @param {string} [privileges=['READ', 'UPDATE']]
     * @returns
     * @memberof SearchColumns
     * @see {@link rolesDropdown} for more details
     */
    contextDropdown(
        context: string,
        filter: activeFilter = 'ACTIVE',
        overrides: DynamicDropdownOptions<Described> = {},
        privileges = ['READ', 'UPDATE']
    ) {
        return this.rolesDropdown(contextToRoles(context, privileges), filter, overrides);
    }

    /**
     * Builds a {@link DynamicColumnDropdown} for resources accessible at the passed roles.  This provides reasonable defaults that should
     *  be standard and consistent for every search component that uses this.
     *
     * It also makes the assumption that the `DropdownOptions.apiFieldPath='{type}.code`.  If this is not the case, it will need to be
     *  specified in the `overrides` param.
     *
     * @param {string[]} roles
     * @param {DynamicDropdownOptions} [overrides={}]
     * @returns
     * @memberof SearchColumns
     */
    rolesDropdown(roles: string[], filter: activeFilter = 'ACTIVE', overrides: DynamicDropdownOptions<Described> = {}) {
        const options: DynamicDropdownConfig<Described> = {
            // null values will be set later
            apiFieldPath: null, // will be set later via setDefaults or ...overrides
            apiSortPath: null, // will be set later via setDefaults or ...overrides
            type: null, // will be set later via setDefaults or ...overrides
            ...this.defaults,
            ...overrides,
            // always wins
            name: this.name,
            fetchData: () => this.findByRoles(roles, filter).pipe(map((aor) => aor.resources)),
        };
        this.setDefaults(options);
        defaultIfNullOrUndefined(options, 'searchable', { defaultSearch: true });
        defaultIfNullOrUndefined(options, 'gridUpdatable', false); // this is usually not going to be updatable
        defaultIfNullOrUndefined(options, 'displayedByDefault', true);
        return DynamicDropdownColumn.ofDescribed(options);
    }
}

export function contextToRoles(securityContext: string, privileges: string[]): string[] {
    return privileges.map((p) => `ROLE_${securityContext}_${p}`);
}

class ResourceDescriptionSearchColumns extends ResourceSearchColumns {
    constructor(
        name: string,
        findByRoles: (roles: string[], filter: activeFilter) => Observable<Resources>,
        defaults: DynamicDropdownOptions<Described> = {}
    ) {
        super(name, findByRoles, defaults);
    }

    /** @override */
    protected setDefaults(config: DynamicDropdownOptions<Described>) {
        defaultIfNullOrUndefined(config, 'apiSortPath', `${this.name.toLowerCase()}.description`);
        defaultIfNullOrUndefined(config, 'hint', `${this.name} Description`); // ex. 'Company Description'
        defaultIfNullOrUndefined(config, 'mapToFilterDisplay', Described.descriptionMapper);
        defaultIfNullOrUndefined(config, 'mapToTableDisplay', Described.descriptionMapper);
        defaultIfNullOrUndefined(config, 'mapToDropdownDisplay', Described.descriptionMapper);
        super.setDefaults(config);
    }
}

class SearchColumns {
    constructor(private readonly facade: ResourceFacade) {}

    readonly company = new ResourceSearchColumns('Company', (r, f) => this.facade.findCompaniesByRoles(r, f));
    readonly regionCodeAndDescription = new ResourceSearchColumns('Region', (r, f) =>
        this.facade.findRegionsByRoles(r, f)
    );
    readonly marketCodeAndDescription = new ResourceSearchColumns('Market', (r, f) =>
        this.facade.findMarketsByRoles(r, f)
    );
    readonly areaCodeAndDescription = new ResourceSearchColumns('Area', (r, f) => this.facade.findAreasByRoles(r, f));
    readonly region = new ResourceDescriptionSearchColumns('Region', (r, f) => this.facade.findRegionsByRoles(r, f));
    readonly market = new ResourceDescriptionSearchColumns('Market', (r, f) => this.facade.findMarketsByRoles(r, f));
    readonly area = new ResourceDescriptionSearchColumns('Area', (r, f) => this.facade.findAreasByRoles(r, f));
    readonly store = new ResourceSearchColumns('Store', (r, f) => this.facade.findStoresByRoles(r, f), {
        hint: 'Store Number',
    });
}
