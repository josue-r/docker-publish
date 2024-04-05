import { QueryPage, QuerySearch, QuerySort, SearchLine } from '@vioc-angular/shared/common-api-models';
import { Column, Comparators } from '@vioc-angular/shared/util-column';
import { DefectiveProduct } from '../..';
import { DefectiveProductApi } from '../api/defective-product.api';
import { DefectiveProductFacade } from './defective-product.facade';

describe('DefectiveProductFacade', () => {
    let api: DefectiveProductApi;
    let facade: DefectiveProductFacade;

    beforeEach(() => {
        facade = new DefectiveProductFacade('//gateway', null);
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

    describe('finalize', () => {
        it('should delegate to the API', () => {
            const dpm = { ...new DefectiveProduct(), store: { code: '1' } };
            jest.spyOn(api, 'finalize').mockImplementation();
            facade.finalize(dpm);
            expect(api.finalize).toHaveBeenCalledWith(dpm);
        });
    });

    describe('View', () => {
        it('should delegate to the API', () => {
            jest.spyOn(api, 'getDefectiveProduct').mockImplementation();
            facade.getDefectiveProduct('STORE', '1');
            expect(api.getDefectiveProduct).toHaveBeenCalledWith('STORE', '1');
        });
    });
});
