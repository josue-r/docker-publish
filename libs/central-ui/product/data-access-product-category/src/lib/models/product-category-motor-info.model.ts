import { Described } from '@vioc-angular/shared/common-functionality';

export class ProductCategoryMotorInfo {
    id?: number = null;
    category?: Described = null;
    version?: number = null;
    primaryTable?: string = null;
    primaryColumn?: string = null;
    secondaryTable?: string = null;
    secondaryColumn?: string = null;
}
