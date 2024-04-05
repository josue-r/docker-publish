import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { SearchPageFacade } from '@vioc-angular/central-ui/feature-search-page';
import { QuerySearch } from '@vioc-angular/shared/common-api-models';
import { Described } from '@vioc-angular/shared/common-functionality';
import { EntityPatch, GATEWAY_TOKEN, ResponseEntity } from '@vioc-angular/shared/util-api';
import { Observable } from 'rxjs';
import { StoreProductApi } from '../api/store-product-api';
import { InventoryDetail } from '../model/inventory-detail.model';
import { StoreProductMassAddPreview } from '../model/store-product-mass-add-preview.model';
import { StoreProductMassAdd } from '../model/store-product-mass-add.model';
import { StoreProductMassUpdate } from '../model/store-product-mass-update.model';
import { StoreProduct } from '../model/store-product.model';

@Injectable()
export class StoreProductFacade implements SearchPageFacade<StoreProduct> {
    private readonly api: StoreProductApi;

    constructor(@Inject(GATEWAY_TOKEN) gateway: string, http: HttpClient) {
        this.api = new StoreProductApi(`${gateway}product`, { http });
    }

    /**
     * Updates the passed `StoreProduct`.
     */
    update(storeProduct: StoreProduct): Observable<Object> {
        if (!storeProduct.extraChargeAmount) {
            // clear out these fields that don't matter
            storeProduct.extraChargeAmount = null; // clears if 0
            storeProduct.extraChargeDescription = null;
            storeProduct.extraChargeTaxable = null;
        }
        if (!storeProduct.schedulePriceDate) {
            // clear out these fields that don't matter
            storeProduct.schedulePriceChange = null;
        }
        if (!storeProduct.wholesalePriceChangeDate) {
            // clear out these fields that don't matter
            storeProduct.wholesalePriceChange = null;
        }
        if (!storeProduct.promotionPriceStartDate) {
            // clear out these fields that don't matter
            storeProduct.promotionPriceEndDate = null;
            storeProduct.promotionPrice = null;
        }
        if (!storeProduct.overridable) {
            // clear out these fields that don't matter
            storeProduct.minOverridePrice = null;
            storeProduct.maxOverridePrice = null;
            storeProduct.minMaxOverridable = false;
        }
        return this.api.update(storeProduct, ['v1/store-products']);
    }

    /**
     * Searches for a `StoreProduct` by store number and product code.
     */
    findByStoreAndProduct(storeNumber: string, productCode: string): Observable<StoreProduct> {
        return this.api.findByStoreAndProduct(storeNumber, productCode);
    }

    /**
     * Searches for a `StoreProduct`s by store number and product codes.
     */
    findByStoreAndProducts(storeNumber: string, productCodes: string[]): Observable<InventoryDetail[]> {
        return this.api.findByStoreAndProducts(storeNumber, productCodes);
    }

    /**
     * @see Api.activate
     */
    activate(ids: { storeId: number; productId: number }[]): Observable<number> {
        return this.api.activate(ids, ['v1/store-products/activate']);
    }

    /**
     * @see Api.deactivate
     */
    deactivate(ids: { storeId: number; productId: number }[]): Observable<number> {
        return this.api.deactivate(ids, ['v1/store-products/deactivate']);
    }

    /**
     * @see SearchPageFacade.search
     */
    search(querySearch: QuerySearch): Observable<ResponseEntity<StoreProduct>> {
        return this.api.query(querySearch, ['v1/store-products/search']);
    }

    /**
     * @see SearchPageFacade.entityPatch
     */
    entityPatch(patches: EntityPatch<{ storeId: number; productId: number }>[]): Observable<Object> {
        return this.api.entityPatch(['v1/store-products/patch'], ...patches);
    }

    /**
     * @see SearchPageFacade.dataSync
     */
    dataSync(ids: { storeId: number; productId: number }[]): Observable<number> {
        return this.api.dataSync(ids, ['v1/store-products/datasync']);
    }

    /**
     * @see StoreProductApi.add
     */
    add(massAdd: StoreProductMassAdd): Observable<number> {
        return this.api.add(massAdd);
    }

    /**
     * @see StoreProductApi.findAssignableStores
     */
    findAssignableStores(productCode: string): Observable<Described[]> {
        return this.api.findAssignableStores(productCode);
    }

    /**
     * @see StoreProductApi.previewMassAdd
     */
    previewMassAdd(storeIds: number[], prodIds: number[]): Observable<StoreProductMassAddPreview[]> {
        return this.api.previewMassAdd(storeIds, prodIds);
    }

    /**
     * @see StoreProductApi.searchAssignedProductsByStore
     */
    searchAssignedProductsByStore(
        querySearch: QuerySearch,
        stores: Described[]
    ): Observable<ResponseEntity<Described>> {
        return this.api.searchAssignedProductsByStore(querySearch, stores);
    }

    /**
     * @see StoreProductApi.massUpdate
     */
    massUpdate(massUpdate: StoreProductMassUpdate, updateFields: string[]): Observable<Object> {
        return this.api.massUpdate(massUpdate, updateFields);
    }

    /**
     * @see StoreProductApi.getInventoryDetails
     */
    getInventoryDetails(storeCode: string, vendorCode: string, productCodes: string[]): Observable<any[]> {
        return this.api.getInventoryDetails(storeCode, vendorCode, productCodes);
    }
}
