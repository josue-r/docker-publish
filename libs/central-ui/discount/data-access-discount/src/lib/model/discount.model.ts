import { Audited, Described } from '@vioc-angular/shared/common-functionality';
import { DiscountCategory } from './discount-category.model';

export class Discount implements Audited {
    id?: string = null;
    company?: Described = null;
    startDate?: string = null;
    expirationDate?: string = null;
    endDate?: string = null;
    code?: string = null;
    description?: string = null;
    type?: Described = null;
    active?: boolean = null;
    national?: boolean = null;
    approach?: Described = null;
    version?: number = null;
    updatedBy?: string = null;
    updatedOn?: string = null;
    owner?: Described = null;
    channel?: Described = null;
    uniqueCodeRequired?: boolean = null;
    discountClassification?: Described = null;
    explanationRequired?: boolean = null;
    amount?: number = null;
    overridable?: boolean = null;
    device?: Described = null;
    program?: Described = null;
    fleetOnly?: boolean = null;
    audience?: Described = null;
    discountCategories?: DiscountCategory[] = [];
    overrideMinAmount?: number = null;
    overrideMaxAmount?: number = null;
    percentMaxAmount?: number = null;
    serviceOffer?: Described = null;
    securityRestriction?: Described = null;
    extraChargesSupported?: boolean = null;
    maxUses?: number = null;
    storeDiscounts?: StoreDiscount[] = [];
}

export class StoreDiscount {
    id?: { storeId: number; discountId: string } = null;
    store?: Described = null;
    active?: boolean = null;
}
