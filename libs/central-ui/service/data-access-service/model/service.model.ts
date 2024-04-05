import { Audited, Described } from '@vioc-angular/shared/common-functionality';

export class ServiceProduct {
    id?: { serviceId: number; productCategoryId: number };
    productCategory?: Described;
    defaultQuantity?: number;
    version?: number;
}

/* Service domain object */
export class Service extends Described implements Audited {
    serviceCategory?: Described = null;
    active?: boolean = null;
    requiresApproval?: boolean = null;
    supportsQuickSale?: boolean = null;
    supportsQuickInvoice?: boolean = null;
    supportsRegularInvoice?: boolean = null;
    supportsRefillInvoice?: boolean = null;
    supportsTireCheckInvoice?: boolean = null;
    serviceProducts?: ServiceProduct[] = null;
    updatedOn?: string = null;
    updatedBy?: string = null;
    id?: any = null;
    code?: string = null;
    description?: string = null;
    version?: number = null;
    supportsECommerce?: boolean = null;
}
