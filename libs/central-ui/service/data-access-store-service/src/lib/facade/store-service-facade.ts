import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { QuerySearch } from '@vioc-angular/shared/common-api-models';
import { defaultEmptyObjectToNull, Described } from '@vioc-angular/shared/common-functionality';
import { EntityPatch, GATEWAY_TOKEN, ResponseEntity } from '@vioc-angular/shared/util-api';
import { Observable } from 'rxjs';
import { StoreServiceApi } from '../api/store-service-api';
import { StoreServiceMassAddPreview } from '../model/store-service-mass-add-preview.model';
import { StoreServiceMassAdd } from '../model/store-service-mass-add.model';
import { StoreServiceMassUpdate } from '../model/store-service-mass-update.model';
import { StoreService } from '../model/store-service.model';

@Injectable()
export class StoreServiceFacade {
    private readonly api: StoreServiceApi;

    constructor(@Inject(GATEWAY_TOKEN) gateway: string, http: HttpClient) {
        this.api = new StoreServiceApi(`${gateway}service`, { http });
    }

    findByStoreAndService(storeNumber: string, serviceCode: string): Observable<StoreService> {
        return this.api.findByStoreAndService(storeNumber, serviceCode);
    }

    save(storeService: StoreService) {
        if (!storeService.priceOverridable) {
            // clear out these fields that don't matter
            storeService.priceOverrideMin = null;
            storeService.priceOverrideMax = null;
            storeService.priceOverrideMinMaxOverrideable = false;
        }
        return this.api.save(storeService, ['v1/store-services']);
    }

    /**
     * @see SearchPageFacade.search
     */
    search(querySearch: QuerySearch): Observable<ResponseEntity<StoreService>> {
        return this.api.query(querySearch, ['v1/store-services/search']);
    }

    /**
     * @see SearchPageFacade.entityPatch
     */
    entityPatch(patches: EntityPatch<{ storeId: number; serviceId: number }>[]): Observable<Object> {
        return this.api.entityPatch(['v1/store-services/patch'], ...patches);
    }

    activate(ids: { storeId: number; serviceId: number }[]): Observable<number> {
        return this.api.activate(ids, ['v1/store-services/activate']);
    }

    /**
     * @see Api.deactivate
     */
    deactivate(ids: { storeId: number; serviceId: number }[]): Observable<number> {
        return this.api.deactivate(ids, ['v1/store-services/deactivate']);
    }

    /**
     * @see Api.previewMassAdd
     */
    previewMassAdd(storeIds: number[], serviceId: number): Observable<StoreServiceMassAddPreview[]> {
        return this.api.previewMassAdd(storeIds, serviceId);
    }

    /**
     * @see Api.add
     */
    add(massAdd: StoreServiceMassAdd): Observable<number> {
        // check the nested entities to see if any are empty, if so set them to null
        defaultEmptyObjectToNull(massAdd.storeService, ['extraCharge1', 'extraCharge2']);
        return this.api.add({
            ...massAdd,
            storeService: massAdd.storeService,
        });
    }

    /**
     * @see SearchPageFacade.dataSync
     */
    dataSync(ids: { storeId: number; serviceId: number }[]): Observable<number> {
        return this.api.dataSync(ids, ['v1/store-services/datasync']);
    }

    /**
     * @see StoreServiceApi.searchAssignedServicesByStore
     */
    searchAssignedServicesByStore(querySearch: QuerySearch, stores: Described[]) {
        return this.api.searchAssignedServicesByStore(querySearch, stores);
    }

    /**
     * @see StoreServiceApi.massUpdate
     */
    massUpdate(massUpdate: StoreServiceMassUpdate) {
        return this.api.massUpdate(massUpdate);
    }
}
