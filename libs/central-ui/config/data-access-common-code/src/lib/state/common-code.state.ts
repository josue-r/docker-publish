import { Injectable } from '@angular/core';
import { Described } from '@vioc-angular/shared/common-functionality';
import { CachedState } from '@vioc-angular/shared/util-state';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CommonCodeState {
    /** Cache of common code types to associated common codes. */
    private readonly findByTypeCache = new CachedState<Described[]>({ evictionStrategy: 'lru', maxSize: 20 });

    /** Returns the cached active common codes for the specified type or undefined if not cached */
    findByType(type: string, active?: boolean): Observable<Described[]> | undefined {
        const key: string = this.getCacheKey(type, active);
        return this.findByTypeCache.get(key);
    }

    /**
     * Caches the passed common codes for the specified type.
     */
    cacheByType(type: string, commonCodes: Observable<Described[]>, active?: boolean): Observable<Described[]> {
        const key: string = this.getCacheKey(type, active);
        return this.findByTypeCache.put(key, commonCodes);
    }

    /**
     * Returns a key to identify the cache based on type and active status
     * @param type
     * @param active
     */
    getCacheKey(type: string, active?: boolean) {
        return type + active;
    }
}
