import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BayContainerComponent } from './bay-container.component';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { MaterialSvgIconsLoaderService } from '@vioc-angular/shared/util-assets';
import { WebSocketService } from '@vioc-angular/shared/common-websocket';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { of } from 'rxjs';
import { Loggers } from '@vioc-angular/shared/common-logging';
import { EventTypeEnum, StoreEventInterface } from '@vioc-angular/shared/common-event-models';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AppStatusService } from '@vioc-angular/bottom-side-ui/config/app-status';

describe('BayContainerComponent', () => {
    let component: BayContainerComponent;
    let fixture: ComponentFixture<BayContainerComponent>;
    let webSocketServiceWatchSpy: jest.SpyInstance;
    let svgIconsLoaderLoadIconsSpy: jest.SpyInstance;
    let loggerGetSpy: jest.SpyInstance;
    let appStatusServiceSetStoreEventSpy: jest.SpyInstance;

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
        svgIconsLoaderLoadIconsSpy = jest.spyOn(MaterialSvgIconsLoaderService.prototype, 'loadIcons');
        webSocketServiceWatchSpy = jest.spyOn(WebSocketService.prototype, 'watch');
        loggerGetSpy = jest.spyOn(Loggers, 'get');
        appStatusServiceSetStoreEventSpy = jest.spyOn(AppStatusService.prototype, 'setStoreEvent');

        await TestBed.configureTestingModule({
            imports: [BayContainerComponent, HttpClientTestingModule, MatIconTestingModule],
            providers: [
                { provide: GATEWAY_TOKEN, useValue: 'http://localhost:4202' },
                MaterialSvgIconsLoaderService,
                WebSocketService,
            ],
        }).compileComponents();

        TestBed.inject(WebSocketService);
        TestBed.inject(AppStatusService);
        TestBed.inject(MaterialSvgIconsLoaderService);
        fixture = TestBed.createComponent(BayContainerComponent);
        component = fixture.componentInstance;
    });

    it('should render app', () => {
        fixture.detectChanges();
        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.querySelector('vioc-angular-header')).toBeDefined();
    });

    it('should load icons on initialization', () => {
        expect(svgIconsLoaderLoadIconsSpy).toHaveBeenCalled();
    });

    it('should subscribe to WebSocketService on initialization, message for this bay (event type: VEHICLE_UPDATED)', () => {
        const expectedEventType = EventTypeEnum.VEHICLE_UPDATED;
        const expectedVehicleToEngineConfigId = 123;
        const message = {
            body: JSON.stringify(
                getDefaultEvent({
                    eventType: expectedEventType,
                    vehicleToEngineConfigId: expectedVehicleToEngineConfigId,
                })
            ),
        };
        webSocketServiceWatchSpy.mockReturnValue(of(message));

        component.bayId = '1';
        component.ngOnInit();
        fixture.detectChanges();

        expect(webSocketServiceWatchSpy).toHaveBeenCalledWith('/store-events');
        expect(component.vehicleToEngineConfigId).toBe(expectedVehicleToEngineConfigId);
        expect(component.eventType).toBe(expectedEventType);
        expect(appStatusServiceSetStoreEventSpy).toBeCalled();
    });

    it('should ignore events that are not for this bay', () => {
        const message = {
            body: JSON.stringify(getDefaultEvent({ bayNumber: 2, vehicleToEngineConfigId: 1 })),
        };
        webSocketServiceWatchSpy.mockReturnValue(of(message));

        component.bayId = '1';
        component.ngOnInit();
        fixture.detectChanges();

        expect(component.vehicleToEngineConfigId).toBeUndefined();
        expect(component.eventType).toBeUndefined();
        expect(loggerGetSpy).toHaveBeenCalledWith('central-ui', 'BayContainerComponent');
    });
});
