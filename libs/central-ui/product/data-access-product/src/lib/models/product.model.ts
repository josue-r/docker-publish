import { Audited, Described } from '@vioc-angular/shared/common-functionality';
import { ProductMotorMapping } from './product-motor-mapping.model';

/** Model for the global product catalog */
export class Product extends Described implements Audited {
    id?: number = null;
    code?: string = null;
    description?: string = null;
    version?: number = null;
    relatedProductCode?: string = null;
    inventoryDescription?: string = null;
    sapNumber?: string = null;
    active?: boolean = null;
    bulk?: boolean = null;
    tankStorage?: boolean = null;
    obsolete?: boolean = null;
    upc?: string = null;
    reportOrder?: string = null;
    defaultUom?: Described = null;
    productCategory?: Described = null;
    type?: Described = null;
    vendorType?: Described = null;
    fluidGroup?: Described = null;
    productMotorMapping?: ProductMotorMapping[] = [];
    updatedOn?: string = null;
    updatedBy?: string = null;
    supportsECommerce?: boolean = null;
}
