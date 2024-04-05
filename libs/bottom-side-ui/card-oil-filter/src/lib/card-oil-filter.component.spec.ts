import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CardOilFilterComponent } from './card-oil-filter.component';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import {
    PartTypeApiEnum,
    VehicleSpecificationFacade,
} from '@vioc-angular/bottom-side-ui/config/data-access-vehicle-specifications';
import { of } from 'rxjs';
import { AppStatusService } from '@vioc-angular/bottom-side-ui/config/app-status';
import { BaseStoreEvent, EventTypeEnum, StoreEventInterface } from '@vioc-angular/shared/common-event-models';

describe('CardOilFilterComponent', () => {
    let component: CardOilFilterComponent;
    let fixture: ComponentFixture<CardOilFilterComponent>;

    let appStatusServiceGetStoreEventSpy: jest.SpyInstance;
    let vehicleSpecificationFacadeGetPartsSpy: jest.SpyInstance;

    const getDefaultEvent = (propsToOverride: Partial<StoreEventInterface>): StoreEventInterface => {
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
            imports: [CardOilFilterComponent, HttpClientTestingModule],
            providers: [{ provide: GATEWAY_TOKEN, useValue: 'http://localhost:4202' }],
        }).compileComponents();

        fixture = TestBed.createComponent(CardOilFilterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        appStatusServiceGetStoreEventSpy.mockClear();
        vehicleSpecificationFacadeGetPartsSpy.mockClear();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should subscribe to a new store event (VEHICLE_UPDATED), empty parts', () => {
        const expectedId = 312;
        const myEvent = BaseStoreEvent.fromJsonString(
            JSON.stringify(getDefaultEvent({ vehicleToEngineConfigId: expectedId }))
        );
        appStatusServiceGetStoreEventSpy.mockReturnValue(of(myEvent));
        vehicleSpecificationFacadeGetPartsSpy.mockReturnValue(of([]));

        component.ngOnInit();
        fixture.detectChanges();

        expect(appStatusServiceGetStoreEventSpy).toBeCalled();
        expect(vehicleSpecificationFacadeGetPartsSpy).toHaveBeenCalledWith(
            expectedId.toString(),
            PartTypeApiEnum.OIL_FILTER
        );
        expect(component.partsContent.length).toBe(0);
    });

    it('should subscribe to a new store event (VEHICLE_UPDATED), with parts', () => {
        const expectedId = 312;
        const expectedPartName = 'oil filter part';
        const expectedNoteValue = 'note1';
        const expectedNotesText = `Notes: ${expectedNoteValue}`;
        const myEvent = BaseStoreEvent.fromJsonString(
            JSON.stringify(getDefaultEvent({ vehicleToEngineConfigId: expectedId }))
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
            expectedId.toString(),
            PartTypeApiEnum.OIL_FILTER
        );
        expect(component.partsContent.length).toBe(1);
        expect(component.partsContent[0].title).toBe(expectedPartName);
        expect(component.partsContent[0].notes).toBe(expectedNotesText);
    });
});
