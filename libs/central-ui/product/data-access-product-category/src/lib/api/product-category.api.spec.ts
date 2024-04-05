import { ProductCategoryApi } from './product-category.api';

describe('ProductCategoryApi', () => {
    const api = new ProductCategoryApi(null, { http: null });

    beforeEach(() => {
        jest.clearAllMocks();
        api.get = jest.fn();
        api.post = jest.fn();
    });

    describe('findActive', () => {
        it('delegate to the get method', () => {
            const testLevel = 'ALL';
            api.findActive(testLevel);
            expect(api.get).toHaveBeenCalledWith(['active'], { level: testLevel });
        });
    });

    describe('findByCode', () => {
        it('delegate to the get method', () => {
            const testCode = 'CODE';
            api.findByCode(testCode);
            expect(api.get).toHaveBeenCalledWith([], { code: testCode });
        });
    });

    describe('findAssignableParents', () => {
        it('delegate to the get method', () => {
            api.findAssignableParents();
            expect(api.get).toHaveBeenCalledWith(['assignable-parents']);
        });
    });

    describe('findSecondLevelByStore', () => {
        it('delegate to the get method', () => {
            const testStoreCode = 'STORE';
            api.findSecondLevelByStore(testStoreCode);
            expect(api.get).toHaveBeenCalledWith(['second-level'], { storeCode: testStoreCode });
        });
    });

    describe('generateCategories', () => {
        it('should delegate to the get method', () => {
            const testCode = 'CODE';
            api.generateCategories([testCode]);
            expect(api.post).toHaveBeenCalledWith(['codes'], [testCode]);
        });
    });
});
