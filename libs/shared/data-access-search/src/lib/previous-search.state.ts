import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PreviousQuerySearch } from './models/previous-query-search';

/**
 * State management for `PreviousQuerySearch`.
 */
@Injectable()
export class PreviousSearchState {
    /**
     * Subscribable tracker for changes to `PreviousQuerySearch`.
     */
    private readonly _previousSearch = new BehaviorSubject<PreviousQuerySearch>(undefined);

    /**
     * Updates the tracked `PreviousQuerySearch`.
     */
    updatePreviousSearch(previousSearch: PreviousQuerySearch): void {
        this._previousSearch.next(previousSearch);
    }

    /**
     * Returns the last `PreviousQuerySearch`.
     */
    getPreviousSearch(): Observable<PreviousQuerySearch> {
        return this._previousSearch.asObservable();
    }
}
