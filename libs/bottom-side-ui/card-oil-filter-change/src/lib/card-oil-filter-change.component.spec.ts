import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { CardOilFilterChangeComponent } from './card-oil-filter-change.component';
import { CARD_OIL_FILTER_CHANGE_MOCK } from './card-oil-filter-change.mocks';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { asyncScheduler, scheduled, throwError } from 'rxjs';

describe('CardOilFilterChangeComponent', () => {
    let component: CardOilFilterChangeComponent;
    let fixture: ComponentFixture<CardOilFilterChangeComponent>;

    const OIL_FILTER_CHANGE_MOCK = CARD_OIL_FILTER_CHANGE_MOCK;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CardOilFilterChangeComponent, HttpClientTestingModule],
            providers: [{ provide: GATEWAY_TOKEN, useValue: 'http://localhost:4202' }],
        }).compileComponents();
        fixture = TestBed.createComponent(CardOilFilterChangeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('getOilFilter', () => {
        it('should call processOilFilter when api answers OK', fakeAsync(() => {
            component.vehicleToEngineConfigId = 1234;
            const mockData = [...OIL_FILTER_CHANGE_MOCK.OIL_FILTER, ...OIL_FILTER_CHANGE_MOCK.OIL_FILTER];
            const serviceCallSpy = jest
                .spyOn(component['vehicleSpecificationFacade'], 'getPartsByVehicleToEngineConfigIdAndPartType')
                .mockReturnValue(scheduled([mockData], asyncScheduler));

            let processOilFilterSpy = jest.spyOn(component, 'processOilFilter');

            component.getOilFilter();
            tick();
            expect(serviceCallSpy).toHaveBeenCalled();
            expect(processOilFilterSpy).toHaveBeenCalled();
        }));

        it('should not call processOilFilter if api answers with error', fakeAsync(() => {
            component.vehicleToEngineConfigId = 1234;
            const serviceCallSpy = jest
                .spyOn(component['vehicleSpecificationFacade'], 'getPartsByVehicleToEngineConfigIdAndPartType')
                .mockReturnValue(scheduled(throwError({}), asyncScheduler));
            let processOilFilterSpy = jest.spyOn(component, 'processOilFilter');
            component.getOilFilter();
            tick();
            expect(serviceCallSpy).toHaveBeenCalled();
            expect(processOilFilterSpy).not.toHaveBeenCalled();
        }));
    });

    describe('getOilFilterTorque', () => {
        it('should call processOilFilterTorque when api answers OK', fakeAsync(() => {
            component.vehicleToEngineConfigId = 1234;
            const serviceCallSpy = jest
                .spyOn(component['vehicleSpecificationFacade'], 'getOilFilterTorqueByVehicleToEngineConfigId')
                .mockReturnValue(scheduled([OIL_FILTER_CHANGE_MOCK.OIL_FILTER_TORQUE], asyncScheduler));

            let processOilFilterTorqueSpy = jest.spyOn(component, 'processOilFilterTorque');

            component.getOilFilterTorque();
            tick();
            expect(serviceCallSpy).toHaveBeenCalled();
            expect(processOilFilterTorqueSpy).toHaveBeenCalled();
        }));

        it('should not call processOilFilterTorque if api answers with error', fakeAsync(() => {
            component.vehicleToEngineConfigId = 1234;
            const serviceCallSpy = jest
                .spyOn(component['vehicleSpecificationFacade'], 'getOilFilterTorqueByVehicleToEngineConfigId')
                .mockReturnValue(scheduled(throwError({}), asyncScheduler));
            let processOilFilterTorqueSpy = jest.spyOn(component, 'processOilFilterTorque');
            component.getOilFilterTorque();
            tick();
            expect(serviceCallSpy).toHaveBeenCalled();
            expect(processOilFilterTorqueSpy).not.toHaveBeenCalled();
        }));
    });

    describe('getPlugTorque', () => {
        it('should call processplugTorque when api answers OK', fakeAsync(() => {
            component.vehicleToEngineConfigId = 1234;
            const serviceCallSpy = jest
                .spyOn(component['vehicleSpecificationFacade'], 'getEngineDrainPlugTorqueByVehicleToEngineConfigId')
                .mockReturnValue(scheduled([OIL_FILTER_CHANGE_MOCK.ENGINE_DRAIN_PLUG_TORQUE], asyncScheduler));

            let processplugTorqueSpy = jest.spyOn(component, 'processplugTorque');

            component.getPlugTorque();
            tick();
            expect(serviceCallSpy).toHaveBeenCalled();
            expect(processplugTorqueSpy).toHaveBeenCalled();
        }));

        it('should not call processplugTorque if api answers with error', fakeAsync(() => {
            component.vehicleToEngineConfigId = 1234;
            const serviceCallSpy = jest
                .spyOn(component['vehicleSpecificationFacade'], 'getEngineDrainPlugTorqueByVehicleToEngineConfigId')
                .mockReturnValue(scheduled(throwError({}), asyncScheduler));
            let processplugTorqueSpy = jest.spyOn(component, 'processplugTorque');
            component.getPlugTorque();
            tick();
            expect(serviceCallSpy).toHaveBeenCalled();
            expect(processplugTorqueSpy).not.toHaveBeenCalled();
        }));
    });

    describe('getOilChange', () => {
        it('should call processOilChange when api answers OK', fakeAsync(() => {
            component.bayNumber = '1';
            const serviceCallSpy = jest
                .spyOn(component['workingBayFacade'], 'getWorkingBayServicesByNumberAndRootServiceCategoryCode')
                .mockReturnValue(scheduled([OIL_FILTER_CHANGE_MOCK.OIL_CHANGE], asyncScheduler));

            let processOilChangeSpy = jest.spyOn(component, 'processOilChange');

            component.getOilChange();
            tick();
            expect(serviceCallSpy).toHaveBeenCalled();
            expect(processOilChangeSpy).toHaveBeenCalled();
        }));

        it('should not call processOilChange if api answers with error', fakeAsync(() => {
            component.bayNumber = '1';
            const serviceCallSpy = jest
                .spyOn(component['workingBayFacade'], 'getWorkingBayServicesByNumberAndRootServiceCategoryCode')
                .mockReturnValue(scheduled(throwError({}), asyncScheduler));
            let processOilChangeSpy = jest.spyOn(component, 'processOilChange');
            component.getOilChange();
            tick();
            expect(serviceCallSpy).toHaveBeenCalled();
            expect(processOilChangeSpy).not.toHaveBeenCalled();
        }));
    });

    describe('processOilFilter', () => {
        it('validate', () => {
            component.vehicleToEngineConfigId = 1234;
            const expectedTitle = 'VO106';
            const expectedNotes = 'Notes: 1 (Qty)';
            component.oilFilter = OIL_FILTER_CHANGE_MOCK.OIL_FILTER;
            component.oilFilterContent = [];
            component.processOilFilter();
            expect(component.oilFilterContent.length).toBe(3);
            expect(component.oilFilterContent[0].title).toBe(expectedTitle);
            expect(component.oilFilterContent[0].notes).toBe(expectedNotes);
        });
    });

    describe('processOilFilterTorque', () => {
        it('validate ', () => {
            const expectedTitle = 'torque_f ft/lbs';
            const expectedNotes = 'Notes: 1 (Qty)';
            component.oilFilterTorque = OIL_FILTER_CHANGE_MOCK.OIL_FILTER_TORQUE;
            component.processOilFilterTorque();

            expect(component.oilFIlterTorqueContent.title).toBe(expectedTitle);
            expect(component.oilFIlterTorqueContent.notes).toBe(expectedNotes);
        });
    });

    describe('processplugTorque', () => {
        it('validate', () => {
            const expectedTitle = 'FtLbs ft/lbs';
            const expectedNotes = 'Notes: 1 (Qty)';
            component.plugTorque = OIL_FILTER_CHANGE_MOCK.ENGINE_DRAIN_PLUG_TORQUE;
            component.processplugTorque();

            expect(component.plugTorqueContent.title).toBe(expectedTitle);
            expect(component.plugTorqueContent.notes).toBe(expectedNotes);
        });
    });

    describe('processOilChange', () => {
        it('validate', () => {
            const expectedDrainPlugCode = '11589';
            const expectedProduct = '0W20MXD';
            const expectedQty = '3.7 qts';
            component.oilChange = OIL_FILTER_CHANGE_MOCK.OIL_CHANGE;
            component.processOilChange();

            expect(component.oilChangeContent.drainPlugCode).toBe(expectedDrainPlugCode);
            expect(component.oilChangeContent.productCode).toBe(expectedProduct);
            expect(component.oilChangeContent.quantity).toBe(expectedQty);
        });
    });
});
