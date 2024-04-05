import { Inject } from '@angular/core';
import { QuerySearch } from '@vioc-angular/shared/common-api-models';
import { Described } from '@vioc-angular/shared/common-functionality';
import { Api, ApiConfig, GATEWAY_TOKEN, ResponseEntity } from '@vioc-angular/shared/util-api';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StoreServiceMassAddPreview } from '../model/store-service-mass-add-preview.model';
import { StoreServiceMassAdd } from '../model/store-service-mass-add.model';
import { StoreServiceMassUpdate } from '../model/store-service-mass-update.model';
import { StoreService } from '../model/store-service.model';

export class StoreServiceApi extends Api<StoreService, { storeId: number; serviceId: number }> {
    constructor(@Inject(GATEWAY_TOKEN) gateway: string, config: ApiConfig) {
        super(`${gateway}`, config);
        // super(`http://localhost:9003/`, config); //
    }

    /**
     * Searches for a `StoreService` by store number and service code.
     */
    findByStoreAndService(storeNumber: string, serviceCode: string): Observable<StoreService> {
        return this.get<StoreService>(['v1/store-services'], { store: storeNumber, service: serviceCode });
    }

    /**
     * Retrieve a preview of what `StoreServices` are assignable out of the given storeIds and serviceIds.
     */
    previewMassAdd(storeIds: number[], serviceId: number): Observable<StoreServiceMassAddPreview[]> {
        return this.post(['v1/store-services/mass-add-preview'], { storeIds, serviceIds: [serviceId] });
    }

    /**
     * Assign `StoreServices` based on the given mass add template values, storeIds and serviceIds.
     */
    add(massAdd: StoreServiceMassAdd): Observable<number> {
        const requestBody = {
            ...massAdd.storeService,
            storeIds: massAdd.stores.map(Described.idMapper),
            serviceIds: [massAdd.service.id],
        };
        return this.post(['v1/store-services/mass-add'], requestBody).pipe(map((r) => r as number));
    }

    /**
     * Searches for StoreServices that are assigned to the given stores and fit the other search criteria
     */
    searchAssignedServicesByStore(
        querySearch: QuerySearch,
        stores: Described[]
    ): Observable<ResponseEntity<Described>> {
        const requestBody = {
            storeIds: stores.map(Described.idMapper),
            restrictions: querySearch.queryRestrictions,
        };
        const httpParams = this.buildHttpParams(querySearch);
        return this.post(['v2/store-services/store-assigned-services'], requestBody, httpParams).pipe(
            this.convertPagedResourceToResponseEntity
        );
    }

    /**
     * Mass updates the updateFields according to the template StoreService at the specified stores and services
     */
    massUpdate(massUpdate: StoreServiceMassUpdate): Observable<number> {
        const requestBody = {
            ...massUpdate.storeService,
            storeIds: massUpdate.stores.map(Described.idMapper),
            serviceIds: massUpdate.services.map(Described.idMapper),
            updateFields: massUpdate.updateFields,
        };
        return this.patch(['v1/store-services/mass-update'], requestBody).pipe(map((r) => r as number));
    }
}
