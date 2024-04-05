import { defer, Observable, of } from 'rxjs';
import { Resources } from '../model/resources.model';
import { ResourceState } from './resource-state';

describe('ResourceState', () => {
    let state: ResourceState;
    beforeEach(() => {
        state = new ResourceState();
    });

    it('should create an instance', () => {
        expect(state).toBeTruthy();
    });

    describe('findResoucesByType', () => {
        it('should return undefined if not cached', () => {
            expect(state.findResoucesByType('company', 'ACTIVE', ['ROLE1'], false, [{ criteria: 'VAL' }])).toBeNull();
        });

        it('should return an observable if cached', () => {
            // put something in cache
            state['_findResoucesByTypeCache'].put(
                'STORE.ACTIVE.withParents:[ROLE1]:[VAL]',
                of({ resources: [], allCompanies: false })
            );

            expect(state.findResoucesByType('store', 'ACTIVE', ['ROLE1'], true, [{ criteria: 'VAL' }])).toBeDefined();
        });
    });

    describe('cacheResoucesByType', () => {
        it('should cache and return a replayable observable ', async () => {
            // Everytime this executes, it will return a new array with different ID values
            let index = 0;
            function loadExternalData(): Observable<Resources> {
                return defer(() =>
                    Promise.resolve({ resources: [{ id: index++ }, { id: index++ }], allCompanies: false })
                );
            }

            const cacheResult = await state
                .cacheResoucesByType('company', 'ACTIVE', ['ROLE1'], loadExternalData())
                .toPromise();

            // index should have been updated twice
            expect(cacheResult).toEqual({ resources: [{ id: 0 }, { id: 1 }], allCompanies: false });
            expect(index).toEqual(2);

            // calling findResoucesByType should always return the cached value
            expect(await state.findResoucesByType('company', 'ACTIVE', ['ROLE1']).toPromise()).toEqual({
                resources: [{ id: 0 }, { id: 1 }],
                allCompanies: false,
            });
            expect(await state.findResoucesByType('company', 'ACTIVE', ['ROLE1']).toPromise()).toEqual({
                resources: [{ id: 0 }, { id: 1 }],
                allCompanies: false,
            });
            // control case:
            // manually calling loadExternalData() should create new array alements
            expect(await loadExternalData().toPromise()).toEqual({
                resources: [{ id: 2 }, { id: 3 }],
                allCompanies: false,
            });
            // calling findResoucesByType should still return the cached value
            expect(await state.findResoucesByType('company', 'ACTIVE', ['ROLE1']).toPromise()).toEqual({
                resources: [{ id: 0 }, { id: 1 }],
                allCompanies: false,
            });
        });
    });
});
