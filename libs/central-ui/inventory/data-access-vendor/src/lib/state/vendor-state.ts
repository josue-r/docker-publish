import { Injectable } from '@angular/core';
import { Described } from '@vioc-angular/shared/common-functionality';
import { CachedState } from '@vioc-angular/shared/util-state';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class VendorState {
    /** Cache of vendor types to associated stores. */
    private readonly findActiveByStoreCache = new CachedState<Described[]>({ evictionStrategy: 'lru', maxSize: 5 });

    private readonly findAllAccessibleActiveCache = new CachedState<Described[]>();

    private findAllAccessibleActiveKey = 'findAllAccessibleActiveKey';

    /** Returns the cached active vendors for the specified stores or undefined if not cached */
    findByStores(storeNumbers: string[]): Observable<Described[]> | undefined {
        const stores: string = this.getSortedStringFromArrayElements(storeNumbers);
        return this.findActiveByStoreCache.get(stores);
    }

    /**
     * Caches the passed vendors for the specified stores.
     */
    cacheByStores(storeNumbers: string[], vendors: Observable<Described[]>): Observable<Described[]> {
        const stores: string = this.getSortedStringFromArrayElements(storeNumbers);
        return this.findActiveByStoreCache.put(stores, vendors);
    }

    getSortedStringFromArrayElements(arr: string[]): string {
        return arr.sort().join();
    }

    cacheByAccessibleActive(vendors: Observable<Described[]>): Observable<Described[]> {
        return this.findAllAccessibleActiveCache.put(this.findAllAccessibleActiveKey, vendors);
    }

    findAllAccessibleActive(): Observable<Described[]> {
        return this.findAllAccessibleActiveCache.get(this.findAllAccessibleActiveKey);
    }
}
