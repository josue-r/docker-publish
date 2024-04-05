import { Described } from '@vioc-angular/shared/common-functionality';
import { defer, Observable, of } from 'rxjs';
import { CompanyExportState } from './company-export-state';

/** Copied and migrated from CommonCodeState */
describe('CompanyExportState', () => {
    let state: CompanyExportState;
    beforeEach(() => {
        state = new CompanyExportState();
    });

    it('should create an instance', () => {
        expect(state).toBeTruthy();
    });

    describe('findByCompanyAndType', () => {
        it('should return undefined if not cached', () => {
            state['findByCompanyAndTypeCache'].put('VAL.SALES', of([]));
            expect(state.findByCompanyAndType('VAL', 'COST')).toBeNull();
        });

        it('should return an observable if cached', () => {
            // put something in cache
            state['findByCompanyAndTypeCache'].put('VAL.SALES', of([]));

            expect(state.findByCompanyAndType('VAL', 'COST')).toBeDefined();
        });
    });

    describe('cacheActcacheByCompanyAndTypeiveByType', () => {
        it('should cache and return a replayable observable ', async () => {
            // Everytime this executes, it will return a new array with different ID values
            let index = 0;
            function loadExternalData(): Observable<Described[]> {
                return defer(() => Promise.resolve([{ id: index++ }, { id: index++ }] as Described[]));
            }

            const cacheResult = await state.cacheByCompanyAndType('VAL', 'COST', loadExternalData()).toPromise();

            // index should have been updated twice
            expect(cacheResult.map((d) => d.id)).toEqual([0, 1]);
            expect(index).toEqual(2);

            // calling findActiveByType should always return the cached value
            expect((await state.findByCompanyAndType('VAL', 'COST').toPromise()).map((d) => d.id)).toEqual([0, 1]);
            expect((await state.findByCompanyAndType('VAL', 'COST').toPromise()).map((d) => d.id)).toEqual([0, 1]);
            // control case:
            // manually calling loadExternalData() should create new array alements
            expect((await loadExternalData().toPromise()).map((d) => d.id)).toEqual([2, 3]);
            // calling findActiveByType should still return the cached value
            expect((await state.findByCompanyAndType('VAL', 'COST').toPromise()).map((d) => d.id)).toEqual([0, 1]);
        });
    });
});
