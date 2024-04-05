import { QueryPage, QuerySearch, QuerySort, SearchLine } from '@vioc-angular/shared/common-api-models';
import { Column, Comparators } from '@vioc-angular/shared/util-column';
import { ReceiptOfMaterialApi } from '../api/receipt-of-material.api';
import { ReceiptOfMaterialFacade } from '../facade/receipt-of-material.facade';
import { ReceiptOfMaterial } from '../model/receipt-of-material.model';

describe('ReceiptOfMaterialFacade', () => {
    let api: ReceiptOfMaterialApi;
    let facade: ReceiptOfMaterialFacade;

    beforeEach(() => {
        facade = new ReceiptOfMaterialFacade('//gateway', null);
        api = facade['api'];
    });

    describe('search', () => {
        it('should delegate to the API', () => {
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

    describe('findReceiptProducts', () => {
        it('should delegate to the API', () => {
            jest.spyOn(api, 'findReceiptProducts').mockImplementation();
            const storeNumber = 'VAL001';
            const rmNumber = 'RVAL0011234';
            facade.findReceiptProducts(storeNumber, rmNumber);
            expect(api.findReceiptProducts).toBeCalledWith(storeNumber, rmNumber);
        });
    });

    describe('findAssociatedReceiptsOfMaterial', () => {
        it('should delegate to the API', () => {
            jest.spyOn(api, 'findAssociatedReceiptsOfMaterial').mockImplementation();
            const storeCode = 'VAL001';
            const receiptType = 'REG';
            const source = 'VAL001';
            const sourceStoreCode = 'VAL002';
            facade.findAssociatedReceiptsOfMaterial(storeCode, receiptType, source, sourceStoreCode);
            expect(api.findAssociatedReceiptsOfMaterial).toBeCalledWith(
                storeCode,
                receiptType,
                source,
                sourceStoreCode
            );
        });
    });

    describe('save', () => {
        it('should delegate to the API', () => {
            const rm = { ...new ReceiptOfMaterial(), number: 'R000001', store: { id: 1 } };
            jest.spyOn(api, 'save').mockImplementation();
            facade.save(rm);
            expect(api.save).toHaveBeenCalledWith(rm);
        });
    });

    describe('finalize', () => {
        it('should delegate to the API', () => {
            const rm = { ...new ReceiptOfMaterial(), number: 'R000001', store: { id: 1 } };
            jest.spyOn(api, 'finalize').mockImplementation();
            facade.finalize(rm, true);
            expect(api.finalize).toHaveBeenCalledWith(rm, true);
        });
    });

    describe('deleteReceiptOfMaterial', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'cancelReceiptOfMaterial').mockImplementation();
            facade.cancelReceiptOfMaterial('TESTSTORE', 'TESTNUMBER');
            expect(api.cancelReceiptOfMaterial).toBeCalledWith('TESTSTORE', 'TESTNUMBER');
        });
    });

    describe('findOpenReceiptsOfMaterial', () => {
        it('should just delegate to the API', () => {
            jest.spyOn(api, 'findOpenReceiptsOfMaterial').mockImplementation();
            facade.findOpenReceiptsOfMaterial('TEST_STORE', 'TEST_VENDOR');
            expect(api.findOpenReceiptsOfMaterial).toHaveBeenCalledWith('TEST_STORE', 'TEST_VENDOR');
        });
    });

    describe('findOpenProductCountReceipts', () => {
        it('should just delegate to the API', () => {
            jest.spyOn(api, 'findOpenProductCountReceipts').mockImplementation();
            facade.findOpenProductCountReceipts('TEST_STORE');
            expect(api.findOpenProductCountReceipts).toHaveBeenCalledWith('TEST_STORE');
        });
    });
});
