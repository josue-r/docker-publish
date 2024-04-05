import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { QuerySearch } from '@vioc-angular/shared/common-api-models';
import { Searchable } from '@vioc-angular/shared/data-access-search';
import { GATEWAY_TOKEN, ResponseEntity } from '@vioc-angular/shared/util-api';
import { Observable } from 'rxjs';
import { PhysicalInventoryApi } from '../api/physical-inventory.api';
import { PhysicalInventoryCount } from '../model/physical-inventory-count.model';
import { PhysicalInventory } from '../model/physical-inventory.model';

@Injectable()
export class PhysicalInventoryFacade implements Searchable<PhysicalInventory> {
    private readonly api: PhysicalInventoryApi;

    constructor(@Inject(GATEWAY_TOKEN) gateway: string, http: HttpClient) {
        this.api = new PhysicalInventoryApi(`${gateway}inventory`, { http });
    }

    /**
     * @see SearchPageFacade.search
     */
    search(querySearch: QuerySearch): Observable<ResponseEntity<PhysicalInventory>> {
        return this.api.query(querySearch);
    }

    /** @see PhysicalInventoryApi#findById */
    findById(id: string): Observable<PhysicalInventory> {
        return this.api.findById(id);
    }

    /** @see PhysicalInventoryApi#createCount */
    createCount(storeCode: string, frequencyCode: string): Observable<number> {
        return this.api.createCount(storeCode, frequencyCode);
    }

    /** @see PhysicalInventoryApi#updateCount */
    updateCount(physicalInventory: PhysicalInventory): Observable<Object> {
        return this.api.updateCount(physicalInventory);
    }

    updateCountByLocation(id: number, physicalInventoryCount: PhysicalInventoryCount): Observable<Object> {
        return this.api.updateCountByLocation(id, physicalInventoryCount);
    }

    /** @see PhysicalInventoryApi#closeCount */
    closeCount(physicalInventory: PhysicalInventory): Observable<Object> {
        return this.api.closeCount(physicalInventory);
    }

    /** @see PhysicalInventoryApi#stopCount */
    stopCount(physicalInventoryId: number, storeCode: string): Observable<Object> {
        return this.api.stopCount(physicalInventoryId, storeCode);
    }

    /** @see PhysicalInventoryApi#searchCountProducts */
    searchCountProducts(id: number, categoryCode?: string): Observable<PhysicalInventoryCount[]> {
        return this.api.searchCountProducts(id, categoryCode);
    }

    searchCountProductsByCategories(
        id: number,
        categoryCodes?: string[],
        isCountingByLocation = false
    ): Observable<PhysicalInventoryCount[]> {
        return this.api.searchCountProductsByCategories(id, categoryCodes, isCountingByLocation);
    }

    calculateVolume(productId: string, storeCode: string, enteredHeight: string): Observable<number> {
        return this.api.calculateVolume(productId, storeCode, enteredHeight);
    }

    /** @see PhysicalInventoryApi#getPDF */
    getPDF(storeCode: string, id: number, categoryCodes?: string[]): Observable<Blob> {
        return this.api.getPDF(storeCode, id, categoryCodes);
    }
}
