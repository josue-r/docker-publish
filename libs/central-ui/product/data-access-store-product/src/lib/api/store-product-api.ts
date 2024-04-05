import { Inject } from '@angular/core';
import { QuerySearch } from '@vioc-angular/shared/common-api-models';
import { Described } from '@vioc-angular/shared/common-functionality';
import { Api, ApiConfig, GATEWAY_TOKEN, ResponseEntity } from '@vioc-angular/shared/util-api';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { InventoryDetail } from '../model/inventory-detail.model';
import { StoreProductInventoryStatus } from '../model/store-product-inventory-status.model';
import { StoreProductMassAdd } from '../model/store-product-mass-add.model';
import { StoreProductMassUpdate } from '../model/store-product-mass-update.model';
import { StoreProduct } from '../model/store-product.model';
import { StoreProductMassAddPreview } from './../model/store-product-mass-add-preview.model';

export class StoreProductApi extends Api<StoreProduct, { storeId: number; productId: number }> {
    constructor(@Inject(GATEWAY_TOKEN) gateway: string, config: ApiConfig) {
        super(`${gateway}`, config);
        //super(`http://localhost:9004/`, config); //
    }

    /**
     * Searches for a `StoreProduct` by store number and product code.
     */
    findByStoreAndProduct(storeNumber: string, productCode: string): Observable<StoreProduct> {
        return this.get<StoreProduct>(['v1/store-products'], { store: storeNumber, product: productCode });
    }

    /**
     * Searches for `StoreProduct`s given a store and product codes
     */
    findByStoreAndProducts(storeNumber: string, productCodes: string[]): Observable<InventoryDetail[]> {
        const requestBody = {
            productIds: null,
            productCodes,
        };
        return this.post<StoreProduct[]>(['v1/store-products/inventory-details'], requestBody, { store: storeNumber });
    }

    /**
     * Assign StoreProducts based on the given mass add template values, storeIds, and prodIds.
     */
    add(massAdd: StoreProductMassAdd): Observable<number> {
        const requestBody = {
            ...massAdd.storeProduct,
            storeIds: massAdd.stores.map(Described.idMapper),
            productIds: massAdd.products.map(Described.idMapper),
        };
        return this.post(['v1/store-products/mass-add'], requestBody).pipe(map((r) => r as number));
    }

    /**
     * Returns all user accessible stores for a given `Product Code` where a `StoreProduct`
     * does not exist, a `CompanyProduct` does exist and is active and the `Store` is active.
     */
    findAssignableStores(productCode: string): Observable<Described[]> {
        return this.get<Described[]>(['v1/store-products/assignable-stores'], { productCode });
    }

    /**
     * Retrieve a preview of what StoreProducts are assignable out of the given storeIds and prodIds.
     */
    previewMassAdd(storeIds: number[], prodIds: number[]): Observable<StoreProductMassAddPreview[]> {
        return this.post(['v1/store-products/mass-add-preview'], { storeIds, prodIds });
    }

    /**
     * Searches for `Products` that have been assigned to `Store Products`.
     */
    searchAssignedProductsByStore(
        querySearch: QuerySearch,
        stores: Described[]
    ): Observable<ResponseEntity<Described>> {
        const requestBody = {
            storeIds: stores.map(Described.idMapper),
            restrictions: querySearch.queryRestrictions,
        };
        const httpParams = this.buildHttpParams(querySearch);
        return this.post(['v2/store-products/store-assigned-products'], requestBody, httpParams).pipe(
            this.convertPagedResourceToResponseEntity
        );
    }

    /**
     * Updates the `StoreProducts` for the given storeIds and prodIds with the provided user values.
     */
    massUpdate(massUpdate: StoreProductMassUpdate, updateFields: string[]): Observable<Object> {
        const requestBody = {
            storeIds: massUpdate.stores.map(Described.idMapper),
            productIds: massUpdate.products.map(Described.idMapper),
            updateFields,
            ...massUpdate.patch,
        };
        return this.patch(['v1/store-products/mass-update'], requestBody);
    }

    /**
     * Retrieve inventory details for the given store, vendor, and productCodes combination. This will contain
     * extra information not available on a base StoreProduct.
     */
    getInventoryDetails(storeCode: string, vendorCode: string, productCodes: string[]): Observable<any[]> {
        return this.post(
            ['v1/store-products/ordering-details'],
            { productCodes },
            { store: storeCode, vendor: vendorCode }
        );
    }

    inventoryStatusSearch(querySearch: QuerySearch): Observable<ResponseEntity<StoreProductInventoryStatus>> {
        return this.query(querySearch, ['v1/store-products/inventory-status/search']);
    }
}
