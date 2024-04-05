import { BaseStoreEvent, EventTypeEnum, StoreEventInterface } from './store-event.model';

const getDefaultEvent = (propsToOverride = {}): StoreEventInterface => {
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

describe('StoreEventModel', () => {
    it('should create BaseStoreEvent instances for each event type', () => {
        for (const type of Object.keys(EventTypeEnum)) {
            const result = BaseStoreEvent.fromJsonString(JSON.stringify(getDefaultEvent({ eventType: type })));
            expect(result).toBeInstanceOf(BaseStoreEvent);
            expect(result.eventType).toBe(type);
            expect(result.toString()).toContain(type);
        }
    });

    it('should not create a BaseStoreEvent instance, event type not supported', () => {
        const createUnsupportedEvent = () =>
            BaseStoreEvent.fromJsonString(JSON.stringify(getDefaultEvent({ eventType: 'fdsaf' })));

        expect(createUnsupportedEvent).toThrowError('Unsupported event type: fdsaf');
    });

    it('should throw an error because a property is missed', () => {
        const myEvent = getDefaultEvent();
        delete myEvent.eventId;
        const createInvalidEvent = () => BaseStoreEvent.fromJsonString(JSON.stringify(myEvent));

        expect(createInvalidEvent).toThrowError('property: eventId is required');
    });

    it('should throw an error because a property is not passing validations', () => {
        const createInvalidEvent = () =>
            BaseStoreEvent.fromJsonString(JSON.stringify(getDefaultEvent({ eventId: 'fdsaf' })));

        expect(createInvalidEvent).toThrowError('Validation failed for property: eventId, Function name: isValidGuid');
    });
});
