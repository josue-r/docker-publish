import { Audited, Described } from '@vioc-angular/shared/common-functionality';
import { ProductAdjustmentDetailPK } from './product-adjustment-detail-pk.model';
import { ProductAdjustment } from './product-adjustment.model';

// @Table(name = "ADJUSTMENTDETAIL")
export class ProductAdjustmentDetail implements Audited {
    id?: ProductAdjustmentDetailPK = null;
    sign?: string = null;
    lineNumber?: number = null;
    quantity?: number = null;
    wholesalePrice?: number = null;
    unitOfMeasure?: Described = null;
    adjustmentReason?: Described = null;
    product?: Described = null;
    Adjustment?: ProductAdjustment = null;
    createdDate?: string = null;
    updatedBy?: string = null;
    updatedOn?: string = null;
}
