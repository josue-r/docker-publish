import { Audited, Described } from '@vioc-angular/shared/common-functionality';

class Product extends Described {
    productCategory?: Described;
}

export class CompanyProduct implements Audited {
    id?: { companyId: number; productId: number } = null;
    company?: Described = null;
    product?: Product = null;
    active?: boolean = null;
    salesAccount?: Described = null;
    costAccount?: Described = null;
    uom?: Described = null;
    reportOrder?: string = null;
    version?: number = null;
    updatedOn?: string = null;
    updatedBy?: string = null;
}
