import { Described } from '@vioc-angular/shared/common-functionality';

export class InventoryOrderProduct {
    secondLevelCategory?: Described = null;
    product?: SapProduct = null;
    uom?: Described = null;
    minimumOrderQuantity?: number = null;
    quantity?: number = null;
    suggestedQuantity?: number = null;
    quantityPerPack?: number = null;
    quantityOnHand?: number = null;
    quantityOnOrder?: number = null;
    averageDailyUsage?: number = null;
}

export class SapProduct extends Described {
    sapNumber: string;
}
