import { fakeAsync, flush } from '@angular/core/testing';
import { QueryPage, QuerySearch, QuerySort } from '@vioc-angular/shared/common-api-models';
import { ResponseEntity } from '@vioc-angular/shared/util-api';
import { Column } from '@vioc-angular/shared/util-column';
import { EMPTY, Observable, of } from 'rxjs';
import { PreviousQuerySearch } from './models/previous-query-search';
import { Searchable } from './models/searchable';
import { PreviousDisplayedColumnsState } from './previous-displayed-columns.state';
import { PreviousSearchState } from './previous-search.state';
import { SearchFacade } from './search.facade';

describe('SearchFacade', () => {
    interface TestEntity {
        id?: number;
        code: string;
    }

    class TestSearchFacade implements Searchable<TestEntity> {
        search(querySearch: QuerySearch): Observable<ResponseEntity<TestEntity>> {
            return EMPTY;
        }
    }

    let searchFacade: SearchFacade;
    beforeEach(() => {
        searchFacade = new SearchFacade(
            new TestSearchFacade(),
            new PreviousSearchState(),
            new PreviousDisplayedColumnsState()
        );
    });

    describe('search', () => {
        it('should search and return results', async () => {
            const querySearch: QuerySearch = {
                queryRestrictions: [],
                page: new QueryPage(0, 10),
                sort: new QuerySort(Column.of({ apiFieldPath: 'foo', name: 'foo', type: 'string' })),
            };
            const response: ResponseEntity<TestEntity> = {
                content: [{ id: 1, code: 'TEST' }],
                totalElements: 0,
            };
            const facade = searchFacade['facade'];
            jest.spyOn(facade, 'search').mockReturnValue(of(response));

            const results = searchFacade.search(querySearch);

            expect(facade.search).toHaveBeenCalledWith(querySearch);
            expect(await results.toPromise()).toEqual(response);
        });
    });

    describe('PreviousSearch', () => {
        let previousSearch: PreviousQuerySearch;
        const search: PreviousQuerySearch = {
            filters: [],
            page: new QueryPage(0, 10),
            sort: new QuerySort(Column.of({ apiFieldPath: 'foo', name: 'foo', type: 'string' })),
        };
        it('should be able to get the previous search details', fakeAsync(() => {
            searchFacade['_previousSearchState'].updatePreviousSearch(search);
            flush();

            searchFacade.getPreviousSearch().subscribe((ps) => (previousSearch = ps));
            flush();
            expect(previousSearch).toEqual(search);
        }));

        it('should be able to save the current search details', fakeAsync(() => {
            searchFacade.getPreviousSearch().subscribe((ps) => (previousSearch = ps));
            flush();
            expect(previousSearch).toBeUndefined();

            searchFacade.savePreviousSearch(search);
            flush();
            expect(previousSearch).toEqual(search);
        }));
    });

    describe('PreviousDisplayedColumns', () => {
        let previousColumns: string[];

        it('should be able to get the previous displayed column details', fakeAsync(() => {
            searchFacade['_previousDisplayedColumnsState'].updatePreviousDisplayedColumns(['TEST']);
            flush();

            searchFacade.getPreviousDisplayedColumns().subscribe((pc) => (previousColumns = pc));
            flush();
            expect(previousColumns).toEqual(['TEST']);
        }));

        it('should be able to get save the current displayed column details', fakeAsync(() => {
            searchFacade.getPreviousDisplayedColumns().subscribe((pc) => (previousColumns = pc));
            flush();
            expect(previousColumns).toEqual([]);

            searchFacade.savePreviousDisplayedColumns(['TEST']);
            flush();
            searchFacade.getPreviousDisplayedColumns().subscribe((pc) => (previousColumns = pc));
            flush();
            expect(previousColumns).toEqual(['TEST']);
        }));
    });
});
