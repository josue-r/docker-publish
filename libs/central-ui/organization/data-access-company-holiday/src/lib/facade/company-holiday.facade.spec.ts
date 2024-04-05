import { QueryPage, QuerySearch, QuerySort, SearchLine } from '@vioc-angular/shared/common-api-models';
import { Column, Comparators } from '@vioc-angular/shared/util-column';
import { CompanyHolidayApi } from '../api/company-holiday.api';
import { CompanyHolidayFacade } from '../facade/company-holiday.facade';
import { CompanyHoliday, StoreHoliday } from '../model/company-holiday.model';

describe('CompanyHolidayFacade', () => {
    let api: CompanyHolidayApi;
    let facade: CompanyHolidayFacade;

    beforeEach(() => {
        facade = new CompanyHolidayFacade('//gateway', null);
        api = facade['api'];
    });

    describe('search', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'query').mockImplementation();

            const column = Column.of({
                name: 'Test',
                type: 'string',
                apiFieldPath: 'test',
            });
            const querySearch: QuerySearch = {
                queryRestrictions: [new SearchLine(column, Comparators.notBlank).toQueryRestriction()],
                sort: new QuerySort(column),
                page: new QueryPage(0, 20),
            };

            facade.search(querySearch);
            // verify that it delegated to api;
            expect(api.query).toBeCalledWith(querySearch);
        });
    });

    describe('findByCompanyAndDate', () => {
        it('should just delegate to API', () => {
            const date = '15-07-2022';
            const company = 'VAL';
            jest.spyOn(api, 'findByCompanyAndDate').mockImplementation();
            facade.findByCompanyAndDate(company, date);
            // verify that it delegated to api;
            expect(api.findByCompanyAndDate).toBeCalledWith(company, date);
        });
    });

    describe('save', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'save').mockImplementation();
            const companyHoliday = { ...new CompanyHoliday(), id: 1, storeHolidays: [new StoreHoliday()] };
            facade.save(companyHoliday);
            // verify that it delegated to api;
            expect(api.save).toBeCalledWith(companyHoliday);
        });
    });
});
