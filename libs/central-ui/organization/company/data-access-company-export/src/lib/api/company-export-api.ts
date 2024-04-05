import { Inject } from '@angular/core';
import { Described } from '@vioc-angular/shared/common-functionality';
import { Api, ApiConfig, GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';

export class CompanyExportApi extends Api<void, void> {
    constructor(@Inject(GATEWAY_TOKEN) gateway: string, config: ApiConfig) {
        super(`${gateway}organization/v1/company-exports`, config);
        // super(`http://localhost:9002/v1/company-exports`, config);
    }

    findByCompanyAndType(companyCode: string, type: 'COST' | 'SALES') {
        return this.get<Described[]>([], { companyCode: companyCode, accountType: type });
    }
}
