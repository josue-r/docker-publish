import { ApiConfig, BaseApi } from '@vioc-angular/shared/util-api';
import { VehicleSpecification } from '../model/vehicle-specification.model';
import { Part, PartTypeApi } from '../model/part.model';
import { Observable } from 'rxjs';
import { OilFilterTorque } from '../model/oil-filter-torque.model';
import { EngineDrainPlugTorque } from '../model/engine-drain-plug-torque.model';
import { FinalDriveTorque } from '../model/final-drive-torque.model';
import { TransferCaseTorque } from '../model/transfer-case-torque.model';
import { ManualTransmissionTorque } from '../model/manual-transmission-torque.model';

/**
 * Vehicle specification api
 *
 * Using void as the type parameter in BaseApi<void> indicates that the BaseApi class does not expect any specific type for its generic parameter.
 *
 * We are only using the base methods to make HTTP requests and handle errors, but not to parse or manipulate the response data (that's responsibility of each subscriber).
 *
 * Even though BaseApi is declared with BaseApi<void>, you can still use it with specific types when calling its methods in VehicleSpecificationApi.
 * This is because TypeScript's generics allow you to specify a different type when using a generic class or method, even if the class itself is defined with a different type parameter.
 */
export class VehicleSpecificationApi extends BaseApi<void> {
    constructor(gateway: string, config: ApiConfig) {
        const apiGatewayPath = 'v1';
        const controllerPath = 'vehicle-specifications';
        super(`${gateway}/${apiGatewayPath}/${controllerPath}`, config);
    }

    getVehicleSpecificationsByVehicleToEngineConfigId(
        vehicleToEngineConfigId: string
    ): Observable<VehicleSpecification> {
        return this.get<VehicleSpecification>([vehicleToEngineConfigId]);
    }

    getPartsByVehicleToEngineConfigIdAndPartType(
        vehicleToEngineConfigId: string,
        partType: PartTypeApi
    ): Observable<Part[]> {
        return this.get<Part[]>([vehicleToEngineConfigId, 'parts', partType]);
    }

    getOilFilterTorqueByVehicleToEngineConfigId(vehicleToEngineConfigId: string): Observable<OilFilterTorque> {
        return this.get<OilFilterTorque>([vehicleToEngineConfigId, 'oil-filter-torque']);
    }

    getEngineDrainPlugTorqueByVehicleToEngineConfigId(
        vehicleToEngineConfigId: string
    ): Observable<EngineDrainPlugTorque> {
        return this.get<EngineDrainPlugTorque>([vehicleToEngineConfigId, 'engine-drain-plug-torque']);
    }

    getFinalDriveTorqueByVehicleToEngineConfigId(vehicleToEngineConfigId: string): Observable<FinalDriveTorque[]> {
        return this.get<FinalDriveTorque[]>([vehicleToEngineConfigId, 'final-drive-torque']);
    }

    getTransferCaseTorqueByVehicleToEngineConfigId(vehicleToEngineConfigId: string): Observable<TransferCaseTorque[]> {
        return this.get<TransferCaseTorque[]>([vehicleToEngineConfigId, 'transfer-case-torque']);
    }

    getManualTransmissionTorqueByVehicleToEngineConfigId(
        vehicleToEngineConfigId: string
    ): Observable<ManualTransmissionTorque[]> {
        return this.get<ManualTransmissionTorque[]>([vehicleToEngineConfigId, 'manual-transmission-torque']);
    }
}
