import { Inject, Optional, Injectable } from '@angular/core';
import { QuerySearch } from '@vioc-angular/shared/common-api-models';
import { ResponseEntity } from '@vioc-angular/shared/util-api';
import { Observable } from 'rxjs';
import { PreviousQuerySearch } from './models/previous-query-search';
import { Searchable } from './models/searchable';
import { PreviousDisplayedColumnsState } from './previous-displayed-columns.state';
import { PreviousSearchState } from './previous-search.state';
import { SEARCHABLE_TOKEN } from './searchable-injection-token';

/**
 * Delegator for managing search API calls and state.
 */
@Injectable()
export class SearchFacade {
    constructor(
        @Inject(SEARCHABLE_TOKEN) @Optional() private readonly facade: Searchable<any>,
        private readonly _previousSearchState: PreviousSearchState,
        private readonly _previousDisplayedColumnsState: PreviousDisplayedColumnsState
    ) {
        if (!facade) {
            // Give a "good" error message for why this is failing and how to address
            throw new Error(
                'A SEARCHABLE_TOKEN must be provided. This is usually done in whichever feature component utilizes the ' +
                    'vioc-angular-search-page tag'
            );
        }
    }

    /**
     * Using the `QuerySearch` make an api call to return `ResponseEntity` content.
     */
    search(querySearch: QuerySearch): Observable<ResponseEntity<any>> {
        return this.facade.search(querySearch);
    }

    /**
     * Returns the most recent `PreviousQuerySearch`.
     */
    getPreviousSearch(): Observable<PreviousQuerySearch> {
        return this._previousSearchState.getPreviousSearch();
    }

    /**
     * Update the previous search with the provided `PreviousQuerySearch`.
     */
    savePreviousSearch(previousQuerySearch: PreviousQuerySearch): void {
        this._previousSearchState.updatePreviousSearch(previousQuerySearch);
    }

    /**
     * Return the most recent displayed column list.
     */
    getPreviousDisplayedColumns(): Observable<string[]> {
        return this._previousDisplayedColumnsState.getPreviousDisplayedColumns();
    }

    /**
     * Update the previous displayed columns with the provided list.
     */
    savePreviousDisplayedColumns(previousDisplayedColumns: string[]): void {
        this._previousDisplayedColumnsState.updatePreviousDisplayedColumns(previousDisplayedColumns);
    }
}
