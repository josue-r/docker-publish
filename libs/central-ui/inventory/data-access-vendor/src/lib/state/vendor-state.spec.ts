import { Described } from '@vioc-angular/shared/common-functionality';
import { defer, Observable, of } from 'rxjs';
import { VendorState } from './vendor-state';

describe('Vendor', () => {
    let state: VendorState;
    beforeEach(() => {
        state = new VendorState();
    });

    it('should create an instance', () => {
        expect(state).toBeTruthy();
    });

    describe('findByStores', () => {
        it('should return undefined if not cached', () => {
            expect(state.findByStores(['FOO'])).toBeNull();
        });

        it('should return an observable if cached', () => {
            // put something in cache
            state['findActiveByStoreCache'].put('FOO', of([]));

            expect(state.findByStores(['FOO'])).toBeDefined();
        });
    });

    describe('getSortedStringFromArrayElements', () => {
        it('should return sorted string', () => {
            expect(state.getSortedStringFromArrayElements(['1000', '1003', '1002'])).toEqual('1000,1002,1003');
        });
    });

    describe('cacheByStores', () => {
        it('should cache and return a replayable observable ', async () => {
            // Everytime this executes, it will return a new array with different ID values
            let index = 0;
            function loadExternalData(): Observable<Described[]> {
                return defer(() => Promise.resolve([{ id: index++ }, { id: index++ }] as Described[]));
            }

            const cacheResult = await state.cacheByStores(['FOO'], loadExternalData()).toPromise();

            // index should have been updated twice
            expect(cacheResult.map((d) => d.id)).toEqual([0, 1]);
            expect(index).toEqual(2);

            // calling findActiveByType should always return the cached value
            expect((await state.findByStores(['FOO']).toPromise()).map((d) => d.id)).toEqual([0, 1]);
            expect((await state.findByStores(['FOO']).toPromise()).map((d) => d.id)).toEqual([0, 1]);
            // control case:
            // manually calling loadExternalData() should create new array alements
            expect((await loadExternalData().toPromise()).map((d) => d.id)).toEqual([2, 3]);
            // calling findActiveByType should still return the cached value
            expect((await state.findByStores(['FOO']).toPromise()).map((d) => d.id)).toEqual([0, 1]);
        });
    });

    describe('findAllAccessibleActive', () => {
        it('should return undefined if not cached', () => {
            expect(state.findAllAccessibleActive()).toBeNull();
        });

        it('should return an observable if cached', () => {
            // put something in cache
            state['findAllAccessibleActiveCache'].put('FOO', of([]));

            expect(state.findAllAccessibleActive()).toBeDefined();
        });
    });

    describe('cacheByAccessibleActive', () => {
        it('should cache and return a replayable observable ', async () => {
            // Everytime this executes, it will return a new array with different ID values
            let index = 0;
            function loadExternalData(): Observable<Described[]> {
                return defer(() => Promise.resolve([{ id: index++ }, { id: index++ }] as Described[]));
            }

            const cacheResult = await state.cacheByAccessibleActive(loadExternalData()).toPromise();

            // index should have been updated twice
            expect(cacheResult.map((d) => d.id)).toEqual([0, 1]);
            expect(index).toEqual(2);

            // calling findAllAccessibleActive should always return the cached value
            expect((await state.findAllAccessibleActive().toPromise()).map((d) => d.id)).toEqual([0, 1]);
            // control case:
            // manually calling loadExternalData() should create new array elements
            expect((await loadExternalData().toPromise()).map((d) => d.id)).toEqual([2, 3]);
            // calling findAllAccessibleActive should still return the cached value
            expect((await state.findAllAccessibleActive().toPromise()).map((d) => d.id)).toEqual([0, 1]);
        });
    });
});
