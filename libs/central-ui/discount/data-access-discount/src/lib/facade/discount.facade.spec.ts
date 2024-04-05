import { QueryPage, QuerySearch, QuerySort, SearchLine } from '@vioc-angular/shared/common-api-models';
import { Column, Comparators } from '@vioc-angular/shared/util-column';
import { DiscountApi } from '../api/discount.api';
import { Discount } from '../model/discount.model';
import { DiscountFacade } from './discount.facade';
describe('DiscountFacade', () => {
    let api: DiscountApi;
    let facade: DiscountFacade;

    const ids = [1, 2];

    beforeEach(() => {
        facade = new DiscountFacade('//gateway', null);
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
            expect(api.query).toBeCalledWith(querySearch, ['v2/discounts/search']);
        });
    });

    describe('findByCodeAndCompany', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'findByCodeAndCompany').mockImplementation();

            const code = 'test';
            const companyCode = 'testCompany';

            facade.findByCodeAndCompany(code, companyCode);

            // verify that it delegated to api;
            expect(api.findByCodeAndCompany).toBeCalledWith(code, companyCode);
        });
    });

    describe('findByCodeAndCompanyV2', () => {
        it('should just delegate to API for local discounts', () => {
            jest.spyOn(api, 'findByCodeAndCompanyV2').mockImplementation();

            const code = 'test';
            const companyCode = 'testCompany';

            facade.findByCodeAndCompanyV2(code, companyCode);

            // verify that it delegated to api;
            expect(api.findByCodeAndCompanyV2).toBeCalledWith(code, companyCode);
        });

        it('should just delegate to API for national discounts', () => {
            jest.spyOn(api, 'findByCodeAndCompanyV2').mockImplementation();

            const code = 'test';

            facade.findByCodeAndCompanyV2(code, null);

            // verify that it delegated to api;
            expect(api.findByCodeAndCompanyV2).toBeCalledWith(code, null);
        });
    });

    describe('save', () => {
        it('should just delegate to API for saving discounts', () => {
            jest.spyOn(api, 'save').mockImplementation();

            const discount = new Discount();

            facade.save(discount);

            // verify that it delegated to api;
            expect(api.save).toBeCalledWith(discount, ['v2/discounts']);
        });
    });

    describe('searchV1', () => {
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

            facade.searchV1(querySearch);

            // verify that it delegated to api;
            expect(api.query).toBeCalledWith(querySearch, ['v1/discounts/search']);
        });
    });

    describe('dataSync', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'dataSync').mockImplementation();

            facade.dataSync(ids);

            // verify that it delegated to api;
            expect(api.dataSync).toBeCalledWith(ids, ['v1/discounts/datasync']);
        });
    });

    describe('activate', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'activate').mockImplementation();

            facade.activate(ids);

            // verify that it delegated to api;
            expect(api.activate).toBeCalledWith(ids, ['v1/discounts/activate']);
        });
    });

    describe('deactivate', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'deactivate').mockImplementation();

            facade.deactivate(ids);

            // verify that it delegated to api;
            expect(api.deactivate).toBeCalledWith(ids, ['v1/discounts/deactivate']);
        });
    });
});
