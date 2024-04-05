import { Described } from '@vioc-angular/shared/common-functionality';

export class Store {
    id?: number = null;
    code?: string = null;
    description?: string = null;
    active?: boolean = null;
    company?: Described = null;
    region?: Described = null;
    market?: Described = null;
    area?: Described = null;
    address?: Address = null;
    phone?: string = null;
    fax?: string = null;
    emergencyPhone?: string = null;
    bayCount?: number = null;
    storeOpenDate?: string = null;
    storeCloseDate?: string = null;
    manager?: Employee = null;
    oilChangePrice?: number = null;
    currentStore?: Described = null;
    marketingArea?: Described = null;
    brand?: Described = null;
    version?: number = null;
    latitude?: number = null;
    longitude?: number = null;
    locationDirections?: string = null;
    communitiesServed?: string = null;
    classification?: Described = null;
    sameStoreReporting?: boolean = null;
}

class Employee {
    id?: string = null;
    firstName?: string = null;
    lastName?: string = null;
}

class Address {
    line1?: string = null;
    line2?: string = null;
    city?: string = null;
    state?: Described = null;
    zip?: string = null;
}
