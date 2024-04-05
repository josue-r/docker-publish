import { QueryPage, QuerySearch, QuerySort, SearchLine } from '@vioc-angular/shared/common-api-models';
import { Column, Comparators } from '@vioc-angular/shared/util-column';
import { StoreProductApi } from '../api/store-product-api';
import { StoreProductInventoryStatusFacade } from './store-product-inventory-status-facade';

describe('StoreProductInventoryStatusFacade', () => {
    let api: StoreProductApi;
    let facade: StoreProductInventoryStatusFacade;

    beforeEach(() => {
        facade = new StoreProductInventoryStatusFacade(null, null);
        api = facade['api'];
    });
    describe('search', () => {
        it('should delegate to the API', () => {
            jest.spyOn(api, 'inventoryStatusSearch').mockImplementation();
            const column = Column.of({ name: 'Test', apiFieldPath: 'test', type: 'string' });
            const querySearch: QuerySearch = {
                queryRestrictions: [new SearchLine(column, Comparators.notBlank).toQueryRestriction()],
                sort: new QuerySort(column),
                page: new QueryPage(0, 20),
            };
            facade.search(querySearch);
            expect(api.inventoryStatusSearch).toBeCalledWith(querySearch);
        });
    });
});
