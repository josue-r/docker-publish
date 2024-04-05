import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HeaderComponent } from './header.component';
import {
    VehicleSpecification,
    VehicleSpecificationFacade,
} from '@vioc-angular/bottom-side-ui/config/data-access-vehicle-specifications';
import { of, throwError } from 'rxjs';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { StatusConstants } from '@vioc-angular/ui-kit/atoms/status';
import {
    BaseStoreEvent,
    EditTypeEnum,
    EventTypeEnum,
    NavigationActionEnum,
    NavigationEvent,
    ServiceEditedEvent,
    StoreEventInterface,
} from '@vioc-angular/shared/common-event-models';
import { AppStatusService } from '@vioc-angular/bottom-side-ui/config/app-status';
import { WorkingBay, WorkingBayFacade } from '@vioc-angular/bottom-side-ui/config/data-access-working-bay';
import { FLAGS, HEADER_STATUS } from './header.constants';

describe('HeaderComponent', () => {
    let fixture: ComponentFixture<HeaderComponent>;
    let component: HeaderComponent;

    let appStatusServiceGetStoreEventSpy: jest.SpyInstance;
    let vehicleSpecificationFacadeGetSpecificationSpy: jest.SpyInstance;
    let workingBayFacadeGetBayStatusSpy: jest.SpyInstance;
    let workingBayFacadeGetBayAttributeSpy: jest.SpyInstance;

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

    const setupComponent = () => {
        fixture = TestBed.createComponent(HeaderComponent);
        component = fixture.componentInstance;
    };

    beforeEach(async () => {
        appStatusServiceGetStoreEventSpy = jest.spyOn(AppStatusService.prototype, 'getStoreEvent');
        vehicleSpecificationFacadeGetSpecificationSpy = jest.spyOn(
            VehicleSpecificationFacade.prototype,
            'getVehicleSpecificationsByVehicleToEngineConfigId'
        );
        workingBayFacadeGetBayStatusSpy = jest.spyOn(WorkingBayFacade.prototype, 'getWorkingBayStatusByNumber');
        workingBayFacadeGetBayAttributeSpy = jest.spyOn(
            WorkingBayFacade.prototype,
            'getBooleanAttributeByNumberAndType'
        );

        await TestBed.configureTestingModule({
            imports: [HeaderComponent, HttpClientTestingModule, MatIconTestingModule],
            providers: [{ provide: GATEWAY_TOKEN, useValue: 'http://localhost:4202' }],
        }).compileComponents();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create', () => {
        setupComponent();
        expect(component).toBeTruthy();
    });

    it('should subscribe to a new store event (VEHICLE_UPDATED), empty specification', () => {
        setupComponent();
        const expectedId = 312;
        const myEvent = BaseStoreEvent.fromJsonString(
            JSON.stringify(getDefaultEvent({ vehicleToEngineConfigId: expectedId }))
        );
        const myBay = new WorkingBay();
        myBay.visitCustomerType = FLAGS.FLEET;
        appStatusServiceGetStoreEventSpy.mockReturnValue(of(myEvent));
        vehicleSpecificationFacadeGetSpecificationSpy.mockReturnValue(of(new VehicleSpecification()));
        workingBayFacadeGetBayStatusSpy.mockReturnValue(of(myBay));
        workingBayFacadeGetBayAttributeSpy.mockReturnValue(of(true));

        component.ngOnInit();
        fixture.detectChanges();

        expect(appStatusServiceGetStoreEventSpy).toBeCalled();
        expect(vehicleSpecificationFacadeGetSpecificationSpy).toHaveBeenCalledWith(expectedId.toString());
        expect(component.showEvacFlag).toBe(true);
        expect(component.showFleetFlag).toBe(true);
        expect(component.carDetails).toBe(', ');
        expect(component.statusConfig.label).toBe(HEADER_STATUS.GREETED);
        expect(component.statusConfig.color).toBe(StatusConstants.Color.Green);
    });

    it('should subscribe to a new store event (SERVICE_EDITED), rootServiceCategoryCode set to OC, empty specification', () => {
        setupComponent();
        const expectedId = 312;
        const myEvent = BaseStoreEvent.fromJsonString(
            JSON.stringify(
                getDefaultEvent({
                    vehicleToEngineConfigId: expectedId,
                    eventType: EventTypeEnum.SERVICE_EDITED,
                })
            )
        ) as ServiceEditedEvent;
        myEvent.editType = EditTypeEnum.ADDED;
        myEvent.serviceCode = '123';
        myEvent.rootServiceCategoryCode = 'OC';
        myEvent.visitServiceId = 123;
        myEvent.ready = true;
        appStatusServiceGetStoreEventSpy.mockReturnValue(of(myEvent));
        vehicleSpecificationFacadeGetSpecificationSpy.mockReturnValue(of(new VehicleSpecification()));
        workingBayFacadeGetBayStatusSpy.mockReturnValue(of(new WorkingBay()));
        workingBayFacadeGetBayAttributeSpy.mockReturnValue(of('false'));

        component.ngOnInit();
        fixture.detectChanges();

        expect(appStatusServiceGetStoreEventSpy).toBeCalled();
        expect(component.showEvacFlag).toBe(false);
        expect(component.showFleetFlag).toBe(false);
        expect(component.carDetails).toBe('-');
        expect(component.statusConfig.label).toBe(HEADER_STATUS.VERIFY_SHOWTIME);
        expect(component.statusConfig.color).toBe(StatusConstants.Color.Yellow);
    });

    it('should subscribe to a new store event (NAVIGATION), status should change to SERVICE REVIEW', () => {
        setupComponent();
        const expectedId = 312;
        const myEvent = BaseStoreEvent.fromJsonString(
            JSON.stringify(
                getDefaultEvent({
                    vehicleToEngineConfigId: expectedId,
                    eventType: EventTypeEnum.NAVIGATION,
                })
            )
        ) as NavigationEvent;
        myEvent.action = NavigationActionEnum['STORE_APP:YOUR_VEHICLE'];
        myEvent.firstTimeOnPage = true;
        appStatusServiceGetStoreEventSpy.mockReturnValue(of(myEvent));

        component.ngOnInit();
        fixture.detectChanges();

        expect(component.statusConfig.label).toBe(HEADER_STATUS.SERVICE_REVIEW);
        expect(component.statusConfig.color).toBe(StatusConstants.Color.DarkBlue);
    });

    it('should subscribe to a new store event (NAVIGATION), status should not change since firstTimeOnPage is false', () => {
        setupComponent();
        const expectedId = 312;
        const myEvent = BaseStoreEvent.fromJsonString(
            JSON.stringify(
                getDefaultEvent({
                    vehicleToEngineConfigId: expectedId,
                    eventType: EventTypeEnum.NAVIGATION,
                })
            )
        ) as NavigationEvent;
        myEvent.action = NavigationActionEnum['STORE_APP:YOUR_VEHICLE'];
        myEvent.firstTimeOnPage = false;
        appStatusServiceGetStoreEventSpy.mockReturnValue(of(myEvent));

        component.ngOnInit();
        fixture.detectChanges();

        expect(component.statusConfig.label).toBe(HEADER_STATUS.NO_VEHICLE_ASSIGNED);
        expect(component.statusConfig.color).toBe(StatusConstants.Color.Gray);
    });

    it('should subscribe to a new store event (VEHICLE_UPDATED), with empty', () => {
        setupComponent();
        const expectedId = 123;
        const error = new Error('-');
        const myEvent = BaseStoreEvent.fromJsonString(
            JSON.stringify(getDefaultEvent({ vehicleToEngineConfigId: expectedId }))
        );
        appStatusServiceGetStoreEventSpy.mockReturnValue(of(myEvent));
        vehicleSpecificationFacadeGetSpecificationSpy.mockReturnValue(throwError(error));

        component.ngOnInit();
        fixture.detectChanges();

        expect(appStatusServiceGetStoreEventSpy).toBeCalled();
        expect(vehicleSpecificationFacadeGetSpecificationSpy).toHaveBeenCalledWith(expectedId.toString());
        expect(component.apiError).toBe(false);
        expect(component.carDetails).toBe('-');
        expect(component.statusConfig.label).toBe(HEADER_STATUS.GREETED);
        expect(component.statusConfig.color).toBe(StatusConstants.Color.Green);
    });

    it('should subscribe to a new store event (VEHICLE_UPDATED), with error', () => {
        setupComponent();
        const expectedId = 312;
        const error = new Error('Error, Notify MOD');
        const myEvent = BaseStoreEvent.fromJsonString(
            JSON.stringify(getDefaultEvent({ vehicleToEngineConfigId: expectedId }))
        );
        appStatusServiceGetStoreEventSpy.mockReturnValue(of(myEvent));
        vehicleSpecificationFacadeGetSpecificationSpy.mockReturnValue(throwError(error));

        component.ngOnInit();
        fixture.detectChanges();

        expect(appStatusServiceGetStoreEventSpy).toBeCalled();
        expect(vehicleSpecificationFacadeGetSpecificationSpy).toHaveBeenCalledWith(expectedId.toString());
        expect(component.apiError).toBe(true);
        expect(component.apiErrorMessage).toBe('Error, Notify MOD');
        expect(component.statusConfig.label).toBe(HEADER_STATUS.GREETED);
        expect(component.statusConfig.color).toBe(StatusConstants.Color.Green);
    });

    it('should subscribe to a new store event (BEGIN_DAY), empty specification', () => {
        setupComponent();
        const expectedId = 312;
        const myEvent = BaseStoreEvent.fromJsonString(
            JSON.stringify(getDefaultEvent({ vehicleToEngineConfigId: expectedId, eventType: EventTypeEnum.BEGIN_DAY }))
        );
        appStatusServiceGetStoreEventSpy.mockReturnValue(of(myEvent));
        vehicleSpecificationFacadeGetSpecificationSpy.mockReturnValue(of(new VehicleSpecification()));
        workingBayFacadeGetBayStatusSpy.mockReturnValue(of(new WorkingBay()));
        workingBayFacadeGetBayAttributeSpy.mockReturnValue(of('false'));

        component.ngOnInit();
        fixture.detectChanges();

        expect(appStatusServiceGetStoreEventSpy).toBeCalled();
        expect(component.showEvacFlag).toBe(false);
        expect(component.showFleetFlag).toBe(false);
        expect(component.carDetails).toBe('-');
        expect(component.statusConfig.label).toBe(HEADER_STATUS.NO_VEHICLE_ASSIGNED);
        expect(component.statusConfig.color).toBe(StatusConstants.Color.Gray);
    });
});
