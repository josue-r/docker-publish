import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * State management for a list of displayed columns.
 */
@Injectable()
export class PreviousDisplayedColumnsState {
    /**
     * Subscribable tracker for changes to the list of displayed columns.
     */
    private readonly _previousDisplayedColumns = new BehaviorSubject<string[]>([]);

    /**
     * Updates the tracked list of displayed columns.
     */
    updatePreviousDisplayedColumns(previousDisplayedColumns: string[]): void {
        this._previousDisplayedColumns.next(previousDisplayedColumns);
    }

    /**
     * Returns the last list of displayed columns.
     */
    getPreviousDisplayedColumns(): Observable<string[]> {
        return this._previousDisplayedColumns.asObservable();
    }
}
