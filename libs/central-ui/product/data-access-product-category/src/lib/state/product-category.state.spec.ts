import { Described } from '@vioc-angular/shared/common-functionality';
import { of } from 'rxjs';
import { ProductCategoryState } from './product-category.state';

describe('ProductCategoryState', () => {
    let state: ProductCategoryState;

    beforeEach(() => (state = new ProductCategoryState()));

    it('should create an instance', () => {
        expect(state).toBeTruthy();
    });

    describe('findActive', () => {
        it('should return null if no data is cached', () => {
            expect(state.findActive('ROOT')).toBeNull();
        });

        it('should return observable of cached data if saved', async () => {
            // insert data into cache
            const categories: Described[] = [{ code: 'TESTCAT' }];
            state['findActiveCache'].put('ROOT', of(categories));

            expect(await state.findActive('ROOT').toPromise()).toEqual(categories);
        });
    });

    describe('cacheFindActive', () => {
        beforeEach(() => {
            // precheck: cache in all levels should be empty
            expect(state['findActiveCache'].get('ALL')).toBeNull();
            expect(state['findActiveCache'].get('ROOT')).toBeNull();
            expect(state['findActiveCache'].get('LEAF')).toBeNull();
        });

        it('should cache and return an observable', async () => {
            const categories: Described[] = [{ code: 'TESTCAT' }];

            // cache data and validate that data was inserted
            state.cacheFindActive('ROOT', of(categories));
            expect(await state['findActiveCache'].get('ROOT').toPromise()).toEqual(categories);
        });

        it('should be able to cache at multiple levels at once', async () => {
            const rootCategories: Described[] = [{ code: 'ROOTCAT1' }, { code: 'ROOTCAT2' }];
            const leafCategories: Described[] = [{ code: 'LEAFCAT1' }, { code: 'LEAFCAT2' }];
            const allCategories: Described[] = [...rootCategories, ...leafCategories];

            // cache data and validate that data was inserted
            state.cacheFindActive('ALL', of(allCategories));
            state.cacheFindActive('ROOT', of(rootCategories));
            state.cacheFindActive('LEAF', of(leafCategories));
            expect(await state['findActiveCache'].get('ALL').toPromise()).toEqual(allCategories);
            expect(await state['findActiveCache'].get('ROOT').toPromise()).toEqual(rootCategories);
            expect(await state['findActiveCache'].get('LEAF').toPromise()).toEqual(leafCategories);
        });
    });

    describe('findSecondLevelByStore', () => {
        it('should return null if no data is cached', () => {
            expect(state.findSecondLevelByStore('STORE')).toBeNull();
        });

        it('should return observable of cached data if saved', async () => {
            // insert data into cache
            const storeProductCategories: Described[] = [{ code: 'SPCAT' }];
            state['findSecondLevelByStoreCache'].put('STORE', of(storeProductCategories));
            expect(await state.findSecondLevelByStore('STORE').toPromise()).toEqual(storeProductCategories);
        });
    });

    describe('cacheFindSecondLevelByStore', () => {
        const store1ProductCategories: Described[] = [{ code: 'S1PCAT' }];
        const store2ProductCategories: Described[] = [{ code: 'S2PCAT' }];

        beforeEach(() => {
            // check caches should be empty
            expect(state['findSecondLevelByStoreCache'].get('STORE1')).toBeNull();
            expect(state['findSecondLevelByStoreCache'].get('STORE2')).toBeNull();
        });

        it('should cache and return an observable', async () => {
            // cache data and validate that data was inserted
            state.cacheFindSecondLevelByStore('STORE1', of(store1ProductCategories));
            expect(await state['findSecondLevelByStoreCache'].get('STORE1').toPromise()).toEqual(
                store1ProductCategories
            );
        });

        it('should be able to cache at for multiple stores at once', async () => {
            // cache data and validate that data was inserted
            state.cacheFindSecondLevelByStore('STORE1', of(store1ProductCategories));
            state.cacheFindSecondLevelByStore('STORE2', of(store2ProductCategories));
            expect(await state['findSecondLevelByStoreCache'].get('STORE1').toPromise()).toEqual(
                store1ProductCategories
            );
            expect(await state['findSecondLevelByStoreCache'].get('STORE2').toPromise()).toEqual(
                store2ProductCategories
            );
        });
    });

    describe('clearCache', () => {
        it('should empty cache of any data', async () => {
            const categories: Described[] = [{ code: 'TESTCAT' }];
            const storeProductCategories: Described[] = [{ code: 'SPCAT' }];

            // cache data and validate that data was inserted
            state.cacheFindActive('ROOT', of(categories));
            state.cacheFindSecondLevelByStore('STORE', of(storeProductCategories));
            expect(await state['findActiveCache'].get('ROOT').toPromise()).toEqual(categories);
            expect(await state['findSecondLevelByStoreCache'].get('STORE').toPromise()).toEqual(storeProductCategories);

            state.clearCache();
            expect(state['findActiveCache'].get('ROOT')).toBeNull();
            expect(state['findSecondLevelByStoreCache'].get('STORE')).toBeNull();
        });
    });
});
