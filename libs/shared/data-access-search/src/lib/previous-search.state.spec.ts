import { fakeAsync, flush } from '@angular/core/testing';
import { QueryPage, QuerySort, SearchLine } from '@vioc-angular/shared/common-api-models';
import { Column, Comparators } from '@vioc-angular/shared/util-column';
import { PreviousQuerySearch } from './models/previous-query-search';
import { PreviousSearchState } from './previous-search.state';

const search: PreviousQuerySearch = {
    filters: [],
    page: new QueryPage(0, 10),
    sort: new QuerySort(Column.of({ apiFieldPath: 'baz', name: 'baz', type: 'string' })),
};

const nextSearch: PreviousQuerySearch = {
    filters: [
        {
            column: Column.of({ apiFieldPath: 'foo', name: 'foo', type: 'string' }),
            comparator: Comparators.equalTo,
            value: ['TEST'],
        } as SearchLine,
    ],
    page: new QueryPage(1, 10),
    sort: new QuerySort(Column.of({ apiFieldPath: 'bar', name: 'bar', type: 'string' }), 'asc'),
};

describe('PreviousSearchState', () => {
    it('should track state', fakeAsync(() => {
        const state = new PreviousSearchState();
        let previousSearch: PreviousQuerySearch;
        state.getPreviousSearch().subscribe((ps) => (previousSearch = ps));
        expect(previousSearch).toBeUndefined();

        state.updatePreviousSearch(search);
        flush();
        state.getPreviousSearch().subscribe((ps) => (previousSearch = ps));
        expect(previousSearch).toEqual(search);

        state.updatePreviousSearch(nextSearch);
        flush();
        state.getPreviousSearch().subscribe((ps) => (previousSearch = ps));
        expect(previousSearch).toEqual(nextSearch);
    }));
});
