import { Described } from '@vioc-angular/shared/common-functionality';

export class CompanyHoliday {
    id?: number = null;
    version?: number = null;
    company?: Described = null;
    name?: string = null;
    holidayDate?: string = null;
    storeClosed?: boolean = null;
    // added for holiday edit screen
    holiday?: Described = null;
    storeHolidays?: StoreHoliday[] = [];
}

export class StoreHoliday {
    id?: number = null;
    store?: Described = null;
    closed?: boolean = null;
}
