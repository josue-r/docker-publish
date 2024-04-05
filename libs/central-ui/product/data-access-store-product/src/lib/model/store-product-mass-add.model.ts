import { Product } from '@vioc-angular/central-ui/product/data-access-product';
import { Described } from '@vioc-angular/shared/common-functionality';
import { StoreProduct } from './store-product.model';

export class StoreProductMassAdd {
    stores?: Described[];
    products?: Product[];
    storeProduct?: StoreProduct;
    useDefaultVendor?: boolean;
    useDefaultReportOrder?: boolean;
}
