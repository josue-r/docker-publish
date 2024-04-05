import { DynamicDropdownColumn, dynamicStringDropdown } from '@vioc-angular/shared/util-column';
import { DropdownColumnFacade } from './dropdown-column.facade';
import { DropdownColumnState } from './dropdown-column.state';

describe('DropdownColumnFacade', () => {
    describe('search', () => {
        let column: DynamicDropdownColumn<string>;
        let state: DropdownColumnState;
        let facade: DropdownColumnFacade;

        beforeEach(() => {
            column = DynamicDropdownColumn.of({
                ...dynamicStringDropdown,
                minCharactersForSearch: 2,
                maxCharactersForSearch: 3,
                dataCacheKey: 'col',
            });
            jest.spyOn(column, 'fetchData');

            state = new DropdownColumnState();
            facade = new DropdownColumnFacade(state);
        });

        it('should not search if searchText length is less than the minCharactersForSearch', async () => {
            const results = await facade.search(column, '').toPromise();

            expect(column.fetchData).not.toHaveBeenCalled();
            expect(results).toEqual([]);
        });
        it('should search if searchText length is between minCharactersForSearch and maxCharactersForSearch', async () => {
            jest.spyOn(state, 'cache');
            const results = await facade.search(column, 'ab').toPromise();

            expect(column.fetchData).toHaveBeenCalledWith('AB');
            expect(results).toEqual(['AB0001', 'AB0002', 'AB0003', 'AB1001', 'AB1002', 'AB1003']);
            expect(state.cache).toHaveBeenCalledWith(column, 'AB', results);
        });
        it('should search with a substring if searchText length is greater than maxCharactersForSearch', async () => {
            const results = await facade.search(column, 'ab0001').toPromise();

            expect(column.fetchData).toHaveBeenCalledWith('AB0');
            // Search results will still be fully filtered
            expect(results).toEqual(['AB0001']);
        });
        it('should return cached results for a searchText if available', async () => {
            const cachedValues = ['040001', '040002', '040003'];
            state.cache(column, '040', cachedValues);
            jest.spyOn(state, 'getCache');

            const results = await facade.search(column, '0400').toPromise();

            expect(results).toEqual(cachedValues);
            expect(state.getCache).toHaveBeenCalled();
            expect(column.fetchData).not.toHaveBeenCalled();
        });
    });
});
