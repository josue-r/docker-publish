import { Api, ApiConfig } from '@vioc-angular/shared/util-api';
import { DefectiveProduct } from '../model/defective-product.model';
import { Observable } from 'rxjs';

export class DefectiveProductApi extends Api<DefectiveProduct, any> {
    constructor(baseUrl: string, config: ApiConfig) {
        super(`${baseUrl}/v1/store-defective-products`, config);
        // super(`http://localhost:9007/v1/store-defective-products`, config);
    }

    finalize(defectiveProduct: DefectiveProduct): Observable<Object> {
        const status = 'FINALIZED';
        return this.post([], defectiveProduct, { status });
    }

    getDefectiveProduct(storeCode: string, defectId: string): Observable<Object> {
        return this.get([], { storeCode, defectId });
    }
}
