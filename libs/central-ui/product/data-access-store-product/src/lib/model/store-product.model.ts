import { Audited, Described } from '@vioc-angular/shared/common-functionality';

class Product extends Described {
    productCategory?: Described;
}

class CompanyProduct extends Described {
    uom?: Described;
}

class Vendor extends Described {
    valvolineDistributor?: boolean;
}

export class StoreProduct implements Audited {
    id?: { storeId: number; productId: number } = null;
    store?: Described = null;
    product?: Product = null;
    companyProduct?: CompanyProduct = null;
    vendor?: Vendor = null;
    extraChargeAmount?: number = null;
    extraChargeDescription?: string = null;
    extraChargeTaxable?: boolean = null;
    wholesalePrice?: number = null;
    retailPrice?: number = null;
    schedulePriceChange?: number = null;
    schedulePriceDate?: string = null;
    taxable?: boolean = null;
    promotionPrice?: number = null;
    promotionPriceEndDate?: string = null;
    promotionPriceStartDate?: string = null;
    overridable?: boolean = null;
    maxOverridePrice?: number = null;
    minOverridePrice?: number = null;
    minMaxOverridable?: boolean = null;
    averageDailyUsage?: number = null;
    minOrderQuantity?: number = null;
    quantityPerPack?: number = null;
    quantityOnHand?: number = null;
    maxStockLimit?: number = null;
    minStockLimit?: number = null;
    minStockLimitEndDate?: string = null;
    includeInCount?: boolean = null;
    countFrequency?: Described = null;
    active?: boolean = null;
    reportOrder?: string = null;
    safetyFactor?: number = null;
    safetyFactorOverride?: number = null;
    wholesalePriceChange?: number = null;
    wholesalePriceChangeDate?: string = null;
    version?: number = null;
    updatedOn?: string = null;
    updatedBy?: string = null;
}
