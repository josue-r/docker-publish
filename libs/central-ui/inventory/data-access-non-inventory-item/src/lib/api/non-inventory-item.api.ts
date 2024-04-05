import { NonInventoryCatalog } from '@vioc-angular/central-ui/inventory/data-access-non-inventory-order';
import { Api, ApiConfig } from '@vioc-angular/shared/util-api';
import { Observable } from 'rxjs';

export class NonInventoryItemApi extends Api<NonInventoryCatalog, any> {
    constructor(baseUrl: string, config: ApiConfig) {
        super(`${baseUrl}/v1/non-inventory-items`, config);
        // super(`http://localhost:9007/v1/non-inventory-items`, config);
    }

    getItemDetails(companyCode: string, storeCode: string, item: string[]): Observable<NonInventoryCatalog[]> {
        return this.get([], { companyCode, storeCode, item });
    }
}
