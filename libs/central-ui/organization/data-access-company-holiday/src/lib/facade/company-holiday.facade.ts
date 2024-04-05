import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { QuerySearch } from '@vioc-angular/shared/common-api-models';
import { Searchable } from '@vioc-angular/shared/data-access-search';
import { GATEWAY_TOKEN, ResponseEntity } from '@vioc-angular/shared/util-api';
import { Observable } from 'rxjs';
import { CompanyHolidayApi } from '../api/company-holiday.api';
import { CompanyHoliday } from '../model/company-holiday.model';

@Injectable()
export class CompanyHolidayFacade implements Searchable<CompanyHoliday> {
    private readonly api: CompanyHolidayApi;

    constructor(@Inject(GATEWAY_TOKEN) gateway: string, http: HttpClient) {
        this.api = new CompanyHolidayApi(`${gateway}organization`, { http });
    }

    /**
     * @see SearchPageFacade.search
     */
    search(querySearch: QuerySearch): Observable<ResponseEntity<CompanyHoliday>> {
        return this.api.query(querySearch);
    }

    findByCompanyAndDate(companyCode: string, holidayDate: string): Observable<CompanyHoliday> {
        return this.api.findByCompanyAndDate(companyCode, holidayDate);
    }

    /** @see Api#save */
    save(companyHoliday: CompanyHoliday) {
        return this.api.save(companyHoliday);
    }
}
