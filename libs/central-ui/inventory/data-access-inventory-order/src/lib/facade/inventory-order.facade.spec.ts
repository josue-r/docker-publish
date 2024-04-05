import { QueryPage, QuerySearch, QuerySort, SearchLine } from '@vioc-angular/shared/common-api-models';
import { Column, Comparators } from '@vioc-angular/shared/util-column';
import { InventoryOrderApi } from '../api/inventory-order.api';
import { InventoryOrder } from '../model/inventory-order.model';
import { InventoryOrderFacade } from './inventory-order.facade';

describe('InventoryOrderFacade', () => {
    let api: InventoryOrderApi;
    let facade: InventoryOrderFacade;

    beforeEach(() => {
        facade = new InventoryOrderFacade('//gateway', null);
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

    describe('findByStoreCodeAndOrderNumber', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'findByStoreCodeAndOrderNumber').mockImplementation();
            facade.findByStoreCodeAndOrderNumber('TESTSTORE', 'TESTORDER');
            expect(api.findByStoreCodeAndOrderNumber).toBeCalledWith('TESTSTORE', 'TESTORDER');
        });
    });

    describe('deleteOrder', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'cancelInventoryOrder').mockImplementation();
            facade.cancelInventoryOrder('TESTSTORE', 'TESTORDER');
            expect(api.cancelInventoryOrder).toBeCalledWith('TESTSTORE', 'TESTORDER');
        });
    });

    describe('generateOrderProducts', () => {
        const storeCode = 'STORE';
        const vendorCode = 'VENDOR';

        it('should delegate to the API', () => {
            jest.spyOn(api, 'generateOrderProducts').mockImplementation();
            facade.generateOrderProducts(storeCode, vendorCode);
            // productCodes were not provided, passes undefined
            expect(api.generateOrderProducts).toHaveBeenCalledWith(storeCode, vendorCode, undefined);
        });
        it('should delegate to  the API with productCodes', () => {
            const codes = ['P1', 'P2'];
            jest.spyOn(api, 'generateOrderProducts').mockImplementation();
            facade.generateOrderProducts(storeCode, vendorCode, codes);
            expect(api.generateOrderProducts).toHaveBeenCalledWith(storeCode, vendorCode, codes);
        });
    });

    describe('finalize', () => {
        it('should delegate to the API', () => {
            const order = { ...new InventoryOrder(), id: { number: 'R000001', storeId: 1 } };
            jest.spyOn(api, 'finalize').mockImplementation();
            facade.finalize(order);
            expect(api.finalize).toHaveBeenCalledWith(order);
        });
    });
});
