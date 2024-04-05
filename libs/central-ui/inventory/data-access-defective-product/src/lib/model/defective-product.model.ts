import { ProductAdjustment } from '@vioc-angular/central-ui/inventory/data-access-product-adjustment';
import { Audited, Described } from '@vioc-angular/shared/common-functionality';

export class DefectiveProduct implements Audited {
    id?: number = null;
    store?: StoreWithCompany = null;
    storeProduct?: StoreProduct = null;
    vendor?: Described = null;
    adjustment?: ProductAdjustment = null;
    quantity?: number = null;
    defectProductReason?: Described = null;
    comments?: string = null;
    defectDate?: string = null;
    updatedBy?: string = null;
    updatedOn?: string = null;
    product?: Described = null;
    reason?: Described = null;
}

class StoreWithCompany {
    id?: any = null;
    code?: string = null;
    description?: string = null;
    version?: number = null;
    company?: Described = null;
}

class Product extends Described {
    productCategory?: Described;
}

class CompanyProduct extends Described {
    uom?: Described;
}

class Vendor extends Described {
    valvolineDistributor?: boolean;
}
class StoreProduct {
    id?: { storeId: number; productId: number } = null;
    store?: Described = null;
    product?: Product = null;
    companyProduct?: CompanyProduct = null;
    vendor?: Vendor = null;
}
