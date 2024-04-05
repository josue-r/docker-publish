import { Described } from '@vioc-angular/shared/common-functionality';
import { ReceiptOfMaterialProduct } from './receipt-of-material-product.model';

export class ReceiptOfMaterial {
    id?: ReceiptOfMaterialPK = null;
    version?: number = null;
    number?: string = null;
    store?: Described = null;
    shipTo?: string = null;
    vendor?: Described = null;
    receiptDate?: string = null;
    status?: Described = null;
    receiptType?: Described = null;
    finalizedOn?: string = null;
    finalizedByEmployee?: Employee = null;
    createdByEmployee?: Employee = null;
    originalNumber?: string = null;
    source?: string = null;
    sourceStore?: Described = null;
    poNumber?: string = null;
    invoiceNumber?: string = null;
    deliveryTicket?: string = null;
    comments?: string = null;
    receiptProducts?: ReceiptOfMaterialProduct[] = [];
}

class Employee {
    id?: string = null;
    firstName?: string = null;
    lastName?: string = null;
}

export class ReceiptOfMaterialPK {
    number: string;
    storeId: number;
}
