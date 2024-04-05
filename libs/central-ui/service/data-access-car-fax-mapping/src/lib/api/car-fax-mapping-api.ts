import { Inject } from '@angular/core';
import { Described } from '@vioc-angular/shared/common-functionality';
import { Api, ApiConfig, GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';

export class CarFaxMappingApi extends Api<Described, void> {
    constructor(@Inject(GATEWAY_TOKEN) gateway: string, config: ApiConfig) {
        super(`${gateway}service/v1/car-fax-mappings`, config);
        // super(`http://localhost:9003/v1/car-fax-mappings`, config);
    }

    getServiceNames() {
        return this.get<string[]>(['service-names']);
    }
}
