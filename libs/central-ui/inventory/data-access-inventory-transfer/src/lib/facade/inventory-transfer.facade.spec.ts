import { QueryPage, QuerySearch, QuerySort, SearchLine } from '@vioc-angular/shared/common-api-models';
import { Column, Comparators } from '@vioc-angular/shared/util-column';
import { InventoryTransfer } from '../model/inventory-transfer.model';
import { InventoryTransferApi } from './../api/inventory-transfer.api';
import { InventoryTransferFacade } from './inventory-transfer.facade';

describe('InventoryTransferFacade', () => {
    let api: InventoryTransferApi;
    let facade: InventoryTransferFacade;

    beforeEach(() => {
        facade = new InventoryTransferFacade('//gateway', null);
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
            const transfer = { ...new InventoryTransfer(), id: { storeId: 1, transferId: '1000' } };
            jest.spyOn(api, 'finalize').mockImplementation();
            facade.finalize(transfer);
            expect(api.finalize).toHaveBeenCalledWith(transfer);
        });
    });

    describe('productLookup', () => {
        it('should delegate to the API', () => {
            jest.spyOn(api, 'productLookup').mockImplementation();
            const productCodes: string[] = ['PROD1', 'PROD2'];
            facade.productLookup('fromStore', 'toStore', productCodes);
            expect(api.productLookup).toHaveBeenCalledWith('fromStore', 'toStore', productCodes);
        });
    });

    describe('getToStores', () => {
        it('should delegate to the API', () => {
            const fromStore = 'VAL002';
            jest.spyOn(api, 'getToStores').mockImplementation();
            facade.getToStores(fromStore);
            expect(api.getToStores).toHaveBeenCalledWith(fromStore);
        });
    });

    describe('findByFromStoreAndTransferId', () => {
        it('should delegate to the API', () => {
            const fromStore = 'VAL002';
            const transferId = '1100';
            jest.spyOn(api, 'findByFromStoreAndTransferId').mockImplementation();
            facade.findByFromStoreAndTransferId(fromStore, transferId);
            expect(api.findByFromStoreAndTransferId).toHaveBeenCalledWith(fromStore, transferId);
        });
    });

    describe('cancelInventoryTransfer', () => {
        it('should delegate to the API', () => {
            const fromStore = 'VAL002';
            const transferId = '1100';
            jest.spyOn(api, 'cancelInventoryTransfer').mockImplementation();
            facade.cancelInventoryTransfer(fromStore, transferId);
            expect(api.cancelInventoryTransfer).toHaveBeenCalledWith(fromStore, transferId);
        });
    });
});
