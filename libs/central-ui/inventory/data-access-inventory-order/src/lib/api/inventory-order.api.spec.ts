import { InventoryOrder } from '../model/inventory-order.model';
import { InventoryOrderApi } from './inventory-order.api';

describe('InventoryOrderApi', () => {
    const api = new InventoryOrderApi(null, { http: null });

    beforeEach(() => {
        jest.clearAllMocks();
        api.get = jest.fn();
        api.post = jest.fn();
        api.put = jest.fn();
        api.delete = jest.fn();
    });

    it('should create an instance', () => {
        expect(api).toBeTruthy();
    });

    describe('findByStoreCodeAndOrderNumber', () => {
        it('should delegate to get method', () => {
            const storeCode = 'TESTSTORE';
            const orderNumber = 'TESTORDER';
            api.findByStoreCodeAndOrderNumber(storeCode, orderNumber);
            expect(api.get).toHaveBeenCalledWith([], { storeCode, orderNumber });
        });
    });

    describe('cancelInventoryOrder', () => {
        it('should delegate to delete method', () => {
            const storeCode = 'TESTSTORE';
            const orderNumber = 'TESTORDER';
            api.cancelInventoryOrder(storeCode, orderNumber);
            expect(api.delete).toHaveBeenCalledWith([], { storeCode, orderNumber });
        });
    });

    describe('generateOrderProducts', () => {
        const storeCode = 'STORE';
        const vendorCode = 'VENDOR';
        it('should delegate to get method', () => {
            api.generateOrderProducts(storeCode, vendorCode);
            // productCodes were not provided, passes an empty array
            expect(api.get).toHaveBeenCalledWith(['generate'], {
                store: storeCode,
                vendor: vendorCode,
                product: [],
            });
        });
        it('should delegate to get method with product(s)', () => {
            const codes = ['P1', 'P2'];
            api.generateOrderProducts(storeCode, vendorCode, codes);
            expect(api.get).toHaveBeenCalledWith(['generate'], {
                store: storeCode,
                vendor: vendorCode,
                product: codes,
            });
        });
    });

    describe('finalize', () => {
        it('should delegate to put method when id is defined', () => {
            const order = { ...new InventoryOrder(), id: { number: 'R000001', storeId: 1 } };
            api.finalize(order);
            expect(api.put).toHaveBeenCalledWith([], order, { status: 'FINALIZED' });
        });

        it('should delegate to post method when id is undefined/null', () => {
            const order = { ...new InventoryOrder(), id: null };
            api.finalize(order);
            expect(api.post).toHaveBeenCalledWith([], order, { status: 'FINALIZED' });
        });
    });
});
