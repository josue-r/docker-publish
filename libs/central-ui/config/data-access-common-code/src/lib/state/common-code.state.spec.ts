import { Described } from '@vioc-angular/shared/common-functionality';
import { defer, Observable, of } from 'rxjs';
import { CommonCodeState } from '../state/common-code.state';

describe('CommonCodeState', () => {
    let state: CommonCodeState;
    beforeEach(() => {
        state = new CommonCodeState();
    });

    it('should create an instance', () => {
        expect(state).toBeTruthy();
    });

    describe('findByType', () => {
        it('should return undefined if not cached', () => {
            expect(state.findByType('CDTYPE')).toBeNull();
        });

        it('should return an observable if cached', () => {
            // put something in cache
            state['findByTypeCache'].put('COMMONCODE:[CDTYPE]', of(Described['']));

            expect(state.findByType('CDTYPE')).toBeDefined();
        });
    });

    describe('cacheByType', () => {
        it('should cache and return a replayable observable when active param is not set', async () => {
            // Everytime this executes, it will return a new array with different ID values
            let index = 0;
            function loadExternalData(): Observable<Described[]> {
                return defer(() => Promise.resolve([{ id: index++ }, { id: index++ }] as Described[]));
            }

            const cacheResult = await state.cacheByType('CDTYPE', loadExternalData()).toPromise();

            // index should have been updated twice
            expect(cacheResult.map((d) => d.id)).toEqual([0, 1]);
            expect(index).toEqual(2);

            // calling findByType should always return the cached value
            expect((await state.findByType('CDTYPE').toPromise()).map((d) => d.id)).toEqual([0, 1]);
            // control case:
            // manually calling loadExternalData() should create new array alements
            expect((await loadExternalData().toPromise()).map((d) => d.id)).toEqual([2, 3]);
            // calling findByType should still return the cached value
            expect((await state.findByType('CDTYPE').toPromise()).map((d) => d.id)).toEqual([0, 1]);
        });

        it('should cache and return a replayable observable when active param is set to true', async () => {
            // Everytime this executes, it will return a new array with different ID values
            let index = 0;
            function loadExternalData(): Observable<Described[]> {
                return defer(() => Promise.resolve([{ id: index++ }, { id: index++ }] as Described[]));
            }

            const cacheResult = await state.cacheByType('CDTYPE', loadExternalData(), true).toPromise();

            // index should have been updated twice
            expect(cacheResult.map((d) => d.id)).toEqual([0, 1]);
            expect(index).toEqual(2);

            // calling findByType should always return the cached value
            expect((await state.findByType('CDTYPE', true).toPromise()).map((d) => d.id)).toEqual([0, 1]);
            // control case:
            // manually calling loadExternalData() should create new array alements
            expect((await loadExternalData().toPromise()).map((d) => d.id)).toEqual([2, 3]);
            // calling findByType should still return the cached value
            expect((await state.findByType('CDTYPE', true).toPromise()).map((d) => d.id)).toEqual([0, 1]);
        });
    });
});
