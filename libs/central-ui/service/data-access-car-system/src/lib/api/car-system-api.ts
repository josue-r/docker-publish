import { Inject } from '@angular/core';
import { Described } from '@vioc-angular/shared/common-functionality';
import { Api, ApiConfig, GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';

export class CarSystemApi extends Api<Described, void> {
    constructor(@Inject(GATEWAY_TOKEN) gateway: string, config: ApiConfig) {
        super(`${gateway}service/v1/car-systems`, config);
        // super(`http://localhost:9003/v1/car-systems`, config); //
    }

    findActive() {
        return this.get<Described[]>(['active']);
    }
}
