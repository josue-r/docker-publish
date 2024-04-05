import { Audited, Described } from '@vioc-angular/shared/common-functionality';
import { ProductExtraCharge } from './product-extra-charge.model';
import { ServiceExtraCharge } from './service-extra-charge.model';

export class StoreService implements Audited {
    id?: { storeId: number; serviceId: number } = null;
    active?: boolean = null;
    laborAmount?: number = null;
    priceOverridable?: boolean = null;
    priceOverrideMax?: number = null;
    priceOverrideMin?: number = null;
    priceOverrideMinMaxOverrideable?: boolean = null;
    productExtraCharges?: ProductExtraCharge[] = [];
    promotionEndDate?: string = null;
    promotionLaborAmount?: number = null;
    promotionPrice?: number = null;
    promotionStartDate?: string = null;
    scheduledChangeDate?: string = null;
    scheduledChangePrice?: number = null;
    service?: Described = null;
    extraCharge1?: ServiceExtraCharge = null;
    extraCharge2?: ServiceExtraCharge = null;
    servicePrice?: number = null;
    store?: Store = null;
    taxable?: boolean = null;
    version?: number = null;
    updatedOn?: string = null;
    updatedBy?: string = null;
}

export class Store extends Described {
    company?: Described;
}
