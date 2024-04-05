import { Described } from '@vioc-angular/shared/common-functionality';

export class ProductExtraCharge {
    id?: number;
    charge?: Described = null;
    productCategory?: Described;
    amount?: number = null;
    quantityIncluded?: number = null;
    beginExtraCharge?: number = null;
    taxable?: boolean = null;
    updatedBy?: string;
    updatedOn?: Date;
    version?: number;
}
