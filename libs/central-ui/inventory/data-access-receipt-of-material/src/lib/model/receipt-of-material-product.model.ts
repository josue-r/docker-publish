import { Described } from '@vioc-angular/shared/common-functionality';

export class ReceiptOfMaterialProduct {
    lineNumber: number;
    version?: number = null;
    quantityReceived?: number = null;
    quantityOrdered?: number = null;
    wholesalePrice?: number = null;
    maxStockLimit?: number = null;
    uom?: Described = null;
    product?: Described = null;
    sapNumber?: string = null;
    secondLevelCategory?: Described = null;
    bulk?: boolean = null;
    quantityOnHand?: number = null;
    averageDailyUsage?: number = null;
}
