import { Audited, Described } from '@vioc-angular/shared/common-functionality';
import { ProductCategoryMotorInfo } from './product-category-motor-info.model';

export class ProductCategory extends Described implements Audited {
    id: number = null;
    code?: string = null;
    parentCategory?: Described = null;
    version?: number = null;
    active?: boolean = null;
    productRating?: Described = null;
    productRatingPriority?: number = null;
    diesel?: boolean = null;
    highMileage?: boolean = null;
    nacsProductCode?: Described = null;
    fleetProductCode?: Described = null;
    reportOrder?: number = null;
    type?: Described = null;
    motorInfo?: ProductCategoryMotorInfo = null;
    updatedOn?: string = null;
    updatedBy?: string = null;
}
