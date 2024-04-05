import { Described } from '@vioc-angular/shared/common-functionality';
import { defer, Observable, of } from 'rxjs';
import { ServiceCategoryState } from './service-category-state';

describe('ServiceCategoryState', () => {
    let state: ServiceCategoryState;
    beforeEach(() => {
        state = new ServiceCategoryState();
    });

    it('should create an instance', () => {
        expect(state).toBeTruthy();
    });

    describe('findActiveByLevel', () => {
        it('should return null if not cached', () => {
            expect(state.findActiveByLevel('LEAF')).toBeNull();
        });

        it('should return an observable if cached', () => {
            // put something in cache
            state['findActiveByLevelCache'].put('LEAF', of([]));

            expect(state.findActiveByLevel('LEAF')).toBeInstanceOf(Observable);
        });
    });

    describe('cacheActiveByLevel', () => {
        it('should cache and return a replayable observable ', async () => {
            // Everytime this executes, it will return a new array with different ID values
            let index = 0;
            function loadExternalData(): Observable<Described[]> {
                return defer(() => Promise.resolve([{ id: index++ }, { id: index++ }] as Described[]));
            }

            const cacheResult = await state.cacheActiveByLevel('LEAF', loadExternalData()).toPromise();

            // index should have been updated twice
            expect(cacheResult.map((d) => d.id)).toEqual([0, 1]);
            expect(index).toEqual(2);

            // calling findActiveByLevel should always return the cached value
            expect((await state.findActiveByLevel('LEAF').toPromise()).map((d) => d.id)).toEqual([0, 1]);
            expect((await state.findActiveByLevel('LEAF').toPromise()).map((d) => d.id)).toEqual([0, 1]);
            // control case:
            // manually calling loadExternalData() should create new array alements
            expect((await loadExternalData().toPromise()).map((d) => d.id)).toEqual([2, 3]);
            // calling findActiveByLevel should still return the cached value
            expect((await state.findActiveByLevel('LEAF').toPromise()).map((d) => d.id)).toEqual([0, 1]);
        });
    });
});
