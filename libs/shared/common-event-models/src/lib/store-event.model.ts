import { executeEventValidations } from './store-event.helper';

export enum EventTypeEnum {
    NAVIGATION = 'NAVIGATION',
    VALIDATION = 'VALIDATION',
    BEGIN_DAY = 'BEGIN_DAY',
    VISIT_ADDED = 'VISIT_ADDED',
    VISIT_REMOVED = 'VISIT_REMOVED',
    VISIT_ASSIGNED_TO_BAY = 'VISIT_ASSIGNED_TO_BAY',
    VISIT_UNASSIGNED_TO_BAY = 'VISIT_UNASSIGNED_TO_BAY',
    SERVICE_EDITED = 'SERVICE_EDITED',
    INVOICE_FINALIZED = 'INVOICE_FINALIZED',
    VEHICLE_UPDATED = 'VEHICLE_UPDATED',
    INVOICE_VOIDED = 'INVOICE_VOIDED',
    INVOICE_LOCKED = 'INVOICE_LOCKED',
    INVOICE_UNLOCKED = 'INVOICE_UNLOCKED',
    CUSTOMER_TYPE_UPDATED = 'CUSTOMER_TYPE_UPDATED',
}

export enum BayCodeEnum {
    G = 'GREETED',
    W = 'WORKING_IN_BAY',
    L = 'WORKING_ON_LOT',
    D = 'DROP_OFF',
}

export enum EditTypeEnum {
    ADDED = 'ADDED',
    UPDATED = 'UPDATED',
    REMOVED = 'REMOVED',
}

export enum NavigationActionEnum {
    'STORE_APP:YOUR_VEHICLE' = 'STORE_APP:YOUR_VEHICLE',
    // TODO: We should be adding these actions programmatically.
    // 'STORE_APP:VISIT_INFO' = 'STORE_APP:VISIT_INFO',
    // 'STORE_APP:FLEET_VALIDATION' = 'STORE_APP:FLEET_VALIDATION',
    // 'STORE_APP:OIL_CHANGE' = 'STORE_APP:OIL_CHANGE',
    // 'STORE_APP:TECH_INFO' = 'STORE_APP:TECH_INFO',
    // 'STORE_APP:VEHICLE_INSPECTION' = 'STORE_APP:VEHICLE_INSPECTION',
    // 'STORE_APP:TODAYS_SERVICES' = 'STORE_APP:TODAYS_SERVICES',
    // 'STORE_APP:REPAIR_ORDER' = 'STORE_APP:REPAIR_ORDER',
    // 'STORE_APP:GUEST_INFO' = 'STORE_APP:GUEST_INFO',
    // 'STORE_APP:ADDRESS_VALIDATION' = 'STORE_APP:ADDRESS_VALIDATION',
    // 'STORE_APP:REVIEW_INVOICE' = 'STORE_APP:REVIEW_INVOICE',
    // 'STORE_APP:PROCESS_PAYMENT' = 'STORE_APP:PROCESS_PAYMENT',
    // 'STORE_APP:PAYMENT_CONFIRMATION' = 'STORE_APP:PAYMENT_CONFIRMATION',
}

export type StoreEventId = string;
export type EventType = keyof typeof EventTypeEnum;
export type BayCode = keyof typeof BayCodeEnum;
export type EditType = keyof typeof EditTypeEnum;
export type NavigationAction = keyof typeof NavigationActionEnum;

export interface StoreEventInterface {
    eventId: StoreEventId;
    eventTime: string;
    eventType: EventType;
    bayType: BayCode;
    bayNumber: number;
    visitId: number;
    visitGuid: string;
    storeNumber: string;
    visitVehicleId?: number;
    vehicleToEngineConfigId?: number;
}

export interface ServiceEditedInterface extends StoreEventInterface {
    editType: EditType;
    serviceCode: string;
    rootServiceCategoryCode: string;
    visitServiceId: number;
    ready: boolean;
}

export interface NavigationInterface extends StoreEventInterface {
    action: NavigationAction;
    firstTimeOnPage: boolean;
}

export abstract class BaseStoreEvent implements StoreEventInterface {
    eventId: StoreEventId;
    eventTime: string;
    eventType: EventType;
    bayType: BayCode;
    bayNumber: number;
    visitId: number;
    visitGuid: string;
    storeNumber: string;
    visitVehicleId: number;
    vehicleToEngineConfigId: number;

