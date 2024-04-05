import { Injectable } from '@angular/core';
import { CachedState } from '@vioc-angular/shared/util-state';
import { Observable } from 'rxjs';
import { ResourceFilterCriteria } from '../model/resource-filter-criteria';
import { activeFilter, resourceType } from '../model/resource.type';
import { Resources } from '../model/resources.model';

@Injectable({ providedIn: 'root' })
export class ResourceState {
    /**
     * Cache of organization types to associated resources.
     */
    private readonly _findResoucesByTypeCache = new CachedState<Resources>({
        evictionStrategy: 'lru',
        maxSize: 20,
    });

    /**
     * Returns the cached organization resources for the specified type and user roles or undefined if not cached.
     */
    findResoucesByType(
        type: resourceType,
        filter: activeFilter,
        roles: string[],
        loadParents = false,
        resourceFilterCriteria?: ResourceFilterCriteria[]
    ): Observable<Resources> | undefined {
        return this._findResoucesByTypeCache.get(
            this.typeAndRolesKey(type, filter, roles, loadParents, resourceFilterCriteria)
        );
    }

    /**
     * Caches the passed organization resources for the spefified type and user roles.
     */
    cacheResoucesByType(
        type: resourceType,
        filter: activeFilter,
        roles: string[],
        resources: Observable<Resources>,
        loadParents = false,
        resourceFilterCriteria?: ResourceFilterCriteria[]
    ): Observable<Resources> {
        return this._findResoucesByTypeCache.put(
            this.typeAndRolesKey(type, filter, roles, loadParents, resourceFilterCriteria),
            resources
        );
    }

    /**
     * Returns a unique key based on the type of resource being access and the user roles.
     *
     * @example
     * `COMPANY:[ROLE_PRODUCT_READ,ROLE_COMPANY_PRODUCT_UPDATE]`
     */
    private typeAndRolesKey(
        type: resourceType,
        filter: activeFilter,
        roles: string[],
        loadParents = false,
        resourceFilterCriteria?: ResourceFilterCriteria[]
    ): string {
        return `${type}.${filter}.${loadParents ? 'withParents' : ''}:[${roles.join(',')}]${
            resourceFilterCriteria ? `:[${resourceFilterCriteria.map((f) => f.criteria).join(',')}]` : ''
        }`.toUpperCase();
    }
}
