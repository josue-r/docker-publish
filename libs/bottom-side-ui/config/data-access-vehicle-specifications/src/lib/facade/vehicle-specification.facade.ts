import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { Observable, throwError } from 'rxjs';
import { VehicleSpecificationApi } from '../api/vehicle-specification.api';
import { VehicleSpecification } from '../model/vehicle-specification.model';
import { Part, PartTypeApi } from '../model/part.model';
import { catchError } from 'rxjs/operators';
import { OilFilterTorque } from '../model/oil-filter-torque.model';
import { EngineDrainPlugTorque } from '../model/engine-drain-plug-torque.model';
import { TransferCaseTorque } from '../model/transfer-case-torque.model';
import { FinalDriveTorque } from '../model/final-drive-torque.model';
import { ManualTransmissionTorque } from '../model/manual-transmission-torque.model';

@Injectable()
export class VehicleSpecificationFacade {
    private readonly api: VehicleSpecificationApi;

    constructor(@Inject(GATEWAY_TOKEN) gateway: string, http: HttpClient) {
        this.api = new VehicleSpecificationApi(`${gateway}`, { http });
    }

    getVehicleSpecificationsByVehicleToEngineConfigId(
        vehicleToEngineConfigId: string
    ): Observable<VehicleSpecification> {
        return this.api
            .getVehicleSpecificationsByVehicleToEngineConfigId(vehicleToEngineConfigId)
            .pipe(catchError(this.handleHttpError));
    }

    getPartsByVehicleToEngineConfigIdAndPartType(
        vehicleToEngineConfigId: string,
        partType: PartTypeApi
    ): Observable<Part[]> {
        return this.api
            .getPartsByVehicleToEngineConfigIdAndPartType(vehicleToEngineConfigId, partType)
            .pipe(catchError(this.handleHttpError));
    }

    getOilFilterTorqueByVehicleToEngineConfigId(vehicleToEngineConfigId: string): Observable<OilFilterTorque> {
        return this.api.getOilFilterTorqueByVehicleToEngineConfigId(vehicleToEngineConfigId);
    }

    getEngineDrainPlugTorqueByVehicleToEngineConfigId(
        vehicleToEngineConfigId: string
    ): Observable<EngineDrainPlugTorque> {
        return this.api.getEngineDrainPlugTorqueByVehicleToEngineConfigId(vehicleToEngineConfigId);
    }

    getFinalDriveTorqueByVehicleToEngineConfigId(vehicleToEngineConfigId: string): Observable<FinalDriveTorque[]> {
        return this.api.getFinalDriveTorqueByVehicleToEngineConfigId(vehicleToEngineConfigId);
    }

    getTransferCaseTorqueByVehicleToEngineConfigId(vehicleToEngineConfigId: string): Observable<TransferCaseTorque[]> {
        return this.api.getTransferCaseTorqueByVehicleToEngineConfigId(vehicleToEngineConfigId);
    }

    getManualTransmissionTorqueByVehicleToEngineConfigId(
        vehicleToEngineConfigId: string
    ): Observable<ManualTransmissionTorque[]> {
        return this.api.getManualTransmissionTorqueByVehicleToEngineConfigId(vehicleToEngineConfigId);
    }

    handleHttpError(error: any): Observable<never> {
        if (error instanceof HttpErrorResponse) {
            if (error.status === 404) {
                return throwError(new Error('-'));
            }
            return throwError(new Error('Error, Notify MOD'));
        }
        return throwError(error);
    }
}
