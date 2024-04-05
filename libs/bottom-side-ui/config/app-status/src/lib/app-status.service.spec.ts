import { TestBed } from '@angular/core/testing';
import { AppStatusService } from './app-status.service';
import { BaseStoreEvent, EventTypeEnum } from '@vioc-angular/shared/common-event-models';

describe('AppStatusService', () => {
    let service: AppStatusService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [AppStatusService],
        });
        service = TestBed.inject(AppStatusService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set and get store event', () => {
        const storeEvent: BaseStoreEvent = {
            eventType: EventTypeEnum.NAVIGATION,
            eventId: '1',
            eventTime: 'string',
            bayType: 'G',
            bayNumber: 123,
            visitId: 1,
            visitGuid: 'fadf',
            storeNumber: '12321',
            visitVehicleId: 21,
            vehicleToEngineConfigId: 1353,
        };

        service.setStoreEvent(storeEvent);
        service.getStoreEvent().subscribe((event) => {
            expect(event).toEqual(storeEvent);
        });
    });
});
