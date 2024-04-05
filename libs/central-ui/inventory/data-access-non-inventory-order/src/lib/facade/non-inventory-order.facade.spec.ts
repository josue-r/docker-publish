import { QueryPage, QuerySearch, QuerySort, SearchLine } from '@vioc-angular/shared/common-api-models';
import { Column, Comparators } from '@vioc-angular/shared/util-column';
import { NonInventoryOrder } from '../..';
import { NonInventoryOrderApi } from './../api/non-inventory-order.api';
import { NonInventoryOrderFacade } from './non-inventory-order.facade';

describe('NonInventoryOrderFacade', () => {
    let api: NonInventoryOrderApi;
    let facade: NonInventoryOrderFacade;

    beforeEach(() => {
        facade = new NonInventoryOrderFacade('//gateway', null);
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

    describe('save', () => {
        it('should delegate to the API', () => {
            const nio = { ...new NonInventoryOrder(), number: 'N000001', store: { id: 1 } };
            jest.spyOn(api, 'save').mockImplementation();
            facade.save(nio);
            expect(api.save).toHaveBeenCalledWith(nio);
        });
    });

    describe('findOpenReceiptsOfMaterial', () => {
        it('should just delegate to the API', () => {
            jest.spyOn(api, 'findNonInventoryOrder').mockImplementation();
            facade.findNonInventoryOrder('TEST_STORE', 'ORDER001');
            expect(api.findNonInventoryOrder).toHaveBeenCalledWith('TEST_STORE', 'ORDER001');
        });
    });

    describe('finalize', () => {
        it('should delegate to finalize save the API', () => {
            const nio: NonInventoryOrder = { comments: 'test', store: { id: 1 } };
            jest.spyOn(api, 'finalizeSave').mockImplementation();
            facade.finalize(nio);
            expect(api.finalizeSave).toHaveBeenCalledWith(nio);
        });
        it('should delegate to finalize update method for existing Non inventory Order', () => {
            const nio: NonInventoryOrder = { id: { storeId: 1, orderNumber: 12 }, store: { id: 1 } };
            jest.spyOn(api, 'finalizeUpdate').mockImplementation();
            facade.finalize(nio);
            expect(api.finalizeUpdate).toHaveBeenCalledWith(nio);
        });
    });
});
