import { Api, ApiConfig } from '@vioc-angular/shared/util-api';
import { Observable } from 'rxjs';
import { CompanyHoliday } from '../model/company-holiday.model';

export class CompanyHolidayApi extends Api<CompanyHoliday, any> {
    constructor(baseUrl: string, config: ApiConfig) {
        super(`${baseUrl}/v1/company-holidays`, config);
        // super(`http://localhost:9002/v1/company-holidays`, config);
    }

    findByCompanyAndDate(company: string, date: string): Observable<CompanyHoliday> {
        return this.get([], { company, date });
    }
}
