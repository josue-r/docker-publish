import { Injectable } from '@angular/core';
import { Described } from '@vioc-angular/shared/common-functionality';
import { CachedState } from '@vioc-angular/shared/util-state';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CompanyExportState {
    /** Cache of companycode.type to associated CompanyExports. */
    private readonly findByCompanyAndTypeCache = new CachedState<Described[]>({ evictionStrategy: 'lru', maxSize: 2 });

    /** Returns the cached records or undefined if not cached */
    findByCompanyAndType(companyCode: string, type: 'COST' | 'SALES'): Observable<Described[]> | undefined {
        const cacheKey = this.cacheKey(companyCode, type);
        return this.findByCompanyAndTypeCache.get(cacheKey);
    }

    /**
     * Caches the passed obeservable for the companycode/type.
     */
    cacheByCompanyAndType(
        companyCode: string,
        type: 'COST' | 'SALES',
        companyExports: Observable<Described[]>
    ): Observable<Described[]> {
        const cacheKey = this.cacheKey(companyCode, type);
        return this.findByCompanyAndTypeCache.put(cacheKey, companyExports);
    }

    private cacheKey(companyCode: string, type: 'COST' | 'SALES') {
        return `${companyCode}.${type}`.toUpperCase();
    }
}
