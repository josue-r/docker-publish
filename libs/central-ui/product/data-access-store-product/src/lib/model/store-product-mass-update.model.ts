import { Described } from '@vioc-angular/shared/common-functionality';
import { StoreProduct } from './store-product.model';

export class StoreProductMassUpdate {
    /**
     * Values selected during the store selection step of the store product mass
     * update.
     */
    stores: Described[];

    /**
     * Values selected during the product selection step of the store product
     * mass update.
     */
    products: Described[];

    /**
     * Patch value that will be used to update the store product records.
     */
    patch: StoreProduct;
}
