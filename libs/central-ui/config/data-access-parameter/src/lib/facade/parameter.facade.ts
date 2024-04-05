import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { ParameterApi } from '../api/parameter.api';
import { ParameterType } from '../model/parameter-type';
import { ParameterState } from '../state/parameter.state';

@Injectable()
export class ParameterFacade {
    private readonly api: ParameterApi;

    constructor(@Inject(GATEWAY_TOKEN) gateway: string, http: HttpClient, private readonly state: ParameterState) {
        this.api = new ParameterApi(gateway, { http });
    }

    findSystemParameterValue(paramName: string, responseType: ParameterType) {
        // If the state has the parameter value for this paramName cached, return it.  Otherwise, trigger cache initialization
        return (
            this.state.findSystemParameterValue(paramName) ||
            this.state.cacheSystemParameter(this.api.findSystemParameterValue(paramName, responseType), paramName)
        );
    }

    findCompanyParameterValue(paramName: string, responseType: ParameterType, compResourceId: string) {
        // If the state has the parameter value for this paramName cached, return it.  Otherwise, trigger cache initialization
        return (
            this.state.findCompanyParameterValue(paramName, compResourceId) ||
            this.state.cacheCompanyParameter(
                this.api.findCompanyParameterValue(paramName, responseType, compResourceId),
                paramName,
                compResourceId
            )
        );
    }

    findStoreParameterValue(paramName: string, responseType: ParameterType, storeResourceId: string) {
        // If the state has the parameter value for this paramName cached, return it.  Otherwise, trigger cache initialization
        return (
            this.state.findStoreParameterValue(paramName, storeResourceId) ||
            this.state.cacheStoreParameter(
                this.api.findStoreParameterValue(paramName, responseType, storeResourceId),
                paramName,
                storeResourceId
            )
        );
    }
}
