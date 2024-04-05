import { QueryPage, QuerySearch, QuerySort, SearchLine } from '@vioc-angular/shared/common-api-models';
import { Column, Comparators } from '@vioc-angular/shared/util-column';
import { NonInventoryItemApi } from '../api/non-inventory-item.api';
import { NonInventoryItemFacade } from './non-inventory-item.facade';

describe('NonInventoryOrderFacade', () => {
    let api: NonInventoryItemApi;
    let facade: NonInventoryItemFacade;

    beforeEach(() => {
        facade = new NonInventoryItemFacade('//gateway', null);
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

    describe('getItemDetails', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'getItemDetails').mockImplementation();
            const itemNumbers: string[] = ['54321', '12543'];
            facade.getItemDetails('COMPANY', 'STORE', itemNumbers);
            // verify that it delegated to api;
            expect(api.getItemDetails).toBeCalledWith('COMPANY', 'STORE', itemNumbers);
        });
    });
});
