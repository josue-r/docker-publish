import { Injectable } from '@angular/core';
import { DynamicDropdownColumn } from '@vioc-angular/shared/util-column';

/**
 * Provides a state for storing cached results of the dropdown column searches.
 */
@Injectable({ providedIn: 'root' })
export class DropdownColumnState {
    /** Cached results from previous searches. Map of cacheKey to filter text to results. */
    private readonly _cachedResults = new Map<string, Map<string, any[]>>();

    /** Cache results for the given column and searchText */
    cache(column: DynamicDropdownColumn<any>, searchText: string, results: any[]): void {
        if (!column) {
            throw new Error('Must provide a column in order to cache results');
        }
        if (!results) {
            throw new Error('Must provide a results array to cache results');
        }
        // TODO: Remove the caching.  Caching should be the job of the facade
        const cacheKey = column.dataCacheKey;
        if (cacheKey) {
            const columnCache = this._cachedResults.get(cacheKey) || new Map<string, any[]>();
            columnCache.set(searchText, results);
            this._cachedResults.set(cacheKey, columnCache);
        }
    }

    /** Check the cached results for the given column and searchText */
    getCache(column: DynamicDropdownColumn<any>, searchText: string): any[] {
        const columnCache = this._cachedResults.get(column.dataCacheKey);
        return columnCache && columnCache.get(searchText);
    }
}
