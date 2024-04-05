import { Described } from '@vioc-angular/shared/common-functionality';
import { of } from 'rxjs';
import { ProductCategoryApi } from '../api/product-category.api';
import { ProductCategory } from '../models/product-category.model';
import { ProductCategoryState } from '../state/product-category.state';
import { ProductCategoryFacade } from './product-category.facade';

describe('ProductCategoryFacade', () => {
    const facade = new ProductCategoryFacade('//gateway', null, new ProductCategoryState());
    const api: ProductCategoryApi = facade['api'];
    const state: ProductCategoryState = facade['state'];

    describe('findActive', () => {
        const categories: Described[] = [{ code: 'TESTCAT' }];

        it('should delegate to the state and if not already cached then cache results', () => {
            const expectedCategories = of(categories);
            jest.spyOn(api, 'findActive').mockImplementation(() => expectedCategories);
            jest.spyOn(state, 'cacheFindActive');
            const testLevel = 'ROOT';
            facade.findActive(testLevel);
            expect(state.cacheFindActive).toHaveBeenCalledWith(testLevel, expectedCategories);
        });

        it('should delegate to the state and get existing results from cache', async () => {
            const apiCategories: Described[] = [{ code: 'NONCACHEDCAT' }, ...categories];
            const testLevel = 'ROOT';

            // mock API implementation and insert differing data into cache
            jest.spyOn(api, 'findActive').mockImplementation(() => of(apiCategories));
            state['findActiveCache'].put(testLevel, of(categories));

            expect(await facade.findActive(testLevel).toPromise()).toEqual(categories);
        });
    });

    describe('save', () => {
        it('should delegate to api', () => {
            api.save = jest.fn();
            facade.save(new ProductCategory());
            expect(api.save).toHaveBeenCalled();
        });

        it('should clear the state cache', async () => {
            api.save = jest.fn();
            const categories: Described[] = [{ code: 'TESTCAT' }];
            const storeProductCategories: Described[] = [{ code: 'SPCAT' }];
            const testLevel = 'ROOT';
            const testStoreCode = 'STORE';
            jest.spyOn(state, 'clearCache');

            // insert data into findActive cache
            state['findActiveCache'].put(testLevel, of(categories));
            expect(await state['findActiveCache'].get(testLevel).toPromise()).toEqual(categories);
            // insert data into findSecondLevelByStore cache
            state['findSecondLevelByStoreCache'].put(testStoreCode, of(storeProductCategories));
            expect(await state['findSecondLevelByStoreCache'].get(testStoreCode).toPromise()).toEqual(
                storeProductCategories
            );

            // save and validate cache was cleared
            facade.save(new ProductCategory());
            expect(state['clearCache']).toHaveBeenCalled();
            expect(state['findActiveCache'].get(testLevel)).toBeNull();
            expect(state['findSecondLevelByStoreCache'].get(testStoreCode)).toBeNull();
        });
    });

    describe('findByCode', () => {
        it('should delegate to the API', async () => {
            api.findByCode = jest.fn();
            const testCode = 'CODE';
            facade.findByCode(testCode);
            expect(api.findByCode).toHaveBeenCalledWith(testCode);
        });
    });

    describe('findAssignableParents', () => {
        it('should delegate to the API', async () => {
            api.findAssignableParents = jest.fn();
            facade.findAssignableParents();
            expect(api.findAssignableParents).toHaveBeenCalledWith();
        });
    });

    describe('findSecondLevelByStore', () => {
        const categories: Described[] = [{ code: 'TESTCAT' }];
        const testStoreCode = 'STORE';

        it('should delegate to the state and if not already cached then cache results', () => {
            const expectedCategories = of(categories);
            jest.spyOn(api, 'findSecondLevelByStore').mockImplementation(() => expectedCategories);
            jest.spyOn(state, 'cacheFindSecondLevelByStore');
            facade.findSecondLevelByStore(testStoreCode);
            expect(state.cacheFindSecondLevelByStore).toHaveBeenCalledWith(testStoreCode, expectedCategories);
        });

        it('should delegate to the state and get existing results from cache', async () => {
            const apiCategories: Described[] = [{ code: 'NONCACHEDCAT' }, ...categories];

            // mock API implementation and insert differing data into cache
            jest.spyOn(api, 'findSecondLevelByStore').mockImplementation(() => of(apiCategories));
            state['findSecondLevelByStoreCache'].put(testStoreCode, of(categories));

            expect(await facade.findSecondLevelByStore(testStoreCode).toPromise()).toEqual(categories);
        });
    });

    describe('dropdown', () => {
        const sB = { code: '1', description: 'Test Code B' };
        const sA = { code: '2', description: 'Test Code A' };
        const sC = { code: '3', description: 'Test Code C' };
        beforeEach(() => {
            jest.spyOn(facade, 'findActive').mockReturnValue(of([sC, sB, sA]));
        });
        it('should create', async () => {
            const dropdown = facade.searchColumns.dropdown({ name: 'Cat', level: 'LEAF', apiFieldPath: 'path' });

            expect(dropdown.name).toEqual('Cat');
            expect(dropdown.apiFieldPath).toEqual('path');
            expect(await dropdown.fetchData('test').toPromise()).toEqual([sB, sA, sC]); // verify sorted
            expect(facade.findActive).toHaveBeenCalledWith('LEAF');
        });

        it('should set defaults', async () => {
            const dropdown = facade.searchColumns.dropdown({ level: 'ROOT', apiFieldPath: 'path' });

            expect(dropdown.name).toEqual('Product Category');
            expect(dropdown.apiFieldPath).toEqual('path');
            await dropdown.fetchData('test').toPromise();
            expect(facade.findActive).toHaveBeenCalledWith('ROOT');
        });
    });

    describe('entityPatch', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'entityPatch').mockImplementation();
            const patch = { id: 1, updateValues: { ...new ProductCategory(), code: 'Test' }, fields: ['code'] };
            facade.entityPatch([patch]);

            // verify that it delegated to api;
            expect(api.entityPatch).toBeCalledWith(['patch'], patch);
        });
    });
});
