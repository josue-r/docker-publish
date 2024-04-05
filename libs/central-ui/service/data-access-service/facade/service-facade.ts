import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { AssignmentCount, QuerySearch } from '@vioc-angular/shared/common-api-models';
import { Described } from '@vioc-angular/shared/common-functionality';
import { EntityPatch, GATEWAY_TOKEN, ResponseEntity } from '@vioc-angular/shared/util-api';
import { of } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { Service } from '../model/service.model';
import { ServiceApi } from './../api/service-api';

@Injectable()
export class ServiceFacade {
    private readonly api: ServiceApi;

    constructor(@Inject(GATEWAY_TOKEN) gateway: string, http: HttpClient) {
        this.api = new ServiceApi(`${gateway}service`, { http });
    }

    /**
     * Returns true if service is assigned to any stores (active or inactive), else returns false if no records found
     * @param service
     */
    isAssignedToAnyStores(service: Service) {
        return !service.id ? of(false) : this.api.isAssignedToAnyStores(service);
    }

    /**
     * Returns true if actively assigned to any company or store, else returns false
     * @param service
     */
    checkIfActiveAtStoreOrCompany(service: Service) {
        return !service.id ? of(false) : this.api.checkIfActiveAtStoreOrCompany(service);
    }

    /**
     * Searches for unassigned `Services`s by `Company`s
     */
    findUnassignedServicesForCompany(
        company: Described,
        querySearch: QuerySearch
    ): Observable<ResponseEntity<Service>> {
        return this.api.findUnassignedServicesForCompany(company, querySearch);
    }

    /**
     * Searches for assignable `Service`s by `Store`s
     */
    findAssignableServicesForStores(stores: { id: number; company?: { id: number } }[]): Observable<Service[]> {
        return this.api.findAssignableServicesForStores(stores);
    }

    /**
     * @see SearchPageFacade.entityPatch
     */
    entityPatch(patches: EntityPatch<number>[]): Observable<Object> {
        return this.api.entityPatch(['patch'], ...patches);
    }

    /**
     * Syncs with database
     */
    dataSync(ids: number[]) {
        return this.api.dataSync(ids);
    }

    /** @see Api#findActive */
    findActive() {
        return this.api.findActive();
    }

    /** @see Api#findActive */
    findActiveByCategory(categoryCode: string) {
        return this.api.findActive({ categoryCode });
    }

    /**
     * Finds services by passed `code`
     */
    findByCode(serviceCode: string) {
        return this.api.findByCode(serviceCode);
    }

    /** @see Api#save */
    save(service: Service) {
        return this.api.save(service);
    }

    /**
     * @see Api.activate
     */
    activate(ids: number[]) {
        return this.api.activate(ids);
    }

    /**
     * @see Api.deactivate
     */
    deactivate(ids: number[]) {
        return this.api.deactivate(ids);
    }

    /**
     * @see SearchPageFacade.search
     */
    search(querySearch: QuerySearch): Observable<ResponseEntity<Service>> {
        return this.api.query(querySearch);
    }

    /**
     * @see ServiceApi.findUsage
     */
    findUsage(ids: number[]): Observable<AssignmentCount[]> {
        return this.api.findUsage(ids);
    }
}
