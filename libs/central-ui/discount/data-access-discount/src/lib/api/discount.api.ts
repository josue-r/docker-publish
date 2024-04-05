import { isNullOrUndefined } from '@vioc-angular/shared/common-functionality';
import { Api, ApiConfig } from '@vioc-angular/shared/util-api';
import { Observable } from 'rxjs';
import { Discount } from '../model/discount.model';

export class DiscountApi extends Api<Discount, any> {
    constructor(baseUrl: string, config: ApiConfig) {
        super(`${baseUrl}`, config);
        // super(`http://localhost:9013`, config);
    }

    /** Find Discount by the given code. */
    findByCodeAndCompany(discountCode: string, companyCode?: string): Observable<Discount> {
        if (companyCode != undefined) {
            return this.get<Discount>(['v1/discounts'], { discountCode, companyCode });
        } else {
            return this.get<Discount>(['v1/discounts'], { discountCode });
        }
    }

    /** Find Discount by the given code. */
    findByCodeAndCompanyV2(discountCode: string, companyCode?: string): Observable<Discount> {
        if (!isNullOrUndefined(companyCode)) {
            return this.get<Discount>(['v2/discounts'], { discountCode, companyCode }); // get local discount
        } else {
            return this.get<Discount>(['v2/discounts'], { discountCode }); // get national discount
        }
    }
}
