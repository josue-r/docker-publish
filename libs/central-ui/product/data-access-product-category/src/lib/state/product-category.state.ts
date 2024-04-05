import { Injectable } from '@angular/core';
import { Described } from '@vioc-angular/shared/common-functionality';
import { CachedState } from '@vioc-angular/shared/util-state';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProductCategoryState {
    /** Cache of searched active categories */
    private readonly findActiveCache = new CachedState<Described[]>({ evictionStrategy: 'lru' });
    private readonly findSecondLevelByStoreCache = new CachedState<Described[]>({ evictionStrategy: 'lru' });

    findActive(level: string): Observable<Described[]> {
        return this.findActiveCache.get(level);
    }

    cacheFindActive(level: string, categories: Observable<Described[]>): Observable<Described[]> {
        return this.findActiveCache.put(level, categories);
    }

    findSecondLevelByStore(storeCode: string): Observable<Described[]> {
        return this.findSecondLevelByStoreCache.get(storeCode);
    }

    cacheFindSecondLevelByStore(storeCode: string, categories: Observable<Described[]>): Observable<Described[]> {
        return this.findSecondLevelByStoreCache.put(storeCode, categories);
    }

    clearCache() {
        this.findActiveCache.clear();
        this.findSecondLevelByStoreCache.clear();
    }
}
