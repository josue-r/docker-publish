import { Described } from '@vioc-angular/shared/common-functionality';

export class GenerateTransferProduct {
    id?: { storeId: number; productId: number } = null;
    reorderLevel?: number = null;
    uom?: Described = null;
    quantityOnHand?: number = null;
    wholesalePrice?: number = null;
    code?: string = null;
    description?: string = null;
}
