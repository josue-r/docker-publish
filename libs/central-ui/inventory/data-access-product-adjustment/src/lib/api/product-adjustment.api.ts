import { Api, ApiConfig } from '@vioc-angular/shared/util-api';
import { Observable } from 'rxjs';
import { ProductAdjustment } from '../model/product-adjustment.model';

export class ProductAdjustmentApi extends Api<ProductAdjustment, any> {
    constructor(baseUrl: string, config: ApiConfig) {
        super(`${baseUrl}/v1/product-adjustments`, config);
    }

    finalize(productAdjustment: ProductAdjustment): Observable<Object> {
        return this.post([], productAdjustment);
    }

    findByAdjustmentId(productAdjustmentId: number): Observable<ProductAdjustment> {
        return this.get([], { adjustmentId: productAdjustmentId.toString() });
    }
}
