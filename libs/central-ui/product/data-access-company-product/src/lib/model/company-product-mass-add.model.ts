import { Product } from '@vioc-angular/central-ui/product/data-access-product';
import { Described } from '@vioc-angular/shared/common-functionality';
import { CompanyProduct } from './company-product.model';

export class CompanyProductMassAdd {
    company: Described = null;
    products: Product[] = null;
    companyProduct: CompanyProduct = null;
    preview: boolean = null;

    constructor(companyProduct: CompanyProduct, preview = false) {
        this.companyProduct = companyProduct;
        this.preview = preview;
    }
}
