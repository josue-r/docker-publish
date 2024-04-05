import { isNullOrUndefined } from '@vioc-angular/shared/common-functionality';
import { Api, ApiConfig } from '@vioc-angular/shared/util-api';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PhysicalInventoryCount } from '../model/physical-inventory-count.model';
import { PhysicalInventory } from '../model/physical-inventory.model';
export class PhysicalInventoryApi extends Api<PhysicalInventory, any> {
    constructor(baseUrl: string, config: ApiConfig) {
        super(`${baseUrl}/v1/physical-inventories`, config);
        // super(`http://localhost:9007/v1/physical-inventories`, config);
    }

    findById(id: string): Observable<PhysicalInventory> {
        return this.get([], { id });
    }

    createCount(storeCode: string, frequencyCode: string): Observable<number> {
        return this.post([], [], { store: storeCode, frequency: frequencyCode });
    }

    updateCount(physicalInventory: PhysicalInventory): Observable<PhysicalInventory> {
        return this.post(['update-counts'], physicalInventory);
    }

    updateCountByLocation(id: number, physicalInventoryCount: PhysicalInventoryCount): Observable<PhysicalInventory> {
        return this.put([`${id}/itemized-count`], physicalInventoryCount);
    }

    closeCount(physicalInventory: PhysicalInventory): Observable<PhysicalInventory> {
        return this.post(['update-counts'], physicalInventory, { status: 'CLOSED' });
    }

    stopCount(physicalInventoryId: number, storeCode: string): Observable<Object> {
        return this.post(['stop-count'], [], { id: `${physicalInventoryId}`, storeCode });
    }

    calculateVolume(productId: string, storeCode: string, enteredHeight: string): Observable<number> {
        return this.get(['calculate-product-volume'], { productId, storeCode, enteredHeight });
    }

    searchCountProducts(id: number, categoryCode?: string): Observable<PhysicalInventoryCount[]> {
        if (!isNullOrUndefined(categoryCode)) {
            return this.get([`${id}/counts`], { categoryCode });
        } else {
            return this.get([`${id}/counts`]);
        }
    }

    searchCountProductsByCategories(
        id: number,
        categoryCodes?: string[],
        isCountingByLocation = false
    ): Observable<PhysicalInventoryCount[]> {
        // check if categoryCodes are needed to pass as a http parameter
        const categoryHttpParams = !isNullOrUndefined(categoryCodes) ? { categoryCodes } : {};
        // check if isCountingByLocation is true, if so add it as a http parameter
        const locationAndCategoryHttpParams = isCountingByLocation
            ? { ...categoryHttpParams, isCountingByLocation: `${isCountingByLocation}` }
            : categoryHttpParams;
        return this.get([`${id}/multiple-category-counts`], locationAndCategoryHttpParams);
    }

    getPDF(storeCode: string, id: number, categoryCodes?: string[]): Observable<Blob> {
        // must use the http.get here to overide the default type T that attempts to convert
        // the response to a json PhysicalInventory response
        if (!isNullOrUndefined(categoryCodes) && categoryCodes.length > 0) {
            return this.getBlob([`${storeCode}/${id}/print`], { categoryCodes }).pipe(
                map((res: Blob) => {
                    return new Blob([res], { type: 'application/pdf' });
                })
            );
        } else {
            return this.getBlob([`${storeCode}/${id}/print`]).pipe(
                map((res: Blob) => {
                    return new Blob([res], { type: 'application/pdf' });
                })
            );
        }
    }
}
