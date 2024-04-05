import { Injectable } from '@angular/core';
import { Described } from '@vioc-angular/shared/common-functionality';
import { CachedState } from '@vioc-angular/shared/util-state';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ServiceCategoryState {
    /** Cache of service category levels to associated service categories. */
    private readonly findActiveByLevelCache = new CachedState<Described[]>({ evictionStrategy: 'lru', maxSize: 3 });

    /** Returns the cached active service categories for the specified level or undefined if not cached */
    findActiveByLevel(level: 'LEAF' | 'ROOT' | 'ALL'): Observable<Described[]> | undefined {
        return this.findActiveByLevelCache.get(level);
    }

    /**
     * Caches the passed service category for the level.
     */
    cacheActiveByLevel(
        level: 'LEAF' | 'ROOT' | 'ALL',
        serviceCategories: Observable<Described[]>
    ): Observable<Described[]> {
        return this.findActiveByLevelCache.put(level, serviceCategories);
    }
}
