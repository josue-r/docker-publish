import { Discount } from '@vioc-angular/central-ui/discount/data-access-discount';
import { OfferContent } from '@vioc-angular/central-ui/discount/data-access-offer-content';
import { Audited, Described } from '@vioc-angular/shared/common-functionality';

export class Offer implements Audited {
    id?: string = null;
    // store is for search projection only
    store?: Described = null;
    // discountOffer is for search projection only
    discountOffer?: DiscountOffer = null;
    company?: Described = null;
    discount?: Discount = null;
    version?: number = null;
    active?: boolean = null;
    daysToExpire?: number = null;
    expirationDate?: string = null;
    name?: string = null;
    amount?: number = null;
    amountFormat?: Described = null;
    storeDiscounts?: StoreDiscount[] = [];
    offerContent?: OfferContent = null;
    updatedBy?: string = null;
    updatedOn?: string = null;
}

// DiscountOffer class is required for search projection only
export class DiscountOffer {
    id?: string = null;
    name?: string = null;
    amount?: number = null;
    amountFormat?: Described = null;
    discount?: Described = null;
    offerContent?: OfferContent = null;
    company?: Described = null;
}

export class StoreDiscount {
    id?: { storeId: number; discountId: string } = null;
    store?: Described = null;
    assigned?: boolean = null;
}
