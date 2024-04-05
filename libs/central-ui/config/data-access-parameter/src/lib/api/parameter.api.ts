import { Inject, Injectable } from '@angular/core';
import { Api, ApiConfig, GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { ParameterType } from '../model/parameter-type';

@Injectable({
    providedIn: 'root',
})
export class ParameterApi extends Api<void, void> {
    constructor(@Inject(GATEWAY_TOKEN) gateway: string, config: ApiConfig) {
        const apiGatewayPath = 'config';
        const controllerPath = 'v1/parameter';
        super(`${gateway}${apiGatewayPath}/${controllerPath}`, config);
        // super(`http://localhost:9000/${controllerPath}`, config);
    }

    findSystemParameterValue(paramName: string, responseType: ParameterType) {
        return this.get<any>([paramName, responseType]);
    }

    findCompanyParameterValue(paramName: string, responseType: ParameterType, compResourceId: string) {
        return this.get<any>([paramName, responseType], { compResourceId });
    }

    findStoreParameterValue(paramName: string, responseType: ParameterType, storeResourceId: string) {
        return this.get<any>([paramName, responseType], { storeResourceId });
    }
}
