import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { CarFaxMappingApi } from '../api/car-fax-mapping-api';

@Injectable()
export class CarFaxMappingFacade {
    private readonly api: CarFaxMappingApi;

    constructor(@Inject(GATEWAY_TOKEN) gateway: string, http: HttpClient) {
        this.api = new CarFaxMappingApi(gateway, { http });
    }

    getServiceNames() {
        return this.api.getServiceNames();
    }
}
