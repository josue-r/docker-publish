import { TestBed } from '@angular/core/testing';
import { VehicleSpecificationFacade } from './vehicle-specification.facade';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PartTypeApiEnum } from '../model/part.model';

describe('VehicleSpecificationFacade', () => {
    let facade: VehicleSpecificationFacade;
    let httpMock: HttpTestingController;
    const gateway = 'http://localhost:4200';

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [VehicleSpecificationFacade, { provide: GATEWAY_TOKEN, useValue: gateway }],
        });

        facade = TestBed.inject(VehicleSpecificationFacade);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(facade).toBeTruthy();
    });

    it('should call api with correct arguments for getVehicleSpecificationsByEngineConfigId', () => {
        const vehicleToEngineConfigId = '1';
        const expectedUrl = `${gateway}/v1/vehicle-specifications/${vehicleToEngineConfigId}`;

        facade.getVehicleSpecificationsByVehicleToEngineConfigId(vehicleToEngineConfigId).subscribe();

        const req = httpMock.expectOne(expectedUrl);
        expect(req.request.method).toBe('GET');
        req.flush({});
    });

    it('should call api with correct arguments for getPartsByVehicleToEngineConfigIdAndPartType', () => {
        const vehicleToEngineConfigId = '1';
        const partType = PartTypeApiEnum.OIL_FILTER;
        const expectedUrl = `${gateway}/v1/vehicle-specifications/${vehicleToEngineConfigId}/parts/${partType}`;

        facade.getPartsByVehicleToEngineConfigIdAndPartType(vehicleToEngineConfigId, partType).subscribe();

        const req = httpMock.expectOne(expectedUrl);
        expect(req.request.method).toBe('GET');
        req.flush({});
    });

    it('should call api with correct arguments for getOilFilterTorqueByVehicleToEngineConfigId', () => {
        const vehicleToEngineConfigId = '1';
        const expectedUrl = `${gateway}/v1/vehicle-specifications/${vehicleToEngineConfigId}/oil-filter-torque`;

        facade.getOilFilterTorqueByVehicleToEngineConfigId(vehicleToEngineConfigId).subscribe();

        const req = httpMock.expectOne(expectedUrl);
        expect(req.request.method).toBe('GET');
        req.flush({});
    });

    it('should call api with correct arguments for getEngineDrainPlugTorqueByVehicleToEngineConfigId', () => {
        const vehicleToEngineConfigId = '1';
        const expectedUrl = `${gateway}/v1/vehicle-specifications/${vehicleToEngineConfigId}/engine-drain-plug-torque`;

        facade.getEngineDrainPlugTorqueByVehicleToEngineConfigId(vehicleToEngineConfigId).subscribe();

        const req = httpMock.expectOne(expectedUrl);
        expect(req.request.method).toBe('GET');
        req.flush({});
    });

    it('should call api with correct arguments for getFinalDriveTorqueByVehicleToEngineConfigId', () => {
        const vehicleToEngineConfigId = '1';
        const expectedUrl = `${gateway}/v1/vehicle-specifications/${vehicleToEngineConfigId}/final-drive-torque`;

        facade.getFinalDriveTorqueByVehicleToEngineConfigId(vehicleToEngineConfigId).subscribe();

        const req = httpMock.expectOne(expectedUrl);
        expect(req.request.method).toBe('GET');
        req.flush({});
    });

    it('should call api with correct arguments for getTransferCaseTorqueByVehicleToEngineConfigId', () => {
        const vehicleToEngineConfigId = '1';
        const expectedUrl = `${gateway}/v1/vehicle-specifications/${vehicleToEngineConfigId}/transfer-case-torque`;

        facade.getTransferCaseTorqueByVehicleToEngineConfigId(vehicleToEngineConfigId).subscribe();

        const req = httpMock.expectOne(expectedUrl);
        expect(req.request.method).toBe('GET');
        req.flush({});
    });

    it('should call api with correct arguments for getManualTransmissionTorqueByVehicleToEngineConfigId', () => {
        const vehicleToEngineConfigId = '1';
        const expectedUrl = `${gateway}/v1/vehicle-specifications/${vehicleToEngineConfigId}/manual-transmission-torque`;

        facade.getManualTransmissionTorqueByVehicleToEngineConfigId(vehicleToEngineConfigId).subscribe();

        const req = httpMock.expectOne(expectedUrl);
        expect(req.request.method).toBe('GET');
        req.flush({});
    });

    it('should handle error 500', () => {
        const vehicleToEngineConfigId = '1';
        const expectedUrl = `${gateway}/v1/vehicle-specifications/${vehicleToEngineConfigId}`;

        facade.getVehicleSpecificationsByVehicleToEngineConfigId(vehicleToEngineConfigId).subscribe(
            () => {
                fail('Expected an error, but got a successful response');
            },
            (error) => {
                expect(error.status).toBe(500);
            }
        );

        const req = httpMock.expectOne(expectedUrl);
        req.flush({}, { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle error 404', () => {
        const vehicleToEngineConfigId = '1';
        const partType = PartTypeApiEnum.OIL_FILTER;
        const expectedUrl = `${gateway}/v1/vehicle-specifications/${vehicleToEngineConfigId}/parts/${partType}`;

        facade.getPartsByVehicleToEngineConfigIdAndPartType(vehicleToEngineConfigId, partType).subscribe(
            (parts) => {
                expect(parts.length).toBe(1);
            },
            () => {
                fail('Expected a successful response, but got an error');
            }
        );

        const req = httpMock.expectOne(expectedUrl);
        req.flush({}, { status: 404, statusText: 'Not Found' });
    });
});