    constructor(data: StoreEventInterface) {
        this.eventId = data.eventId;
        this.eventTime = data.eventTime;
        this.eventType = data.eventType;
        this.bayType = data.bayType;
        this.bayNumber = data.bayNumber;
        this.visitId = data.visitId;
        this.visitGuid = data.visitGuid;
        this.storeNumber = data.storeNumber;
        this.visitVehicleId = data.visitVehicleId;
        this.vehicleToEngineConfigId = data.vehicleToEngineConfigId;
    }

    static fromJsonString(jsonString: string): BaseStoreEvent {
        const parsedData = JSON.parse(jsonString);
        executeEventValidations(parsedData);
        const eventClass = EVENT_TYPE_CLASS_MAP[parsedData.eventType];

        if (!eventClass) {
            throw new Error(`Unsupported event type: ${parsedData.eventType}`);
        }

        return new eventClass(parsedData);
    }

    toString(): string {
        return JSON.stringify(this);
    }
}

export class NavigationEvent extends BaseStoreEvent {
    action: NavigationAction;
    firstTimeOnPage: boolean;

    constructor(data: NavigationInterface) {
        super(data);
        this.action = data.action;
        this.firstTimeOnPage = data.firstTimeOnPage;
    }
}

export class VisitAddedEvent extends BaseStoreEvent {}

export class VisitRemovedEvent extends BaseStoreEvent {}

export class VisitAssignedToBayEvent extends BaseStoreEvent {}

export class VisitUnassignedToBayEvent extends BaseStoreEvent {}

export class ServiceEditedEvent extends BaseStoreEvent {
    editType: EditType;
    serviceCode: string;
    rootServiceCategoryCode: string;
    visitServiceId: number;
    ready: boolean;

    constructor(data: ServiceEditedInterface) {
        super(data);
        this.editType = data.editType;
        this.serviceCode = data.serviceCode;
        this.rootServiceCategoryCode = data.rootServiceCategoryCode;
        this.visitServiceId = data.visitServiceId;
        this.ready = data.ready;
    }
}

export class InvoiceFinalizedEvent extends BaseStoreEvent {}

export class VehicleUpdatedEvent extends BaseStoreEvent {}

export class InvoiceVoidedEvent extends BaseStoreEvent {}

export class InvoiceLockedEvent extends BaseStoreEvent {}

export class InvoiceUnlockedEvent extends BaseStoreEvent {}

export class BeginDayEvent extends BaseStoreEvent {}

export class CustomerTypeUpdatedEvent extends BaseStoreEvent {}

export class ValidationEvent extends BaseStoreEvent {}

const EVENT_TYPE_CLASS_MAP: { [key in EventTypeEnum]: typeof BaseStoreEvent } = {
    [EventTypeEnum.NAVIGATION]: NavigationEvent,
    [EventTypeEnum.VALIDATION]: ValidationEvent,
    [EventTypeEnum.BEGIN_DAY]: BeginDayEvent,
    [EventTypeEnum.VISIT_ADDED]: VisitAddedEvent,
    [EventTypeEnum.VISIT_REMOVED]: VisitRemovedEvent,
    [EventTypeEnum.VISIT_ASSIGNED_TO_BAY]: VisitAssignedToBayEvent,
    [EventTypeEnum.VISIT_UNASSIGNED_TO_BAY]: VisitUnassignedToBayEvent,
    [EventTypeEnum.SERVICE_EDITED]: ServiceEditedEvent,
    [EventTypeEnum.INVOICE_FINALIZED]: InvoiceFinalizedEvent,
    [EventTypeEnum.VEHICLE_UPDATED]: VehicleUpdatedEvent,
    [EventTypeEnum.INVOICE_VOIDED]: InvoiceVoidedEvent,
    [EventTypeEnum.INVOICE_LOCKED]: InvoiceLockedEvent,
    [EventTypeEnum.INVOICE_UNLOCKED]: InvoiceUnlockedEvent,
    [EventTypeEnum.CUSTOMER_TYPE_UPDATED]: CustomerTypeUpdatedEvent,
};
