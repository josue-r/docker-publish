import { Described } from '@vioc-angular/shared/common-functionality';

export class NonInventoryCatalog {
    id?: number = null;
    company?: Described = null;
    number?: string = null;
    description?: string = null;
    category?: Described = null;
    uom?: Described = null;
    active?: boolean = null;
    maximumQuantity?: number = null;
    minimumQuantity?: number = null;
    quantityPerPack?: number = null;
    erpGeneralLedgerAccount?: Described = null;
    inactiveDate?: string = null;
    unitPrice?: number = null;
    comments?: string = null;
}
