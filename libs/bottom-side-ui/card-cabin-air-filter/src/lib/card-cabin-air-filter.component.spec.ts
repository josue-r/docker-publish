import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardCabinAirFilterComponent } from './card-cabin-air-filter.component';
import {
    CabinAirFilter,
    PartTypeApiEnum,
    VehicleSpecificationFacade,
} from '@vioc-angular/bottom-side-ui/config/data-access-vehicle-specifications';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { of } from 'rxjs';
import { BaseStoreEvent, EventTypeEnum, StoreEventInterface } from '@vioc-angular/shared/common-event-models';
import { AppStatusService } from '@vioc-angular/bottom-side-ui/config/app-status';

describe('CardCabinAirFilterComponent', () => {
    let component: CardCabinAirFilterComponent;
    let fixture: ComponentFixture<CardCabinAirFilterComponent>;
    let vehicleSpecificationFacadeGetPartsSpy: jest.SpyInstance;
    let appStatusServiceGetStoreEventSpy: jest.SpyInstance;

    const getDefaultEvent = (propsToOverride): StoreEventInterface => {
        const defaultEvent: StoreEventInterface = {
            eventId: '6d5aebe0-3556-4b68-960b-72338c07ebd8',
            eventTime: '2010-11-12T13:14:15Z',
            eventType: EventTypeEnum.VEHICLE_UPDATED,
            bayType: 'W',
            bayNumber: 1,
            visitId: 123,
            visitGuid: '813fe038-eb2e-4f75-958e-b6c54777fe2b',
            storeNumber: '123',
            visitVehicleId: 1233,
            vehicleToEngineConfigId: 111,
        };
        return { ...defaultEvent, ...propsToOverride };
    };

    beforeEach(async () => {
        appStatusServiceGetStoreEventSpy = jest.spyOn(AppStatusService.prototype, 'getStoreEvent');
        vehicleSpecificationFacadeGetPartsSpy = jest.spyOn(
            VehicleSpecificationFacade.prototype,
            'getPartsByVehicleToEngineConfigIdAndPartType'
        );

        await TestBed.configureTestingModule({
            imports: [CardCabinAirFilterComponent, HttpClientTestingModule],
            providers: [{ provide: GATEWAY_TOKEN, useValue: 'http://localhost:4202' }],
        }).compileComponents();

        fixture = TestBed.createComponent(CardCabinAirFilterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        vehicleSpecificationFacadeGetPartsSpy.mockClear();
        appStatusServiceGetStoreEventSpy.mockClear();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should subscribe to a new store event (VEHICLE_UPDATED), empty parts', () => {
        const vehicleToEngineConfigId = 312;
        const myEvent = BaseStoreEvent.fromJsonString(
            JSON.stringify(getDefaultEvent({ vehicleToEngineConfigId: vehicleToEngineConfigId }))
        );
        appStatusServiceGetStoreEventSpy.mockReturnValue(of(myEvent));
        vehicleSpecificationFacadeGetPartsSpy.mockReturnValue(of([]));

        component.ngOnInit();
        fixture.detectChanges();

        expect(appStatusServiceGetStoreEventSpy).toBeCalled();
        expect(vehicleSpecificationFacadeGetPartsSpy).toHaveBeenCalledWith(
            vehicleToEngineConfigId.toString(),
            PartTypeApiEnum.CABIN_AIR
        );
        component.cabinAirFilterWithNotes$.subscribe((data) => {
            expect(data).toHaveLength(0);
        });
    });

    it('should subscribe to a new store event (VEHICLE_UPDATED), with parts', () => {
        const vehicleToEngineConfigId = 312;
        const expectedPartName = 'cabin air filter part';
        const expectedNoteValue = '1 Qty';
        const myEvent = BaseStoreEvent.fromJsonString(
            JSON.stringify(getDefaultEvent({ vehicleToEngineConfigId: vehicleToEngineConfigId }))
        );
        appStatusServiceGetStoreEventSpy.mockReturnValue(of(myEvent));
        vehicleSpecificationFacadeGetPartsSpy.mockReturnValue(
            of([
                {
                    id: 1,
                    part: expectedPartName,
                    notes: [
                        {
                            id: 'note1',
                            value: expectedNoteValue,
                        },
                    ],
                    qualifier: null,
                    type: null,
                },
            ])
        );

        component.ngOnInit();
        fixture.detectChanges();

        expect(appStatusServiceGetStoreEventSpy).toBeCalled();
        expect(vehicleSpecificationFacadeGetPartsSpy).toHaveBeenCalledWith(
            vehicleToEngineConfigId.toString(),
            PartTypeApiEnum.CABIN_AIR
        );
        component.cabinAirFilterWithNotes$.subscribe((data) => {
            expect(data).toHaveLength(1);
        });
    });
});
