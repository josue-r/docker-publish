import { Described } from '@vioc-angular/shared/common-functionality';

export class StoreProductInventoryStatus {
    store?: Described;
    product?: { id?: number; code?: string; description?: string; version?: number; sapNumber?: string };
    quantityOnHand?: number;
    companyProduct?: { uom?: Described };
    vendor?: Described;
    active?: boolean;
}
