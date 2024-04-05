import { Described } from '@vioc-angular/shared/common-functionality';

export class PhysicalInventoryCount {
    id?: { physicalInventoryId?: number; line?: number } = null;
    status?: Described = null;
    closedOn?: string = null;
    product?: Described = null;
    category?: Described = null;
    uom?: Described = null;
    quantityOnHand?: number = null;
    maxStockLimit?: number = null;
    actualCount?: number = null;
    version?: number = null;
    variance?: number = null;
    qohCountWhenOpened?: number = null;
    qohCountWhenClosed?: number = null;
    storeTank?: StoreTank = null;
    /** used for count by location functionality */
    totalQuantity?: number = null;
    countsByLocation?: CountLocation[] = [];
    /** used to identify if volume is not calculated before apply */
    volumeCalculatorEnabled: boolean;
}
class StoreTank {
    companyTank?: CompanyTank = null;
}

class CompanyTank extends Described {
    heightUom?: Described = null;
}

export class CountLocation {
    count?: number = null;
    location?: string = null;
}
