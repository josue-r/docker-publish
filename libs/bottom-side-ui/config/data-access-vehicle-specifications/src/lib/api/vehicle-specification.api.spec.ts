import { of } from 'rxjs';
import { VehicleSpecificationApi } from './vehicle-specification.api';
import { ApiConfig } from '@vioc-angular/shared/util-api';
import { HttpClient } from '@angular/common/http';

describe('VehicleSpecificationApi', () => {
    let api: VehicleSpecificationApi;
    let getSpy: jest.SpyInstance;

    beforeEach(() => {
        const gateway = 'http://localhost:4200';
        const httpMock = {
            get: jest.fn(() => of()),
        } as Partial<HttpClient> as jest.Mocked<HttpClient>;
        const config: ApiConfig = { http: httpMock };
        api = new VehicleSpecificationApi(gateway, config);
        getSpy = jest.spyOn(api, 'get');
    });

    it('should create an instance', () => {
        expect(api).toBeTruthy();
    });

    it('should call get with correct arguments for getVehicleSpecificationsByEngineConfigId', () => {
        const vehicleToEngineConfigId = '1';
        getSpy.mockReturnValue(of({}));

        api.getVehicleSpecificationsByVehicleToEngineConfigId(vehicleToEngineConfigId);

        expect(getSpy).toHaveBeenCalledWith([vehicleToEngineConfigId]);
    });

    it('should call get with correct arguments for getPartsByVehicleToEngineConfigIdAndPartType', () => {
        const vehicleToEngineConfigId = '1';
        const partType = 'OIL_FILTER';
        getSpy.mockReturnValue(of([]));

        api.getPartsByVehicleToEngineConfigIdAndPartType(vehicleToEngineConfigId, partType);

        expect(getSpy).toHaveBeenCalledWith([vehicleToEngineConfigId, 'parts', partType]);
    });

    it('should call get with correct arguments for getOilFilterTorqueByVehicleToEngineConfigId', () => {
        const vehicleToEngineConfigId = '1';
        getSpy.mockReturnValue(of({}));

        api.getOilFilterTorqueByVehicleToEngineConfigId(vehicleToEngineConfigId);

        expect(getSpy).toHaveBeenCalledWith([vehicleToEngineConfigId, 'oil-filter-torque']);
    });

    it('should call get with correct arguments for getEngineDrainPlugTorqueByVehicleToEngineConfigId', () => {
        const vehicleToEngineConfigId = '1';
        getSpy.mockReturnValue(of({}));

        api.getEngineDrainPlugTorqueByVehicleToEngineConfigId(vehicleToEngineConfigId);

        expect(getSpy).toHaveBeenCalledWith([vehicleToEngineConfigId, 'engine-drain-plug-torque']);
    });

    it('should call get with correct arguments for getFinalDriveTorqueByVehicleToEngineConfigId', () => {
        const vehicleToEngineConfigId = '1';
        getSpy.mockReturnValue(of({}));

        api.getFinalDriveTorqueByVehicleToEngineConfigId(vehicleToEngineConfigId);

        expect(getSpy).toHaveBeenCalledWith([vehicleToEngineConfigId, 'final-drive-torque']);
    });

    it('should call get with correct arguments for getTransferCaseTorqueByVehicleToEngineConfigId', () => {
        const vehicleToEngineConfigId = '1';
        getSpy.mockReturnValue(of({}));

        api.getTransferCaseTorqueByVehicleToEngineConfigId(vehicleToEngineConfigId);

        expect(getSpy).toHaveBeenCalledWith([vehicleToEngineConfigId, 'transfer-case-torque']);
    });

    it('should call get with correct arguments for getManualTransmissionTorqueByVehicleToEngineConfigId', () => {
        const vehicleToEngineConfigId = '1';
        getSpy.mockReturnValue(of({}));

        api.getManualTransmissionTorqueByVehicleToEngineConfigId(vehicleToEngineConfigId);

        expect(getSpy).toHaveBeenCalledWith([vehicleToEngineConfigId, 'manual-transmission-torque']);
    });
});
