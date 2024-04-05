import { Injectable } from '@angular/core';
import { isNullOrUndefined } from '@vioc-angular/shared/common-functionality';
import { CachedState } from '@vioc-angular/shared/util-state';

@Injectable({
    providedIn: 'root',
})
export class ParameterState {
    /** Cache of system parameter value. */
    private readonly findCachedSystemParameterValue = new CachedState<any>({ evictionStrategy: 'lru', maxSize: 20 });

    /** Cache of company parameter value. */
    private readonly findCachedCompanyParameterValue = new CachedState<any>({ evictionStrategy: 'lru', maxSize: 20 });

    /** Cache of store parameter value. */
    private readonly findCachedStoreParameterValue = new CachedState<any>({ evictionStrategy: 'lru', maxSize: 20 });

    /** Returns the cached active parameter for the specified type or undefined if not cached */
    findSystemParameterValue(paramName: string) {
        const key: string = this.getCacheKey(paramName);
        return this.findCachedSystemParameterValue.get(key);
    }

    /** Returns the cached active parameter for the specified type or undefined if not cached */
    findCompanyParameterValue(paramName: string, compResourceId: string) {
        const key: string = this.getCacheKey(paramName, compResourceId);
        return this.findCachedCompanyParameterValue.get(key);
    }

    /** Returns the cached active parameter for the specified type or undefined if not cached */
    findStoreParameterValue(paramName: string, storeResourceId: string) {
        const key: string = this.getCacheKey(paramName, storeResourceId);
        return this.findCachedStoreParameterValue.get(key);
    }

    /**
     * Caches the passed system parameter value for the specified param name.
     */
    cacheSystemParameter(paramValue, paramName: string) {
        const key: string = this.getCacheKey(paramName);
        return this.findCachedSystemParameterValue.put(key, paramValue);
    }

    /**
     * Caches the passed company parameter value for the specified param name.
     */
    cacheCompanyParameter(paramValue, paramName: string, compResourceId: string) {
        const key: string = this.getCacheKey(paramName, compResourceId);
        return this.findCachedCompanyParameterValue.put(key, paramValue);
    }

    /**
     * Caches the passed store parameter value for the specified param name.
     */
    cacheStoreParameter(paramValue, paramName: string, storeResourceId: string) {
        const key: string = this.getCacheKey(paramName, storeResourceId);
        return this.findCachedStoreParameterValue.put(key, paramValue);
    }

    /**
     * Returns a key to identify the cache based on type and active status
     * @param paramName
     * @param companyId
     * @param storeId
     */
    getCacheKey(paramName: string, resourceId = null): string {
        if (!isNullOrUndefined(resourceId)) {
            return `${paramName}.${resourceId}`;
        } else {
            return paramName;
        }
    }
}
